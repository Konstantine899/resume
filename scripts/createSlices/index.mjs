/**
 * `generate:slice` entry point — plan §2.3.1 / REQ-G1–G3.
 *
 * Usage:
 *   npm run generate:slice -- <Layer> <SliceName> [--with-slice] [--force] [--dry-run] [--root=<dir>]
 *
 *   <Layer>     must be in `generatorLayers` of scripts/fsd-layers.json (SSOT)
 *   <SliceName> PascalCase: /^[A-Z][a-zA-Z0-9]*$/
 *
 * All failures go through `try/catch` → `process.exitCode = 1` (never a
 * silent exit 0 — plan R3/REQ-G2).
 */
import process from 'node:process';
import { getGeneratorLayers } from '../fsd-layers.mjs';
import { createTemplate, GeneratorError } from './create-template.mjs';
import { deriveNames } from './naming.mjs';
import { resolveRoot } from './resolve-root.mjs';

const USAGE =
  'Usage: npm run generate:slice -- <Layer> <SliceName> ' +
  '[--with-slice] [--force] [--dry-run] [--root=<dir>]';

/**
 * @param {string[]} argv
 * @returns {{ flags: { force: boolean, dryRun: boolean, withSlice: boolean }, positional: string[] }}
 */
function parseArgs(argv) {
  const flags = { force: false, dryRun: false, withSlice: false };
  const positional = [];
  for (const arg of argv) {
    if (arg === '--force') flags.force = true;
    else if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--with-slice') flags.withSlice = true;
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
  await createTemplate({ root, names, force: flags.force, dryRun: flags.dryRun });
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
