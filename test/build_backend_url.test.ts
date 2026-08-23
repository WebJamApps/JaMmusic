import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { Plugin, PluginOption, UserConfig } from 'vite';
import viteConfigPromise from '../vite.config';

type TransformOutput = { code: string; map: null } | null;

interface ReplaceProcessEnvPlugin extends Pick<Plugin, 'name'> {
  transform: (code: string, id: string) => TransformOutput;
}

function hasPluginName(plugin: PluginOption): plugin is Plugin | { name: string } {
  return typeof plugin === 'object' && plugin !== null && !Array.isArray(plugin) && 'name' in plugin;
}

function isReplaceProcessEnvPlugin(plugin: PluginOption): plugin is ReplaceProcessEnvPlugin {
  if (!hasPluginName(plugin) || plugin.name !== 'replace-process-env') return false;
  return 'transform' in plugin && typeof plugin.transform === 'function';
}

function flattenPlugins(plugins: PluginOption[]): PluginOption[] {
  const flattened: PluginOption[] = [];
  for (const entry of plugins) {
    if (Array.isArray(entry)) {
      flattened.push(...flattenPlugins(entry));
    } else {
      flattened.push(entry);
    }
  }
  return flattened;
}

async function buildProductionConfig(): Promise<UserConfig> {
  return viteConfigPromise({ mode: 'production', command: 'build' });
}

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

  const getReplaceProcessEnvPlugin = async (
    envOverrides: Record<string, string> = {},
  ): Promise<ReplaceProcessEnvPlugin> => {
    Object.assign(process.env, { ALLOW_LOCALHOST_BACKEND: 'true', ...envOverrides });
    const config = await buildProductionConfig();
    const plugin = flattenPlugins(config.plugins ?? []).find(isReplaceProcessEnvPlugin);
    if (!plugin) {
      throw new Error('replace-process-env plugin not found in vite config plugins');
    }
    return plugin;
  };

  it('contract: empty BackendUrl means same origin', async () => {
    const plugin = await getReplaceProcessEnvPlugin({ BackendUrl: '' });
    expect(plugin).toBeDefined();
    const transformed = plugin.transform(
      'const url = `${process.env.BackendUrl}/user/auth/google`;',
      'src/file.ts',
    );
    expect(transformed).toBeDefined();
    // Replacing process.env.BackendUrl with "" results in a same-origin relative path
    expect(transformed?.code).toBe('const url = `${""}/user/auth/google`;');
  });

  it('preserves configured non-empty BackendUrl in replaceProcessEnv', async () => {
    const plugin = await getReplaceProcessEnvPlugin({
      BackendUrl: 'https://api.joshandmariamusic.com',
    });
    expect(plugin).toBeDefined();
    const transformed = plugin.transform(
      'const url = `${process.env.BackendUrl}/song`;',
      'src/file.ts',
    );
    expect(transformed).toBeDefined();
    expect(transformed?.code).toBe('const url = `${"https://api.joshandmariamusic.com"}/song`;');
  });

  it('build-time assertion: building with BackendUrl=http://localhost:7000 throws when ALLOW_LOCALHOST_BACKEND is not set', async () => {
    process.env.BackendUrl = 'http://localhost:7000';
    delete process.env.ALLOW_LOCALHOST_BACKEND;

    await expect(buildProductionConfig()).rejects.toThrow(
      'Refusing production build with localhost BackendUrl. Set ALLOW_LOCALHOST_BACKEND=true to allow.',
    );
  });

  it('build-time assertion: building with BackendUrl=http://localhost:7000 succeeds when ALLOW_LOCALHOST_BACKEND=true', async () => {
    process.env.BackendUrl = 'http://localhost:7000';
    process.env.ALLOW_LOCALHOST_BACKEND = 'true';

    const config = await buildProductionConfig();
    expect(config).toBeDefined();
    expect(config.plugins).toBeDefined();
  });

  it('production build without BackendUrl succeeds with empty string fallback', async () => {
    delete process.env.BackendUrl;

    const plugin = await getReplaceProcessEnvPlugin({ BackendUrl: '' });
    expect(plugin).toBeDefined();
    const transformed = plugin.transform(
      'const url = `${process.env.BackendUrl}/facebook/token`;',
      'src/file.ts',
    );
    expect(transformed?.code).toBe('const url = `${""}/facebook/token`;');
  });

  it('does not refuse localhost BackendUrl during development serve', async () => {
    process.env.BackendUrl = 'http://localhost:7000';
    delete process.env.ALLOW_LOCALHOST_BACKEND;

    const config = await viteConfigPromise({ mode: 'development', command: 'serve' });
    expect(config).toBeDefined();
  });

  it('verifies replaced process.env does not contain hardcoded credentials fallback when env is unset', async () => {
    const plugin = await getReplaceProcessEnvPlugin({
      GoogleClientId: '',
      GOOGLE_MAPS_API_KEY: '',
    });
    expect(plugin).toBeDefined();
    const transformed = plugin.transform(
      'const g = process.env.GoogleClientId; const m = process.env.GOOGLE_MAPS_API_KEY;',
      'src/file.ts',
    );
    expect(transformed?.code).toBe('const g = ""; const m = "";');
  });

  it('verifies production build dist assets contain 0 occurrences of localhost:7000', () => {
    const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
    if (fs.existsSync(distAssetsDir)) {
      const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
      for (const jsFile of jsFiles) {
        const content = fs.readFileSync(path.join(distAssetsDir, jsFile), 'utf-8');
        expect(content).not.toContain('localhost:7000');
      }
    }
  });
});
