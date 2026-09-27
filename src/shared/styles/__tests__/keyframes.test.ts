import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards for the keyframes deduplication (change: sdd-134-css, task C4).
 *
 * Each animation name must be defined EXACTLY ONCE repo-wide so the final CSS
 * carries a single @keyframes block instead of one copy per consumer module.
 * Global (non-module) definitions are referenced from scoped modules via
 * `:global(<name>)`, otherwise vite's CSS-modules scoping renames the
 * reference and the animation silently breaks.
 */

const SRC_ROOT = resolve(__dirname, '../../..'); // src/

/** The seven animation names being consolidated into animations/_keyframes.scss. */
const CONSOLIDATED = [
  'fadeUp',
  'fadeIn',
  'fadeOut',
  'scaleIn',
  'scaleOut',
  'pulse-glow',
  'theme-spin',
] as const;

/** slideInRight is deliberately NOT part of this change — baseline count. */
const SLIDE_IN_RIGHT_BASELINE = 2;

function collectScssFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectScssFiles(full, out);
    } else if (entry.endsWith('.scss')) {
      out.push(full);
    }
  }
  return out;
}

function keyframesDefinitions(files: string[]): Map<string, string[]> {
  const defs = new Map<string, string[]>();
  const pattern = /@keyframes\s+([A-Za-z0-9_-]+)/g;
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(pattern)) {
      const name = match[1];
      if (name === undefined) continue;
      const list = defs.get(name) ?? [];
      list.push(file);
      defs.set(name, list);
    }
  }
  return defs;
}

describe('keyframes deduplication', () => {
  const files = collectScssFiles(SRC_ROOT);
  const defs = keyframesDefinitions(files);

  it.each(CONSOLIDATED)('defines @keyframes %s exactly once across src/**/*.scss', (name) => {
    expect(defs.get(name) ?? []).toHaveLength(1);
  });

  it.each(CONSOLIDATED)(
    'defines @keyframes %s in a non-module file (globals reachable)',
    (name) => {
      const locations = defs.get(name) ?? [];
      expect(locations).toHaveLength(1);
      expect(locations[0]).not.toMatch(/\.module\.scss$/);
    }
  );

  it('leaves slideInRight untouched (out of scope, baseline 2)', () => {
    expect(defs.get('slideInRight') ?? []).toHaveLength(SLIDE_IN_RIGHT_BASELINE);
  });

  it('defines each consolidated keyframe in animations/_keyframes.scss', () => {
    const keyframesFile = join(SRC_ROOT, 'shared/styles/animations/_keyframes.scss');
    for (const name of CONSOLIDATED) {
      expect(defs.get(name)).toEqual([keyframesFile]);
    }
  });
});
