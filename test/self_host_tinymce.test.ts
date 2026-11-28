import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { PluginOption, ResolvedConfig } from 'vite';
import viteConfigPromise, { copyTinyMceRuntime, selfHostTinyMce } from '../vite.config';

const realTinyMceRoot = path.resolve(process.cwd(), 'node_modules/tinymce');
const cwdDistTinyMce = path.resolve(process.cwd(), 'dist/tinymce');

const RUNTIME_PATHS = [
  'tinymce.min.js',
  'license.md',
  'themes',
  'skins',
  'icons',
  'models',
  ...['advlist', 'anchor', 'autolink', 'charmap', 'code', 'fullscreen', 'help', 'image', 'insertdatetime',
    'link', 'lists', 'media', 'preview', 'searchreplace', 'table', 'visualblocks', 'wordcount']
    .map((plugin) => path.join('plugins', plugin)),
];

type HookFn = (...args: unknown[]) => unknown;

function callHook(hook: unknown, ...args: unknown[]): unknown {
  const fn = (typeof hook === 'function' ? hook : (hook as { handler: HookFn }).handler) as HookFn;
  return fn(...args);
}

function snapshotCwdDist(): string {
  if (!fs.existsSync(cwdDistTinyMce)) return 'absent';
  return String(fs.statSync(cwdDistTinyMce).mtimeMs);
}

function flattenPlugins(plugins: PluginOption[]): PluginOption[] {
  return plugins.flatMap((entry) => (Array.isArray(entry) ? flattenPlugins(entry) : [entry]));
}

describe('self-host-tinymce build copy', () => {
  let tmpRoot: string;

  beforeEach(() => {
    tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'jam-tinymce-'));
  });

  afterEach(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('copies the runtime and all 17 used plugins into <outDir>/tinymce', () => {
    const outDir = path.join(tmpRoot, 'out');
    copyTinyMceRuntime(realTinyMceRoot, outDir);
    const missing = RUNTIME_PATHS.filter((rel) => !fs.existsSync(path.join(outDir, 'tinymce', rel)));
    expect(missing).toEqual([]);
  });

  it('copies into the resolved --outDir and leaves ./dist untouched', () => {
    const before = snapshotCwdDist();
    const plugin = selfHostTinyMce(true, realTinyMceRoot);
    const runDist = path.join(tmpRoot, 'jammusic-e2e-stack-run', 'dist');
    callHook(plugin.configResolved, { root: tmpRoot, build: { outDir: runDist } } as unknown as ResolvedConfig);
    callHook(plugin.closeBundle);

    expect(fs.existsSync(path.join(runDist, 'tinymce', 'tinymce.min.js'))).toBe(true);
    expect(fs.existsSync(path.join(runDist, 'tinymce', 'plugins', 'wordcount'))).toBe(true);
    expect(snapshotCwdDist()).toBe(before);
  });

  it('resolves a relative outDir against the config root', () => {
    const plugin = selfHostTinyMce(true, realTinyMceRoot);
    callHook(plugin.configResolved, { root: tmpRoot, build: { outDir: 'build-out' } } as unknown as ResolvedConfig);
    callHook(plugin.closeBundle);
    expect(fs.existsSync(path.join(tmpRoot, 'build-out', 'tinymce', 'tinymce.min.js'))).toBe(true);
  });

  it('refuses the build and writes nothing when a runtime file or plugin is missing', () => {
    const fakeRoot = path.join(tmpRoot, 'tinymce');
    fs.cpSync(realTinyMceRoot, fakeRoot, { recursive: true });
    fs.rmSync(path.join(fakeRoot, 'plugins', 'wordcount'), { recursive: true });
    const outDir = path.join(tmpRoot, 'out');

    expect(() => copyTinyMceRuntime(fakeRoot, outDir)).toThrow(/missing TinyMCE runtime files.*plugins[/\\]wordcount/);
    expect(fs.existsSync(path.join(outDir, 'tinymce'))).toBe(false);
  });

  it('refuses the build when node_modules/tinymce is absent', () => {
    const plugin = selfHostTinyMce(true, path.join(tmpRoot, 'no-tinymce'));
    callHook(plugin.configResolved, { root: tmpRoot, build: { outDir: 'out' } } as unknown as ResolvedConfig);
    expect(() => callHook(plugin.closeBundle)).toThrow(/tinymce\.min\.js/);
    expect(fs.existsSync(path.join(tmpRoot, 'out'))).toBe(false);
  });

  it('copies nothing outside a build', () => {
    const plugin = selfHostTinyMce(false, realTinyMceRoot);
    callHook(plugin.configResolved, { root: tmpRoot, build: { outDir: 'out' } } as unknown as ResolvedConfig);
    callHook(plugin.closeBundle);
    expect(fs.existsSync(path.join(tmpRoot, 'out'))).toBe(false);
  });

  it('is registered in the production build config', async () => {
    const original = process.env.ALLOW_LOCALHOST_BACKEND;
    process.env.ALLOW_LOCALHOST_BACKEND = 'true';
    try {
      const config = await viteConfigPromise({ mode: 'production', command: 'build' });
      const names = flattenPlugins(config.plugins ?? [])
        .filter((p): p is { name: string } => typeof p === 'object' && p !== null && 'name' in p)
        .map((p) => p.name);
      expect(names).toContain('self-host-tinymce');
    } finally {
      if (original === undefined) delete process.env.ALLOW_LOCALHOST_BACKEND;
      else process.env.ALLOW_LOCALHOST_BACKEND = original;
    }
  });
});
