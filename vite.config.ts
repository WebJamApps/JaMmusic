/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import pkg from './package.json';

const srcDir = path.resolve(process.cwd(), 'src');
const testDir = path.resolve(process.cwd(), 'test');
const certDir = path.resolve(process.cwd(), '.certs');

// Opt-in local HTTPS for the dev server: `DEV_HTTPS=true npm run dev`. Needed to
// exercise Facebook FB.login (page-admin Reconnect flow) locally, since FB.login
// refuses to run on http:// pages. Off unless the flag is set AND the self-signed
// certs exist (.certs is gitignored), so CI and production builds are unaffected.
function devHttps(env: Record<string, string>) {
  const enabled = (process.env.DEV_HTTPS ?? env.DEV_HTTPS) === 'true';
  const key = `${certDir}/localhost.key`;
  const cert = `${certDir}/localhost.crt`;
  if (!enabled || !fs.existsSync(key) || !fs.existsSync(cert)) return undefined;
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) };
}

const APP_ENV_KEYS = [
  'BackendUrl',
  'GoogleClientId',
  'APP_NAME',
  'SCS_HOST',
  'SCS_PORT',
  'SOCKETCLUSTER_SECURE',
  'userRoles',
  'NODE_ENV',
  'GOOGLE_MAPS_API_KEY',
] as const;

const TINYMCE_USED_PLUGINS = [
  'advlist',
  'anchor',
  'autolink',
  'charmap',
  'code',
  'fullscreen',
  'help',
  'image',
  'insertdatetime',
  'link',
  'lists',
  'media',
  'preview',
  'searchreplace',
  'table',
  'visualblocks',
  'wordcount',
] as const;

const TINYMCE_MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function selfHostTinyMce(isBuild: boolean): Plugin {
  const tinymceRoot = path.resolve(process.cwd(), 'node_modules/tinymce');
  const distTinyMce = path.resolve(process.cwd(), 'dist/tinymce');
  return {
    name: 'self-host-tinymce',
    configureServer(server) {
      server.middlewares.use('/tinymce', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          next();
          return;
        }
        const rawPath = (req.url || '/').split('?')[0];
        const relPath = path.posix.normalize(rawPath).replace(/^\/+/, '');
        if (!relPath || relPath.startsWith('..')) {
          next();
          return;
        }
        const target = path.resolve(tinymceRoot, relPath);
        if (!target.startsWith(`${tinymceRoot}${path.sep}`)) {
          next();
          return;
        }
        if (fs.existsSync(target) && fs.statSync(target).isFile()) {
          const ext = path.extname(target).toLowerCase();
          res.setHeader('Content-Type', TINYMCE_MIME_TYPES[ext] || 'application/octet-stream');
          if (req.method === 'HEAD') {
            res.end();
            return;
          }
          res.end(fs.readFileSync(target));
          return;
        }
        next();
      });
    },
    closeBundle() {
      if (!isBuild || !fs.existsSync(tinymceRoot)) return;
      fs.mkdirSync(distTinyMce, { recursive: true });
      for (const file of ['tinymce.min.js', 'license.md']) {
        const src = path.join(tinymceRoot, file);
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(distTinyMce, file));
      }
      for (const dir of ['themes', 'skins', 'icons', 'models']) {
        const src = path.join(tinymceRoot, dir);
        if (fs.existsSync(src)) fs.cpSync(src, path.join(distTinyMce, dir), { recursive: true });
      }
      const pluginsDest = path.join(distTinyMce, 'plugins');
      fs.mkdirSync(pluginsDest, { recursive: true });
      for (const plugin of TINYMCE_USED_PLUGINS) {
        const src = path.join(tinymceRoot, 'plugins', plugin);
        if (fs.existsSync(src)) fs.cpSync(src, path.join(pluginsDest, plugin), { recursive: true });
      }
    },
  };
}

function replaceProcessEnv(env: Record<string, string>): Plugin {
  return {
    name: 'replace-process-env',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id)) return null;
      let out = code;
      for (const key of APP_ENV_KEYS) {
        // Contract: an empty BackendUrl means same-origin, and that is the production value.
        const val = env[key] ?? process.env[key] ?? '';
        const re = new RegExp(`process\\.env\\.${key}\\b`, 'g');
        out = out.replace(re, JSON.stringify(val));
      }
      return out === code ? null : { code: out, map: null };
    },
  };
}

export default defineConfig(async ({ mode, command }) => {
  if (command === 'build' || mode === 'production') {
    process.env.NODE_ENV = 'production';
  }
  const env: Record<string, string> = { ...loadEnv(mode, process.cwd(), ''), NODE_ENV: mode };
  if (command === 'build' || mode === 'production') {
    const backendUrl = process.env.BackendUrl ?? env.BackendUrl ?? '';
    const allowLocalhost = (process.env.ALLOW_LOCALHOST_BACKEND ?? env.ALLOW_LOCALHOST_BACKEND) === 'true';
    if (/localhost/i.test(backendUrl) && !allowLocalhost) {
      throw new Error('Refusing production build with localhost BackendUrl. Set ALLOW_LOCALHOST_BACKEND=true to allow.');
    }
  }
  const isTest = mode === 'test' || (command !== 'build' && Boolean(process.env.VITEST));
  // `vitest/config` is a devDependency — import it lazily so a production
  // build (npm install --omit=dev) never tries to resolve it.
  const testExclude = isTest
    ? [...(await import('vitest/config')).configDefaults.exclude, 'test/e2e/**', 'test/e2e-stack/**']
    : ['test/e2e/**', 'test/e2e-stack/**'];
  return {
    ...(command === 'build' ? { oxc: { jsx: { development: false } } } : {}),
    plugins: [
      ...(isTest ? [] : [
        selfHostTinyMce(command === 'build'),
        replaceProcessEnv(env),
        checker({ typescript: { tsconfigPath: './tsconfig.prod.json' }, enableBuild: false }),
      ]),
      react(),
    ],
    server: {
      port: Number(env.PORT) || 7878,
      ...(devHttps(env) ? { https: devHttps(env) } : {}),
    },
    resolve: {
      alias: {
        src: srcDir,
        test: testDir,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        util: 'util/',
        buffer: 'buffer',
        vm: 'vm-browserify',
        events: 'events',
      },
    },
    define: {
      global: 'globalThis',
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/vitest.setup.ts'],
      css: false,
      mockReset: true,
      testTimeout: 40000,
      include: ['test/**/*.{test,spec}.{ts,tsx}'],
      // Playwright e2e specs live under test/e2e — keep Vitest out of them.
      exclude: testExclude,
      fakeTimers: {
        now: 1483228800000,
        toFake: ['Date'],
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/Main.tsx', 'src/redux/store/index.ts'],
        // CI gate: `npm test` (which runs vitest with --coverage) fails when
        // total coverage drops below these floors. Statements + lines held at
        // 90%; branches + functions floored at 80% (some MUI dialogs/providers
        // are only partially exercised). Raise as coverage grows.
        thresholds: {
          statements: 90,
          lines: 90,
          branches: 80,
          functions: 80,
        },
      },
    },
  } as any;
});
