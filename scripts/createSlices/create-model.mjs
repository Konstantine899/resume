/**
 * `model/` step of the slice generator — plan §2.3.3 (flat model directory,
 * AdminAuth/About precedent: no `model/types/`, `model/slices/`, or empty
 * `model/services/` subdirectories).
 *
 * Files:
 *   - always: `types.ts` (`<Name>Props`; + `<Name>State`/`<Name>RootState`
 *     with `--with-slice`, REQ-G9);
 *   - only with `--with-slice`: `<camel>Slice.ts` (name must match `*Slice.ts`
 *     for the `no-param-reassign` override), `selectors.ts` (REQ-G10),
 *     `<camel>Slice.test.ts`.
 *
 * The orchestrator (create-template.mjs) performs the actual staged writes;
 * this module owns the file plan and the per-step write order.
 */
import path from 'node:path';
import { reduxSliceTemplate, sliceTestTemplate } from './templates/redux-slice.mjs';
import { selectorsTemplate } from './templates/selectors.mjs';
import { typesTemplate } from './templates/types.mjs';

/**
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @returns {{ relPath: string, content: string }[]}
 */
export function modelFiles(names) {
  const files = [{ relPath: 'model/types.ts', content: typesTemplate(names) }];
  if (names.withSlice) {
    files.push(
      { relPath: `model/${names.camel}Slice.ts`, content: reduxSliceTemplate(names) },
      { relPath: 'model/selectors.ts', content: selectorsTemplate(names) },
      { relPath: `model/${names.camel}Slice.test.ts`, content: sliceTestTemplate(names) }
    );
  }
  return files;
}

/**
 * Write the `model/` files into the staging directory.
 * @param {string} stagingDir absolute path of the staging directory
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @param {(absPath: string, content: string) => Promise<void>} writeFileWx
 *   fail-if-exists writer supplied by the orchestrator (plan §2.3.2 п.4)
 */
export async function createModel(stagingDir, names, writeFileWx) {
  for (const file of modelFiles(names)) {
    await writeFileWx(path.join(stagingDir, file.relPath), file.content);
  }
}
