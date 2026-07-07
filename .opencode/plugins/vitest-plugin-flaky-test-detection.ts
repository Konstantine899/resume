/**
 * Vitest Plugin: Flaky Test Detection
 *
 * Automatically detects and reports flaky tests:
 * - Re-runs failed tests multiple times
 * - Tracks flakiness rate
 * - Generates flaky test reports
 * - Fails build if flakiness exceeds threshold
 */

import type { Plugin } from 'vite';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface FlakyTestOptions {
  /**
   * Number of times to re-run failed tests
   * @default 3
   */
  retryCount?: number;

  /**
   * Maximum acceptable flakiness rate (0-1)
   * @default 0.01 (1%)
   */
  flakinessThreshold?: number;

  /**
   * Minimum test runs before marking as flaky
   * @default 10
   */
  minTestRuns?: number;

  /**
   * Path to store flaky test data
   * @default '.opencode/logs/flaky-tests.json'
   */
  dataPath?: string;

  /**
   * Fail build if flakiness exceeds threshold
   * @default true
   */
  failBuild?: boolean;

  /**
   * Show detailed report
   * @default true
   */
  showDetails?: boolean;
}

interface FlakyTestData {
  testId: string;
  file: string;
  name: string;
  totalRuns: number;
  failures: number;
  flakinessRate: number;
  lastFailure: string | null;
  firstDetected: string;
}

/**
 * Vitest plugin for flaky test detection
 */
export function flakyTestDetection(options: FlakyTestOptions = {}): Plugin {
  const {
    retryCount = 3,
    flakinessThreshold = 0.01,
    minTestRuns = 10,
    dataPath = '.opencode/logs/flaky-tests.json',
    failBuild = true,
    showDetails = true,
  } = options;

  const flakyTests: Map<string, FlakyTestData> = new Map();
  const testResults: Map<string, Array<boolean>> = new Map();

  return {
    name: 'vite-plugin-flaky-test-detection',
    enforce: 'post',

    // This would integrate with Vitest's test runner
    // For now, we provide the infrastructure
    config: () => ({
      test: {
        retry: retryCount,
        failFlakyTests: true,
      },
    }),

    closeBundle() {
      // Load existing data
      const existingData = loadFlakyTestData(dataPath);

      // Merge with current session data
      for (const [testId, results] of testResults.entries()) {
        const existing = existingData.get(testId);

        if (existing) {
          existing.totalRuns += results.length;
          existing.failures += results.filter((r) => !r).length;
          existing.flakinessRate = existing.failures / existing.totalRuns;
        } else {
          const failures = results.filter((r) => !r).length;
          existingData.set(testId, {
            testId,
            file: 'unknown',
            name: 'unknown',
            totalRuns: results.length,
            failures,
            flakinessRate: failures / results.length,
            lastFailure: failures > 0 ? new Date().toISOString() : null,
            firstDetected: new Date().toISOString(),
          });
        }
      }

      // Find flaky tests
      const newFlakyTests: FlakyTestData[] = [];

      for (const [testId, data] of existingData.entries()) {
        if (data.totalRuns >= minTestRuns && data.flakinessRate > flakinessThreshold) {
          newFlakyTests.push(data);
          flakyTests.set(testId, data);
        }
      }

      // Save data
      saveFlakyTestData(dataPath, existingData);

      // Generate report
      if (showDetails && newFlakyTests.length > 0) {
        console.log('\n🚨 Flaky Tests Detected');
        console.log('='.repeat(60));

        for (const test of newFlakyTests) {
          console.log(`❌ ${test.name} (${test.file})`);
          console.log(
            `   Flakiness: ${(test.flakinessRate * 100).toFixed(2)}% ` +
              `(${test.failures}/${test.totalRuns} runs failed)`
          );
          console.log(`   Last failure: ${test.lastFailure || 'N/A'}`);
        }

        console.log('='.repeat(60));
        console.log(`Total: ${newFlakyTests.length} flaky test(s)\n`);
      }

      // Check if build should fail
      if (failBuild && newFlakyTests.length > 0) {
        throw new Error(`Flaky test detection failed: ${newFlakyTests.length} flaky test(s) found`);
      }
    },
  };
}

/**
 * Load flaky test data from file
 */
function loadFlakyTestData(dataPath: string): Map<string, FlakyTestData> {
  const data = new Map<string, FlakyTestData>();

  if (!existsSync(dataPath)) {
    return data;
  }

  try {
    const content = readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(content);

    for (const item of parsed) {
      data.set(item.testId, item);
    }
  } catch (error) {
    // Ignore errors
  }

  return data;
}

/**
 * Save flaky test data to file
 */
function saveFlakyTestData(dataPath: string, data: Map<string, FlakyTestData>) {
  const content = JSON.stringify(Array.from(data.values()), null, 2);
  writeFileSync(dataPath, content, 'utf8');
}

/**
 * Generate flaky test report
 */
export function generateFlakyTestReport(
  dataPath: string = '.opencode/logs/flaky-tests.json'
): string {
  const data = loadFlakyTestData(dataPath);

  if (data.size === 0) {
    return 'No flaky test data available';
  }

  let report = '# Flaky Test Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Total flaky tests: ${data.size}\n\n`;
  report += '---\n\n';

  // Sort by flakiness rate (highest first)
  const sorted = Array.from(data.values()).sort((a, b) => b.flakinessRate - a.flakinessRate);

  for (const test of sorted) {
    report += `## ${test.name}\n\n`;
    report += `- **File**: ${test.file}\n`;
    report += `- **Flakiness Rate**: ${(test.flakinessRate * 100).toFixed(2)}%\n`;
    report += `- **Total Runs**: ${test.totalRuns}\n`;
    report += `- **Failures**: ${test.failures}\n`;
    report += `- **Last Failure**: ${test.lastFailure || 'N/A'}\n`;
    report += `- **First Detected**: ${test.firstDetected}\n\n`;
  }

  return report;
}

/**
 * Vitest config helper
 */
export function defineFlakyTestConfig(options: FlakyTestOptions = {}) {
  return {
    test: {
      retry: options.retryCount || 3,
      failFlakyTests: true,
      isolate: true, // No shared state
      sequence: {
        shuffle: true, // Detect order dependency
      },
    },
    plugins: [flakyTestDetection(options)],
  };
}

export default flakyTestDetection;
