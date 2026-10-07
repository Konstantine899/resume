/**
 * `npm run spec:status` — the spec dashboard table (REQ-G18).
 *
 * Prints one `slice | status | verified` row per spec. This is the READ side
 * of the vault link: the Obsidian plan copies/consumes this table — the vault
 * never edits specs (it is narrative/dashboard, the repo is SSOT). Always
 * exit 0: reporting never fails.
 *
 * Usage: node scripts/spec-status.mjs [--root=<dir>]
 */
import { resolveRoot } from './createSlices/resolve-root.mjs';
import { scanSpecs } from './spec-tools.mjs';

async function main() {
  const root = resolveRoot();
  const specs = await scanSpecs(root);

  console.log('slice | status | verified');
  for (const spec of specs) {
    console.log(`${spec.sliceDir} | ${spec.status ?? 'missing'} | ${spec.verified ?? ''}`);
  }
  if (specs.length === 0) console.log('(no spec/SPEC.md under src/)');
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
);
