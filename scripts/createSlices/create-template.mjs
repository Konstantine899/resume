/**
 * Slice generator orchestrator — plan §2.3.2 (fail-fast rewrite of the
 * source's `createTemplate.js`; treats CRITICAL R1/R2 and HIGH #3/#4).
 *
 * Semantics:
 *   1. `--dry-run` prints the future file tree and returns — zero writes (REQ-G7).
 *   2. Preflight BEFORE any write: existing target without `--force` → error
 *      with a recovery hint, exit 1, tree byte-identical (REQ-G5/G6).
 *   3. The full tree is written into a staging directory next to the target
 *      (`src/<layer>/.<Name>.tmp-<ts>/`, same filesystem), every file with the
 *      fail-if-exists `'wx'` flag (plan §2.3.2 item 3–4).
 *   4. Each step (`createModel` → `createUI` → `createPublicApi`) gets its own
 *      try; errors are aggregated and the FIRST error aborts — staging is
 *      removed, the target is never left in a mixed state (plan §2.3.2 item 5).
 *   5. Atomic `rename` staging → target.
 *   6. `--force`: swap — the existing target is renamed to `<Name>.old-<ts>`,
 *      the staged tree takes its place, the old tree is removed after success
 *      and restored on failure. Only generator-owned files are replaced;
 *      foreign files are copied into the new target and listed in the output,
 *      never deleted (plan §2.3.2 item 7).
 *   7. On Windows, editors/watchers (e.g. VS Code) can hold open handles on
 *      the target directory, so its rename fails with EPERM/EBUSY/EACCES.
 *      Lock errors are reported with an actionable hint (exit 1, staging
 *      removed, target untouched); the atomic-dir design itself is unchanged.
 *
 * Emitted content is run through `prettier.format()` with the repository
 * `.prettierrc` (REQ-G13 / plan R17): long generated lines (e.g. the `memo`
 * signature) are wrapped exactly as `prettier --check` expects, so lint-staged
 * and the smoke S6 check can never rewrite the generated tree.
 */
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { createModel, modelFiles } from './create-model.mjs';
import { createPublicApi, publicApiFiles } from './create-public-api.mjs';
import { createUI, uiFiles } from './create-ui.mjs';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PRETTIER_CONFIG_PATH = path.resolve(MODULE_DIR, '..', '..', '.prettierrc');

/** Recovery-hint error (REQ-G6); the entry point maps it to exit code 1. */
export class GeneratorError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GeneratorError';
  }
}

/**
 * The complete file plan for a slice (used by `--dry-run`, the success log
 * and foreign-file detection).
 * @param {{ name: string, camel: string, kebab: string, storyTitle: string, withSlice?: boolean }} names
 * @returns {{ relPath: string, content: string }[]}
 */
export function planFiles(names) {
  return [...modelFiles(names), ...uiFiles(names), ...publicApiFiles(names)];
}

let prettierConfigPromise = null;

function prettierConfig() {
  prettierConfigPromise ??= resolveConfig(PRETTIER_CONFIG_PATH).then((config) => config ?? {});
  return prettierConfigPromise;
}

/**
 * Staging writer: prettier-formats the content, then writes with `'wx'`
 * (fail-if-exists — third line of defense, plan §2.3.2 item 4).
 * @returns {(absPath: string, content: string) => Promise<void>}
 */
function createStagingWriter() {
  return async (absPath, content) => {
    const config = await prettierConfig();
    const formatted = await format(content, { ...config, filepath: absPath });
    await writeFile(absPath, formatted, { flag: 'wx' });
  };
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

/** Windows lock codes: rename of a watched/open directory fails with these. */
const LOCK_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);

/** @param {unknown} error @returns {boolean} */
function isLockError(error) {
  return error != null && LOCK_CODES.has(/** @type {any} */ (error).code);
}

/** Actionable hint for a blocked swap (REQ-G6 recovery guidance). */
function lockedSwapError(targetDir) {
  return new GeneratorError(
    `Cannot swap ${targetDir}: directory is locked by another process (Windows). ` +
      'Close file watchers/editors or remove the directory manually, then rerun with --force.'
  );
}

function printTree(header, files) {
  console.log(header);
  for (const file of files) {
    console.log(`  ${file.relPath}`);
  }
}

function printNextSteps(names) {
  console.log('Next steps — manual gates (the generator never edits composition files):');
  if (names.withSlice) {
    console.log(
      `  - src/storeReducers.ts: import { ${names.camel}Reducer } from ` +
        `'@/${names.layer}/${names.name}/model/${names.camel}Slice'; and register it in the reducers map.`
    );
  }
  console.log(
    '  - src/pages/routerConfig.tsx / src/pages/Home/HomePage.tsx: ' +
      'register a route or a home section if this slice needs one.'
  );
  console.log(
    '  - src/shared/lib/i18n/locales/en.json + ru.json: add keys only when you introduce ' +
      'user-facing text (none is generated).'
  );
}

/**
 * Copy every non-generator-owned file of the previous tree into the new
 * target, then report what was kept. Foreign files are NEVER deleted (REQ-G5).
 * @param {string} oldDir
 * @param {string} targetDir
 * @param {{ name: string, camel: string, kebab: string, storyTitle: string, withSlice?: boolean }} names
 * @returns {Promise<string[]>} kept foreign paths (`/`-separated, sorted)
 */
