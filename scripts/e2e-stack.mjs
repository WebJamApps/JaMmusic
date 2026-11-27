/* global fetch */
import { execFileSync, spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { clearTimeout, setTimeout } from 'node:timers';
import { URL } from 'node:url';
import scc from 'socketcluster-client';

const BACKEND_REPO_URL = 'https://github.com/WebJamApps/web-jam-back.git';
const WJSC_REPO_URL = 'https://github.com/WebJamApps/WebJamSocketCluster.git';
const STARTUP_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 250;

function log(message) {
  process.stdout.write(`[e2e-stack] ${message}\n`);
}

function logError(message) {
  process.stderr.write(`[e2e-stack] ${message}\n`);
}

function createRunId() {
  return `${Date.now()}_${process.pid}_${crypto.randomBytes(4).toString('hex')}`;
}

function allocatePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close(() => reject(new Error('Failed to allocate ephemeral TCP port')));
        return;
      }
      const { port } = address;
      server.close((err) => {
        if (err) reject(err);
        else resolve(port);
      });
    });
  });
}

function validateAndScopeTestDb(rawUri, dbName) {
  let parsed;
  try {
    parsed = new URL(rawUri);
  } catch {
    throw new Error('Refusing TEST_DB: URI could not be parsed cleanly');
  }
  if (parsed.protocol !== 'mongodb:' && parsed.protocol !== 'mongodb+srv:') {
    throw new Error(`Refusing TEST_DB: unsupported protocol "${parsed.protocol}"`);
  }
  const incomingDb = parsed.pathname.replace(/^\/+/, '');
  if (/release|prod/i.test(incomingDb)) {
    throw new Error(`Refusing TEST_DB: database name "${incomingDb}" contains "release" or "prod"`);
  }
  parsed.pathname = `/${dbName}`;
  return parsed.toString();
}

function ensureDockerAvailable() {
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore' });
  } catch {
    throw new Error(
      'Docker is unavailable or not running. Start Docker or set TEST_DB to an isolated non-prod MongoDB URI.',
    );
  }
}

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd || process.cwd(),
      env: opts.env || process.env,
      stdio: opts.stdio || 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve(0);
        return;
      }
      const detail = signal ? `signal ${signal}` : `exit code ${code}`;
      reject(new Error(`Command "${cmd} ${args.join(' ')}" failed with ${detail}`));
    });
  });
}

async function waitForMongoContainer(containerName, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      execFileSync(
        'docker',
        ['exec', containerName, 'mongosh', '--quiet', '--eval', 'db.adminCommand("ping").ok'],
        { stdio: 'ignore' },
      );
      return;
    } catch {
      await new Promise((r) => { setTimeout(r, POLL_INTERVAL_MS); });
    }
  }
  throw new Error(`Timed out waiting for MongoDB container ${containerName} to accept connections`);
}

