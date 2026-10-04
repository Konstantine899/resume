import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * REQ-Q3 / REQ-Q4.2–4.6 — generator CLI integration tests.
 *
 * The CLI is spawned with `execFile(process.execPath, [entry, ...args])` — no
 * shell, no `spawn('node')` (Windows-safe, plan R6). Every run targets its own
 * temp root through `--root=<dir>` (or the `SLICE_ROOT` env), so the real
 * repository `src/` can never be touched by a test.
 *
 * Coverage:
 *   (a) output tree equals plan §2.3.3 — base and `--with-slice`;
 *   (b) rerun WITHOUT `--force` → exit 1 and zero bytes changed (CRITICAL);
 *   (c) `--dry-run` prints the future tree and creates nothing;
 *   (d) invalid slice names / non-generator layers are rejected;
 *   (e) template content: forbidden substrings absent, allowed path present;
 *   (f) `--force` swaps atomically and never deletes foreign files;
 *   (g) `SLICE_ROOT` env redirect works when `--root` is absent.
 */

const execFileAsync = promisify(execFile);
// NOTE: avoid the `new URL(rel, import.meta.url)` literal here — Vite rewrites
// that exact pattern to a dev-server URL inside vitest, breaking fileURLToPath.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(MODULE_DIR, '../createSlices/index.mjs');
const REPO_ROOT = path.resolve(MODULE_DIR, '../..');

/**
 * @param {string[]} args
 * @param {{ env?: Record<string, string> }} [options]
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
async function runCli(args, options = {}) {
  const env = options.env ? { ...process.env, ...options.env } : process.env;
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [ENTRY, ...args], {
      timeout: 60_000,
      env,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    if (typeof error.code === 'number') {
      return { exitCode: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
    }
    throw error;
  }
}

/** @param {string} absDir @returns {Promise<string[]>} files relative, `/`-separated, sorted */
async function listFiles(absDir) {
  const entries = await readdir(absDir, { recursive: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(absDir, entry);
    if ((await stat(abs)).isFile()) {
      files.push(entry.split(path.sep).join('/'));
    }
  }
  return files.sort();
}

/** @param {string} absDir @returns {Promise<Record<string, string>>} relPath → sha256 */
async function snapshot(absDir) {
  const files = await listFiles(absDir);
  const result = {};
  for (const rel of files) {
    const bytes = await readFile(path.join(absDir, rel));
    result[rel] = createHash('sha256').update(bytes).digest('hex');
  }
  return result;
}

describe('generate:slice CLI — validation and exit codes (REQ-G1/G2)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('rejects non-PascalCase slice names before writing anything (REQ-Q4.2)', async () => {
    for (const badName of ['lowercase', 'with-dash']) {
      const result = await runCli(['--root=' + root, 'features', badName]);
      expect(result.exitCode, `name "${badName}"`).toBe(1);
      expect(result.stdout + result.stderr).toContain('Invalid slice name');
      expect(result.stdout + result.stderr).toContain(badName);
    }
    expect(existsSync(path.join(root, 'src'))).toBe(false);
  });

  it('rejects layers outside the SSOT generatorLayers list (REQ-G2)', async () => {
    for (const badLayer of ['shared', 'nope']) {
      const result = await runCli(['--root=' + root, badLayer, 'GoodName']);
      expect(result.exitCode, `layer "${badLayer}"`).toBe(1);
      expect(result.stdout + result.stderr).toContain('Unknown layer');
    }
    expect(existsSync(path.join(root, 'src'))).toBe(false);
  });

  it('rejects missing/extra positional arguments with a usage message', async () => {
    const missing = await runCli(['--root=' + root, 'features']);
    expect(missing.exitCode).toBe(1);
    expect(missing.stdout + missing.stderr).toContain('Usage');

    const extra = await runCli(['--root=' + root, 'features', 'Ok', 'Stray']);
    expect(extra.exitCode).toBe(1);
    expect(extra.stdout + extra.stderr).toContain('Usage');
  });

  it('redirects writes through the SLICE_ROOT env when --root is absent (REQ-Q3)', async () => {
    const result = await runCli(['features', 'EnvSlice'], { env: { SLICE_ROOT: root } });
    expect(result.exitCode).toBe(0);
    expect(existsSync(path.join(root, 'src', 'features', 'EnvSlice', 'index.ts'))).toBe(true);
    // The real repository must stay untouched.
    expect(existsSync(path.join(REPO_ROOT, 'src', 'features', 'EnvSlice'))).toBe(false);
  });
});