async function preserveForeignFiles(oldDir, targetDir, names) {
  // Owned = anything the generator can emit for this slice in EITHER mode, so
  // `--force` without `--with-slice` also removes now-stale redux files.
  const owned = new Set(planFiles({ ...names, withSlice: true }).map((file) => file.relPath));

  const entries = await readdir(oldDir, { recursive: true });
  const kept = [];
  for (const entry of entries) {
    const abs = path.join(oldDir, entry);
    if (!(await stat(abs)).isFile()) continue;
    const relPath = entry.split(path.sep).join('/');
    if (owned.has(relPath)) continue;
    kept.push(relPath);
  }
  kept.sort();

  if (kept.length > 0) {
    for (const relPath of kept) {
      const from = path.join(oldDir, ...relPath.split('/'));
      const to = path.join(targetDir, ...relPath.split('/'));
      await mkdir(path.dirname(to), { recursive: true });
      await copyFile(from, to);
    }
    console.log(`Kept ${kept.length} foreign file(s) not owned by the generator:`);
    for (const relPath of kept) {
      console.log(`  ${relPath}`);
    }
  }
  return kept;
}

/**
 * `--force` swap: staged tree atomically replaces the target; the previous
 * tree is restored if the swap fails.
 * @param {string} stagingDir
 * @param {string} targetDir
 * @param {string} layerDir
 * @param {{ name: string, camel: string, kebab: string, storyTitle: string, withSlice?: boolean }} names
 * @param {number} ts
 */
async function swapIntoPlace(stagingDir, targetDir, layerDir, names, ts) {
  const oldDir = path.join(layerDir, `${names.name}.old-${ts}`);
  try {
    await rename(targetDir, oldDir);
  } catch (error) {
    if (isLockError(error)) throw lockedSwapError(targetDir);
    throw error;
  }
  try {
    await rename(stagingDir, targetDir);
  } catch (error) {
    // rollback: the previous tree takes its place again
    try {
      await rename(oldDir, targetDir);
    } catch (rollbackError) {
      throw new GeneratorError(
        `Swap failed (${messageOf(error)}) and rollback failed (${messageOf(rollbackError)}). ` +
          `Previous tree kept at ${oldDir}; staging is removed. Restore it manually.`
      );
    }
    if (isLockError(error)) throw lockedSwapError(targetDir);
    throw error;
  }
  try {
    await preserveForeignFiles(oldDir, targetDir, names);
  } catch (error) {
    throw new GeneratorError(
      `Swap succeeded, but keeping foreign files failed: ${messageOf(error)}. ` +
        `Previous tree kept at ${oldDir}.`
    );
  }
  await rm(oldDir, { recursive: true, force: true });
}

/**
 * Generate a slice at `<root>/src/<layer>/<Name>` (plan §2.3.2/§2.3.3).
 * @param {{ root: string, names: object, force?: boolean, dryRun?: boolean }} options
 */
export async function createTemplate({ root, names, force = false, dryRun = false }) {
  const layerDir = path.join(root, 'src', names.layer);
  const targetDir = path.join(layerDir, names.name);
  const displayPath = `src/${names.layer}/${names.name}`;

  if (dryRun) {
    printTree(`Dry run — nothing will be written. Would create ${displayPath}:`, planFiles(names));
    return;
  }

  const targetExists = existsSync(targetDir);
  if (targetExists && !force) {
    throw new GeneratorError(
      `Target ${targetDir} already exists. Remove it manually or rerun with --force.`
    );
  }

  const ts = Date.now();
  const stagingDir = path.join(layerDir, `.${names.name}.tmp-${ts}`);
  const writeFileWx = createStagingWriter();

  try {
    // plan §2.3.2 item 3 — recursive mkdir only for the staging tree, post-preflight.
    await mkdir(stagingDir, { recursive: true });
    for (const dir of new Set(planFiles(names).map((file) => path.dirname(file.relPath)))) {
      if (dir !== '.') await mkdir(path.join(stagingDir, dir), { recursive: true });
    }

    const errors = [];
    const steps = [
      ['createModel', () => createModel(stagingDir, names, writeFileWx)],
      ['createUI', () => createUI(stagingDir, names, writeFileWx)],
      ['createPublicApi', () => createPublicApi(stagingDir, names, writeFileWx)],
    ];
    for (const [label, runStep] of steps) {
      if (errors.length > 0) break; // first error aborts the remaining steps
      try {
        await runStep();
      } catch (error) {
        errors.push(`${label}: ${messageOf(error)}`);
      }
    }
    if (errors.length > 0) {
      throw new GeneratorError(errors.join('\n'));
    }

    if (targetExists) {
      await swapIntoPlace(stagingDir, targetDir, layerDir, names, ts);
    } else {
      await rename(stagingDir, targetDir);
    }
  } catch (error) {
    // Any failure: staging removed, target untouched (plan §2.3.2 item 2).
    await rm(stagingDir, { recursive: true, force: true });
    throw error;
  }

  printTree(`Created ${displayPath}:`, planFiles(names));
  printNextSteps(names);
}
