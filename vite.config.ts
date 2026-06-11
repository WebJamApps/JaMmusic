/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import pkg from './package.json';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const testDir = fileURLToPath(new URL('./test', import.meta.url));
const certDir = fileURLToPath(new URL('./.certs', import.meta.url));

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
  'HashString',
  'APP_NAME',
  'SCS_HOST',
  'SCS_PORT',
  'SOCKETCLUSTER_SECURE',
  'userRoles',
  'TINY_KEY',
  'FB_APP_ID',
  'NODE_ENV',
] as const;

function replaceProcessEnv(env: Record<string, string>): Plugin {
  return {
    name: 'replace-process-env',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id)) return null;
      let out = code;
      for (const key of APP_ENV_KEYS) {
        const re = new RegExp(`process\\.env\\.${key}\\b`, 'g');
        out = out.replace(re, JSON.stringify(env[key] ?? ''));
      }
      return out === code ? null : { code: out, map: null };
    },
  };
}

export default defineConfig(async ({ mode }) => {
  const env: Record<string, string> = { ...loadEnv(mode, process.cwd(), ''), NODE_ENV: mode };
  const isTest = mode === 'test' || process.env.VITEST;
  // `vitest/config` is a devDependency — import it lazily so a production
  // build (npm install --omit=dev) never tries to resolve it.
  const testExclude = isTest
    ? [...(await import('vitest/config')).configDefaults.exclude, 'test/e2e/**']
    : ['test/e2e/**'];
  return {
    plugins: [
      ...(isTest ? [] : [
        replaceProcessEnv(env),
        checker({ typescript: { tsconfigPath: './tsconfig.prod.json' } }),
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
      },
    },
  } as any;
});
