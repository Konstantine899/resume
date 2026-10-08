/**
 * `generate:slice` entry point — plan §2.3.1 / REQ-G1–G3, spec-phase REQ-G14/G15.
 *
 * Usage:
 *   npm run generate:slice -- <Layer> <SliceName> [--with-slice] [--force] [--dry-run] [--scaffold] [--root=<dir>]
 *
 *   <Layer>     must be in `generatorLayers` of scripts/fsd-layers.json (SSOT)
 *   <SliceName> PascalCase: /^[A-Z][a-zA-Z0-9]*$/
 *
 * Two phases: DEFAULT = phase A (spec/SPEC.md + spec/TODO.md only, no code);
 * `--scaffold` = phase B (REQ-G8 code tree), allowed only when the slice SPEC
 * frontmatter says `status: approved` (REQ-G15).
 *
 * All failures go through `try/catch` → `process.exitCode = 1` (never a
 * silent exit 0 — plan R3/REQ-G2).
 */
import process from 'node:process';
import { getGeneratorLayers, isFsdLayer } from '../fsd-layers.mjs';
import { createTemplate, GeneratorError } from './create-template.mjs';
import { deriveNames } from './naming.mjs';
import { resolveRoot } from './resolve-root.mjs';

const USAGE =
  'Usage: npm run generate:slice -- <Layer> <SliceName> ' +
  '[--with-slice] [--force] [--dry-run] [--scaffold] [--root=<dir>]';

/**
 * @param {string[]} argv
 * @returns {{ flags: { force: boolean, dryRun: boolean, withSlice: boolean, scaffold: boolean }, positional: string[] }}
 */
function parseArgs(argv) {
  const flags = { force: false, dryRun: false, withSlice: false, scaffold: false };
  const positional = [];
  for (const arg of argv) {
    if (arg === '--force') flags.force = true;
    else if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--with-slice') flags.withSlice = true;
    else if (arg === '--scaffold') flags.scaffold = true;
    else if (arg.startsWith('--root='))
      continue; // consumed by resolveRoot
    else if (arg.startsWith('--')) {
      throw new GeneratorError(`Unknown option "${arg}".\n${USAGE}`);
    } else {
      positional.push(arg);
    }
  }
  if (positional.length !== 2) {
    throw new GeneratorError(`Expected exactly <Layer> <SliceName>.\n${USAGE}`);
  }
  return { flags, positional };
}

async function main() {
  const argv = process.argv.slice(2);
  const { flags, positional } = parseArgs(argv);
  const [layer, sliceName] = positional;

  const generatorLayers = getGeneratorLayers();
  if (!generatorLayers.includes(layer)) {
    // A real FSD layer that is deliberately NOT generated (shared, app) is a
    // different mistake than a typo — say so and point at the manual path
    // instead of the misleading "Unknown layer".
    if (isFsdLayer(layer)) {
      const kitHint =
        layer === 'shared'
          ? '\nFor shared (kit) components the phase-A spec pair is hand-made from ' +
            'scripts/createSlices/templates/spec.mjs — see AGENTS.md § Spec-driven features.'
          : '';
      throw new GeneratorError(
        `Layer "${layer}" is a valid FSD layer but not a generator layer ` +
          `(scripts/fsd-layers.json → generatorLayers: ${generatorLayers.join(', ')}).` +
          kitHint
      );
    }
    throw new GeneratorError(
      `Unknown layer "${layer}". Generator layers (scripts/fsd-layers.json → generatorLayers): ` +
        `${generatorLayers.join(', ')}.`
    );
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(sliceName)) {
    throw new GeneratorError(
      `Invalid slice name "${sliceName}" — expected PascalCase like ContactForm ` +
        '(/^[A-Z][a-zA-Z0-9]*$/).'
    );
  }

  const root = resolveRoot(argv);
  const names = deriveNames(layer, sliceName, flags.withSlice);
  await createTemplate({
    root,
    names,
    force: flags.force,
    dryRun: flags.dryRun,
    scaffold: flags.scaffold,
  });
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
