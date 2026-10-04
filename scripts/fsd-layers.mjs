/**
 * Thin ESM wrapper around scripts/fsd-layers.json — the single source of truth
 * for FSD layer lists. Never hardcode layer arrays in other scripts; extend the
 * JSON instead (guarded by scripts/__tests__/fsd-layers.test.ts).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// NOTE: load via `fileURLToPath(import.meta.url)` + `path.join`, NOT the
// `new URL('./file', import.meta.url)` literal — Vite rewrites that pattern
// to a dev-server URL inside vitest, and `readFileSync` then rejects it
// ("The URL must be of scheme file") when a test imports this module
// in-process.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(path.join(MODULE_DIR, 'fsd-layers.json'), 'utf8'));

/** @returns {string[]} copy of the layer list (SSOT layer order) */
export function getFsdLayers() {
  return [...data.layers];
}

/**
 * Slice layers the generator may scaffold (SSOT key `generatorLayers`).
 * @returns {string[]}
 */
export function getGeneratorLayers() {
  return [...data.generatorLayers];
}

/** @param {string} value @returns {boolean} */
export function isFsdLayer(value) {
  return data.layers.includes(value);
}

/**
 * Extract the FSD layer from a file path (normalizes `\` → `/`).
 * @param {string} filePath
 * @returns {string | null}
 */
export function layerFromPath(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(new RegExp(`/(${data.layers.join('|')})/`));
  return match ? match[1] : null;
}

/**
 * Extract the FSD layer from an `@/`-aliased import specifier.
 * @param {string} specifier
 * @returns {string | null}
 */
export function layerFromSpecifier(specifier) {
  if (!specifier) return null;
  const match = specifier.match(new RegExp(`^@/(${data.layers.join('|')})(/|$)`));
  return match ? match[1] : null;
}
