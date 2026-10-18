// ============================================
// Bundle Size Check — reads performance-budget.json
// ============================================

import { readFileSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, process.argv[2] || 'public');
const BUDGET_FILE = join(ROOT, 'performance-budget.json');

if (!existsSync(BUDGET_FILE)) {
  console.error(`✗ Budget file not found: ${BUDGET_FILE}`);
  process.exit(1);
}

const budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
const budgets = budget.budgets;
const patterns = budget.patterns;

if (!existsSync(DIST)) {
  console.error(`✗ dist not found: ${DIST}. Run build first.`);
  process.exit(1);
}

function classify(name) {
  if (patterns.vendor.some((p) => name.includes(p))) return 'vendor';
  if (patterns.main.some((p) => name.includes(p))) return 'main';
  return 'chunk';
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (!entry.endsWith('.html')) {
      // Everything except HTML documents: index.html is the entry shell and
      // stats.html is the optional ANALYZE=1 report — neither is a runtime
      // asset. .js/.css keep their own checks below; every other file (webp,
      // svg, png, …) is counted as a binary asset against assets.maxSize
      // (issue #298: this category was never measured before).
      out.push(full);
    }
  }
  return out;
}

const files = walk(DIST);

const jsFiles = files.filter((f) => f.endsWith('.js'));
const binaryFiles = files.filter((f) => !f.endsWith('.js') && !f.endsWith('.css'));

if (jsFiles.length === 0) {
  console.error(`✗ No JS files found in ${DIST}. Run build first.`);
  process.exit(1);
}

const totalSize = jsFiles.reduce((sum, f) => sum + statSync(f).size, 0);
const binarySize = binaryFiles.reduce((sum, f) => sum + statSync(f).size, 0);
const limit = budgets.total.maxSize;
const assetLimit = budgets.assets.maxSize;
const failures = [];

console.log(`Bundle check — ${files.length} files, total ${(totalSize / 1024).toFixed(1)} KiB`);
console.log(`Budget total: ${(limit / 1024).toFixed(1)} KiB`);
console.log(
  `Binary assets — ${binaryFiles.length} files, ${(binarySize / 1024).toFixed(1)} KiB ` +
    `(cap ${(assetLimit / 1024).toFixed(1)} KiB)\n`
);

for (const file of files) {
  const size = statSync(file).size;
  const name = file.replace(DIST, 'dist').replace(/\\/g, '/');
  const isJs = file.endsWith('.js');
  const kind = classify(file);
  const kindBudget = budgets.chunks[kind] || budgets.chunks.default;
  const maxSize = kindBudget.maxSize;

  const maxAsset = budgets.assets.maxSize;
  const exceedsKind = isJs && size > maxSize;
  const exceedsAsset = !isJs && size > maxAsset;

  if (exceedsKind || exceedsAsset) {
    failures.push(
      `  ✗ ${name} (${kind}) = ${(size / 1024).toFixed(1)} KiB > ${(exceedsAsset ? maxAsset : maxSize) / 1024} KiB`
    );
  }
}

const exceedsTotal = totalSize > limit;
if (exceedsTotal) {
  failures.push(
    `  ✗ TOTAL = ${(totalSize / 1024).toFixed(1)} KiB > ${(limit / 1024).toFixed(1)} KiB`
  );
}

const exceedsAssets = binarySize > assetLimit;
if (exceedsAssets) {
  failures.push(
    `  ✗ ASSETS TOTAL = ${(binarySize / 1024).toFixed(1)} KiB > ${(assetLimit / 1024).toFixed(1)} KiB`
  );
}

if (failures.length > 0) {
  console.error('Budget violations:');
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log('✓ Bundle size within budget');
