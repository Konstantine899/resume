/**
 * `check:public-api` — shared/ui public-API boundary checker (REQ-R2).
 *
 * Two passes over `src/` (dry-run by default, exit 1 on findings):
 *
 *  1. Barrels — every directory under `src/shared/ui/` must have an
 *     `index.ts`. `--fix` creates it with NAMED re-exports collected from
 *     the component's own files (never `export *`, per REQ-R2), skipping
 *     tests/stories. A directory without any named export fails loudly
 *     instead of writing an empty barrel.
 *  2. Deep imports — `@/shared/ui/<Component>/<X>` must go through the
 *     component barrel `@/shared/ui/<Component>`; `--fix` rewrites them.
 *     Exception: the first segment after the component may be one of the
 *     internal segments sanctioned by the repo's own ESLint rule
 *     `public-api-only.allowInternal` (`lib`, `constants`, `types`,
 *     `model` — see eslint.config.js). Flagging those would contradict the
 *     ESLint architecture gate inside `npm run validate` (OPEN-6) and would
 *     force internal helpers into component public APIs — verified against
 *     the real tree (`getFallbackColor`, `validateDividerProps`,
 *     `ToastAction` are deliberately not barrel-exported).
 *
 * Upstream (`createPublicApiForSharedUi.ts`) emitted `export *`, did not
 * await saves and flagged every deep specifier; this ESM + ts-morph rewrite
 * (OPEN-4, Variant A) fixes all three.
 *
 * Usage:
 *   node scripts/refactoring/check-shared-ui-public-api.mjs [--fix] [--root=<dir>]
 *   npm run check:public-api [-- --fix]
 */
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Node } from 'ts-morph';
import { resolveRoot } from '../createSlices/resolve-root.mjs';
import { createSrcProject, getModuleSpecifiers, parseArgs } from './src-scan.mjs';

const USAGE =
  'Usage: node scripts/refactoring/check-shared-ui-public-api.mjs [--fix] [--root=<dir>]';

const SHARED_UI_PREFIX = '@/shared/ui/';
const PRINT_WIDTH = 100;

/**
 * Internal segments allowed after the component name — mirrors
 * `public-api-only.allowInternal` in eslint.config.js (SSOT for that rule).
 * @type {readonly string[]}
 */
const ALLOWED_INTERNAL_SEGMENTS = Object.freeze(['lib', 'constants', 'types', 'model']);

/**
 * Classify a specifier against the shared/ui public-API boundary.
 * @param {string} specifier module specifier to inspect
 * @returns {{ suggestion: string } | null} violation with its rewrite target,
 *   or `null` when the specifier is fine (relative, package, barrel-level or
 *   an allowed internal segment)
 */
function findDeepImport(specifier) {
  if (!specifier.startsWith(SHARED_UI_PREFIX)) return null;
  const rest = specifier.slice(SHARED_UI_PREFIX.length);
  const slash = rest.indexOf('/');
  if (slash <= 0) return null; // `@/shared/ui` or `@/shared/ui/<Component>` — barrel-level
  const component = rest.slice(0, slash);
  const [firstInnerSegment] = rest.slice(slash + 1).split('/');
  if (ALLOWED_INTERNAL_SEGMENTS.includes(firstInnerSegment)) return null;
  return { suggestion: `${SHARED_UI_PREFIX}${component}` };
}

/**
 * Format one barrel export line, wrapping at the project print width (100).
 * @param {'value' | 'type'} kind
 * @param {string[]} names sorted export names
 * @param {string} rel posix-relative module path (`./Widget`, `./model/types`)
 * @returns {string}
 */
function formatExportLine(kind, names, rel) {
  const keyword = kind === 'type' ? 'export type' : 'export';
  const single = `${keyword} { ${names.join(', ')} } from '${rel}';`;
  if (single.length <= PRINT_WIDTH) return single;
  const body = names.map((name) => `  ${name},`).join('\n');
  return `${keyword} {\n${body}\n} from '${rel}';`;
}

/**
 * Collect the named exports of a component directory from the project's
 * already-loaded source files (own barrel, tests and stories excluded).
 * @param {import('ts-morph').Project} project
 * @param {string} componentDir absolute directory of the component
 * @param {string} componentDirPosix posix path of the component dir (for rel)
 * @returns {{ lines: string[], hasExports: boolean }}
 */
