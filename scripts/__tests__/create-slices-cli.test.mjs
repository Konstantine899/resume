import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * REQ-Q3 / REQ-Q4.2–4.11 — generator CLI integration tests (spec-phase workflow).
 *
 * The CLI is spawned with `execFile(process.execPath, [entry, ...args])` — no
 * shell, no `spawn('node')` (Windows-safe, plan R6). Every run targets its own
 * temp root through `--root=<dir>` (or the `SLICE_ROOT` env), so the real
 * repository `src/` can never be touched by a test.
 *
 * Coverage:
 *   (a) PHASE A (default): tree is exactly spec/SPEC.md + spec/TODO.md (REQ-G14);
 *   (b) PHASE B (--scaffold): gate on missing SPEC / status (REQ-G15), code tree
 *       equals REQ-G8 / ARCH-1, spec/ preserved byte-identical;
 *   (c) rerun WITHOUT `--force` → exit 1 and zero bytes changed (CRITICAL);
 *   (d) `--dry-run` prints the future tree and creates nothing (REQ-G7);
 *   (e) invalid slice names / non-generator layers are rejected;
 *   (f) template content: forbidden substrings absent, allowed path present;
 *   (g) `--force` swaps atomically and never deletes foreign files;
 *   (h) `.gitignore` allowlists spec files in every generator layer (REQ-G14);
 *   (i) `SLICE_ROOT` env redirect works when `--root` is absent.
 */

const execFileAsync = promisify(execFile);
// NOTE: avoid the `new URL(rel, import.meta.url)` literal here — Vite rewrites
// that exact pattern to a dev-server URL inside vitest, breaking fileURLToPath.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(MODULE_DIR, '../createSlices/index.mjs');
const REPO_ROOT = path.resolve(MODULE_DIR, '../..');

/**
 * @param {string[]} args
 * @param {{ env?: Record<string, string>, cwd?: string, bin?: string }} [options]
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
async function run(args, options = {}) {
  const env = options.env ? { ...process.env, ...options.env } : process.env;
  try {
    const { stdout, stderr } = await execFileAsync(options.bin ?? process.execPath, args, {
      timeout: 60_000,
      env,
      cwd: options.cwd,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    if (typeof error.code === 'number') {
      return { exitCode: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
    }
    throw error;
  }
}

/** @param {string[]} args @param {{ env?: Record<string, string> }} [options] */
function runCli(args, options = {}) {
  return run([ENTRY, ...args], options);
}

/** `git check-ignore <path>` → exit 0 = ignored, exit 1 = NOT ignored. */
function runGitIgnore(relPath) {
  return run(['check-ignore', relPath], { bin: 'git', cwd: REPO_ROOT });
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

/** Flip the generated SPEC frontmatter `status: draft` → `status: approved` (REQ-G15). */
async function approveSpec(sliceDir) {
  const specPath = path.join(sliceDir, 'spec', 'SPEC.md');
  const content = await readFile(specPath, 'utf8');
  const approved = content.replace('status: draft', 'status: approved');
  expect(approved, 'generated SPEC must start from status: draft').not.toBe(content);
  await writeFile(specPath, approved);
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
    expect(
      existsSync(path.join(root, 'src', 'features', 'EnvSlice', 'spec', 'SPEC.md'))
    ).toBe(true);
    // The real repository must stay untouched.
    expect(existsSync(path.resolve(REPO_ROOT, 'src/features/EnvSlice'))).toBe(false);
  });
});

