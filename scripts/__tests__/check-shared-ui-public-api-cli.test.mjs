import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * REQ-R2 / REQ-R4 / REQ-Q4.9 — `check-shared-ui-public-api` CLI tests
 * (TDD: written before the tool).
 *
 * Spawned via `execFile(process.execPath, [entry, ...args])` — no shell
 * (Windows-safe) — against a temp root through `--root=<dir>`, so the real
 * repository can never be touched by a test.
 *
 * Coverage:
 *   (a) missing `src/shared/ui` guard → explicit error + exit 1 (never a
 *       silent no-op), in both dry-run and `--fix` modes;
 *   (b) pass 1: directories without `index.ts` are listed (dry-run exit 1);
 *       `--fix` creates barrels with NAMED re-exports, never `export *`;
 *   (c) pass 2: deep imports `@/shared/ui/<C>/<X>` are listed (dry-run exit
 *       1) and rewritten to `@/shared/ui/<C>` by `--fix`;
 *   (d) sanctioned internal segments (`model`, `lib`, `constants`, `types`)
 *       are NOT violations — mirrors `eslint.config.js`
 *       `public-api-only.allowInternal`, so this gate can never contradict
 *       the ESLint architecture rule (OPEN-6 requires a green tree);
 *   (e) clean tree → exit 0; `--fix` idempotency (REQ-R4);
 *   (f) a directory with no named exports fails loudly instead of writing an
 *       empty barrel.
 *   (g) phase-A dirs (`spec/` pair only, no source files — spec-driven
 *       workflow) are skipped with a visible note; the gate re-engages when
 *       the first `.ts`/`.tsx` lands.
 */

const execFileAsync = promisify(execFile);
// NOTE: avoid the `new URL(rel, import.meta.url)` literal here — Vite rewrites
// that exact pattern to a dev-server URL inside vitest, breaking fileURLToPath.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ENTRY = path.resolve(MODULE_DIR, '../refactoring/check-shared-ui-public-api.mjs');

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

/** A complete, valid shared/ui fixture: Widget (with barrel) + Gadget (with barrel). */
function cleanSharedUiFiles() {
  return {
    'src/shared/ui/Widget/index.ts':
      "export { Widget } from './Widget';\n" +
      "export type { WidgetProps } from './model/types';\n",
    'src/shared/ui/Widget/Widget.tsx': 'export function Widget() {\n  return null;\n}\n',
    'src/shared/ui/Widget/model/types.ts': 'export type WidgetProps = {\n  label: string;\n};\n',
    'src/shared/ui/Gadget/index.ts': "export { Gadget } from './Gadget';\n",
    'src/shared/ui/Gadget/Gadget.tsx': 'export function Gadget() {\n  return null;\n}\n',
  };
}

describe('check-shared-ui-public-api CLI — missing-dir guard (REQ-R2)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'public-api-guard-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('fails with a clear message when src/shared/ui does not exist (dry-run and --fix)', async () => {
    for (const args of [[], ['--fix']]) {
      const result = await runTool([...args, '--root=' + root]);
      expect(result.exitCode, `mode: ${args.join(' ') || 'dry-run'}`).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('src/shared/ui');
      expect(output).toContain('not found');
    }
  });
});

describe('check-shared-ui-public-api CLI — pass 1, barrels (REQ-R2)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'public-api-barrels-'));
    // Widget has NO index.ts; Gadget has one — only Widget must be reported.
    await writeFiles(root, {
      'src/shared/ui/Widget/Widget.tsx': 'export function Widget() {\n  return null;\n}\n',
      'src/shared/ui/Widget/model/types.ts': 'export type WidgetProps = {\n  label: string;\n};\n',
      'src/shared/ui/Gadget/index.ts': "export { Gadget } from './Gadget';\n",
      'src/shared/ui/Gadget/Gadget.tsx': 'export function Gadget() {\n  return null;\n}\n',
    });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('dry-run lists directories without index.ts and exits 1', async () => {
    const result = await runTool(['--root=' + root]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Missing barrel: src/shared/ui/Widget');
    expect(result.stdout).not.toContain('Missing barrel: src/shared/ui/Gadget');
    expect(result.stdout).toContain('1 missing barrel(s)');
    // Dry-run never writes.
    expect(existsSync(path.join(root, 'src/shared/ui/Widget/index.ts'))).toBe(false);
  });

  it('--fix creates barrels with named re-exports, NEVER export *', async () => {
    const fixed = await runTool(['--fix', '--root=' + root]);
    expect(fixed.exitCode).toBe(0);
    expect(fixed.stdout).toContain('Created barrel: src/shared/ui/Widget/index.ts');

    const barrel = await readFile_(root, 'src/shared/ui/Widget/index.ts');
    expect(barrel).toContain("export { Widget } from './Widget';");
    expect(barrel).toContain("export type { WidgetProps } from './model/types';");
    expect(barrel).not.toContain('export *');

    // The existing barrel is left byte-identical.
    expect(await readFile_(root, 'src/shared/ui/Gadget/index.ts')).toBe(
      "export { Gadget } from './Gadget';\n"
    );

    // The tree is clean after the fix.
    const after = await runTool(['--root=' + root]);
    expect(after.exitCode).toBe(0);
    expect(after.stdout).toContain('Public API OK: 2/2');
  });

  it('--fix on an already-clean barrel set reports 0 changes (REQ-R4)', async () => {
    await runTool(['--fix', '--root=' + root]);
    const second = await runTool(['--fix', '--root=' + root]);
    expect(second.exitCode).toBe(0);
    expect(second.stdout).toContain('Fixed 0 violation(s)');
  });
});

