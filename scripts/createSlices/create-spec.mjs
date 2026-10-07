/**
 * Phase A — spec scaffolding step (REQ-G14).
 *
 * Writes the two human-owned files into the staging tree:
 * `spec/SPEC.md` (contract) + `spec/TODO.md` (burn-down plan). In phase A the
 * generator owns ONLY this pair — everything else in the target (code, notes)
 * is foreign and survives a `--force` swap (REQ-G5).
 */
import path from 'node:path';
import { specMd, todoMd } from './templates/spec.mjs';

/**
 * The complete phase-A file plan (used by `--dry-run`, the success log and
 * foreign-file detection).
 * @param {{ layer: string, name: string, camel: string, withSlice?: boolean }} names
 * @returns {{ relPath: string, content: string }[]}
 */
export function specFiles(names) {
  return [
    { relPath: 'spec/SPEC.md', content: specMd(names) },
    { relPath: 'spec/TODO.md', content: todoMd(names) },
  ];
}

/**
 * Staging step: write the spec pair with the fail-if-exists writer.
 * @param {string} stagingDir
 * @param {{ layer: string, name: string, camel: string, withSlice?: boolean }} names
 * @param {(absPath: string, content: string) => Promise<void>} writeFileWx
 */
export async function createSpec(stagingDir, names, writeFileWx) {
  for (const file of specFiles(names)) {
    await writeFileWx(path.join(stagingDir, file.relPath), file.content);
  }
}
