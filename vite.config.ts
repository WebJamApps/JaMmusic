import { defineConfig, loadEnv, type Plugin } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

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
  return {
    plugins: [replaceProcessEnv(env), react()],
    server: {
      port: Number(env.PORT) || 7878,
    },
    resolve: {
      alias: {
        src: srcDir,
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
  };
});