function startLoggedProcess(name, cmd, args, opts) {
  const logStream = fs.createWriteStream(opts.logPath, { flags: 'a' });
  const child = spawn(cmd, args, {
    cwd: opts.cwd,
    env: opts.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.pipe(logStream);
  child.stderr.pipe(logStream);

  const state = {
    name,
    child,
    logPath: opts.logPath,
    logStream,
    exited: false,
    exitDetail: '',
  };
  child.on('exit', (code, signal) => {
    state.exited = true;
    state.exitDetail = signal ? `signal ${signal}` : `exit code ${code}`;
  });
  return state;
}

async function stopProcess(proc) {
  if (!proc) return;
  const { child, logStream } = proc;
  if (!proc.exited && child.pid) {
    await new Promise((resolve) => {
      const killTimer = setTimeout(() => {
        try {
          child.kill('SIGKILL');
        } catch {
          // ignore
        }
        resolve();
      }, 5000);
      child.once('exit', () => {
        clearTimeout(killTimer);
        resolve();
      });
      try {
        child.kill('SIGTERM');
      } catch {
        clearTimeout(killTimer);
        resolve();
      }
    });
  }
  logStream.end();
}

function tailLog(logPath, maxLines = 80) {
  if (!fs.existsSync(logPath)) return '(no log file)';
  const lines = fs.readFileSync(logPath, 'utf8').trimEnd().split('\n');
  return lines.slice(-maxLines).join('\n');
}

async function waitForHttp200(url, proc, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'no response';
  while (Date.now() < deadline) {
    if (proc.exited) {
      throw new Error(`${proc.name} exited early (${proc.exitDetail}). Log:\n${tailLog(proc.logPath)}`);
    }
    try {
      const res = await fetch(url);
      if (res.status === 200) return;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => { setTimeout(r, POLL_INTERVAL_MS); });
  }
  throw new Error(`Timed out waiting for ${proc.name} at ${url} (${lastError}). Log:\n${tailLog(proc.logPath)}`);
}

async function waitForSocketClusterReady(port, proc, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (proc.exited) {
      throw new Error(`${proc.name} exited early (${proc.exitDetail}). Log:\n${tailLog(proc.logPath)}`);
    }
    const ready = await new Promise((resolve) => {
      const socket = scc.create({
        hostname: '127.0.0.1',
        port,
        autoConnect: true,
        secure: false,
      });
      let settled = false;
      const finish = (ok) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try {
          socket.disconnect();
        } catch {
          // ignore
        }
        resolve(ok);
      };
      const timer = setTimeout(() => finish(false), 3000);
      const consumer = socket.receiver('allGigs').createConsumer();
      consumer.next().then((msg) => finish(Array.isArray(msg.value))).catch(() => finish(false));
      socket.listener('error').createConsumer().next().then(() => finish(false)).catch(() => finish(false));
      socket.listener('connectAbort').createConsumer().next().then(() => finish(false)).catch(() => finish(false));
      socket.transmit('initial message', 123);
    });
    if (ready) return;
    await new Promise((r) => { setTimeout(r, POLL_INTERVAL_MS); });
  }
  throw new Error(`Timed out waiting for ${proc.name} SocketCluster initial message on port ${port}. Log:\n${tailLog(proc.logPath)}`);
}

async function prepareBackend({ name, repoUrl, ref, overrideDir, targetDir, buildCommands }) {
  if (overrideDir) {
    const resolved = path.resolve(overrideDir);
    if (!fs.existsSync(resolved)) {
      throw new Error(`${name} override directory does not exist: ${resolved}`);
    }
    log(`Using local ${name} directory: ${resolved}`);
    return resolved;
  }
  log(`Cloning ${name} (${ref}) into ${targetDir}`);
  await runCommand('git', ['clone', '--depth', '1', '--branch', ref, repoUrl, targetDir]);
  log(`Installing ${name} dependencies (ignoring postinstall)...`);
  await runCommand('npm', ['ci', '--ignore-scripts'], { cwd: targetDir });
  log(`Compiling ${name}...`);
  for (const [cmd, args] of buildCommands) {
    await runCommand(cmd, args, { cwd: targetDir });
  }
  return targetDir;
}

