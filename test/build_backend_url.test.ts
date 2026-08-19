/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import viteConfigPromise from '../vite.config';

describe('BackendUrl contract and build-time assertions', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.BackendUrl;
    delete process.env.ALLOW_LOCALHOST_BACKEND;
    delete process.env.GoogleClientId;
    delete process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.APP_NAME;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  const getReplaceProcessEnvPlugin = async (envOverrides: Record<string, string> = {}) => {
    Object.assign(process.env, envOverrides);
    const config = await (viteConfigPromise as any)({ mode: 'production', command: 'build' });
    const plugin = (config.plugins as any[])
      .flat()
      .find((p: any) => p && p.name === 'replace-process-env');
    return plugin;
  };

  it('contract: empty BackendUrl means same origin', async () => {
    const plugin = await getReplaceProcessEnvPlugin({ BackendUrl: '' });
    expect(plugin).toBeDefined();
    const transformed = (plugin.transform as any)(
      'const url = `${process.env.BackendUrl}/user/auth/google`;',
      'src/file.ts',
    );
    expect(transformed).toBeDefined();
    // Replacing process.env.BackendUrl with "" results in a same-origin relative path
    expect(transformed.code).toBe('const url = `${""}/user/auth/google`;');
  });

  it('preserves configured non-empty BackendUrl in replaceProcessEnv', async () => {
    const plugin = await getReplaceProcessEnvPlugin({
      BackendUrl: 'https://api.joshandmariamusic.com',
    });
    expect(plugin).toBeDefined();
    const transformed = (plugin.transform as any)(
      'const url = `${process.env.BackendUrl}/song`;',
      'src/file.ts',
    );
    expect(transformed).toBeDefined();
    expect(transformed.code).toBe('const url = `${"https://api.joshandmariamusic.com"}/song`;');
  });

  it('build-time assertion: building with BackendUrl=http://localhost:7000 throws when ALLOW_LOCALHOST_BACKEND is not set', async () => {
    process.env.BackendUrl = 'http://localhost:7000';
    delete process.env.ALLOW_LOCALHOST_BACKEND;

    await expect(
      (viteConfigPromise as any)({ mode: 'production', command: 'build' }),
    ).rejects.toThrow(
      'Refusing production build with localhost BackendUrl. Set ALLOW_LOCALHOST_BACKEND=true to allow.',
    );
  });

  it('build-time assertion: building with BackendUrl=http://localhost:7000 succeeds when ALLOW_LOCALHOST_BACKEND=true', async () => {
    process.env.BackendUrl = 'http://localhost:7000';
    process.env.ALLOW_LOCALHOST_BACKEND = 'true';

    const config = await (viteConfigPromise as any)({ mode: 'production', command: 'build' });
    expect(config).toBeDefined();
    expect(config.plugins).toBeDefined();
  });

  it('production build without BackendUrl succeeds with empty string fallback', async () => {
    delete process.env.BackendUrl;

    const plugin = await getReplaceProcessEnvPlugin();
    expect(plugin).toBeDefined();
    const transformed = (plugin.transform as any)(
      'const url = `${process.env.BackendUrl}/facebook/token`;',
      'src/file.ts',
    );
    expect(transformed.code).toBe('const url = `${""}/facebook/token`;');
  });

  it('does not refuse localhost BackendUrl during development serve', async () => {
    process.env.BackendUrl = 'http://localhost:7000';
    delete process.env.ALLOW_LOCALHOST_BACKEND;

    const config = await (viteConfigPromise as any)({ mode: 'development', command: 'serve' });
    expect(config).toBeDefined();
  });

  it('verifies production build dist assets contain 0 occurrences of localhost:7000 or hardcoded credentials', () => {
    const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
    if (fs.existsSync(distAssetsDir)) {
      const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(path.join(distAssetsDir, jsFile), 'utf-8');
        expect(content).not.toContain('localhost:7000');
        expect(content).not.toContain('702173574211-lo764q6i5k1c5brj29g28ltrjcbvq2hn');
        expect(content).not.toContain('AIzaSyDtwXQPQwJWf3DlW74ZcU-llcaJzZZXCpo');
      }
    }
  });
});
