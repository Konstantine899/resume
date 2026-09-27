// scripts/analyze-scss.mjs
//
// Standalone SCSS dead-code analyzer (C1).
//
// `analyzeScss(files)` is a pure function: it takes `{ file, content }` pairs
// and returns every `$var` / `@mixin` / `@function` declaration and CSS
// custom-property (design token) declaration that is never used in ANY file
// of the set. Key rules (all covered by
// config/vite/plugins/__tests__/analyzeScss.test.ts):
//   - a declaration position never counts as usage of itself;
//   - `//`-leading lines are skipped entirely (no decls, no usages);
//   - private `$_*` members and the system mixin whitelist are ignored;
//   - usages resolve across the whole file set (cross-file included);
//   - tokens are consumed via `var(--name)` or a quoted `'--name'` key
//     (setProperty/getPropertyValue), never by their own declaration.
//
// CLI: `node scripts/analyze-scss.mjs [glob-root]` — prints findings plus
// per-file totals, exits 0.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { globby } from 'globby';

/**
 * @typedef {'var' | 'mixin' | 'func' | 'token'} ScssDeclType
 * @typedef {{ name: string, type: ScssDeclType, file: string, line: number }} ScssFinding
 * @typedef {{ file: string, content: string }} ScssFileInput
 */

/** System mixins/functions kept regardless of usage (breakpoints, flex, font). */
const WHITELIST = new Set([
  'max-xs',
  'max-sm',
  'max-md',
  'max-lg',
  'max-xl',
  'min-xs',
  'min-sm',
  'min-md',
  'min-lg',
  'min-xl',
  'container',
  'flex-start',
  'flex-center',
  'flex-between',
  'font-light',
  'font-normal',
  'font-medium',
  'font-semibold',
  'font-bold',
]);

