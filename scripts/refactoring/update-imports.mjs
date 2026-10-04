/**
 * `refactor:imports` — module-specifier alias checker (REQ-R1, plan §2.4).
 *
 * Dry-run by default: lists every module specifier whose FIRST segment is an
 * FSD layer (SSOT: `scripts/fsd-layers.json` via `scripts/fsd-layers.mjs`)
 * but is NOT `@/`-aliased — e.g. `from 'shared/ui/Button'` — and exits 1
 * while findings exist. `--fix` rewrites them to `@/shared/ui/Button`.
 *
 * The upstream TypeScript source called its predicate `isAbsolute`, which is
 * a misnomer (it checks for a bare FSD-layer prefix, not an absolute path),
 * and implemented it as a naive `startsWith(layer)` — that wrongly matches
 * lookalikes such as `sharedness/lib/utils`. Here the predicate is the
 * accurately named `startsWithFsdLayer`, based on the first path segment.
 *
 * Usage:
 *   node scripts/refactoring/update-imports.mjs [--fix] [--root=<dir>]
 *   npm run refactor:imports [-- --fix]
 *
 * Note: `.mjs` files are not covered by ESLint (`files: **\/*.{ts,tsx}`), so
 * this header documents the output contract instead of relying on rules.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRoot } from '../createSlices/resolve-root.mjs';
import { getFsdLayers } from '../fsd-layers.mjs';
import { createSrcProject, getModuleSpecifiers, parseArgs } from './src-scan.mjs';

const USAGE = 'Usage: node scripts/refactoring/update-imports.mjs [--fix] [--root=<dir>]';

const FSD_LAYERS = getFsdLayers();

/**
 * True when the specifier's FIRST path segment is an FSD layer from the SSOT
 * — i.e. a bare layer specifier missing the `@/` alias.
 *
 * Rejects `@/shared/...` (first segment `@`), relative specifiers (first
 * segment `.`/`..`), package specifiers (`react`) and layer lookalikes such
 * as `sharedness/lib/utils` (first segment `sharedness`).
 *
 * @param {string} specifier module specifier to inspect
 * @returns {boolean}
 */
export function startsWithFsdLayer(specifier) {
  if (!specifier) return false;
  const [firstSegment] = specifier.split('/');
  return FSD_LAYERS.includes(firstSegment);
}

/**
 * Scan `src/`, report (or rewrite with `--fix`) bare FSD-layer specifiers.
 * @returns {Promise<void>}
 */
async function main() {
  const argv = process.argv.slice(2);
  const { fix } = parseArgs(argv, USAGE);
  const root = resolveRoot(argv);
  const project = createSrcProject(path.join(root, 'src'));

  /** @type {{ file: string, line: number, value: string, ref: { set: (next: string) => void } }[]} */
  const findings = [];
  for (const sourceFile of project.getSourceFiles()) {
    const rel = path.relative(root, sourceFile.getFilePath()).split(path.sep).join('/');
    for (const ref of getModuleSpecifiers(sourceFile)) {
      if (startsWithFsdLayer(ref.value)) {
        findings.push({ file: rel, line: ref.line, value: ref.value, ref });
      }
    }
  }
  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  if (!fix) {
    if (findings.length === 0) {
      console.log(
        `No module specifiers missing the '@/' alias (checked ${project.getSourceFiles().length} file(s)).`
      );
      return;
    }
    for (const finding of findings) {
      console.log(`  ${finding.file}:${finding.line}  '${finding.value}'`);
    }
    console.log(
      `Found ${findings.length} module specifier(s) without the '@/' alias. Run with --fix to rewrite.`
    );
    process.exitCode = 1;
    return;
  }

  const touchedFiles = new Set();
  for (const finding of findings) {
    finding.ref.set(`@/${finding.value}`);
    touchedFiles.add(finding.file);
  }
  if (findings.length > 0) {
    await project.save();
  }
  console.log(
    `Rewrote ${findings.length} module specifier(s) across ${touchedFiles.size} file(s).`
  );
}

// Run only when executed directly (tests import this module for the
// predicate; the spawned CLI exercises main through the entry point).
// Same guard style as scripts/analyze-scss.mjs.
const invokedDirectly =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
