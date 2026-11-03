import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Zero-ref invariant for design tokens (change: sdd-134-css, task C5).
 *
 * Every custom property declared in globals/_theme.scss must be referenced
 * from runtime code scopes (src/, index.html, .storybook/) via
 * `var(--token)` or a quoted `'--token'` key (setProperty/getPropertyValue).
 * A token without a consumer is dead weight in every theme variant
 * (`:root`, `[data-theme='dark']`, `[data-theme='light']`) and must be
 * removed. Comment lines are ignored — prose mentioning a token is not a
 * consumer.
 */

const SRC_ROOT = resolve(__dirname, '../../..'); // src/
const REPO_ROOT = resolve(SRC_ROOT, '..');
const THEME_PATH = join(SRC_ROOT, 'app/styles/globals/_theme.scss');
const STORYBOOK_PREVIEW_PATH = join(REPO_ROOT, '.storybook/preview.tsx');

/** Source extensions that can carry a token reference at runtime. */
const REF_EXTENSIONS = new Set(['.scss', '.css', '.ts', '.tsx', '.js', '.jsx', '.html', '.mjs']);

/** Build artifacts and dependencies are derived — never ref sources. */
const SKIP_DIRS = new Set(['node_modules', '.git', 'storybook-static', 'dist', 'coverage']);

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectFiles(full, out);
    } else if ([...REF_EXTENSIONS].some((ext) => entry.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

/** Custom properties declared in the theme file (line-leading `--name:`). */
export function declaredTokens(scss: string): string[] {
  const names = new Set<string>();
  for (const match of scss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) {
    const name = match[1];
    if (name !== undefined) names.add(name);
  }
  return [...names];
}

/** Tokens consumed by a source file: `var(--name)` or quoted `'--name'` keys. */
function referencedTokens(sources: string[]): Set<string> {
  const refs = new Set<string>();
  for (const source of sources) {
    for (const line of source.split('\n')) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
        continue; // prose is not a consumer
      }
      for (const match of line.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
        const name = match[1];
        if (name !== undefined) refs.add(name);
      }
      for (const match of line.matchAll(/['"`](--[a-z0-9-]+)['"`]/g)) {
        const name = match[1];
        if (name !== undefined) refs.add(name);
      }
    }
  }
  return refs;
}

function collectRefSources(): string[] {
  const files = [
    ...collectFiles(SRC_ROOT),
    ...collectFiles(join(REPO_ROOT, '.storybook')),
    join(REPO_ROOT, 'index.html'),
  ];
  return files.map((file) => readFileSync(file, 'utf8'));
}

describe('theme tokens zero-ref invariant (C5)', () => {
  const declared = declaredTokens(readFileSync(THEME_PATH, 'utf8'));
  const refs = referencedTokens(collectRefSources());

  it('declares no custom property without a consumer in code scopes', () => {
    const dead = declared.filter((name) => !refs.has(name));

    // Non-vacuous guard: the theme file must actually declare tokens.
    expect(declared.length).toBeGreaterThan(100);
    // RED lists every dead token still declared; GREEN requires an empty list.
    expect(dead).toEqual([]);
  });

  it('keeps --text-primary declared because .storybook/preview.tsx consumes it', () => {
    // Documents the C5 rejection: this token has a real consumer outside src/
    // and must NOT be deleted with the zero-ref set.
    const preview = readFileSync(STORYBOOK_PREVIEW_PATH, 'utf8');
    expect(preview).toContain('var(--text-primary)');
    expect(declared).toContain('--text-primary');
  });
});
