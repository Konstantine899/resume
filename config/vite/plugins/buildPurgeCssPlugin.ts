// config/vite/plugins/buildPurgeCssPlugin.ts
//
// Production PurgeCSS transform for CSS Modules.
//
// Why `enforce: 'pre'` instead of the previous `config.css.postcss` injection:
//   Vite's internal CSS plugin runs *after* pre-plugins, so this hook sees the
//   RAW SCSS — before Sass compilation and, crucially, BEFORE `vite:css-post`
//   replaces every class name with the prod `generateScopedName` hash
//   (`[hash:base64:8]`). Purging after that hash would match nothing and strip
//   the entire stylesheet.
//
// Why the extractor normalises case:
//   `buildCssModules.ts` uses `localsConvention: 'camelCaseOnly'`, so TSX
//   references `styles.cardTitle` while the SCSS declares `.card-title`.
//   PurgeCSS matches extracted tokens against the *raw* selector value, so a
//   plain `/[\w-/:]+/` extractor drops every camelCase-referenced class.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, posix, sep } from 'node:path';

import purgecss from '@fullhuman/postcss-purgecss';
import postcss from 'postcss';
import * as scss from 'postcss-scss';
import type { Plugin } from 'vite';

/** Source extensions scanned to build the PurgeCSS content blob. */
const CONTENT_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.html']);

/** Extensions that may declare a CSS Module imported by an indexed styles object. */
const CSS_MODULE_SUFFIX = '.module.scss';

export interface PurgeStylesheetOptions {
  /** Absolute path of the stylesheet; used for postcss diagnostics. */
  from: string;
  /** Whole-repo source blob the selectors are matched against. */
  content: string;
  /** Extra exact class names that must survive (dynamic `styles[...]` modules). */
  safelist?: readonly string[];
}

/**
 * Classes that are referenced outside of plain `styles.foo` reads:
 * global theme toggles, base document elements and the emailjs runtime.
 */
export const PURGE_SAFE_STANDARD: (string | RegExp)[] = [
  'dark',
  'light',
  'theme-dark',
  'theme-light',
  'body',
  'html',
  '__variable-font__',
  'root',
  /emailjs-.*/,
];

/**
 * Selector *fragments* kept regardless of content. `^&` protects SCSS parent
 * references and `^:global` protects CSS-module escape hatches — both are
 * authored, never present in TSX, and would otherwise be stripped.
 */
export const PURGE_SAFE_GREEDY: RegExp[] = [
  /^&/,
  /^:global/,
  /^variant-.*/,
  /^size-.*/,
  /^status-.*/,
  /^state-.*/,
  /^type-.*/,
  /.*active.*/,
  /.*hover.*/,
  /.*focus.*/,
];

const toPosix = (value: string): string => value.split(sep).join(posix.sep);

/** `card-title` → `cardTitle`; identity for anything without a dash. */
function kebabToCamel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
}

