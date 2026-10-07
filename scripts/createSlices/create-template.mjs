/**
 * Slice generator orchestrator — plan §2.3.2 (fail-fast rewrite of the
 * source's `createTemplate.js`; treats CRITICAL R1/R2 and HIGH #3/#4).
 *
 * Semantics (spec-phase workflow, REQ-G14/G15):
 *   0. Phase A (default) scaffolds only `spec/SPEC.md` + `spec/TODO.md` —
 *      the generator owns exactly that pair; phase B (`--scaffold`) emits the
 *      REQ-G8 code tree and is gated on the SPEC frontmatter
 *      `status: approved` BEFORE anything else (missing spec → phase-A hint,
 *      other status → error naming it; blocked runs write zero bytes).
 *   1. `--dry-run` prints the future file tree and returns — zero writes (REQ-G7).
 *   2. Preflight BEFORE any write: existing target without `--force` (phase A
 *      only — scaffold always swaps) → error with a recovery hint, exit 1,
 *      tree byte-identical (REQ-G5/G6).
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
import { copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { createModel, modelFiles } from './create-model.mjs';
import { createSpec, specFiles } from './create-spec.mjs';
import { createPublicApi, publicApiFiles } from './create-public-api.mjs';
import { createUI, uiFiles } from './create-ui.mjs';
import { deriveNames } from './naming.mjs';
import { planFileExtras } from './plan-extras.mjs';
import { readSpecStatus } from '../spec-tools.mjs';

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
 * and foreign-file detection). Mode-aware: phase A (default) plans the spec
 * pair only, phase B (`scaffold`) plans the REQ-G8 code tree.
 * @param {{ name: string, camel: string, kebab: string, storyTitle: string, withSlice?: boolean }} names
 * @param {boolean} scaffold
 * @returns {{ relPath: string, content: string }[]}
 */
