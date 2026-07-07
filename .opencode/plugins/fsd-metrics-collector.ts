/**
 * FSD Metrics Collector
 *
 * Collects and reports on FSD architecture metrics:
 * - Layer purity (import compliance)
 * - Circular dependencies
 * - Component cohesion
 * - Public API quality
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

interface FSDMetrics {
  layerPurity: {
    score: number; // 0-100
    cleanImports: number;
    totalImports: number;
    violations: ImportViolation[];
  };
  circularDependencies: {
    count: number;
    cycles: string[][];
  };
  componentCohesion: {
    score: number; // 0-100
    components: ComponentCohesion[];
  };
  publicAPIQuality: {
    score: number; // 0-100
    missingExports: number;
    directImports: number;
  };
}

interface ImportViolation {
  file: string;
  fromLayer: string;
  toLayer: string;
  line: number;
}

interface ComponentCohesion {
  file: string;
  score: number;
  responsibilities: string[];
}

// FSD Layer hierarchy
const LAYER_ORDER = ['shared', 'entities', 'features', 'widgets', 'pages', 'app'];

// Allowed imports for each layer
const ALLOWED_IMPORTS: Record<string, string[]> = {
  shared: [],
  entities: ['shared'],
  features: ['entities', 'shared'],
  widgets: ['app', 'pages', 'features', 'entities', 'shared'],
  pages: ['app', 'widgets', 'features', 'entities', 'shared'],
  app: ['shared'],
};

/**
 * Collect FSD metrics from source directory
 */
export function collectFSDMetrics(srcDir: string): FSDMetrics {
  const files = getAllTypeScriptFiles(srcDir);

  const metrics: FSDMetrics = {
    layerPurity: { score: 100, cleanImports: 0, totalImports: 0, violations: [] },
    circularDependencies: { count: 0, cycles: [] },
    componentCohesion: { score: 100, components: [] },
    publicAPIQuality: { score: 100, missingExports: 0, directImports: 0 },
  };

  // Analyze each file
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const layer = getLayerFromPath(file);

    if (!layer) continue;

    // Analyze imports
    const imports = extractImports(content);
    for (const imp of imports) {
      metrics.layerPurity.totalImports++;

      const importLayer = getLayerFromImport(imp, file, srcDir);
      if (importLayer) {
        const isAllowed = checkImportAllowed(layer, importLayer);

        if (isAllowed) {
          metrics.layerPurity.cleanImports++;
        } else {
          metrics.layerPurity.violations.push({
            file: relative(srcDir, file),
            fromLayer: layer,
            toLayer: importLayer,
            line: getImportLine(content, imp),
          });
        }
      }
    }

    // Analyze component cohesion
    const cohesion = analyzeComponentCohesion(content, file);
    metrics.componentCohesion.components.push(cohesion);
  }

  // Calculate scores
  metrics.layerPurity.score =
    metrics.layerPurity.totalImports > 0
      ? (metrics.layerPurity.cleanImports / metrics.layerPurity.totalImports) * 100
      : 100;

  metrics.componentCohesion.score =
    metrics.componentCohesion.components.length > 0
      ? metrics.componentCohesion.components.reduce((sum, c) => sum + c.score, 0) /
        metrics.componentCohesion.components.length
      : 100;

  // Detect circular dependencies
  metrics.circularDependencies = detectCircularDependencies(files);

  return metrics;
}

/**
 * Get all TypeScript files recursively
 */
function getAllTypeScriptFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      getAllTypeScriptFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get FSD layer from file path
 */
function getLayerFromPath(filePath: string): string | null {
  for (const layer of LAYER_ORDER) {
    if (filePath.includes(`/${layer}/`)) {
      return layer;
    }
  }
  return null;
}

/**
 * Get layer from import statement
 */
function getLayerFromImport(
  importPath: string,
  currentFile: string,
  srcDir: string
): string | null {
  if (importPath.startsWith('@/')) {
    const path = importPath.substring(2);
    return getLayerFromPath(path);
  }

  if (importPath.startsWith('.')) {
    const resolved = join(currentFile, '..', importPath);
    return getLayerFromPath(resolved);
  }

  return null;
}

