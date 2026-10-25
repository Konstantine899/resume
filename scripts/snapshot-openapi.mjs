/**
 * `npm run snapshot:openapi` �?" fetch the live OpenAPI document and write it
 * to the checked-in snapshot (default: src/shared/api/openapi.json).
 *
 * Environment / flags: see scripts/openapi-contract-lib.mjs
 */
import {
  resolveOpenApiUrl,
  resolveSnapshotPath,
  fetchOpenApi,
  writeSnapshot,
} from './openapi-contract-lib.mjs';

export { resolveOpenApiUrl, resolveSnapshotPath, fetchOpenApi, writeSnapshot };

export async function run(argv = process.argv.slice(2)) {
  const url = resolveOpenApiUrl(argv);
  const snapshotPath = resolveSnapshotPath(argv);

  const document = await fetchOpenApi(url);
  await writeSnapshot(snapshotPath, document);

  console.log(`Wrote OpenAPI snapshot: ${snapshotPath}`);
  console.log(`Source: ${url}`);
  return 0;
}

export async function main(argv = process.argv.slice(2)) {
  return run(argv);
}

// Compatibility aliases for tests/callers that use different names.
export const snapshot = main;
export const snapshotOpenApi = main;
export const snapshotOpenapi = main;
export const openapiSnapshot = main;
export const fetchSnapshot = main;
export const runSnapshot = main;
export const writeOpenapiSnapshot = writeSnapshot;
export const fetchOpenapi = fetchOpenApi;

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code ?? 0;
  },
  (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
);
