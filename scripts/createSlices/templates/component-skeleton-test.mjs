/**
 * Skeleton component test template — REQ-G16 (Plan-files extras).
 *
 * Three `it.todo(...)` placeholders mirroring the real component-test cases:
 * they compile, count as tests (so the suite is never empty) and execute
 * nothing — burned together with the TODO Work unit when the component is
 * implemented. Deliberately NO component import: an import nothing uses would
 * fail `tsc` (TS6133) and ESLint before anyone writes a single assertion.
 *
 * @param {{ name: string }} names
 * @returns {string}
 */
export function componentSkeletonTestTemplate({ name }) {
  return `import { describe, it } from 'vitest';

describe('${name}', () => {
  // TODO(spec): replace it.todo with real cases from ../../spec/SPEC.md (burn with the TODO WU)
  it.todo('renders with default testid');
  it.todo('merges custom className');
  it.todo('renders children');
});
`;
}