describe('generate:slice CLI — output tree (REQ-G8, plan §2.3.3)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('base tree: index + model/types + 4 ui files, nothing else', async () => {
    const result = await runCli(['--root=' + root, 'features', 'TreeBase']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created src/features/TreeBase');

    const files = await listFiles(path.join(root, 'src', 'features', 'TreeBase'));
    expect(files).toEqual(
      [
        'index.ts',
        'model/types.ts',
        'ui/TreeBase.module.scss',
        'ui/TreeBase.stories.tsx',
        'ui/TreeBase.test.tsx',
        'ui/TreeBase.tsx',
      ].sort()
    );
  });

  it('--with-slice tree adds *Slice.ts, selectors.ts and the slice test', async () => {
    const result = await runCli(['--root=' + root, '--with-slice', 'features', 'SliceTree']);
    expect(result.exitCode).toBe(0);

    const files = await listFiles(path.join(root, 'src', 'features', 'SliceTree'));
    expect(files).toEqual(
      [
        'index.ts',
        'model/selectors.ts',
        'model/sliceTreeSlice.test.ts',
        'model/sliceTreeSlice.ts',
        'model/types.ts',
        'ui/SliceTree.module.scss',
        'ui/SliceTree.stories.tsx',
        'ui/SliceTree.test.tsx',
        'ui/SliceTree.tsx',
      ].sort()
    );
  });

  it('rerun without --force exits 1 and changes zero bytes (REQ-G5, CRITICAL)', async () => {
    const layerDir = path.join(root, 'src', 'features');
    const first = await runCli(['--root=' + root, 'features', 'RerunSlice']);
    expect(first.exitCode).toBe(0);

    const before = await snapshot(layerDir);
    expect(Object.keys(before).length).toBeGreaterThan(0);

    const second = await runCli(['--root=' + root, 'features', 'RerunSlice']);
    expect(second.exitCode).toBe(1);
    const output = second.stdout + second.stderr;
    expect(output).toContain('Target');
    expect(output).toContain('Remove it manually or rerun with --force');

    // Byte-identical tree: no file rewritten, no file added, no staging leftover.
    const after = await snapshot(layerDir);
    expect(after).toEqual(before);
  });

  it('--dry-run prints the future tree and writes nothing (REQ-G7)', async () => {
    const result = await runCli(['--root=' + root, '--dry-run', 'features', 'DrySlice']);
    expect(result.exitCode).toBe(0);
    for (const planned of [
      'index.ts',
      'model/types.ts',
      'ui/DrySlice.tsx',
      'ui/DrySlice.test.tsx',
      'ui/DrySlice.stories.tsx',
      'ui/DrySlice.module.scss',
    ]) {
      expect(result.stdout).toContain(planned);
    }
    expect(existsSync(path.join(root, 'src'))).toBe(false);
  });

  it('--force swaps the tree, keeps foreign files and leaves no leftovers (REQ-G5)', async () => {
    const sliceDir = path.join(root, 'src', 'features', 'ForceSlice');
    const first = await runCli(['--root=' + root, 'features', 'ForceSlice']);
    expect(first.exitCode).toBe(0);

    // Foreign (non-generator) files inside the target: plain and nested.
    await writeFile(path.join(sliceDir, 'notes.txt'), 'keep me');
    await mkdir(path.join(sliceDir, 'spec'), { recursive: true });
    await writeFile(path.join(sliceDir, 'spec', 'probe.ts'), 'export {};');

    const forced = await runCli([
      '--root=' + root,
      '--with-slice',
      '--force',
      'features',
      'ForceSlice',
    ]);
    expect(forced.exitCode).toBe(0);

    // Generator-owned files were replaced with the new configuration.
    expect(existsSync(path.join(sliceDir, 'model', 'forceSliceSlice.ts'))).toBe(true);
    expect(existsSync(path.join(sliceDir, 'model', 'selectors.ts'))).toBe(true);

    // Foreign files survive and are reported in the output.
    expect(await readFile(path.join(sliceDir, 'notes.txt'), 'utf8')).toBe('keep me');
    expect(await readFile(path.join(sliceDir, 'spec', 'probe.ts'), 'utf8')).toBe('export {};');
    const output = forced.stdout + forced.stderr;
    expect(output).toContain('notes.txt');
    expect(output).toContain('spec/probe.ts');

    // No .old-* / .tmp-* leftovers in the layer directory.
    const layerEntries = await readdir(path.join(root, 'src', 'features'));
    expect(layerEntries).toEqual(['ForceSlice']);
  });
});

