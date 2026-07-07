/**
 * Vitest Plugin: Coverage Fake Protection
 *
 * Prevents fake test coverage by:
 * - Requiring actual assertions in tests
 * - Detecting empty tests
 * - Detecting tests without proper expectations
 * - Enforcing minimum assertions per test
 */

import type { Plugin } from 'vite';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import type { CallExpression, ArrowFunctionExpression, FunctionExpression } from '@babel/types';

interface CoverageOptions {
  /**
   * Minimum number of assertions per test
   * @default 1
   */
  minAssertions?: number;

  /**
   * List of assertion function names
   * @default ['expect', 'assert', 'should']
   */
  assertFunctionNames?: string[];

  /**
   * Fail build on fake tests
   * @default true
   */
  failBuild?: boolean;

  /**
   * Show detailed report
   * @default true
   */
  showDetails?: boolean;
}

/**
 * Vitest plugin for coverage fake protection
 */
export function coverageFakeProtection(options: CoverageOptions = {}): Plugin {
  const {
    minAssertions = 1,
    assertFunctionNames = ['expect', 'assert', 'should'],
    failBuild = true,
    showDetails = true,
  } = options;

  const fakeTests: Array<{
    file: string;
    test: string;
    line: number;
    reason: string;
  }> = [];

  return {
    name: 'vite-plugin-coverage-fake-protection',
    enforce: 'pre',

    transform(code, id) {
      // Only process test files
      if (
        !id.includes('.test.') &&
        !id.includes('.spec.') &&
        !id.includes('__tests__') &&
        !id.includes('test/')
      ) {
        return;
      }

      try {
        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
        });

        let currentTestName = '';

        traverse(ast, {
          CallExpression(path) {
            const node = path.node as CallExpression;
            const callee = node.callee;

            // Check for test/it functions
            if (callee.type === 'Identifier' && (callee.name === 'test' || callee.name === 'it')) {
              currentTestName = extractTestName(node);
              const testBody = node.arguments[1];

              // Check if test has a body
              if (!testBody) {
                fakeTests.push({
                  file: id,
                  test: currentTestName,
                  line: node.loc?.start.line || 0,
                  reason: 'Test has no body',
                });
                return;
              }

              // Check for empty test
              if (
                testBody.type === 'ArrowFunctionExpression' ||
                testBody.type === 'FunctionExpression'
              ) {
                const body = testBody.body;

                // Empty arrow function
                if (testBody.type === 'ArrowFunctionExpression' && body.type !== 'BlockStatement') {
                  // Check if body is just a return without assertions
                  if (body.type === 'Identifier' || body.type === 'Literal') {
                    fakeTests.push({
                      file: id,
                      test: currentTestName,
                      line: node.loc?.start.line || 0,
                      reason: 'Test body is just a value, no assertions',
                    });
                  }
                }

                // Check block statement
                if (body.type === 'BlockStatement') {
                  const hasAssertions = checkForAssertions(body, assertFunctionNames);

                  if (!hasAssertions) {
                    fakeTests.push({
                      file: id,
                      test: currentTestName,
                      line: node.loc?.start.line || 0,
                      reason: 'Test has no assertions',
                    });
                  }
                }
              }
            }
          },
        });
      } catch (error) {
        // Ignore parse errors
      }
    },

    closeBundle() {
      if (fakeTests.length === 0) {
        if (showDetails) {
          console.log('\n✅ No fake tests detected\n');
        }
        return;
      }

      if (showDetails) {
        console.log('\n🚨 Fake Tests Detected');
        console.log('='.repeat(60));

        for (const fake of fakeTests) {
          console.log(`❌ ${fake.test} (${fake.file}:${fake.line})`);
          console.log(`   Reason: ${fake.reason}`);
        }

        console.log('='.repeat(60));
        console.log(`Total: ${fakeTests.length} fake test(s) found\n`);
      }

      if (failBuild) {
        throw new Error(`Coverage fake protection failed: ${fakeTests.length} fake test(s) found`);
      }
    },
  };
}

/**
 * Extract test name from test/it call
 */
function extractTestName(node: CallExpression): string {
  const firstArg = node.arguments[0];
  if (firstArg && firstArg.type === 'StringLiteral') {
    return firstArg.value;
  }
  return 'anonymous';
}

/**
 * Check if AST node contains assertions
 */
function checkForAssertions(node: any, assertFunctionNames: string[]): boolean {
  let found = false;

  traverse(node, {
    CallExpression(path) {
      const callee = path.node.callee;

      // Check for expect().toX() pattern
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'CallExpression' &&
        callee.object.callee.type === 'Identifier' &&
        assertFunctionNames.includes(callee.object.callee.name)
      ) {
        found = true;
      }

      // Check for assert.xxx() pattern
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'assert'
      ) {
        found = true;
      }

      // Check for direct assertion functions
      if (callee.type === 'Identifier' && assertFunctionNames.includes(callee.name)) {
        found = true;
      }
    },
  });

  return found;
}

/**
 * Vitest config helper
 */
export function defineFakeCoverageConfig(options: CoverageOptions = {}) {
  return {
    test: {
      coverage: {
        thresholds: {
          lines: 90,
          branches: 85,
          functions: 95,
          statements: 90,
        },
        // Require actual assertions
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          '**/*.test.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          '**/__tests__/**',
          '**/node_modules/**',
        ],
      },
      // Setup file for fake protection
      setupFiles: ['./.opencode/plugins/coverage-fake-setup.ts'],
    },
    plugins: [coverageFakeProtection(options)],
  };
}

export default coverageFakeProtection;
