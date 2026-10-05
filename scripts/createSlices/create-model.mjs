/**
 * `model/` step of the slice generator — nested model directory
 * (owner decision 2026-10-04, SPEC §3.2 REQ-G8 amended): `model/` contains
 * ONLY the subdirectories `types/`, `slices/`, `selectors/`, `services/` —
 * flat files directly in `model/` are forbidden.
 *
 * Files:
 *   - always: `types/index.ts` (`<Name>Props`; + `<Name>State`/`<Name>RootState`
 *     with `--with-slice`, REQ-G9);
 *   - only with `--with-slice`: `slices/<camel>Slice.ts` (name must match `*Slice.ts`
 *     for the `no-param-reassign` override), `selectors/index.ts` (REQ-G10),
 *     `slices/<camel>Slice.test.ts`;
 *   - `services/` is never created (empty directories are not committable) —
 *     it is created by hand when real service files appear.
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
  const files = [{ relPath: 'model/types/index.ts', content: typesTemplate(names) }];
  if (names.withSlice) {
    files.push(
      { relPath: `model/slices/${names.camel}Slice.ts`, content: reduxSliceTemplate(names) },
      { relPath: 'model/selectors/index.ts', content: selectorsTemplate(names) },
      { relPath: `model/slices/${names.camel}Slice.test.ts`, content: sliceTestTemplate(names) }
    );
  }
  return files;
}

/**
 * Write the `model/` files into the staging directory.
 * @param {string} stagingDir absolute path of the staging directory
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @param {(absPath: string, content: string) => Promise<void>} writeFileWx
 *   fail-if-exists writer supplied by the orchestrator (plan §2.3.2 item 4)
 */
export async function createModel(stagingDir, names, writeFileWx) {
  for (const file of modelFiles(names)) {
    await writeFileWx(path.join(stagingDir, file.relPath), file.content);
  }
}
