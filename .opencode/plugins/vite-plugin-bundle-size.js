/**
 * Vite Plugin: Bundle Size Limit
 * 
 * Enforces performance budgets for bundle sizes:
 * - Per-chunk size limits
 * - Total bundle size limits
 * - Pattern-based limits (vendor, main, etc.)
 * 
 * Fails build if budgets exceeded
 */

import { readFile } from 'fs/promises';
import { gzipSize } from 'gzip-size';
import prettyBytes from 'pretty-bytes';

export function bundleSizeLimit(options = {}) {
  const {
    maxSize = 100 * 1024, // 100kb per chunk
    totalSize = 500 * 1024, // 500kb total
    failBuild = true,
    patterns = {},
    showDetails = true,
  } = options;

  const budgets = {
    default: { max: maxSize },
    total: { max: totalSize },
    ...Object.entries(patterns).reduce((acc, [pattern, limit]) => ({
      ...acc,
      [pattern]: { max: typeof limit === 'number' ? limit : limit.max },
    }), {}),
  };

  return {
    name: 'vite-plugin-bundle-size',
    enforce: 'post',
    async writeBundle(outputOptions, bundle) {
      const outputDir = outputOptions.dir || outputOptions.file;
      const chunks = [];
      const violations = [];
      let totalBundleSize = 0;

      // Analyze each chunk
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue;

        const filePath = `${outputDir}/${fileName}`;
        const code = await readFile(filePath, 'utf8');
        const rawSize = Buffer.byteLength(code, 'utf8');
        const gzippedSize = await gzipSize(code);

        chunks.push({
          fileName,
          rawSize,
          gzippedSize,
          modules: Object.keys(chunk.modules),
        });

        totalBundleSize += rawSize;

        // Check pattern-based budgets
        for (const [pattern, budget] of Object.entries(budgets)) {
          if (pattern === 'total') continue;

          const matches =
            pattern === 'default' ||
            fileName.includes(pattern) ||
            new RegExp(pattern).test(fileName);

          if (matches && rawSize > budget.max) {
            violations.push({
              fileName,
              type: 'chunk',
              pattern,
              actual: rawSize,
              limit: budget.max,
              overhead: rawSize - budget.max,
            });
          }
        }
      }

      // Check total bundle size
      if (totalBundleSize > budgets.total.max) {
        violations.push({
          fileName: 'TOTAL',
          type: 'total',
          pattern: 'total',
          actual: totalBundleSize,
          limit: budgets.total.max,
          overhead: totalBundleSize - budgets.total.max,
        });
      }

      // Show details
      if (showDetails) {
        console.log('\n📦 Bundle Size Analysis');
        console.log('='.repeat(60));

        for (const chunk of chunks) {
          const status =
            chunk.rawSize > maxSize
              ? '❌'
              : chunk.rawSize > maxSize * 0.8
              ? '⚠️'
              : '✅';

          console.log(
            `${status} ${chunk.fileName.padEnd(40)} ${prettyBytes(chunk.rawSize).padStart(10)} (gzip: ${prettyBytes(chunk.gzippedSize)})`
          );
        }

        console.log('-'.repeat(60));
        const totalStatus =
          totalBundleSize > totalSize
            ? '❌'
            : totalBundleSize > totalSize * 0.8
            ? '⚠️'
            : '✅';
        console.log(
          `${totalStatus} ${'TOTAL'.padEnd(40)} ${prettyBytes(totalBundleSize).padStart(10)} (limit: ${prettyBytes(totalSize)})`
        );
        console.log('='.repeat(60));
      }

      // Report violations
      if (violations.length > 0) {
        console.error('\n🚨 Bundle Size Budget Violations');
        console.error('='.repeat(60));

        for (const violation of violations) {
          console.error(
            `❌ ${violation.fileName} (${violation.pattern}): ${prettyBytes(violation.actual)} > ${prettyBytes(violation.limit)} (+${prettyBytes(violation.overhead)})`
          );
        }

        console.error('='.repeat(60));

        if (failBuild) {
          throw new Error(
            `Bundle size budget exceeded: ${violations.length} violation(s) found`
          );
        }
      }
    },
  };
}

export default bundleSizeLimit;
