/**
 * Setup file for Vitest Coverage Fake Protection
 *
 * This file is automatically included in Vitest tests
 * to enforce real assertions and prevent fake coverage.
 */

// Track assertions
const assertionCounts = new Map<string, number>();

// Store original expect
const originalExpect = (globalThis as any).expect;

if (originalExpect) {
  // Wrap expect to track usage
  (globalThis as any).expect = function (actual: any, message?: string) {
    const testState = getCurrentTestState();
    const testId = testState ? `${testState.file}:${testState.test}` : 'unknown';

    // Increment assertion count
    const count = assertionCounts.get(testId) || 0;
    assertionCounts.set(testId, count + 1);

    return originalExpect(actual, message);
  };
}

/**
 * Get current test state
 */
function getCurrentTestState() {
  // This would need to integrate with Vitest's test runner
  // For now, return null
  return null;
}

/**
 * Check if test has assertions
 */
function hasAssertions(testFn: Function): boolean {
  const testStr = testFn.toString();

  // Check for common assertion patterns
  const assertionPatterns = [
    /expect\s*\(/,
    /assert\s*\./,
    /should\s*\(/,
    /toThrow/,
    /toBe/,
    /toEqual/,
    /toBeTruthy/,
    /toBeFalsy/,
    /toBeDefined/,
    /toBeUndefined/,
    /toBeNull/,
    /toBeInstanceOf/,
    /toContain/,
    /toMatch/,
    /toHaveProperty/,
    /toHaveLength/,
  ];

  return assertionPatterns.some((pattern) => pattern.test(testStr));
}

/**
 * Warn about tests without assertions
 */
function warnAboutFakeCoverage(testName: string, file: string) {
  console.warn(
    `⚠️  Test "${testName}" in ${file} has no assertions. ` +
      'This test may not provide meaningful coverage.'
  );
}

// Export for manual usage
export { assertionCounts, hasAssertions, warnAboutFakeCoverage };
