import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: {
        src: srcDir,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        util: 'util/',
        buffer: 'buffer',
        vm: 'vm-browserify',
      },
    },
    define: {
      'process.env': JSON.stringify({ ...env, NODE_ENV: mode }),
      global: 'globalThis',
    },
    optimizeDeps: {
      esbuildOptions: {
        define: { global: 'globalThis' },
      },
    },
  };
});
