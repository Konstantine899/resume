/**
 * Shared ts-morph scanning helpers for the refactoring tools (REQ-R3,
 * Variant A: ESM `.mjs` + `ts-morph`, zero config changes).
 *
 * Both tools load the same file set (all `.ts`/`.tsx` under `src/`) and
 * iterate the same node kinds (module specifiers of import AND export
 * declarations), so the globbing and specifier handling live here once.
 */
import path from 'node:path';
import { Project } from 'ts-morph';

/**
 * Create a ts-morph project preloaded with every `.ts`/`.tsx` file under
 * `<srcDir>`. The glob is normalized to `/` so absolute Windows paths work.
 *
 * @param {string} srcDir absolute path of a `src` directory
 * @returns {Project}
 */
export function createSrcProject(srcDir) {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const globBase = srcDir.split(path.sep).join('/').replace(/\/+$/, '');
  project.addSourceFilesAtPaths(`${globBase}/**/*.ts`);
  project.addSourceFilesAtPaths(`${globBase}/**/*.tsx`);
  return project;
}

/**
 * Collect every module specifier of a source file: `import … from '…'`,
 * bare `import '…'` and `export … from '…'`. Export declarations WITHOUT a
 * module specifier (`export { local }`) are skipped — they have no string to
 * rewrite or inspect.
 *
 * @param {import('ts-morph').SourceFile} sourceFile
 * @returns {{ value: string, line: number, set: (next: string) => void }[]}
 */
export function getModuleSpecifiers(sourceFile) {
  const references = [];
  const declarations = [
    ...sourceFile.getImportDeclarations(),
    ...sourceFile.getExportDeclarations(),
  ];
  for (const declaration of declarations) {
    const value = declaration.getModuleSpecifierValue();
    if (!value) continue;
    references.push({
      value,
      line: declaration.getStartLineNumber(),
      set: (next) => declaration.setModuleSpecifier(next),
    });
  }
  return references;
}
