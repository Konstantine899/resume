import { describe, expect, it } from 'vitest';
import fsd from '../fsd-layers.json';
import pluginSource from '../../.opencode/eslint/eslint-plugin-fsd-imports.cjs?raw';
import buildPathTypes from '../../config/vite/types/config.ts?raw';

/**
 * REQ-S5 / REQ-S6 — single source of truth for FSD layer lists.
 *
 * After the plugin reads scripts/fsd-layers.json (REQ-S3), the plugin's own
 * side of the invariant is tautological: it can only diverge by reintroducing
 * a hardcoded list, which the "second list" assertions below forbid at the
 * source level. The meaningful runtime assertions are therefore:
 *   1. JSON internal consistency (layers ↔ allowedImports ↔ generatorLayers);
 *   2. the JSON ↔ vite contract (every layer has a BuildPath entry);
 *   3. plugin wiring (requires the SSOT with the correct depth, no dead lists).
 */

const layers: string[] = fsd.layers;
const generatorLayers: string[] = fsd.generatorLayers;
const allowedKeys = stringKeys(fsd.allowedImports);

function stringKeys(obj: Record<string, unknown>): string[] {
  return Object.keys(obj);
}

describe('fsd-layers.json invariants (REQ-S5)', () => {
  it('layers are unique and non-empty', () => {
    expect(layers.length).toBeGreaterThan(0);
    expect(new Set(layers).size).toBe(layers.length);
  });

  it('allowedImports keys == layers (set equality)', () => {
    expect([...allowedKeys].sort()).toEqual([...layers].sort());
  });

  it('generatorLayers ⊆ layers (no duplicates)', () => {
    expect(generatorLayers.length).toBeGreaterThan(0);
    expect(new Set(generatorLayers).size).toBe(generatorLayers.length);
    for (const layer of generatorLayers) {
      expect(layers).toContain(layer);
    }
  });

  it('every allowedImports value only references known layers', () => {
    for (const [source, targets] of Object.entries(fsd.allowedImports)) {
      expect(layers, `allowedImports.${source}`).toContain(source);
      for (const target of targets as string[]) {
        expect(layers, `allowedImports.${source} → ${target}`).toContain(target);
      }
    }
  });

  it('layers ⊆ keys(BuildPath) minus {src, locales, buildLocales} (REQ-S5)', () => {
    // The `paths` object in vite.config.ts is not exported, but it is
    // type-checked against `BuildPath`, so the interface is the contract.
    const body = buildPathTypes.match(/export interface BuildPath \{([^}]*)\}/)?.[1] ?? '';
    expect(body, 'BuildPath interface not found — update this test').not.toBe('');
    const pathKeys = [...body.matchAll(/^\s*(\w+):/gm)]
      .map((m) => m[1])
      .filter((key): key is string => key !== undefined);
    const layerPathKeys = pathKeys.filter(
      (key) => !['src', 'locales', 'buildLocales'].includes(key)
    );
    for (const layer of layers) {
      expect(layerPathKeys, `vite BuildPath has no entry for layer "${layer}"`).toContain(layer);
    }
  });
});

describe('plugin consumes the SSOT — no second layer list (REQ-S5/S6)', () => {
  it('requires ../../scripts/fsd-layers.json with the correct depth', () => {
    expect(pluginSource).toContain("require('../../scripts/fsd-layers.json')");
    // '../../../' escapes the repository root and breaks every `npm run lint`.
    expect(pluginSource).not.toContain('../../../scripts/fsd-layers.json');
  });

  it('has no hardcoded layer alternation left in regexes', () => {
    expect(pluginSource).not.toMatch(/\(app\|pages\|widgets\|features\|entities\|shared\)/);
    expect(pluginSource).not.toContain('LAYER_ORDER');
  });

  it('has no hardcoded allowedImports literal left', () => {
    expect(pluginSource).not.toMatch(/app:\s*\[\s*'shared'\s*\]/);
  });
});
