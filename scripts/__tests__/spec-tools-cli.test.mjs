import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

/**
 * REQ-G17 / REQ-G18, REQ-Q4.13–4.14 — CLI tests for the spec gate scripts.
 *
 * `check:spec` exits 1 while any spec's frontmatter status is not ready
 * (`approved` or `done` — the plan §1.3 literal `!= approved` is
 * clarified so an implemented slice never blocks again). `spec:status` prints
 * the `slice | status | verified` dashboard table and always exits 0.
 *
 * Both scripts are spawned with `execFile(process.execPath, [entry, ...])` —
 * no shell (Windows-safe) — against their own temp root via `--root=<dir>`.
 */

const execFileAsync = promisify(execFile);
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const CHECK_ENTRY = path.resolve(MODULE_DIR, '../check-spec.mjs');
const STATUS_ENTRY = path.resolve(MODULE_DIR, '../spec-status.mjs');

/**
 * @param {string} entry
 * @param {string[]} args
 * @returns {Promise<{ exitCode: number, stdout: string, stderr: string }>}
 */
async function runScript(entry, args) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [entry, ...args], {
      timeout: 60_000,
      env: process.env,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    if (typeof error.code === 'number') {
      return { exitCode: error.code, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
    }
    throw error;
  }
}

/**
 * Write `src/<layer>/<Name>/spec/SPEC.md` into the fixture root.
 * @param {string} root
 * @param {string} sliceDir e.g. `src/features/Ok`
 * @param {string} statusLine `status: approved` or '' for a missing status
 */
async function writeSpec(root, sliceDir, statusLine) {
  const abs = path.join(root, sliceDir, 'spec');
  await mkdir(abs, { recursive: true });
  const frontmatter = ['---', statusLine, 'created: "2026-10-01"', 'verified: "2026-10-02"', '---']
    .filter((line) => line !== '')
    .join('\n');
  await writeFile(path.join(abs, 'SPEC.md'), `${frontmatter}\n\n# SPEC — ${sliceDir}\n`);
}

describe('spec gate scripts — check:spec (REQ-G17, REQ-Q4.13)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'spec-gate-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('exits 1 and lists only the not-ready specs (draft + missing status)', async () => {
    await writeSpec(root, 'src/features/Ready', 'status: approved');
    await writeSpec(root, 'src/features/Implemented', 'status: done');
    await writeSpec(root, 'src/features/DraftOne', 'status: draft');
    await writeSpec(root, 'src/features/NoStatus', '');

    const result = await runScript(CHECK_ENTRY, ['--root=' + root]);
    expect(result.exitCode).toBe(1);
    const output = result.stdout + result.stderr;
    expect(output).toContain('src/features/DraftOne/spec/SPEC.md');
    expect(output).toContain('"draft"');
    expect(output).toContain('src/features/NoStatus/spec/SPEC.md');
    expect(output).toContain('"missing"');
    expect(output).not.toContain('src/features/Ready/spec/SPEC.md');
    expect(output).not.toContain('src/features/Implemented/spec/SPEC.md');
  });

  it('exits 0 when every spec is approved or done', async () => {
    await writeSpec(root, 'src/features/Ready', 'status: approved');
    await writeSpec(root, 'src/features/Implemented', 'status: done');

    const result = await runScript(CHECK_ENTRY, ['--root=' + root]);
    expect(result.exitCode, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('2');
  });

  it('exits 0 when there are no specs at all', async () => {
    const result = await runScript(CHECK_ENTRY, ['--root=' + root]);
    expect(result.exitCode).toBe(0);
    expect(existsSync(path.join(root, 'src'))).toBe(false);
  });
});

describe('spec status table — spec:status (REQ-G18, REQ-Q4.14)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'spec-status-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('prints one row per spec with status and verified, always exit 0', async () => {
    await writeSpec(root, 'src/features/Ready', 'status: approved');
    await writeSpec(root, 'src/pages/Admin', 'status: draft');

    const result = await runScript(STATUS_ENTRY, ['--root=' + root]);
    expect(result.exitCode, result.stdout + result.stderr).toBe(0);
    expect(result.stdout).toContain('slice');
    expect(result.stdout).toContain('status');
    expect(result.stdout).toContain('verified');
    expect(result.stdout).toContain('src/features/Ready');
    expect(result.stdout).toContain('approved');
    expect(result.stdout).toContain('2026-10-02');
    expect(result.stdout).toContain('src/pages/Admin');
    expect(result.stdout).toContain('draft');
  });
});
