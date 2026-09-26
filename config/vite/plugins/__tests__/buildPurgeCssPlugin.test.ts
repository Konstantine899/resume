// config/vite/plugins/__tests__/buildPurgeCssPlugin.test.ts
//
// RED tests for the production PurgeCSS transform (Phase 2, T3 + T4).
// The purge runs in an `enforce: 'pre'` transform hook, so it receives RAW SCSS
// (Vite's `cssPlugin` runs after pre plugins) — hence the postcss-scss parser and
// the requirement that SCSS syntax must survive purging untouched.
import { describe, expect, it } from 'vitest';

import {
  buildDynamicSafelist,
  extractClassSelectors,
  findDynamicStyleModulePaths,
  purgeStylesheet,
  PURGE_SAFE_GREEDY,
} from '../buildPurgeCssPlugin.ts';

const MODULE_FROM = 'src/shared/ui/Foo/ui/Foo.module.scss';

describe('purgeStylesheet', () => {
  it('keeps selectors that are used in content and drops unused ones', async () => {
    const out = await purgeStylesheet('.used { color: red; }\n.unused { color: blue; }', {
      from: MODULE_FROM,
      content: 'const cls = styles.used;',
    });

    expect(out).toContain('.used');
    expect(out).not.toContain('.unused');
  });

  it('preserves SCSS nesting, parent references, variables and @use directives', async () => {
    const scss = [
      "@use 'sass:math';",
      '',
      '$brand: #ff0000;',
      '',
      '.used {',
      '  color: $brand;',
      '  &:hover { color: blue; }',
      '  .used-child { color: teal; }',
      '}',
      '',
      '.unused { color: blue; }',
    ].join('\n');

    const out = await purgeStylesheet(scss, {
      from: MODULE_FROM,
      content: 'styles.used; styles.usedChild;',
    });

    expect(out).toContain("@use 'sass:math'");
    expect(out).toContain('$brand: #ff0000');
    expect(out).toContain('.used {');
    expect(out).toContain('&:hover');
    expect(out).toContain('.used-child');
    expect(out).not.toContain('.unused');
  });

  it('matches kebab-case SCSS selectors against camelCase content keys (localsConvention: camelCaseOnly)', async () => {
    const out = await purgeStylesheet('.card-title { color: red; }\n.not-used { color: blue; }', {
      from: MODULE_FROM,
      content: 'className={styles.cardTitle}',
    });

    expect(out).toContain('.card-title');
    expect(out).not.toContain('.not-used');
  });

  it('keeps :global(...) selectors so CSS-module escape hatches are never stripped', async () => {
    const out = await purgeStylesheet(
      ':global(.raw-token) { color: red; }\n.local-missing { color: blue; }',
      { from: MODULE_FROM, content: 'nothing used here' }
    );

    expect(out).toContain(':global(.raw-token)');
    expect(out).not.toContain('.local-missing');
  });

  it('leaves the stylesheet untouched when purgecss cannot parse it', async () => {
    const broken = '.ok { color: red; } }';
    const out = await purgeStylesheet(broken, { from: MODULE_FROM, content: 'styles.ok' });

    expect(out).toBe(broken);
  });
});

describe('safelist', () => {
  it('greedy-safelists parent selectors starting with &', () => {
    expect(PURGE_SAFE_GREEDY).toContainEqual(/^&/);
  });

  it('keeps nested &-selectors through the transform even when only the parent is used', async () => {
    const out = await purgeStylesheet(
      '.root {\n  &:hover { color: red; }\n  .child { color: blue; }\n}',
      { from: MODULE_FROM, content: 'const cls = styles.root;' }
    );

    expect(out).toContain('&:hover');
    expect(out).not.toContain('.child');
  });

  it('finds the .module.scss paired with a TSX file that indexes its styles object', () => {
    const files = [
      {
        path: 'src/shared/ui/Foo/ui/Foo.tsx',
        source: [
          "import styles from './Foo.module.scss';",
          '',
          "const cls = styles['dynamic-key'];",
        ].join('\n'),
      },
    ];

    expect(findDynamicStyleModulePaths(files)).toEqual(['src/shared/ui/Foo/ui/Foo.module.scss']);
  });

  it('ignores files whose styles object is only read statically', () => {
    const files = [
      {
        path: 'src/shared/ui/Bar/ui/Bar.tsx',
        source: "import styles from './Bar.module.scss';\nconst cls = styles.staticKey;",
      },
    ];

    expect(findDynamicStyleModulePaths(files)).toEqual([]);
  });

  it('derives a whole-file class safelist from the paired module', () => {
    const files = [
      {
        path: 'src/shared/ui/Foo/ui/Foo.tsx',
        source: "import styles from './Foo.module.scss';\nconst cls = styles['dynamic-key'];",
      },
      {
        path: 'src/shared/ui/Bar/ui/Bar.tsx',
        source: "import styles from './Bar.module.scss';\nconst cls = styles.staticKey;",
      },
    ];

    const map = buildDynamicSafelist(files, (modulePath) => {
      expect(modulePath).toBe('src/shared/ui/Foo/ui/Foo.module.scss');
      return [
        '@use "x" as *;',
        '$brand: #f00;',
        '.dynamic-key { color: red; }',
        '.static-key,',
        '.other-key { color: blue; }',
        '&:hover { color: teal; }',
      ].join('\n');
    });

    expect([...map.keys()]).toEqual(['src/shared/ui/Foo/ui/Foo.module.scss']);
    expect(map.get('src/shared/ui/Foo/ui/Foo.module.scss')).toEqual([
      'dynamic-key',
      'static-key',
      'other-key',
    ]);
  });

  it('keeps safelisted dynamic classes through the transform', async () => {
    const out = await purgeStylesheet('.dynamic-key { color: red; }\n.gone { color: blue; }', {
      from: MODULE_FROM,
      content: 'no class in here matches anything',
      safelist: ['dynamic-key'],
    });

    expect(out).toContain('.dynamic-key');
    expect(out).not.toContain('.gone');
  });

  it('extracts class selectors from nested SCSS without duplicates', () => {
    const scss = [
      '.a {',
      '  .b { color: red; }',
      '  .a { color: blue; }',
      '}',
      '.c,',
      '.a { color: teal; }',
      '@keyframes spin { from { opacity: 0; } }',
    ].join('\n');

    expect(extractClassSelectors(scss)).toEqual(['a', 'b', 'c']);
  });
});
