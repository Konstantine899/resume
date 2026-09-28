// config/vite/plugins/__tests__/analyzeScss.test.ts
//
// RED tests for the standalone SCSS dead-code analyzer (C1, task 1.1).
//
// Contract: `analyzeScss(files)` receives `{ file, content }` pairs, collects
// `$var` / `@mixin` / `@function` declarations and CSS custom-property
// (design token) declarations, and reports every declaration that has no
// usage in ANY file of the set. A declaration position must NEVER
// count as usage of itself (the bug in scssUnusedAnalyzer.ts), `//`-leading
// lines are skipped entirely, `$_*` members and the system whitelist are
// ignored, and usages are resolved across the whole file set. Tokens are
// consumed via `var(--name)` or a quoted `'--name'` key (FR-d).
import { describe, expect, it } from 'vitest';

import { analyzeScss } from '../../../../scripts/analyze-scss.mjs';

const A = 'src/shared/styles/_a.scss';
const B = 'src/shared/styles/_b.scss';

describe('analyzeScss', () => {
  it('reports an unused $var with its file and line', () => {
    const findings = analyzeScss([
      { file: A, content: '$brand-primary: #ff0000;\n.card { color: red; }' },
    ]);

    // The declaration itself must not count as usage of $brand-primary.
    expect(findings).toEqual([{ name: '$brand-primary', type: 'var', file: A, line: 1 }]);
  });

  it('reports unused @mixin and @function declarations', () => {
    const findings = analyzeScss([
      {
        file: A,
        content: [
          '@mixin card-title {',
          '  font-weight: 600;',
          '}',
          '',
          '@function spacing($n) {',
          '  @return $n * 4px;',
          '}',
        ].join('\n'),
      },
    ]);

    expect(findings).toEqual([
      { name: 'card-title', type: 'mixin', file: A, line: 1 },
      { name: 'spacing', type: 'func', file: A, line: 5 },
    ]);
  });

  it('treats usages found in other files as usage (cross-file)', () => {
    const findings = analyzeScss([
      {
        file: A,
        content: [
          '$gap: 8px;',
          '@mixin hairline {',
          '  border-width: 1px;',
          '}',
          '@function answer() {',
          '  @return 42;',
          '}',
        ].join('\n'),
      },
      {
        file: B,
        content: [
          '.card {',
          '  margin: $gap;',
          '  @include hairline;',
          '}',
          '.badge { z-index: answer(); }',
        ].join('\n'),
      },
    ]);

    expect(findings).toEqual([]);
  });

  it('ignores // comment lines for both declarations and usages', () => {
    const findings = analyzeScss([
      {
        file: A,
        content: '// $legacy-color: #123456;\n// @mixin legacy-mixin {\n$live: 1px;',
      },
      { file: B, content: '// $live mentioned only inside a comment' },
    ]);

    // Commented declarations are not collected; a commented usage does not
    // mark $live as used — so $live is still reported at its real line.
    expect(findings).toEqual([{ name: '$live', type: 'var', file: A, line: 3 }]);
  });

  it('skips whitelisted names and private $_ members', () => {
    const findings = analyzeScss([
      {
        file: A,
        content: [
          '@mixin max-md {',
          '  max-width: 768px;',
          '}',
          '@mixin font-bold {',
          '  font-weight: 700;',
          '}',
          '$_private-gap: 1px;',
          '$_legacy-cache: 2px;',
        ].join('\n'),
      },
    ]);

    expect(findings).toEqual([]);
  });

  it('counts value-position usages while ignoring declaration positions', () => {
    const findings = analyzeScss([
      { file: A, content: '$base: 16px;\n$derived: $base;\n$orphan: 8px;' },
    ]);

    // $base is used as the VALUE of $derived (real usage);
    // $derived and $orphan are never used anywhere.
    expect(findings).toEqual([
      { name: '$derived', type: 'var', file: A, line: 2 },
      { name: '$orphan', type: 'var', file: A, line: 3 },
    ]);
  });

  it('resolves namespaced @include usages', () => {
    const findings = analyzeScss([
      { file: A, content: '@mixin card-title {\n  font-weight: 600;\n}' },
      { file: B, content: '.heading {\n  @include ui.card-title;\n}' },
    ]);

    expect(findings).toEqual([]);
  });

  it('reports every unused declaration per file, not just one per name', () => {
    const findings = analyzeScss([
      { file: A, content: '$orphan-name: 1px;' },
      { file: B, content: '$orphan-name: 2px;' },
    ]);

    expect(findings).toEqual([
      { name: '$orphan-name', type: 'var', file: A, line: 1 },
      { name: '$orphan-name', type: 'var', file: B, line: 1 },
    ]);
  });

  it('reports unused design tokens with file:line, skipping var()-referenced and commented ones', () => {
    const findings = analyzeScss([
      {
        file: A,
        content: [
          ':root {',
          '  --some-token: #fff;',
          '  --used-token: #000;',
          '  --alias: var(--used-token);',
          '}',
          '// --comment-token: #123456;',
        ].join('\n'),
      },
      { file: B, content: '.card {\n  color: var(--used-token);\n}' },
    ]);

    // --some-token and --alias have no consumer anywhere in the set (the
    // declaration position never counts as usage of itself); --used-token is
    // consumed cross-file via var() — and from the same line inside --alias —
    // so it must not be reported. Commented declarations are never collected.
    expect(findings).toEqual([
      { name: '--some-token', type: 'token', file: A, line: 2 },
      { name: '--alias', type: 'token', file: A, line: 4 },
    ]);
  });

  it('counts design-token usages from non-scss usage files (cross-language)', () => {
    const findings = analyzeScss(
      [
        {
          file: A,
          content: [':root {', '  --live-token: #fff;', '  --dead-token: #000;', '}'].join('\n'),
        },
      ],
      [
        {
          file: 'src/ui/Widget.tsx',
          content: [
            '// var(--dead-token) mentioned only in a comment',
            "const style = { color: 'var(--live-token)' };",
          ].join('\n'),
        },
      ]
    );

    // --live-token is consumed from TSX (storybook stories, inline styles,
    // setProperty-style keys) — declarations stay SCSS-only, but usages must
    // resolve across languages or every cross-language consumer is a false
    // positive. A commented usage never counts.
    expect(findings).toEqual([{ name: '--dead-token', type: 'token', file: A, line: 3 }]);
  });
});
