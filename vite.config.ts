/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const testDir = fileURLToPath(new URL('./test', import.meta.url));

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

export default defineConfig(({ mode }) => {
  const env: Record<string, string> = { ...loadEnv(mode, process.cwd(), ''), NODE_ENV: mode };
  const isTest = mode === 'test' || process.env.VITEST;
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
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/vitest.setup.ts'],
      css: false,
      mockReset: true,
      testTimeout: 40000,
      include: ['test/**/*.{test,spec}.{ts,tsx}'],
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
  };
});