describe('check-shared-ui-public-api CLI — pass 2, deep imports (REQ-R2, REQ-R4)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'public-api-deep-'));
    await writeFiles(root, {
      ...cleanSharedUiFiles(),
      'src/features/Other/ui/Other.tsx': [
        "import { Widget } from '@/shared/ui/Widget/ui/Widget';",
        '',
        'export function Other() {',
        '  return Widget;',
        '}',
        '',
      ].join('\n'),
    });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('dry-run lists the deep import with its fix suggestion and exits 1', async () => {
    const result = await runTool(['--root=' + root]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("'@/shared/ui/Widget/ui/Widget'");
    expect(result.stdout).toContain("(use '@/shared/ui/Widget')");
    expect(result.stdout).toContain('1 deep import(s)');

    // Dry-run never rewrites.
    const source = await readFile_(root, 'src/features/Other/ui/Other.tsx');
    expect(source).toContain("'@/shared/ui/Widget/ui/Widget'");
  });

  it('--fix rewrites the deep import to the component barrel', async () => {
    const fixed = await runTool(['--fix', '--root=' + root]);
    expect(fixed.exitCode).toBe(0);
    expect(fixed.stdout).toContain('Fixed 1 violation(s)');

    const source = await readFile_(root, 'src/features/Other/ui/Other.tsx');
    expect(source).toContain("from '@/shared/ui/Widget';");
    expect(source).not.toContain("'@/shared/ui/Widget/ui/Widget'");

    const after = await runTool(['--root=' + root]);
    expect(after.exitCode).toBe(0);
    expect(after.stdout).toContain('Public API OK: 2/2');
  });

  it('--fix is idempotent: second run reports 0 changes (REQ-R4)', async () => {
    await runTool(['--fix', '--root=' + root]);
    const second = await runTool(['--fix', '--root=' + root]);
    expect(second.exitCode).toBe(0);
    expect(second.stdout).toContain('Fixed 0 violation(s)');
  });

  it('sanctioned internal segments (model/lib/constants/types) are NOT violations', async () => {
    // Mirrors eslint.config.js `public-api-only.allowInternal`. Forcing these
    // through the barrel would break type-check on the real tree (internal
    // helpers such as `getFallbackColor` are deliberately not exported) and
    // would contradict the ESLint architecture gate inside `npm run validate`.
    const internalRoot = await mkdtemp(path.join(tmpdir(), 'public-api-internal-'));
    try {
      await writeFiles(internalRoot, {
        ...cleanSharedUiFiles(),
        'src/features/Other/ui/Other.tsx':
          "import type { WidgetProps } from '@/shared/ui/Widget/model/types';\n" +
          "import { Gadget } from '@/shared/ui/Gadget/lib/gadget';\n",
      });
      const result = await runTool(['--root=' + internalRoot]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Public API OK:');
    } finally {
      await rm(internalRoot, { recursive: true, force: true });
    }
  });
});

describe('check-shared-ui-public-api CLI — phase-A spec-only dirs are skipped', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'public-api-phaseA-'));
    // Planned has ONLY spec/ (phase A) — no source files, nothing to barrel.
    await writeFiles(root, {
      ...cleanSharedUiFiles(),
      'src/shared/ui/Planned/spec/SPEC.md': '# SPEC — shared/ui/Planned\n',
      'src/shared/ui/Planned/spec/TODO.md': '# TODO — shared/ui/Planned\n',
    });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('a directory with only spec/ (no source files) is not a missing barrel', async () => {
    const result = await runTool(['--root=' + root]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain('Missing barrel: src/shared/ui/Planned');
    expect(result.stdout).toContain('Public API OK: 2/2');
    // Informational: the skip is visible, never silent.
    expect(result.stdout).toContain('Planned');
  });

  it('--fix does not create a barrel for a spec-only directory', async () => {
    const fixed = await runTool(['--fix', '--root=' + root]);
    expect(fixed.exitCode).toBe(0);
    expect(existsSync(path.join(root, 'src/shared/ui/Planned/index.ts'))).toBe(false);
  });

  it('once source files land, the barrel becomes required again', async () => {
    await writeFiles(root, {
      'src/shared/ui/Planned/Planned.tsx': 'export function Planned() {\n  return null;\n}\n',
    });
    const result = await runTool(['--root=' + root]);
    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('Missing barrel: src/shared/ui/Planned');
  });
});

describe('check-shared-ui-public-api CLI — clean tree and errors (REQ-R5)', () => {
  /** @type {string} */
  let root;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'public-api-clean-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('exits 0 when every directory has a barrel and imports go through it', async () => {
    await writeFiles(root, {
      ...cleanSharedUiFiles(),
      'src/features/Other/ui/Other.tsx':
        "import { Widget } from '@/shared/ui/Widget';\nexport { Widget };\n",
    });
    const result = await runTool(['--root=' + root]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Public API OK: 2/2');
    expect(result.stdout).toContain('0 deep import violation(s)');
  });

  it('fails loudly instead of writing an empty barrel (no named exports)', async () => {
    await writeFiles(root, {
      'src/shared/ui/Empty/Empty.test.tsx': "describe('empty', () => {});\n",
    });
    const dry = await runTool(['--root=' + root]);
    expect(dry.exitCode).toBe(1);
    expect(dry.stdout).toContain('Missing barrel: src/shared/ui/Empty');

    const fixed = await runTool(['--fix', '--root=' + root]);
    expect(fixed.exitCode).toBe(1);
    expect(fixed.stdout + fixed.stderr).toContain('src/shared/ui/Empty');
    expect(fixed.stdout + fixed.stderr).toContain('no named exports');
    expect(existsSync(path.join(root, 'src/shared/ui/Empty/index.ts'))).toBe(false);
  });
});
