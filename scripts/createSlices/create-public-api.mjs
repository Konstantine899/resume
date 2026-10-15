/**
 * Public-API step of the slice generator — plan §2.3.3 / §4.5.6.
 *
 * The slice root always gets an `index.ts` with banner + named re-exports
 * (never `export *`); the redux exports are active only with `--with-slice`.
 */
import path from 'node:path';
import { publicApiTemplate } from './templates/index.mjs';

/**
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @returns {{ relPath: string, content: string }[]}
 */
export function publicApiFiles(names) {
  return [{ relPath: 'index.ts', content: publicApiTemplate(names) }];
}

/**
 * Write the public API file into the staging directory.
 * @param {string} stagingDir absolute path of the staging directory
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @param {(absPath: string, content: string) => Promise<void>} writeFileWx
 */
export async function createPublicApi(stagingDir, names, writeFileWx) {
  for (const file of publicApiFiles(names)) {
    await writeFileWx(path.join(stagingDir, file.relPath), file.content);
  }
}