const VAR_DECL = /(\$[\w-]+)\s*:/g;
const MIXIN_DECL = /@mixin\s+([\w-]+)/g;
const FUNC_DECL = /@function\s+([\w-]+)/g;
const VAR_USE = /\$[\w-]+/g;
// Supports namespaces: `@include ui.card-title` → `card-title`.
const INCLUDE_USE = /@include\s+(?:[\w-]+\.)*([\w-]+)/g;
const FUNC_USE = /([\w-]+)\s*\(/g;
// Design tokens: a custom-property declaration is a property line, so it must
// START the line (after indentation) — this keeps BEM modifiers with pseudos
// (`&--active:hover {`) out of the declaration set.
const TOKEN_DECL = /^\s*(--[\w-]+)\s*:/g;
const TOKEN_USE_VAR = /var\(\s*(--[\w-]+)/g;
const TOKEN_USE_QUOTED = /(['"`])(--[\w-]+)\1/g;

/**
 * True when the name at `index` sits inside one of the declaration spans
 * collected on the same line (i.e. the match IS a declaration, not a usage).
 *
 * @param {number} index
 * @param {Array<[number, number]>} spans
 * @returns {boolean}
 */
function isAtDeclaration(index, spans) {
  return spans.some(([start, end]) => index >= start && index < end);
}

/**
 * Analyze a set of SCSS files for unused declarations.
 *
 * Design tokens get a second, usage-only file set: their declarations are
 * SCSS-only, but consumers live across languages (TSX inline styles,
 * storybook stories, setProperty-style keys), so token usages resolve over
 * `files ∪ tokenUsageFiles` while var/mixin/func keep using `files` alone
 * (existing report output stays byte-stable).
 *
 * @param {ScssFileInput[]} files SCSS sources — declarations + all usages.
 * @param {ScssFileInput[]} [tokenUsageFiles] non-SCSS sources — token usages only.
 * @returns {ScssFinding[]} findings in input order (file order, then line order)
 */
export function analyzeScss(files, tokenUsageFiles = []) {
  /** @type {ScssFinding[]} */
  const findings = [];
  const usages = new Set();
  const tokenUsages = new Set();
  /** @type {Array<{ name: string, type: ScssDeclType, file: string, line: number }>} */
  const declarations = [];

  for (const { file, content } of files) {
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (line.trimStart().startsWith('//')) return;

      /** @type {Array<[number, number]>} */
      const spans = [];

      for (const m of line.matchAll(VAR_DECL)) {
        const span = /** @type {[number, number]} */ ([m.index, m.index + m[1].length]);
        spans.push(span);
        declarations.push({ name: m[1], type: 'var', file, line: idx + 1 });
      }
      for (const m of line.matchAll(MIXIN_DECL)) {
        const span = /** @type {[number, number]} */ ([m.index, m.index + m[0].length]);
        spans.push(span);
        declarations.push({ name: m[1], type: 'mixin', file, line: idx + 1 });
      }
      for (const m of line.matchAll(FUNC_DECL)) {
        const span = /** @type {[number, number]} */ ([m.index, m.index + m[0].length]);
        spans.push(span);
        declarations.push({ name: m[1], type: 'func', file, line: idx + 1 });
      }
      for (const m of line.matchAll(TOKEN_DECL)) {
        const nameStart = m[0].indexOf(m[1]);
        const span = /** @type {[number, number]} */ ([
          m.index + nameStart,
          m.index + nameStart + m[1].length,
        ]);
        spans.push(span);
        declarations.push({ name: m[1], type: 'token', file, line: idx + 1 });
      }

      for (const m of line.matchAll(VAR_USE)) {
        if (!isAtDeclaration(m.index, spans)) usages.add(m[0]);
      }
      for (const m of line.matchAll(INCLUDE_USE)) {
        const nameIndex = m.index + m[0].lastIndexOf(m[1]);
        if (!isAtDeclaration(nameIndex, spans)) usages.add(m[1]);
      }
      for (const m of line.matchAll(FUNC_USE)) {
        if (!isAtDeclaration(m.index, spans)) usages.add(m[1]);
      }
      for (const m of line.matchAll(TOKEN_USE_VAR)) {
        const nameIndex = m.index + m[0].indexOf(m[1]);
        if (!isAtDeclaration(nameIndex, spans)) tokenUsages.add(m[1]);
      }
      for (const m of line.matchAll(TOKEN_USE_QUOTED)) {
        const nameIndex = m.index + m[0].indexOf(m[2]);
        if (!isAtDeclaration(nameIndex, spans)) tokenUsages.add(m[2]);
      }
    });
  }

  // Token usages from other languages: usage-only — no declarations are ever
  // collected here, so var/mixin/func findings are unaffected. Prose (comment
  // lines) never counts as a consumer.
  for (const { content } of tokenUsageFiles) {
    for (const line of content.split('\n')) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
      for (const m of line.matchAll(TOKEN_USE_VAR)) tokenUsages.add(m[1]);
      for (const m of line.matchAll(TOKEN_USE_QUOTED)) tokenUsages.add(m[2]);
    }
  }

  // Evaluate only AFTER every file was scanned, so usages in later files
  // count for declarations in earlier ones (cross-file resolution).
  for (const decl of declarations) {
    if (decl.name.startsWith('$_')) continue;
    if (WHITELIST.has(decl.name)) continue;
    const used = decl.type === 'token' ? tokenUsages : usages;
    if (used.has(decl.name)) continue;
    findings.push({
      name: decl.name,
      type: decl.type,
      file: decl.file,
      line: decl.line,
    });
  }

  return findings;
}

/**
 * Format findings for CLI output.
 *
 * @param {ScssFinding[]} findings
 * @returns {string[]}
 */
export function formatFindings(findings) {
  return findings.map((f) => `[${f.type.toUpperCase()}] ${f.name} ${f.file}:${f.line}`);
}

async function main() {
  const root = process.argv[2] ?? 'src';
  const rootGlob = root.replace(/\/+$/, '');
  const ignore = ['**/node_modules/**', '**/dist/**'];
  const paths = await globby(`${rootGlob}/**/*.scss`, {
    ignore,
  });

  // Usage-only sources for the design-token pass: consumers live across
  // languages (TSX inline styles, stories, tests, storybook preview,
  // index.html). Declarations stay SCSS-only, so var/mixin/func findings
  // are byte-identical to the pre-token analyzer.
  const usagePaths = await globby(
    [
      `${rootGlob}/**/*.{ts,tsx,js,jsx,mjs,html,css}`,
      '.storybook/**/*.{ts,tsx,js,jsx,mjs}',
      'index.html',
    ],
    { ignore }
  );

  const readAll = (list) =>
    Promise.all(
      list.sort().map(async (file) => ({
        file: file.replaceAll('\\', '/'),
        content: await fs.readFile(file, 'utf-8'),
      }))
    );

  const files = await readAll(paths);
  const usageFiles = await readAll(usagePaths);

  const findings = analyzeScss(files, usageFiles);

  if (findings.length === 0) {
    console.log('No unused SCSS declarations found.');
  } else {
    console.warn(`Found ${findings.length} unused SCSS declaration(s):`);
    for (const line of formatFindings(findings)) console.warn(`  ${line}`);

    // Per-file totals (FR-d): one row per file with findings, broken down
    // by category so design tokens sit alongside var/mixin/func.
    /** @type {Map<string, { total: number, byType: Record<string, number> }>} */
    const totals = new Map();
    for (const finding of findings) {
      const entry = totals.get(finding.file) ?? { total: 0, byType: {} };
      entry.total += 1;
      entry.byType[finding.type] = (entry.byType[finding.type] ?? 0) + 1;
      totals.set(finding.file, entry);
    }
    console.warn('Per-file totals:');
    for (const [file, { total, byType }] of totals) {
      const breakdown = Object.entries(byType)
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');
      console.warn(`  ${file}: ${total} (${breakdown})`);
    }
  }
  process.exitCode = 0;
}

const isMain =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
