import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * REQ-R1 / REQ-Q4.8 — `update-imports` CLI tests (TDD: written before the tool).
 *
 * The tool is spawned with `execFile(process.execPath, [entry, ...args])` — no
 * shell (Windows-safe, plan R6) — against its own temp root via `--root=<dir>`,
 * so the real repository `src/` can never be touched by a test.
 *
 * Coverage:
 *   (a) `startsWithFsdLayer` accepts bare FSD-layer specifiers only (fixes the
 *       source's `isAbsolute` misnomer — no naive `startsWith` false hits);
 *   (b) dry-run prints ONLY bare specifiers and rewrites nothing (exit 1 while
 *       findings exist, exit 0 on an all-`@/` tree);
 *   (c) `--fix` rewrites bare specifiers to `@/…` and leaves aliased,
 *       relative and package specifiers byte-identical;
 *   (d) second `--fix` run reports 0 changes (REQ-R4 idempotency);
 *   (e) unknown flags are rejected with a usage message (exit 1).
 */

const execFileAsync = promisify(execFile);
// NOTE: avoid the `new URL(rel, import.meta.url)` literal here — Vite rewrites
// that exact pattern to a dev-server URL inside vitest, breaking fileURLToPath.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(MODULE_DIR, '../refactoring/update-imports.mjs');

/**
 * @param {string[]} args
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
async function runTool(args) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [ENTRY, ...args], {
      timeout: 60_000,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    if (typeof error.code === 'number') {
      return { exitCode: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
    }
    throw error;
  }
}

/** @param {string} root @param {Record<string, string>} files relPath → content */
async function writeFiles(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(root, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, content);
  }
}

/** @param {string} root @param {string} rel @returns {Promise<string>} */
function readFile_(root, rel) {
  return readFile(path.join(root, rel), 'utf8');
}

/** Bare (`@/`-less) FSD specifiers mixed with aliased, relative and package ones. */
const MIXED_FILES = {
  'src/features/Demo/ui/Demo.tsx': [
    "import { Button } from 'shared/ui/Button';",
    "import { selectDemo } from 'features/Demo/model/selectors';",
    "import { classNames } from '@/shared/lib/utils/classNames';",
    "import styles from './Demo.module.scss';",
    "import React from 'react';",
    '',
  ].join('\n'),
  'src/features/Demo/model/index.ts': [
    "export { useDemo } from 'features/Demo/lib/useDemo';",
    '',
  ].join('\n'),
};

describe('update-imports — startsWithFsdLayer helper (REQ-R1)', () => {
  it('accepts specifiers whose FIRST segment is an FSD layer from the SSOT', async () => {
    const { startsWithFsdLayer } = await import('../refactoring/update-imports.mjs');
    expect(startsWithFsdLayer('shared/ui/Button')).toBe(true);
    expect(startsWithFsdLayer('features/Demo/model/selectors')).toBe(true);
    expect(startsWithFsdLayer('entities/Developer')).toBe(true);
    expect(startsWithFsdLayer('app/main')).toBe(true);
    expect(startsWithFsdLayer('pages/Home')).toBe(true);
  });

  it('rejects aliased, relative, package and layer-lookalike specifiers', async () => {
    const { startsWithFsdLayer } = await import('../refactoring/update-imports.mjs');
    expect(startsWithFsdLayer('@/shared/ui/Button')).toBe(false);
    expect(startsWithFsdLayer('./Demo.module.scss')).toBe(false);
    expect(startsWithFsdLayer('../model/types')).toBe(false);
    expect(startsWithFsdLayer('react')).toBe(false);
    // Naive `startsWith('shared')` would wrongly accept this (source bug).
    expect(startsWithFsdLayer('sharedness/lib/utils')).toBe(false);
    expect(startsWithFsdLayer('')).toBe(false);
  });
});

describe('update-imports CLI — dry-run (REQ-R1, REQ-Q4.8)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'update-imports-'));
    await writeFiles(root, MIXED_FILES);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('prints only bare specifiers, exits 1 and writes nothing', async () => {
    const before = await readFile_(root, 'src/features/Demo/ui/Demo.tsx');
    const result = await runTool(['--root=' + root]);
    expect(result.exitCode).toBe(1);

    // Bare specifiers are reported…
    expect(result.stdout).toContain('shared/ui/Button');
    expect(result.stdout).toContain('features/Demo/model/selectors');
    expect(result.stdout).toContain('features/Demo/lib/useDemo');
    expect(result.stdout).toContain('Found 3 module specifier(s)');
    // …aliased / relative / package specifiers are NOT reported.
    expect(result.stdout).not.toContain('classNames');
    expect(result.stdout).not.toContain('Demo.module.scss');
    expect(result.stdout).not.toContain("'react'");

    // Dry-run must not touch the filesystem.
    expect(await readFile_(root, 'src/features/Demo/ui/Demo.tsx')).toBe(before);
    expect(existsSync(path.join(root, 'src/features/Demo/ui/Demo.tsx'))).toBe(true);
  });

  it('exits 0 on a fixture whose specifiers are all @/-aliased', async () => {
    const cleanRoot = await mkdtemp(path.join(tmpdir(), 'update-imports-clean-'));
    try {
      await writeFiles(cleanRoot, {
        'src/features/Demo/ui/Demo.tsx': [
          "import { classNames } from '@/shared/lib/utils/classNames';",
          "import { Button } from '@/shared/ui/Button';",
          "import styles from './Demo.module.scss';",
          '',
        ].join('\n'),
      });
      const result = await runTool(['--root=' + cleanRoot]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('No module specifiers');
    } finally {
      await rm(cleanRoot, { recursive: true, force: true });
    }
  });

  it('rejects unknown flags with a usage message', async () => {
    const result = await runTool(['--oops', '--root=' + root]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout + result.stderr).toContain('Usage');
  });
});

describe('update-imports CLI — --fix (REQ-R1, REQ-R4)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'update-imports-fix-'));
    await writeFiles(root, MIXED_FILES);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('rewrites bare specifiers to @/ and leaves everything else byte-identical', async () => {
    const result = await runTool(['--fix', '--root=' + root]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Rewrote 3 module specifier(s)');

    const demo = await readFile_(root, 'src/features/Demo/ui/Demo.tsx');
    expect(demo).toContain("from '@/shared/ui/Button'");
    expect(demo).toContain("from '@/features/Demo/model/selectors'");
    // Already-aliased, relative and package specifiers stay untouched.
    expect(demo).toContain("from '@/shared/lib/utils/classNames'");
    expect(demo).toContain("from './Demo.module.scss'");
    expect(demo).toContain("from 'react'");
    expect(demo).not.toContain("'shared/ui/Button'");
    expect(demo).not.toContain("'features/Demo/model/selectors'");

    const modelIndex = await readFile_(root, 'src/features/Demo/model/index.ts');
    expect(modelIndex).toContain("export { useDemo } from '@/features/Demo/lib/useDemo';");
  });

  it('is idempotent: a second --fix run reports 0 changes (REQ-R4)', async () => {
    const first = await runTool(['--fix', '--root=' + root]);
    expect(first.exitCode).toBe(0);
    const snapshot = await readFile_(root, 'src/features/Demo/ui/Demo.tsx');

    const second = await runTool(['--fix', '--root=' + root]);
    expect(second.exitCode).toBe(0);
    expect(second.stdout).toContain('Rewrote 0 module specifier(s)');
    expect(await readFile_(root, 'src/features/Demo/ui/Demo.tsx')).toBe(snapshot);
  });
});
