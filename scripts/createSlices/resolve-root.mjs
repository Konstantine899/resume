/**
 * Root resolution for the slice generator (plan §2.3.1 / REQ-Q3).
 *
 * The generator writes relative to a "root" directory that defaults to the
 * repository root (`../..` from `scripts/createSlices/`). Tests point it at a
 * temp directory via `--root=<dir>` or the `SLICE_ROOT` env var — the real
 * `src/` can never be touched accidentally.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

/** Default root: repository root (`scripts/createSlices` → `scripts` → repo). */
export const DEFAULT_ROOT = path.resolve(MODULE_DIR, '..', '..');

const ROOT_FLAG = '--root=';

/**
 * Resolve the generator root.
 * Precedence: `--root=<dir>` → `SLICE_ROOT` env → repository root.
 * @param {string[]} [argv] CLI arguments (without `node` and script path)
 * @returns {string} absolute root path
 */
export function resolveRoot(argv = process.argv.slice(2)) {
  const flag = argv.find((arg) => arg.startsWith(ROOT_FLAG));
  const fromFlag = flag ? flag.slice(ROOT_FLAG.length) : '';
  if (fromFlag) return path.resolve(fromFlag);
  if (process.env.SLICE_ROOT) return path.resolve(process.env.SLICE_ROOT);
  return DEFAULT_ROOT;
}