// Windows-only: owner-approved EPERM adaptation. A real directory lock cannot
// be simulated in-process (Node opens handles with FILE_SHARE_DELETE), so a
// PowerShell child holds a FileShare::None handle on a file inside the target —
// that blocks the parent-directory rename with EPERM exactly like an editor.
describe.skipIf(process.platform !== 'win32')(
  'generate:slice CLI — locked directory hint (Windows EPERM adaptation)',
  () => {
    /** @type {string} */
    let root;
    /** @type {import('node:child_process').ChildProcess | undefined} */
    let locker;

    beforeEach(async () => {
      root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
    });

    afterEach(async () => {
      if (locker && locker.exitCode === null) {
        locker.kill();
        await new Promise((resolve) => locker.once('exit', resolve));
        locker = undefined;
      }
      await rm(root, { recursive: true, force: true });
    });

    it('--force on a locked target exits 1 with an actionable hint, staging removed, target intact', async () => {
      const sliceDir = path.join(root, 'src', 'features', 'LockSlice');
      const first = await runCli(['--root=' + root, 'features', 'LockSlice']);
      expect(first.exitCode).toBe(0);
      const before = await snapshot(path.join(root, 'src', 'features'));

      const childFile = path.join(sliceDir, 'index.ts').replace(/\\/g, '\\\\');
      const readyFile = path.join(root, 'ready.lock').replace(/\\/g, '\\\\');
      locker = spawn('powershell.exe', [
        '-NoProfile',
        '-Command',
        `$f=[IO.File]::Open('${childFile}','Open','ReadWrite','None'); ` +
          `[IO.File]::WriteAllText('${readyFile}','x'); Start-Sleep 30`,
      ]);
      // Wait until the lock is actually held (ready marker written).
      const deadline = Date.now() + 10_000;
      while (!existsSync(path.join(root, 'ready.lock')) && Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      expect(existsSync(path.join(root, 'ready.lock'))).toBe(true);

      const forced = await runCli([
        '--root=' + root,
        '--with-slice',
        '--force',
        'features',
        'LockSlice',
      ]);
      expect(forced.exitCode).toBe(1);
      const output = forced.stdout + forced.stderr;
      expect(output).toContain('Cannot swap');
      expect(output).toContain('directory is locked by another process (Windows)');
      expect(output).toContain('rerun with --force');

      // Release the lock before reading the tree back (FileShare::None blocks
      // snapshot's readFile until the locker process is gone).
      locker.kill();
      await new Promise((resolve) => locker.once('exit', resolve));
      locker = undefined;

      // Rollback: target byte-identical, no staging/.old leftovers.
      expect(await snapshot(path.join(root, 'src', 'features'))).toEqual(before);
      const layerEntries = await readdir(path.join(root, 'src', 'features'));
      expect(layerEntries).toEqual(['LockSlice']);
    }, 30_000);
  }
);

describe('generate:slice CLI — template content (REQ-Q4.6, REQ-T1–T8)', () => {
  /** @type {string} */
  let root;
  /** @type {Record<string, string>} relPath → file content */
  let files;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
    const result = await runCli(['--root=' + root, '--with-slice', 'features', 'ContentSlice']);
    expect(result.exitCode).toBe(0);

    files = {};
    const dir = path.join(root, 'src', 'features', 'ContentSlice');
    for (const rel of await listFiles(dir)) {
      files[rel] = await readFile(path.join(dir, rel), 'utf8');
    }
  }, 60_000);

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  function allContent() {
    return Object.values(files).join('\n');
  }

  it('contains no forbidden substrings (clsx/classnames/i18n/empty interface/SB6)', () => {
    const all = allContent();
    for (const forbidden of [
      'clsx',
      'classnames',
      'useTranslation',
      'shared/lib/classNames',
      'ComponentStory',
      'Template.bind',
    ]) {
      expect(all, `forbidden substring: ${forbidden}`).not.toContain(forbidden);
    }
    expect(all).not.toMatch(/interface\s+[A-Za-z0-9_]+\s*\{\s*\}/);
    expect(all).not.toMatch(/console\./);
    expect(all).not.toMatch(/: any\b/);
  });

  it('component uses the only allowed classNames path, kebab testid and camel class', () => {
    const component = files['ui/ContentSlice.tsx'];
    expect(component).toBeDefined();
    expect(component).toContain("import { classNames } from '@/shared/lib/utils/classNames';");
    expect(component).toContain("'data-testid': testId = 'content-slice'");
    expect(component).toContain('classNames(styles.contentSlice, {}, [className])');
    expect(component).toContain("import type { ContentSliceProps } from '../model/types';");
    expect(component).not.toContain('ReactNode');
  });

  it('story is Storybook 10 CSF3 with the <LayerPascal>/<Name> title', () => {
    const story = files['ui/ContentSlice.stories.tsx'];
    expect(story).toBeDefined();
    expect(story).toContain("import type { Meta, StoryObj } from '@storybook/react-vite';");
    expect(story).toContain("title: 'Features/ContentSlice'");
    expect(story).toContain("tags: ['autodocs']");
    expect(story).toContain('satisfies Meta<typeof ContentSlice>');
    expect(story).toContain('export const Default: Story');
  });

  it('types.ts always carries Props, and State/RootState with --with-slice', () => {
    const types = files['model/types.ts'];
    expect(types).toContain('export interface ContentSliceProps {');
    expect(types).toContain('export type ContentSliceState = {');
    expect(types).toContain('export type ContentSliceRootState = {');
    expect(types).toContain('contentSlice: ContentSliceState;');
    expect(types).toMatch(/interface\s+ContentSliceProps\s*\{[^}]+\}/);
  });

  it('redux model follows the lazy-hydration rule in a *Slice.ts file', () => {
    const slice = files['model/contentSliceSlice.ts'];
    expect(slice).toBeDefined();
    expect(slice).toContain("name: 'contentSlice'");
    expect(slice).toContain('resume-rtk-lazy-hydration');
    expect(slice).toContain(
      'export const contentSliceReducer: typeof contentSliceSlice.reducer = (state, action) =>'
    );
    expect(slice).toContain('contentSliceSlice.reducer(state ?? initialState, action)');
    expect(slice).toContain("import type { ContentSliceState } from './types';");
  });

  it('selectors and the slice test read the structural root state', () => {
    const selectors = files['model/selectors.ts'];
    expect(selectors).toContain('export const selectContentSliceInitialized');
    expect(selectors).toContain('(state: ContentSliceRootState): boolean');
    expect(selectors).toContain('state.contentSlice.initialized');

    const sliceTest = files['model/contentSliceSlice.test.ts'];
    expect(sliceTest).toContain("import { describe, expect, it } from 'vitest';");
    expect(sliceTest).toContain("toBe('contentSlice/setInitialized')");
    expect(sliceTest).toContain('selectContentSliceInitialized');
  });

  it('style module has the camel class with a mandatory comment', () => {
    const style = files['ui/ContentSlice.module.scss'];
    expect(style).toContain('.contentSlice {');
    expect(style).toContain('/* styles go here */');
  });

  it('public API is named re-exports only, slice-aware', () => {
    const index = files['index.ts'];
    expect(index).toContain("export { ContentSlice } from './ui/ContentSlice';");
    expect(index).toContain("export type { ContentSliceProps } from './model/types';");
    expect(index).toContain(
      "export type { ContentSliceState, ContentSliceRootState } from './model/types';"
    );
    expect(index).toContain(
      "export { contentSliceReducer, setInitialized } from './model/contentSliceSlice';"
    );
    expect(index).toContain("export { selectContentSliceInitialized } from './model/selectors';");
    expect(index).not.toContain('export *');
  });
});