describe('generate:slice CLI — phase A default spec scaffold (REQ-G14)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('base tree is exactly spec/SPEC.md + spec/TODO.md, nothing else (REQ-Q4.10)', async () => {
    const result = await runCli(['--root=' + root, 'features', 'TreeBase']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Created src/features/TreeBase');

    const files = await listFiles(path.join(root, 'src', 'features', 'TreeBase'));
    expect(files).toEqual(['spec/SPEC.md', 'spec/TODO.md']);
  });

  it('SPEC frontmatter starts at draft and the template carries the required sections', async () => {
    const result = await runCli(['--root=' + root, 'features', 'DraftSlice']);
    expect(result.exitCode).toBe(0);

    const spec = await readFile(
      path.join(root, 'src', 'features', 'DraftSlice', 'spec', 'SPEC.md'),
      'utf8'
    );
    expect(spec).toContain('status: draft');
    expect(spec).toContain('## Goal');
    expect(spec).toContain('## Acceptance criteria');
    expect(spec).toContain('## Plan files');
    expect(spec).toContain('`index.ts`');
    expect(spec).toContain('`model/types/types.ts`');
  });

  it('TODO carries the storeReducers Work unit iff --with-slice (REQ-G11/G14)', async () => {
    const plain = await runCli(['--root=' + root, 'features', 'PlainA']);
    expect(plain.exitCode).toBe(0);
    const plainTodo = await readFile(
      path.join(root, 'src', 'features', 'PlainA', 'spec', 'TODO.md'),
      'utf8'
    );
    expect(plainTodo).toContain('## Work units');
    expect(plainTodo).not.toContain('storeReducers');

    const sliced = await runCli(['--root=' + root, '--with-slice', 'features', 'SlicedA']);
    expect(sliced.exitCode).toBe(0);
    const slicedTodo = await readFile(
      path.join(root, 'src', 'features', 'SlicedA', 'spec', 'TODO.md'),
      'utf8'
    );
    expect(slicedTodo).toContain('src/storeReducers.ts');
    expect(slicedTodo).toContain('slicedASlice');
    expect(slicedTodo).toContain("model/slices/slicedASlice");
    // Composition-root steps live in the TODO, never on the console (REQ-G11).
    expect(sliced.stdout).not.toContain('Next steps');
    expect(sliced.stdout).toContain('spec/TODO.md');
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

  it('--dry-run prints the spec tree and writes nothing (REQ-G7)', async () => {
    const result = await runCli(['--root=' + root, '--dry-run', 'features', 'DrySlice']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('spec/SPEC.md');
    expect(result.stdout).toContain('spec/TODO.md');
    expect(existsSync(path.join(root, 'src'))).toBe(false);
  });

  it('--force replaces the spec pair but never deletes code or foreign files (REQ-G14/G5)', async () => {
    const sliceDir = path.join(root, 'src', 'features', 'ForceSlice');
    // Phase A → scaffold (approved) so the slice also holds generator code.
    const first = await runCli(['--root=' + root, 'features', 'ForceSlice']);
    expect(first.exitCode).toBe(0);
    await approveSpec(sliceDir);
    const scaffolded = await runCli(['--root=' + root, '--scaffold', 'features', 'ForceSlice']);
    expect(scaffolded.exitCode).toBe(0);

    // A foreign file at the slice root.
    await writeFile(path.join(sliceDir, 'notes.txt'), 'keep me');
    // A human-edited SPEC — owned by phase A, so --force replaces it.
    const specPath = path.join(sliceDir, 'spec', 'SPEC.md');
    await writeFile(specPath, '---\nstatus: approved\n---\n# CUSTOM-MARKER\n');

    const forced = await runCli(['--root=' + root, '--force', 'features', 'ForceSlice']);
    expect(forced.exitCode).toBe(0);

    // Spec pair replaced with the phase-A template again.
    const specAfter = await readFile(specPath, 'utf8');
    expect(specAfter).not.toContain('CUSTOM-MARKER');
    expect(specAfter).toContain('status: draft');

    // Code and foreign files survive and foreign files are reported.
    expect(existsSync(path.join(sliceDir, 'index.ts'))).toBe(true);
    expect(existsSync(path.join(sliceDir, 'ui', 'ForceSlice', 'ForceSlice.tsx'))).toBe(true);
    expect(await readFile(path.join(sliceDir, 'notes.txt'), 'utf8')).toBe('keep me');
    const output = forced.stdout + forced.stderr;
    expect(output).toContain('notes.txt');

    // No .old-* / .tmp-* leftovers in the layer directory.
    const layerEntries = await readdir(path.join(root, 'src', 'features'));
    expect(layerEntries).toEqual(['ForceSlice']);
  });
});

describe('generate:slice CLI — phase B --scaffold gate and tree (REQ-G15, REQ-G8)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('exits 1 without spec/SPEC.md and points at the phase-A command (REQ-Q4.11)', async () => {
    const result = await runCli(['--root=' + root, '--scaffold', 'features', 'NeverMade']);
    expect(result.exitCode).toBe(1);
    const output = result.stdout + result.stderr;
    expect(output).toContain('phase A');
    expect(output).toContain('generate:slice');
    // Nothing was created: no slice dir, no staging leftovers.
    expect(existsSync(path.join(root, 'src', 'features', 'NeverMade'))).toBe(false);
    expect(existsSync(path.join(root, 'src'))).toBe(false);
  });

  it('exits 1 while status is draft and changes zero bytes (REQ-Q4.11, CRITICAL)', async () => {
    const sliceDir = path.join(root, 'src', 'features', 'DraftSlice');
    const phaseA = await runCli(['--root=' + root, 'features', 'DraftSlice']);
    expect(phaseA.exitCode).toBe(0);
    const before = await snapshot(sliceDir);

    const result = await runCli(['--root=' + root, '--scaffold', 'features', 'DraftSlice']);
    expect(result.exitCode).toBe(1);
    const output = result.stdout + result.stderr;
    expect(output).toContain('draft');
    expect(output).toContain('approved');
    expect(await snapshot(sliceDir)).toEqual(before);
  });

  it('emits the base code tree when status is approved (REQ-Q4.11)', async () => {
    const sliceDir = path.join(root, 'src', 'features', 'ApprovedBase');
    const phaseA = await runCli(['--root=' + root, 'features', 'ApprovedBase']);
    expect(phaseA.exitCode).toBe(0);
    await approveSpec(sliceDir);

    const result = await runCli(['--root=' + root, '--scaffold', 'features', 'ApprovedBase']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('spec/TODO.md');

    const files = await listFiles(sliceDir);
    expect(files).toEqual(
      [
        'index.ts',
        'model/types/types.ts',
        'spec/SPEC.md',
        'spec/TODO.md',
        'ui/ApprovedBase/ApprovedBase.module.scss',
        'ui/ApprovedBase/ApprovedBase.stories.tsx',
        'ui/ApprovedBase/ApprovedBase.test.tsx',
        'ui/ApprovedBase/ApprovedBase.tsx',
      ].sort()
    );
  });

  it('--scaffold --with-slice adds slices/<name>Slice.ts, selectors and the test', async () => {
    const sliceDir = path.join(root, 'src', 'features', 'ApprovedSlice');
    const phaseA = await runCli(['--root=' + root, '--with-slice', 'features', 'ApprovedSlice']);
    expect(phaseA.exitCode).toBe(0);
    await approveSpec(sliceDir);

    const result = await runCli([
      '--root=' + root,
      '--scaffold',
      '--with-slice',
      'features',
      'ApprovedSlice',
    ]);
    expect(result.exitCode).toBe(0);

    const files = await listFiles(sliceDir);
    expect(files).toEqual(
      [
        'index.ts',
        'model/selectors/selectors.ts',
        'model/slices/approvedSliceSlice.test.ts',
        'model/slices/approvedSliceSlice.ts',
        'model/types/types.ts',
        'spec/SPEC.md',
        'spec/TODO.md',
        'ui/ApprovedSlice/ApprovedSlice.module.scss',
        'ui/ApprovedSlice/ApprovedSlice.stories.tsx',
        'ui/ApprovedSlice/ApprovedSlice.test.tsx',
        'ui/ApprovedSlice/ApprovedSlice.tsx',
      ].sort()
    );
  });

  it('preserves the human-owned spec/ byte-identical through scaffolding (REQ-G15)', async () => {
    const sliceDir = path.join(root, 'src', 'features', 'SpecOwned');
    const phaseA = await runCli(['--root=' + root, 'features', 'SpecOwned']);
    expect(phaseA.exitCode).toBe(0);
    await approveSpec(sliceDir);
    // Human annotation that the generator must never touch.
    await writeFile(
      path.join(sliceDir, 'spec', 'SPEC.md'),
      (await readFile(path.join(sliceDir, 'spec', 'SPEC.md'), 'utf8')) +
        '\n<!-- human-note: keep me -->\n'
    );
    const before = await snapshot(path.join(sliceDir, 'spec'));

    const first = await runCli(['--root=' + root, '--scaffold', 'features', 'SpecOwned']);
    expect(first.exitCode).toBe(0);
    // Rerun without --force: scaffold always swaps, spec still untouched.
    const second = await runCli(['--root=' + root, '--scaffold', 'features', 'SpecOwned']);
    expect(second.exitCode).toBe(0);

    expect(await snapshot(path.join(sliceDir, 'spec'))).toEqual(before);
    expect(existsSync(path.join(sliceDir, 'index.ts'))).toBe(true);
  });
});