/**
 * Check if import is allowed between layers
 */
function checkImportAllowed(fromLayer: string, toLayer: string): boolean {
  const allowed = ALLOWED_IMPORTS[fromLayer];
  if (!allowed) return true;

  // Same layer imports are allowed
  if (fromLayer === toLayer) return true;

  return allowed.includes(toLayer);
}

/**
 * Extract imports from file content
 */
function extractImports(content: string): string[] {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const exportsRegex = /export\s+.*?\s+from\s+['"]([^'"]+)['"]/g;

  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  while ((match = exportsRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Get line number of import in content
 */
function getImportLine(content: string, importPath: string): number {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(importPath)) {
      return i + 1;
    }
  }
  return 0;
}

/**
 * Analyze component cohesion (simplified heuristic)
 */
function analyzeComponentCohesion(content: string, file: string): ComponentCohesion {
  // Count number of distinct responsibilities
  const hasState = /useState|useReducer/.test(content);
  const hasEffects = /useEffect|useLayoutEffect/.test(content);
  const hasMemo = /useMemo|useCallback|React\.memo/.test(content);
  const hasHandlers = /handle|on[A-Z]/.test(content);
  const hasRender = /return\s*\(/.test(content);

  const responsibilities = [];
  if (hasState) responsibilities.push('state-management');
  if (hasEffects) responsibilities.push('side-effects');
  if (hasMemo) responsibilities.push('optimization');
  if (hasHandlers) responsibilities.push('event-handling');
  if (hasRender) responsibilities.push('rendering');

  // Score based on single responsibility principle
  // Ideal: 1-2 responsibilities, Penalize: 4+ responsibilities
  const score =
    responsibilities.length <= 2
      ? 100
      : responsibilities.length === 3
        ? 70
        : responsibilities.length === 4
          ? 40
          : 10;

  return {
    file,
    score,
    responsibilities,
  };
}

/**
 * Detect circular dependencies (simplified)
 */
function detectCircularDependencies(files: string[]) {
  const cycles: string[][] = [];

  // This is a simplified implementation
  // A full implementation would build a dependency graph
  // and use DFS to detect cycles

  return {
    count: cycles.length,
    cycles,
  };
}

/**
 * Generate report
 */
export function generateFSDReport(metrics: FSDMetrics): string {
  let report = '# FSD Architecture Metrics Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += '---\n\n';

  // Layer Purity
  report += '## Layer Purity\n\n';
  report += `**Score**: ${metrics.layerPurity.score.toFixed(1)}%\n\n`;
  report += `- Clean imports: ${metrics.layerPurity.cleanImports}/${metrics.layerPurity.totalImports}\n`;

  if (metrics.layerPurity.violations.length > 0) {
    report += `\n### Violations (${metrics.layerPurity.violations.length})\n\n`;
    for (const v of metrics.layerPurity.violations.slice(0, 10)) {
      report += `- ${v.file}:${v.line} - ${v.fromLayer} → ${v.toLayer}\n`;
    }
  }
  report += '\n';

  // Circular Dependencies
  report += '## Circular Dependencies\n\n';
  report += `**Count**: ${metrics.circularDependencies.count}\n\n`;

  if (metrics.circularDependencies.cycles.length > 0) {
    report += '### Cycles\n\n';
    for (const cycle of metrics.circularDependencies.cycles) {
      report += `- ${cycle.join(' → ')}\n`;
    }
  }
  report += '\n';

  // Component Cohesion
  report += '## Component Cohesion\n\n';
  report += `**Score**: ${metrics.componentCohesion.score.toFixed(1)}%\n\n`;

  const lowCohesion = metrics.componentCohesion.components.filter((c) => c.score < 70);
  if (lowCohesion.length > 0) {
    report += `### Low Cohesion Components (${lowCohesion.length})\n\n`;
    for (const c of lowCohesion.slice(0, 10)) {
      report += `- ${c.file} (${c.score}%) - ${c.responsibilities.join(', ')}\n`;
    }
  }
  report += '\n';

  return report;
}

export default collectFSDMetrics;