function buildBarrelContent(project, componentDir, componentDirPosix) {
  const dirPrefix = `${componentDir.split(path.sep).join('/')}/`;
  const files = project
    .getSourceFiles()
    .filter((file) => {
      const abs = file.getFilePath().split(path.sep).join('/');
      if (!abs.startsWith(dirPrefix)) return false;
      const relPath = abs.slice(dirPrefix.length);
      if (relPath === 'index.ts') return false;
      if (relPath.endsWith('.d.ts')) return false;
      if (relPath.endsWith('.test.ts') || relPath.endsWith('.test.tsx')) return false;
      if (relPath.endsWith('.stories.ts') || relPath.endsWith('.stories.tsx')) return false;
      return abs.endsWith('.ts') || abs.endsWith('.tsx');
    })
    .sort((a, b) => a.getFilePath().localeCompare(b.getFilePath()));

  /** @type {Map<string, 'value' | 'type'>} */
  const emitted = new Map();
  const lines = [];
  for (const file of files) {
    const absPosix = file.getFilePath().split(path.sep).join('/');
    const rel = `./${absPosix.slice(dirPrefix.length).replace(/\.tsx?$/, '')}`;
    const valueNames = [];
    const typeNames = [];
    for (const [name, declarations] of file.getExportedDeclarations()) {
      if (name === 'default' || emitted.has(name)) continue;
      const isTypeOnly =
        declarations.length > 0 &&
        declarations.every(
          (declaration) =>
            Node.isTypeAliasDeclaration(declaration) || Node.isInterfaceDeclaration(declaration)
        );
      emitted.set(name, isTypeOnly ? 'type' : 'value');
      (isTypeOnly ? typeNames : valueNames).push(name);
    }
    if (valueNames.length > 0) {
      lines.push(formatExportLine('value', valueNames.sort(), rel));
    }
    if (typeNames.length > 0) {
      lines.push(formatExportLine('type', typeNames.sort(), rel));
    }
  }
  const hasExports = lines.length > 0;
  if (!hasExports) return { lines, hasExports };
  const banner = `// ${componentDirPosix}/index.ts (created by check:public-api --fix)`;
  return { lines: [banner, ...lines], hasExports };
}

/**
 * Analyze (and with `--fix` repair) the shared/ui public API.
 * @returns {Promise<void>}
 */
async function main() {
  const argv = process.argv.slice(2);
  const { fix } = parseArgs(argv, USAGE);
  const root = resolveRoot(argv);
  const srcSharedUi = path.join(root, 'src', 'shared', 'ui');
  if (!existsSync(srcSharedUi)) {
    console.error(`Error: src/shared/ui not found at ${srcSharedUi}. Nothing to check.`);
    process.exitCode = 1;
    return;
  }

  const entries = await readdir(srcSharedUi, { withFileTypes: true });
  const componentDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const missingBarrels = componentDirs.filter(
    (name) => !existsSync(path.join(srcSharedUi, name, 'index.ts'))
  );

  const project = createSrcProject(path.join(root, 'src'));
  /** @type {{ file: string, line: number, value: string, suggestion: string, ref: { set: (next: string) => void } }[]} */
  const deepImports = [];
  for (const sourceFile of project.getSourceFiles()) {
    const rel = path.relative(root, sourceFile.getFilePath()).split(path.sep).join('/');
    for (const ref of getModuleSpecifiers(sourceFile)) {
      const violation = findDeepImport(ref.value);
      if (violation) {
        deepImports.push({ file: rel, line: ref.line, value: ref.value, ...violation, ref });
      }
    }
  }
  deepImports.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

  const totalViolations = missingBarrels.length + deepImports.length;
  if (!fix) {
    for (const name of missingBarrels) {
      console.log(`Missing barrel: src/shared/ui/${name}`);
    }
    for (const violation of deepImports) {
      console.log(
        `Deep import: ${violation.file}:${violation.line}  '${violation.value}' (use '${violation.suggestion}')`
      );
    }
    if (totalViolations > 0) {
      console.log(
        `Found ${totalViolations} public-API violation(s) (${missingBarrels.length} missing barrel(s), ${deepImports.length} deep import(s)). Run with --fix to repair.`
      );
      process.exitCode = 1;
      return;
    }
    const withIndex = componentDirs.length - missingBarrels.length;
    console.log(
      `Public API OK: ${withIndex}/${componentDirs.length} shared/ui directories have index.ts; ${deepImports.length} deep import violation(s).`
    );
    return;
  }

  let created = 0;
  let errors = 0;
  for (const name of missingBarrels) {
    const componentDir = path.join(srcSharedUi, name);
    const componentDirPosix = `src/shared/ui/${name}`;
    const { lines, hasExports } = buildBarrelContent(project, componentDir, componentDirPosix);
    if (!hasExports) {
      console.error(
        `Error: cannot create barrel for ${componentDirPosix} (no named exports found).`
      );
      errors += 1;
      continue;
    }
    const indexFile = project.createSourceFile(
      path.join(componentDir, 'index.ts'),
      `${lines.join('\n')}\n`
    );
    await indexFile.save();
    created += 1;
    console.log(`Created barrel: ${componentDirPosix}/index.ts`);
  }

  let rewritten = 0;
  for (const violation of deepImports) {
    violation.ref.set(violation.suggestion);
    rewritten += 1;
    console.log(
      `Rewrote deep import: ${violation.file}:${violation.line}  '${violation.value}' -> '${violation.suggestion}'`
    );
  }
  if (rewritten > 0) {
    await project.save();
  }

  if (errors > 0) {
    console.log(`Fixed ${created + rewritten} violation(s); ${errors} error(s) occurred.`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `Fixed ${created + rewritten} violation(s) (${created} barrel(s) created, ${rewritten} deep import(s) rewritten).`
  );
}

// Run only when executed directly (in-process tests can import main's
// helpers without triggering a CLI run) — same guard style as update-imports.
const invokedDirectly =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    await main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