describe('generate:slice CLI — template content (REQ-Q4.6, REQ-T1–T8)', () => {
  /** @type {string} */
  let root;
  /** @type {Record<string, string>} relPath → file content */
  let files;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'slice-gen-'));
    const sliceDir = path.join(root, 'src', 'features', 'ContentSlice');
    const phaseA = await runCli(['--root=' + root, '--with-slice', 'features', 'ContentSlice']);
    expect(phaseA.exitCode).toBe(0);
    await approveSpec(sliceDir);
    const scaffold = await runCli([
      '--root=' + root,
      '--scaffold',
      '--with-slice',
      'features',
      'ContentSlice',
    ]);
    expect(scaffold.exitCode).toBe(0);

    files = {};
    for (const rel of await listFiles(sliceDir)) {
      files[rel] = await readFile(path.join(sliceDir, rel), 'utf8');
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
    const component = files['ui/ContentSlice/ContentSlice.tsx'];
    expect(component).toBeDefined();
    expect(component).toContain("import { classNames } from '@/shared/lib/utils/classNames';");
    expect(component).toContain("'data-testid': testId = 'content-slice'");
    expect(component).toContain('classNames(styles.contentSlice, {}, [className])');
    expect(component).toContain("import type { ContentSliceProps } from '../../model/types/types';");
    expect(component).not.toContain('ReactNode');
  });

  it('story is Storybook 10 CSF3 with the <LayerPascal>/<Name> title', () => {
    const story = files['ui/ContentSlice/ContentSlice.stories.tsx'];
    expect(story).toBeDefined();
    expect(story).toContain("import type { Meta, StoryObj } from '@storybook/react-vite';");
    expect(story).toContain("title: 'Features/ContentSlice'");
    expect(story).toContain("tags: ['autodocs']");
    expect(story).toContain('satisfies Meta<typeof ContentSlice>');
    expect(story).toContain('export const Default: Story');
  });

  it('types/types.ts carries Props, and State/RootState with --with-slice', () => {
    const types = files['model/types/types.ts'];
    expect(types).toContain('export interface ContentSliceProps {');
    expect(types).toContain('export type ContentSliceState = {');
    expect(types).toContain('export type ContentSliceRootState = {');
    expect(types).toContain('contentSlice: ContentSliceState;');
    expect(types).toMatch(/interface\s+ContentSliceProps\s*\{[^}]+\}/);
  });

  it('redux model follows the lazy-hydration rule in model/slices/<name>Slice.ts', () => {
    const slice = files['model/slices/contentSliceSlice.ts'];
    expect(slice).toBeDefined();
    expect(slice).toContain("name: 'contentSlice'");
    expect(slice).toContain('resume-rtk-lazy-hydration');
    expect(slice).toContain(
      'export const contentSliceReducer: typeof contentSliceSlice.reducer = (state, action) =>'
    );
    expect(slice).toContain('contentSliceSlice.reducer(state ?? initialState, action)');
    expect(slice).toContain("import type { ContentSliceState } from '../types/types';");
  });

  it('selectors and the slice test read the structural root state', () => {
    const selectors = files['model/selectors/selectors.ts'];
    expect(selectors).toContain('export const selectContentSliceInitialized');
    expect(selectors).toContain('(state: ContentSliceRootState): boolean');
    expect(selectors).toContain("from '../types/types'");
    expect(selectors).toContain('state.contentSlice.initialized');

    const sliceTest = files['model/slices/contentSliceSlice.test.ts'];
    expect(sliceTest).toContain("import { describe, expect, it } from 'vitest';");
    expect(sliceTest).toContain("toBe('contentSlice/setInitialized')");
    expect(sliceTest).toContain('selectContentSliceInitialized');
  });

  it('style module has the camel class with a mandatory comment', () => {
    const style = files['ui/ContentSlice/ContentSlice.module.scss'];
    expect(style).toContain('.contentSlice {');
    expect(style).toContain('/* styles go here */');
  });

  it('public API is named re-exports only, slice-aware', () => {
    const index = files['index.ts'];
    expect(index).toContain("export { ContentSlice } from './ui/ContentSlice/ContentSlice';");
    expect(index).toContain("export type { ContentSliceProps } from './model/types/types';");
    expect(index).toContain(
      "export type { ContentSliceState, ContentSliceRootState } from './model/types/types';"
    );
    expect(index).toContain(
      "export { contentSliceReducer, setInitialized } from './model/slices/contentSliceSlice';"
    );
    expect(index).toContain("export { selectContentSliceInitialized } from './model/selectors/selectors';");
    expect(index).not.toContain('export *');
  });
});

describe('generate:slice CLI — .gitignore allowlists spec files everywhere (REQ-G14)', () => {
  it('git check-ignore reports NOT ignored for every generator layer', async () => {
    for (const layer of ['features', 'entities', 'pages', 'widgets']) {
      const result = await runGitIgnore(`src/${layer}/Probe/spec/SPEC.md`);
      expect(result.exitCode, `src/${layer}/Probe/spec/SPEC.md must not be ignored`).toBe(1);
      const todo = await runGitIgnore(`src/${layer}/Probe/spec/TODO.md`);
      expect(todo.exitCode, `src/${layer}/Probe/spec/TODO.md must not be ignored`).toBe(1);
    }
  });
});