export function planFiles(names, scaffold = false) {
  if (!scaffold) return specFiles(names);
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

/**
 * Phase-B gate (REQ-G15): missing spec → phase-A recovery hint; any status
 * other than `approved` → error naming it. Runs before dry-run/preflight, so
 * a blocked scaffold touches zero bytes. On success returns the spec content
 * (the extras plan REQ-G16 is parsed from it).
 * @param {string} targetDir
 * @returns {Promise<string>} spec/SPEC.md content
 */
async function assertScaffoldAllowed(targetDir) {
  const specPath = path.join(targetDir, 'spec', 'SPEC.md');
  if (!existsSync(specPath)) {
    throw new GeneratorError(
      `No spec/SPEC.md at ${specPath}. Run phase A first: ` +
        'npm run generate:slice -- <Layer> <SliceName>'
    );
  }
  const specContent = await readFile(specPath, 'utf8');
  const status = readSpecStatus(specContent);
  if (status !== 'approved') {
    throw new GeneratorError(
      `Scaffold blocked: spec/SPEC.md status is "${status ?? 'missing'}" — ` +
        'only "approved" allows --scaffold. Fill the spec, set status: approved, then rerun.'
    );
  }
  return specContent;
}

/** Console output = a pointer to the next phase, never the steps themselves (REQ-G11). */
function printPointer(names, scaffold) {
  const specDir = `src/${names.layer}/${names.name}/spec`;
  if (scaffold) {
    console.log(
      `Next: work through ${specDir}/TODO.md (burn-down). The generator never edits composition files.`
    );
  } else {
    console.log(
      `Next: fill ${specDir}/SPEC.md (owner sets status: approved), then rerun with ` +
        `--scaffold — Work units: ${specDir}/TODO.md.`
    );
  }
}

/**
 * Copy every non-generator-owned file of the previous tree into the new
 * target, then report what was kept. Foreign files are NEVER deleted (REQ-G5).
 *
 * The owned set is computed ONCE by the caller (`ownedSet`): everything the
 * generator can emit in EITHER with-slice mode (so dropping `--with-slice`
 * still removes now-stale redux files) plus the current Plan-files extras
 * (REQ-G16) — spec/ is human-owned after phase A and is preserved as foreign.
 * @param {string} oldDir
 * @param {string} targetDir
 * @param {Set<string>} owned relPaths the generator owns
 * @returns {Promise<string[]>} kept foreign paths (`/`-separated, sorted)
 */
async function preserveForeignFiles(oldDir, targetDir, owned) {
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
 * @param {Set<string>} ownedSet generator-owned relPaths (see preserveForeignFiles)
 */
async function swapIntoPlace(stagingDir, targetDir, layerDir, names, ts, ownedSet) {
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
    await preserveForeignFiles(oldDir, targetDir, ownedSet);
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
 * Phase A (default) = spec pair only; `scaffold` = phase-B code tree behind
 * the approved gate (REQ-G14/G15).
 * @param {{ root: string, names: object, force?: boolean, dryRun?: boolean, scaffold?: boolean }} options
 */
export async function createTemplate({
  root,
  names,
  force = false,
  dryRun = false,
  scaffold = false,
}) {
  const layerDir = path.join(root, 'src', names.layer);
  const targetDir = path.join(layerDir, names.name);
  const displayPath = `src/${names.layer}/${names.name}`;

  // Phase-B gate FIRST (REQ-G15): even a dry run must not print a code tree
  // for an unapproved spec, and a blocked run must write nothing. Returns the
  // spec content — the Plan-files extras (REQ-G16) are parsed from it.
  const specContent = scaffold ? await assertScaffoldAllowed(targetDir) : null;

  const standard = planFiles(names, scaffold);
  const extras = scaffold
    ? planFileExtras(
        specContent,
        standard.map((file) => file.relPath)
      )
    : { components: [], manual: [] };
  const extraFiles = extras.components.flatMap((componentName) =>
    uiFiles(deriveNames(names.layer, componentName, false), { skeleton: true })
  );
  const files = [...standard, ...extraFiles];

  // Owned set for the swap: everything the generator can emit in EITHER
  // with-slice mode (stale-redux cleanup) + the currently listed extras.
  const ownedSet = new Set(
    [...planFiles({ ...names, withSlice: true }, scaffold), ...extraFiles].map(
      (file) => file.relPath
    )
  );

  if (dryRun) {
    printTree(`Dry run — nothing will be written. Would create ${displayPath}:`, files);
    for (const manualPath of extras.manual) console.log(`  manual: ${manualPath}`);
    return;
  }

  const targetExists = existsSync(targetDir);
  // Phase-A rerun guard (REQ-G5). Scaffold always swaps: the target exists by
  // definition (the spec lives inside it) and never requires --force.
  if (targetExists && !force && !scaffold) {
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
    for (const dir of new Set(files.map((file) => path.dirname(file.relPath)))) {
      if (dir !== '.') await mkdir(path.join(stagingDir, dir), { recursive: true });
    }

    const errors = [];
    const steps = scaffold
      ? [
          ['createModel', () => createModel(stagingDir, names, writeFileWx)],
          ['createUI', () => createUI(stagingDir, names, writeFileWx)],
          ['createPublicApi', () => createPublicApi(stagingDir, names, writeFileWx)],
          // Plan-files extras (REQ-G16): skeleton quads whose content was
          // built above; the dirs already exist (the mkdir loop covers `files`).
          [
            'createExtras',
            async () => {
              for (const file of extraFiles) {
                await writeFileWx(path.join(stagingDir, file.relPath), file.content);
              }
            },
          ],
        ]
      : [['createSpec', () => createSpec(stagingDir, names, writeFileWx)]];
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
      await swapIntoPlace(stagingDir, targetDir, layerDir, names, ts, ownedSet);
    } else {
      await rename(stagingDir, targetDir);
    }
  } catch (error) {
    // Any failure: staging removed, target untouched (plan §2.3.2 item 2).
    await rm(stagingDir, { recursive: true, force: true });
    throw error;
  }

  printTree(`Created ${displayPath}:`, files);
  if (extras.manual.length > 0) {
    console.log('Listed in the SPEC but not scaffoldable — create by hand:');
    for (const manualPath of extras.manual) console.log(`  manual: ${manualPath}`);
  }
  printPointer(names, scaffold);
}
