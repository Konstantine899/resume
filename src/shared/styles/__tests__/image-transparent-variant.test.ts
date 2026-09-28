import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Source-level guards for the Image `variant="transparent"` spec sub-criterion
 * (change: about-block-redesign, phase P8 — "container without background /
 * border-radius, transparent skeleton without fill").
 *
 * jsdom never loads CSS-module stylesheets, so runtime assertions in
 * Image.test.tsx cannot observe these rules (classes are hashed and
 * unstyled). Following the theme-tokens/keyframes precedent, the SCSS source
 * is read from disk and the rule blocks that make the variant fully
 * see-through are asserted directly. Matching is by rule-block segment —
 * selector + normalized declarations — so the test is robust to formatting
 * changes and never depends on byte-exact source.
 */

const SRC_ROOT = resolve(__dirname, '../../..'); // src/
const IMAGE_SCSS_PATH = join(SRC_ROOT, 'shared/ui/Image/ui/Image.module.scss');

/** Drop comments so prose mentioning selectors is never parsed as a rule. */
function stripComments(scss: string): string {
  return scss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Body of the first flat rule block whose selector matches exactly.
 * Selector tokens are joined with `\s+` so whitespace reformatting between
 * combinators does not break the lookup; a missing rule returns `null`
 * (the non-vacuous guard below proves the matcher discriminates).
 */
function ruleBody(scss: string, selector: string): string | null {
  const pattern = new RegExp(
    `(?:^|})\\s*${selector.split(/\s+/).map(escapeRegExp).join('\\s+')}\\s*{([^}]*)}`,
    'm'
  );
  const match = pattern.exec(scss);
  return match?.[1] ?? null;
}

/** Assert a declaration inside a rule body, whitespace-insensitive. */
function expectDeclaration(body: string | null, declaration: RegExp): void {
  expect(body).not.toBeNull();
  const normalized = (body ?? '').replace(/\s+/g, ' ');
  expect(normalized).toMatch(declaration);
}

describe('Image transparent variant source-level spec guard', () => {
  const scss = stripComments(readFileSync(IMAGE_SCSS_PATH, 'utf8'));

  it('parses a real variantTransparent section (non-vacuous guard)', () => {
    // The file must actually declare the compound selectors; otherwise every
    // ruleBody() lookup below would be vacuously null and the suite would
    // silently stop guarding anything.
    expect(scss).toContain('.container.variantTransparent');
    // Matcher discriminates: an unknown selector finds no rule block.
    expect(ruleBody(scss, '.container.variantDoesNotExist')).toBeNull();
  });

  it('container has no background and no border-radius', () => {
    const body = ruleBody(scss, '.container.variantTransparent');
    expectDeclaration(body, /background-color:\s*transparent\s*[;$]/);
    expectDeclaration(body, /border-radius:\s*0(?:px)?\s*[;$]/);
  });

  it('placeholder under the transparent container is background-color: transparent', () => {
    const body = ruleBody(scss, '.container.variantTransparent .placeholder');
    expectDeclaration(body, /background-color:\s*transparent\s*[;$]/);
  });

  it('error-state placeholder under the transparent variant stays transparent', () => {
    // Specificity guard: `.variantTransparent.error .placeholder` (0,3,0)
    // must out-rank `.error .placeholder` (0,2,0) which paints --image-error-bg.
    const body = ruleBody(scss, '.variantTransparent.error .placeholder');
    expectDeclaration(body, /background-color:\s*transparent\s*[;$]/);
  });

  it('fallback under the transparent container is background-color: transparent', () => {
    const body = ruleBody(scss, '.container.variantTransparent .fallback');
    expectDeclaration(body, /background-color:\s*transparent\s*[;$]/);
  });

  it('neutralizes nested skeleton children so the shimmer paints no fill', () => {
    // `.placeholder > *` covers the nested ImageSkeleton/Skeleton element:
    // without this, the loading skeleton paints a solid box over a
    // "fully transparent" variant.
    const body = ruleBody(scss, '.container.variantTransparent .placeholder > *');
    expectDeclaration(body, /background-color:\s*transparent\s*[;$]/);
  });
});