/** `cardTitle` → `card-title`; identity for anything without an uppercase run. */
function camelToKebab(value: string): string {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/**
 * Default PurgeCSS extractor plus a case bridge between
 * `localsConvention: 'camelCaseOnly'` accessors and kebab-case SCSS selectors.
 */
export function createPurgeExtractor(): (content: string) => string[] {
  return (content: string): string[] => {
    const matches = content.match(/[\w-/:]+(?<!:)/g) ?? [];
    const indexed = [...content.matchAll(/styles\[['"]([^'"]+)['"]\]/g)].map(
      (match) => match[1] ?? ''
    );

    const tokens = new Set<string>();
    for (const token of [...matches, ...indexed]) {
      if (!token) continue;
      tokens.add(token);
      tokens.add(kebabToCamel(token));
      tokens.add(camelToKebab(token));
    }

    return [...tokens];
  };
}

/** Every `.class` selector in a stylesheet, document order, de-duplicated. */
export function extractClassSelectors(scssSource: string): string[] {
  const root = postcss().process(scssSource, {
    from: undefined,
    parser: scss.parse,
    stringifier: scss.stringify,
  }).root;

  const classes: string[] = [];
  const seen = new Set<string>();

  root.walkRules((rule) => {
    const parent = rule.parent;
    if (parent?.type === 'atrule' && /keyframes$/.test(parent.name)) return;

    for (const part of rule.selector.split(',')) {
      for (const match of part.matchAll(/\.([A-Za-z0-9_-]+)/g)) {
        const name = match[1];
        if (!name || seen.has(name)) continue;
        seen.add(name);
        classes.push(name);
      }
    }
  });

  return classes;
}

/**
 * CSS Modules whose `styles` object is read through an index expression
 * (`styles[size]`, `styles['x']`) or handed to `resolveCssModuleKey(styles, …)`.
 * Those keys are built at runtime and never appear as literal tokens in TSX.
 */
export function findDynamicStyleModulePaths(
  files: ReadonlyArray<{ path: string; source: string }>
): string[] {
  const modulePaths: string[] = [];
  const seen = new Set<string>();
  const importPattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+\.module\.scss)['"]/g;

  for (const file of files) {
    importPattern.lastIndex = 0;
    for (const match of file.source.matchAll(importPattern)) {
      const binding = match[1];
      const specifier = match[2];
      if (!binding || !specifier) continue;

      const indexed = new RegExp(`\\b${binding}\\s*\\[`);
      const resolved = new RegExp(`resolveCssModuleKey\\s*\\(\\s*${binding}\\b`);
      if (!indexed.test(file.source) && !resolved.test(file.source)) continue;

      const modulePath = specifier.startsWith('.')
        ? posix.join(posix.dirname(toPosix(file.path)), specifier)
        : specifier.startsWith('@/')
          ? posix.join(toPosix(process.cwd()), 'src', specifier.slice(2))
          : null;
      if (!modulePath || seen.has(modulePath)) continue;

      seen.add(modulePath);
      modulePaths.push(modulePath);
    }
  }

  return modulePaths;
}

/**
 * Whole-file class safelist: `Map<modulePath, classNames>` for every module
 * paired with a dynamically-indexed importer. Keys are posix-normalised so the
 * map matches what `transform` sees in `id`.
 */
export function buildDynamicSafelist(
  files: ReadonlyArray<{ path: string; source: string }>,
  readModule: (modulePath: string) => string
): Map<string, string[]> {
  const safelist = new Map<string, string[]>();

  for (const modulePath of findDynamicStyleModulePaths(files)) {
    if (safelist.has(modulePath)) continue;
    let source: string;
    try {
      source = readModule(modulePath);
    } catch {
      continue;
    }
    safelist.set(modulePath, extractClassSelectors(source));
  }

  return safelist;
}

/** Extensions tried when an import specifier carries none (in candidate order). */
const EXTENSIONLESS_CANDIDATES = ['.ts', '.tsx', '.js', '.jsx', '.scss', '.css'];

/**
 * Resolve an import specifier to every filesystem path it could refer to.
 * Returns `null` for bare specifiers in TS/JS (`lodash`, `@scope/pkg`) —
 * those live in node_modules and must never enter the importer graph.
 * Sass is different: `@use 'mixins'` is resolved relative to the importing
 * stylesheet, so unqualified specs coming from a `.scss` file stay relative.
 */
export function resolveImportCandidates(fromPath: string, spec: string): string[] | null {
  const clean = spec.split('?')[0] ?? spec;
  const isAlias = clean.startsWith('@/');
  const isRelative = clean.startsWith('.');
  if (!isAlias && !isRelative && !fromPath.endsWith('.scss')) return null;

  const base = isAlias
    ? posix.join(toPosix(process.cwd()), 'src', clean.slice(2))
    : posix.join(posix.dirname(toPosix(fromPath)), clean);

  if (/\.[A-Za-z0-9]+$/.test(clean)) return [base];

  const directory = posix.dirname(base);
  const name = posix.basename(base);
  return [
    ...EXTENSIONLESS_CANDIDATES.map((ext) => `${base}${ext}`),
    ...EXTENSIONLESS_CANDIDATES.map((ext) => `${base}/index${ext}`),
    `${directory}/_${name}.scss`,
  ];
}

/** Import specifiers a source file references. */
function extractImportSpecifiers(file: { path: string; source: string }): string[] {
  const specs: string[] = [];

  if (file.path.endsWith('.scss')) {
    for (const match of file.source.matchAll(/@(?:use|import|forward)\s+['"]([^'"]+)['"]/g)) {
      specs.push(match[1]);
    }
    return specs;
  }

  if (!/\.(ts|tsx|js|jsx)$/.test(file.path)) return specs;

  // `import x from '…'`, `import type { T } from '…'`, `export * from '…'`.
  // `[^'";]` keeps a statement from bleeding into the next one.
  for (const match of file.source.matchAll(
    /\b(?:import|export)\s+(?:type\s+)?[^'";]*?\bfrom\s*['"]([^'"]+)['"]/g
  )) {
    specs.push(match[1]);
  }
  // Side-effect imports and dynamic `import('…')`.
  for (const match of file.source.matchAll(/\bimport\s*\(?\s*['"]([^'"]+)['"]/g)) {
    specs.push(match[1]);
  }

  return specs;
}

/**
 * Reverse import graph: target path → every file that imports it directly or
 * transitively. Targets resolve against the scanned file set; a specifier that
 * ends in `.scss` always forms a target node even though SCSS files are never
 * part of that set (production collection reads only TS/JS/HTML).
 */
export function buildImporterGraph(
  files: ReadonlyArray<{ path: string; source: string }>
): Map<string, Set<string>> {
  const knownPaths = new Set(files.map((file) => file.path));
  /** Direct edges only: target → files with a literal import of it. */
  const direct = new Map<string, Set<string>>();

  for (const file of files) {
    for (const rawSpec of extractImportSpecifiers(file)) {
      const spec = rawSpec.split('?')[0] ?? rawSpec;
      const candidates = resolveImportCandidates(file.path, spec);
      if (!candidates) continue;

      const target =
        candidates.find((candidate) => knownPaths.has(candidate)) ??
        (spec.endsWith('.scss') ? candidates[0] : undefined);
      if (!target || target === file.path) continue;

      const importers = direct.get(target) ?? new Set<string>();
      importers.add(file.path);
      direct.set(target, importers);
    }
  }

  // Transitive closure per target: breadth-first over reverse edges. The BFS
  // visited-set terminates on cycles; the target itself is removed afterwards
  // so a cycle never makes a file its own importer.
  const graph = new Map<string, Set<string>>();
  for (const [target] of direct) {
    const importers = new Set<string>();
    const queue = [...(direct.get(target) ?? [])];
    while (queue.length > 0) {
      const node = queue.pop();
      if (node === undefined || importers.has(node)) continue;
      importers.add(node);
      queue.push(...(direct.get(node) ?? []));
    }
    importers.delete(target);
    if (importers.size > 0) graph.set(target, importers);
  }

  return graph;
}

/**
 * Per-module PurgeCSS content: `<module.scss path>` → only the sources that
 * can reference its classes (its transitive importers) plus `index.html`
 * (global body/`dark` selectors live there).
 *
 * Fallback contract (transform reads `scoped.get(file) ?? content`):
 *   - empty graph → empty map → every module keeps the whole blob;
 *   - dynamically-indexed modules are omitted → they keep the whole blob
 *     (their keys are computed at runtime, no importer scoping is safe);
 *   - `SCOPED_PURGE_EXCLUDE=<anything>` → empty map → global opt-out.
 */
export function buildScopedContent(
  files: ReadonlyArray<{ path: string; source: string }>,
  graph: ReadonlyMap<string, ReadonlySet<string>>
): Map<string, string> {
  if (process.env.SCORPED_PURGE_EXCLUDE) return new Map();

  const sourceByPath = new Map(files.map((file) => [file.path, file.source]));
  const dynamicModules = new Set(findDynamicStyleModulePaths(files));
  // index.html (and any other HTML entry) is global context for every scope.
  const htmlContent = files
    .filter((file) => file.path.endsWith('.html'))
    .map((file) => file.source)
    .join('\n');

  const scoped = new Map<string, string>();
  for (const [target, importers] of graph) {
    if (!target.endsWith('.module.scss')) continue;
    if (dynamicModules.has(target)) continue;

    const importerSources = [...importers]
      .map((importer) => sourceByPath.get(importer) ?? '')
      .filter(Boolean);
    if (importerSources.length === 0) continue;

    scoped.set(target, [htmlContent, ...importerSources].filter(Boolean).join('\n'));
  }

  return scoped;
}

/**
 * Run PurgeCSS over one stylesheet. Returns the original source verbatim when
 * PurgeCSS cannot parse it — a build that ships unpurged CSS is recoverable,
 * a build that ships nothing is not.
 */
export async function purgeStylesheet(
  code: string,
  options: PurgeStylesheetOptions
): Promise<string> {
  const safelist = options.safelist ?? [];

  try {
    const result = await postcss([
      purgecss({
        content: [{ raw: options.content, extension: 'html' }],
        safelist: {
          standard: [...PURGE_SAFE_STANDARD, ...safelist],
          greedy: PURGE_SAFE_GREEDY,
        },
        defaultExtractor: createPurgeExtractor(),
        keyframes: false,
        variables: false,
      }),
    ]).process(code, {
      from: options.from,
      parser: scss.parse,
      stringifier: scss.stringify,
    });

    return result.css;
  } catch {
    return code;
  }
}

/** Recursively collect source files that feed the PurgeCSS content blob. */
function collectContentFiles(
  directory: string,
  files: Array<{ path: string; source: string }>
): void {
  let entries: string[];
  try {
    entries = readdirSync(directory);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      collectContentFiles(path, files);
      continue;
    }
    const dot = entry.lastIndexOf('.');
    if (dot === -1 || !CONTENT_EXTENSIONS.has(entry.slice(dot))) continue;
    try {
      files.push({ path: toPosix(path), source: readFileSync(path, 'utf8') });
    } catch {
      // Unreadable source must never fail the build.
    }
  }
}

export function buildPurgeCssPlugin(): Plugin {
  let content = '';
  let scopedContent = new Map<string, string>();
  let dynamicSafelist = new Map<string, string[]>();

  return {
    name: 'vite-plugin-purgecss',
    apply: 'build',
    enforce: 'pre',

    buildStart() {
      const files: Array<{ path: string; source: string }> = [];
      const srcDirectory = join(process.cwd(), 'src');
      const htmlEntry = join(process.cwd(), 'index.html');

      if (existsSync(srcDirectory)) collectContentFiles(srcDirectory, files);
      if (existsSync(htmlEntry)) {
        files.push({ path: toPosix(htmlEntry), source: readFileSync(htmlEntry, 'utf8') });
      }

      content = files.map((file) => file.source).join('\n');
      dynamicSafelist = buildDynamicSafelist(files, (modulePath) =>
        readFileSync(modulePath, 'utf8')
      );

      // Scoped purging is an optimisation: any failure must degrade to the
      // whole blob, never to an empty one (which would purge everything).
      try {
        scopedContent = buildScopedContent(files, buildImporterGraph(files));
      } catch {
        scopedContent = new Map();
      }
    },

    async transform(code, id) {
      const file = toPosix(id.split('?')[0] ?? id);
      if (!file.endsWith(CSS_MODULE_SUFFIX)) return null;

      const safelist = dynamicSafelist.get(file);
      const purged = await purgeStylesheet(code, {
        from: id,
        // Modules not in the scoped map (dynamic, unreachable, opt-out)
        // fall back to the whole-repo blob.
        content: scopedContent.get(file) ?? content,
        safelist,
      });

      return purged === code ? null : purged;
    },
  };
}
