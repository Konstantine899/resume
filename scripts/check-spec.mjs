/**
 * `npm run check:spec` — the repo-side spec gate (REQ-G17, plan §1.3).
 *
 * A spec PASSES when its frontmatter status is `approved` or `done` (`done` is
 * past approval: the gate exists so no DRAFT survives into implementation, not
 * to punish an already-implemented slice — this is the recorded clarification
 * of the plan's literal `status != approved`). Anything else (missing key,
 * `draft`, unknown) is a violation: listed with its path, exit 1.
 *
 * Not wired into `validate` — it is a deliberate checkpoint before mass
 * implementation, run on demand (or by the spec-planner agent).
 *
 * Usage: node scripts/check-spec.mjs [--root=<dir>]
 */
import { resolveRoot } from './createSlices/resolve-root.mjs';
import { scanSpecs } from './spec-tools.mjs';

/** Statuses that allow implementation (REQ-G17). */
const READY = new Set(['approved', 'done']);

async function main() {
  const root = resolveRoot();
  const specs = await scanSpecs(root);
  const violations = specs.filter((spec) => !READY.has(spec.status ?? ''));

  if (violations.length > 0) {
    for (const violation of violations) {
      console.log(`  ${violation.specPath}: status "${violation.status ?? 'missing'}"`);
    }
    console.log(
      `spec gate FAILED: ${violations.length} of ${specs.length} spec(s) not ready ` +
        '(need approved|done). Fill the spec, set status: approved, or run the scaffold first.'
    );
    return 1;
  }

  console.log(`spec gate OK: ${specs.length} spec(s) ready.`);
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
