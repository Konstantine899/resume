// src/shared/lib/versionedStorage barrel — shared `{ v: 1 }` envelope
// persistence mechanics for the admin CRUD services (issue #302).
// See versionedStorage.ts.
export { createVersionedStorage, dedupeById } from './versionedStorage';
export type { VersionedStorage, VersionedStorageConfig } from './versionedStorage';
