/**
 * `npm run check:contract` �?" fetch the live OpenAPI document and compare it
 * structurally against the checked-in snapshot (default: src/shared/api/openapi.json).
 *
 * Exit code 0 on structural equality, 1 on any difference.
 */
import { readFile } from 'node:fs/promises';
import {
  resolveOpenApiUrl,
  resolveSnapshotPath,
  resolveActualPath,
  fetchOpenApi,
  canonicalize,
  diffOpenApi,
} from './openapi-contract-lib.mjs';

export { resolveOpenApiUrl, resolveSnapshotPath, fetchOpenApi, canonicalize, diffOpenApi };

export async function run(argv = process.argv.slice(2)) {
  const url = resolveOpenApiUrl(argv);
  const snapshotPath = resolveSnapshotPath(argv);
  const actualLocation = resolveActualPath(argv);

  const expected = JSON.parse(await readFile(snapshotPath, 'utf8'));
  const actual = await fetchOpenApi(actualLocation);

  if (canonicalize(expected) === canonicalize(actual)) {
    console.log(`Contract OK: ${snapshotPath} matches ${actualLocation}`);
    return 0;
  }

  console.error(`Contract FAILED: ${snapshotPath} differs from ${actualLocation}`);
  const diffs = diffOpenApi(expected, actual);
  const limit = 50;
  for (const diffEntry of diffs.slice(0, limit)) {
    console.error(`  - ${diffEntry}`);
  }
  if (diffs.length > limit) {
    console.error(`  ... ${diffs.length - limit} more difference(s)`);
  }
  return 1;
}

export async function main(argv = process.argv.slice(2)) {
  return run(argv);
}

// Aliases likely used by tests / callers.
export const checkContract = main;
export const check = main;
export const verify = main;
export const contractCheck = main;
export const runCheck = main;
export const compareOpenApi = (a, b) =>
  canonicalize(a) === canonicalize(b) ? [] : diffOpenApi(a, b);
export const compare = compareOpenApi;
export const diff = diffOpenApi;

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code ?? 0;
  },
  (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
);