async function main() {
  const runId = createRunId();
  const dbName = `e2e_stack_${runId}`;
  const runDir = `/tmp/jammusic-e2e-stack-${runId}`;
  const distDir = path.join(runDir, 'dist');
  const authFile = path.join(runDir, 'auth.json');
  const runHashString = process.env.E2E_STACK_HASH_STRING || crypto.randomBytes(24).toString('hex');

  let mongoContainerName = '';
  let runMongoUri = '';
  const processes = [];
  let playwrightExitCode;
  let cleanedUp = false;

  const cleanup = async (dumpLogs = false) => {
    if (cleanedUp) return;
    cleanedUp = true;

    if (dumpLogs) {
      for (const proc of processes) {
        logError(`--- Tail of ${proc.name} (${proc.logPath}) ---\n${tailLog(proc.logPath)}`);
      }
    }

    for (const proc of [...processes].reverse()) {
      await stopProcess(proc);
    }

    if (mongoContainerName) {
      try {
        execFileSync('docker', ['rm', '-f', mongoContainerName], { stdio: 'ignore' });
      } catch {
        // ignore if already removed
      }
    }

    try {
      fs.rmSync(runDir, { recursive: true, force: true });
    } catch (err) {
      logError(`Failed to remove ${runDir}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSignal = async (signal) => {
    logError(`Received ${signal}, tearing down stack...`);
    await cleanup(false);
    process.exit(signal === 'SIGINT' ? 130 : 143);
  };
  process.once('SIGINT', () => { void handleSignal('SIGINT'); });
  process.once('SIGTERM', () => { void handleSignal('SIGTERM'); });

  try {
    const rawTestDb = (process.env.TEST_DB || '').trim();
    if (rawTestDb) {
      runMongoUri = validateAndScopeTestDb(rawTestDb, dbName);
      log(`Using external MongoDB URI scoped to database "${dbName}"`);
    } else {
      ensureDockerAvailable();
      fs.mkdirSync(runDir, { recursive: true });
      mongoContainerName = `jammusic-e2e-mongo-${runId}`;
      log(`Starting ephemeral Docker container ${mongoContainerName} (mongo:7)...`);
      execFileSync(
        'docker',
        ['run', '--rm', '-d', '--name', mongoContainerName, '-p', '127.0.0.1:0:27017', 'mongo:7'],
        { stdio: 'pipe' },
      );
      const portOut = execFileSync('docker', ['port', mongoContainerName, '27017/tcp'], { encoding: 'utf8' }).trim();
      const match = /:(\d+)$/.exec(portOut.split('\n')[0] || '');
      if (!match) {
        throw new Error(`Could not determine mapped MongoDB port from docker port output: "${portOut}"`);
      }
      const mongoPort = match[1];
      await waitForMongoContainer(mongoContainerName, STARTUP_TIMEOUT_MS);
      runMongoUri = `mongodb://127.0.0.1:${mongoPort}/${dbName}`;
      log(`MongoDB container ready on 127.0.0.1:${mongoPort} (DB: ${dbName})`);
    }

    fs.mkdirSync(runDir, { recursive: true });

    const backendPort = await allocatePort();
    const wjscPort = await allocatePort();
    const previewPort = await allocatePort();
    const previewOrigin = `http://127.0.0.1:${previewPort}`;
    const localhostPreviewOrigin = `http://localhost:${previewPort}`;
    const backendUrl = `http://127.0.0.1:${backendPort}`;

    const backendDir = await prepareBackend({
      name: 'web-jam-back',
      repoUrl: BACKEND_REPO_URL,
      ref: process.env.WEB_JAM_BACK_REF || 'dev',
      overrideDir: process.env.WEB_JAM_BACK_DIR,
      targetDir: path.join(runDir, 'web-jam-back'),
      buildCommands: [
        ['npx', ['tsc', '-p', 'tsconfig.prod.json']],
        ['npm', ['run', 'copy:assets']],
      ],
    });

    const wjscDir = await prepareBackend({
      name: 'WebJamSocketCluster',
      repoUrl: WJSC_REPO_URL,
      ref: process.env.WJSC_REF || 'dev',
      overrideDir: process.env.WJSC_DIR,
      targetDir: path.join(runDir, 'WebJamSocketCluster'),
      buildCommands: [
        ['npx', ['tsc', '-p', 'tsconfig.prod.json']],
      ],
    });

    const userRolesJson = JSON.stringify({ roles: ['Developer', 'JaM-admin'] });

    // web-jam-back skips app.listen() when NODE_ENV === 'test' and exports `app` directly,
    // so invoke app.listen() around the compiled entrypoint while keeping NODE_ENV=test.
    log(`Starting web-jam-back on ${backendUrl}...`);
    const backendBootstrap = [
      "import { pathToFileURL } from 'node:url';",
      "const { default: app } = await import(pathToFileURL(process.argv[1]).href);",
      "app.listen(Number(process.env.PORT), '127.0.0.1');",
    ].join(' ');
    const backendProc = startLoggedProcess(
      'web-jam-back',
      process.execPath,
      ['--input-type=module', '-e', backendBootstrap, path.join(backendDir, 'build/src/index.js')],
      {
        cwd: backendDir,
        logPath: path.join(runDir, 'web-jam-back.log'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
          TEST_DB: runMongoUri,
          PORT: String(backendPort),
          HashString: runHashString,
          AllowUrl: JSON.stringify({ urls: [previewOrigin, localhostPreviewOrigin] }),
          frontURL: previewOrigin,
        },
      },
    );
    processes.push(backendProc);

    log(`Starting WebJamSocketCluster on 127.0.0.1:${wjscPort}...`);
    const wjscProc = startLoggedProcess(
      'WebJamSocketCluster',
      process.execPath,
      [path.join(wjscDir, 'build/src/index.js')],
      {
        cwd: wjscDir,
        logPath: path.join(runDir, 'webjamsocketcluster.log'),
        env: {
          ...process.env,
          NODE_ENV: 'test',
          TEST_DB: runMongoUri,
          PORT: String(wjscPort),
          SOCKETCLUSTER_PORT: String(wjscPort),
          BackendUrl: backendUrl,
          HashString: runHashString,
          userRoles: userRolesJson,
        },
      },
    );
    processes.push(wjscProc);

    log(`Building JaMmusic frontend into ${distDir}...`);
    await runCommand(
      'npx',
      ['vite', 'build', '--outDir', distDir, '--emptyOutDir'],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          BackendUrl: backendUrl,
          ALLOW_LOCALHOST_BACKEND: 'true',
          SCS_HOST: '127.0.0.1',
          SCS_PORT: String(wjscPort),
          SOCKETCLUSTER_SECURE: 'false',
          GoogleClientId: 'e2e-dummy-google-client-id',
          GOOGLE_MAPS_API_KEY: 'e2e-dummy-google-maps-api-key',
          userRoles: userRolesJson,
          APP_NAME: 'JaMmusic',
          NODE_ENV: 'production',
        },
      },
    );

    log(`Starting JaMmusic preview server on ${previewOrigin}...`);
    const previewProc = startLoggedProcess(
      'JaMmusic-preview',
      'npx',
      ['vite', 'preview', '--outDir', distDir, '--host', '127.0.0.1', '--port', String(previewPort), '--strictPort'],
      {
        cwd: process.cwd(),
        logPath: path.join(runDir, 'preview.log'),
        env: process.env,
      },
    );
    processes.push(previewProc);

    log('Polling readiness endpoints...');
    await waitForHttp200(`${backendUrl}/song`, backendProc, STARTUP_TIMEOUT_MS);
    await waitForSocketClusterReady(wjscPort, wjscProc, STARTUP_TIMEOUT_MS);
    await waitForHttp200(`${previewOrigin}/`, previewProc, STARTUP_TIMEOUT_MS);
    log('All three services ready.');

    const outputDir = process.env.E2E_STACK_OUTPUT_DIR || `test/test-results-stack/${runId}`;
    const reportDir = process.env.E2E_STACK_REPORT_DIR || `playwright-report-stack/${runId}`;
    const extraArgs = process.argv.slice(2);

    log('Running Playwright real-stack suite...');
    const pwExit = await new Promise((resolve, reject) => {
      const pw = spawn('npx', ['playwright', 'test', '--config=playwright.stack.config.ts', ...extraArgs], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: {
          ...process.env,
          BASE_URL: previewOrigin,
          TEST_DB: runMongoUri,
          HashString: runHashString,
          E2E_STACK_HASH_STRING: runHashString,
          E2E_STACK_RUN_DIR: runDir,
          E2E_STACK_BACKEND_DIR: backendDir,
          E2E_STACK_AUTH_FILE: authFile,
          E2E_STACK_OUTPUT_DIR: outputDir,
          E2E_STACK_REPORT_DIR: reportDir,
        },
      });
      pw.on('error', reject);
      pw.on('exit', (code, signal) => {
        if (typeof code === 'number') resolve(code);
        else resolve(signal ? 1 : 1);
      });
    });

    playwrightExitCode = pwExit;
  } catch (err) {
    logError(err instanceof Error ? err.stack || err.message : String(err));
    playwrightExitCode = 1;
  } finally {
    await cleanup(playwrightExitCode !== 0);
  }

  process.exit(playwrightExitCode);
}

await main();
