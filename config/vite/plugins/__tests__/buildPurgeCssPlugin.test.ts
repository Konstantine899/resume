// config/vite/plugins/__tests__/buildPurgeCssPlugin.test.ts
//
// RED tests for the production PurgeCSS transform (Phase 2, T3 + T4).
// The purge runs in an `enforce: 'pre'` transform hook, so it receives RAW SCSS
// (Vite's `cssPlugin` runs after pre plugins) — hence the postcss-scss parser and
// the requirement that SCSS syntax must survive purging untouched.
import { afterEach, describe, expect, it } from 'vitest';

import {
  buildDynamicSafelist,
  buildImporterGraph,
  buildScopedContent,
  extractClassSelectors,
  findDynamicStyleModulePaths,
  purgeStylesheet,
  resolveImportCandidates,
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

describe('resolveImportCandidates', () => {
  it('returns null for bare and scoped package specifiers', () => {
    expect(resolveImportCandidates('src/App.tsx', 'lodash')).toBeNull();
    expect(resolveImportCandidates('src/App.tsx', '@scope/pkg')).toBeNull();
    expect(resolveImportCandidates('src/App.tsx', '~bootstrap/dist/css')).toBeNull();
  });

  it('resolves @/ aliases against <cwd>/src', () => {
    const cwd = process.cwd().replaceAll('\\', '/');

    expect(resolveImportCandidates('src/App.tsx', '@/shared/ui/Card')).toEqual([
      `${cwd}/src/shared/ui/Card.ts`,
      `${cwd}/src/shared/ui/Card.tsx`,
      `${cwd}/src/shared/ui/Card.js`,
      `${cwd}/src/shared/ui/Card.jsx`,
      `${cwd}/src/shared/ui/Card.scss`,
      `${cwd}/src/shared/ui/Card.css`,
      `${cwd}/src/shared/ui/Card/index.ts`,
      `${cwd}/src/shared/ui/Card/index.tsx`,
      `${cwd}/src/shared/ui/Card/index.js`,
      `${cwd}/src/shared/ui/Card/index.jsx`,
      `${cwd}/src/shared/ui/Card/index.scss`,
      `${cwd}/src/shared/ui/Card/index.css`,
      `${cwd}/src/shared/ui/_Card.scss`,
    ]);
  });

  it('expands a relative extensionless spec into extension, index and partial candidates', () => {
    expect(resolveImportCandidates('src/ui/Card/ui/Card.tsx', './usePress')).toEqual([
      'src/ui/Card/ui/usePress.ts',
      'src/ui/Card/ui/usePress.tsx',
      'src/ui/Card/ui/usePress.js',
      'src/ui/Card/ui/usePress.jsx',
      'src/ui/Card/ui/usePress.scss',
      'src/ui/Card/ui/usePress.css',
      'src/ui/Card/ui/usePress/index.ts',
      'src/ui/Card/ui/usePress/index.tsx',
      'src/ui/Card/ui/usePress/index.js',
      'src/ui/Card/ui/usePress/index.jsx',
      'src/ui/Card/ui/usePress/index.scss',
      'src/ui/Card/ui/usePress/index.css',
      'src/ui/Card/ui/_usePress.scss',
    ]);
  });

  it('returns the single exact candidate for a fully specified relative spec', () => {
    expect(resolveImportCandidates('src/ui/Card/ui/Card.tsx', './Card.module.scss')).toEqual([
      'src/ui/Card/ui/Card.module.scss',
    ]);
  });
});

describe('buildImporterGraph', () => {
  it('links a module.scss to its direct and transitive TS importers', () => {
    const files = [
      {
        path: 'src/pages/Home.tsx',
        source: "import { Card } from '../widgets/Card/Card';",
      },
      {
        path: 'src/widgets/Card/Card.tsx',
        source: "import styles from './Card.module.scss';\nexport const cls = styles.cardTitle;",
      },
      // Card.module.scss is intentionally absent — SCSS files are never part
      // of the scanned set, yet the specifier must still form a target node.
    ];

    const graph = buildImporterGraph(files);

    expect([...(graph.get('src/widgets/Card/Card.module.scss') ?? [])].sort()).toEqual([
      'src/pages/Home.tsx',
      'src/widgets/Card/Card.tsx',
    ]);
  });

  it('resolves dynamic imports, side-effect imports and re-exports', () => {
    const files = [
      {
        path: 'src/App.tsx',
        source: [
          "const Lazy = lazy(() => import('./panels/LazyPanel'));",
          "import './polyfill';",
        ].join('\n'),
      },
      { path: 'src/panels/LazyPanel.tsx', source: "export { Panel } from './Panel';" },
      { path: 'src/panels/Panel.tsx', source: 'export const Panel = null;' },
      { path: 'src/polyfill.ts', source: 'export {};' },
    ];

    const graph = buildImporterGraph(files);

    expect([...(graph.get('src/panels/LazyPanel.tsx') ?? [])]).toEqual(['src/App.tsx']);
    // Panel is imported by LazyPanel, which App imports → transitive App too.
    expect([...(graph.get('src/panels/Panel.tsx') ?? [])]).toEqual([
      'src/panels/LazyPanel.tsx',
      'src/App.tsx',
    ]);
    expect([...(graph.get('src/polyfill.ts') ?? [])]).toEqual(['src/App.tsx']);
  });

  it('parses @use/@import/@forward from SCSS importers', () => {
    const files = [
      {
        path: 'src/shared/styles/index.scss',
        source: [
          "@use './Card.module.scss' as card;",
          "@import 'mixins';",
          "@forward './tokens.scss';",
        ].join('\n'),
      },
      { path: 'src/shared/styles/_mixins.scss', source: '' },
    ];

    const graph = buildImporterGraph(files);

    expect([...(graph.get('src/shared/styles/Card.module.scss') ?? [])]).toEqual([
      'src/shared/styles/index.scss',
    ]);
    // Extensionless @import resolves through the SCSS partial candidate.
    expect([...(graph.get('src/shared/styles/_mixins.scss') ?? [])]).toEqual([
      'src/shared/styles/index.scss',
    ]);
    // @forward specifier ends with .scss → valid target even though the file
    // is not part of the set.
    expect([...(graph.get('src/shared/styles/tokens.scss') ?? [])]).toEqual([
      'src/shared/styles/index.scss',
    ]);
  });

  it('ignores bare package imports — no node_modules nodes', () => {
    const files = [
      {
        path: 'src/App.tsx',
        source: "import React from 'react';\nimport { x } from '@scope/lib';",
      },
    ];

    expect(buildImporterGraph(files).size).toBe(0);
  });

  it('terminates on circular imports and excludes the target itself', () => {
    const files = [
      { path: 'src/a.ts', source: "import './b';" },
      { path: 'src/b.ts', source: "import './a';" },
    ];

    const graph = buildImporterGraph(files);

    expect(graph.get('src/a.ts')).toEqual(new Set(['src/b.ts']));
    expect(graph.get('src/b.ts')).toEqual(new Set(['src/a.ts']));
  });
});

describe('buildScopedContent', () => {
  const files = [
    { path: 'index.html', source: '<div class="app-root"></div>' },
    { path: 'src/App.tsx', source: "import { Home } from './pages/Home';" },
    {
      path: 'src/pages/Home.tsx',
      source: "import styles from './Home.module.scss';\nexport const cls = styles.page;",
    },
    { path: 'src/Unrelated.tsx', source: 'export const secret = "unrelated-token";' },
  ];

  afterEach(() => {
    delete process.env.SCORPED_PURGE_EXCLUDE;
  });

  it('scopes content to transitive importers plus index.html, excluding unrelated files', () => {
    const graph = buildImporterGraph(files);
    const scoped = buildScopedContent(files, graph);
    const homeScope = scoped.get('src/pages/Home.module.scss');

    expect(homeScope).toBeDefined();
    // Transitive importer chain: Home.tsx imports the module, App.tsx imports Home.
    expect(homeScope).toContain("import { Home } from './pages/Home';");
    expect(homeScope).toContain('styles.page');
    // index.html is global — body/`dark` class selectors live there.
    expect(homeScope).toContain('<div class="app-root"></div>');
    // A file outside the importer set must never feed the scope.
    expect(homeScope).not.toContain('unrelated-token');
  });

  it('returns an empty map for an empty graph so the transform keeps the whole blob', () => {
    expect(buildScopedContent(files, new Map()).size).toBe(0);
  });

  it('omits dynamically-indexed modules so they keep the whole blob', () => {
    const dynamicFiles = [
      { path: 'index.html', source: '<div></div>' },
      {
        path: 'src/ui/Chip.tsx',
        source: [
          "import styles from './Chip.module.scss';",
          "const cls = styles['dynamic-key'];",
        ].join('\n'),
      },
    ];

    const graph = buildImporterGraph(dynamicFiles);
    const scoped = buildScopedContent(dynamicFiles, graph);

    expect(graph.has('src/ui/Chip.module.scss')).toBe(true);
    expect(scoped.has('src/ui/Chip.module.scss')).toBe(false);
  });

  it('returns an empty map when SCOPED_PURGE_EXCLUDE opts out', () => {
    process.env.SCORPED_PURGE_EXCLUDE = '1';
    const graph = buildImporterGraph(files);

    expect(buildScopedContent(files, graph).size).toBe(0);
  });
});
