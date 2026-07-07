/**
 * ESLint Rule: fsd-imports/no-circular
 * 
 * Detects circular dependencies between files
 * Uses dependency graph analysis
 */

const path = require('path');

const importMap = new Map(); // file -> [imports]
const circularCache = new Map(); // cache for circular detection

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect circular dependencies',
      category: 'Architecture',
      recommended: 'error',
    },
    fixable: null,
    schema: [],
    messages: {
      circular: 'Circular dependency detected: {{cycle}}',
    },
  },
  create(context) {
    const currentFilePath = context.getFilename();

    /**
     * Track import
     */
    function trackImport(node) {
      const importSource = node.source.value;

      // Only track local imports
      if (!importSource.startsWith('.') && !importSource.startsWith('@')) {
        return;
      }

      if (!importMap.has(currentFilePath)) {
        importMap.set(currentFilePath, []);
      }

      importMap.get(currentFilePath).push({
        source: importSource,
        node,
      });
    }

    /**
     * Detect circular dependency using DFS
     */
    function detectCircular(start, current, visited, path) {
      if (visited.has(current)) {
        if (current === start && path.length > 1) {
          return path;
        }
        return null;
      }

      visited.add(current);
      path.push(current);

      const imports = importMap.get(current) || [];
      
      for (const { source } of imports) {
        // Resolve import path
        let resolvedPath;
        if (source.startsWith('@/')) {
          resolvedPath = source.replace('@/', 'src/');
        } else if (source.startsWith('.')) {
          resolvedPath = path.resolve(path.dirname(current), source);
        } else {
          continue;
        }

        // Normalize path
        resolvedPath = resolvedPath.replace(/\\/g, '/');
        if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx')) {
          resolvedPath += '.ts';
        }

        const cycle = detectCircular(start, resolvedPath, new Set(visited), [...path]);
        if (cycle) {
          return cycle;
        }
      }

      return null;
    }

    /**
     * Check for circular dependencies after all imports are tracked
     */
    function checkCircular() {
      // Only check once per file
      if (circularCache.has(currentFilePath)) {
        return;
      }

      const cycle = detectCircular(
        currentFilePath,
        currentFilePath,
        new Set(),
        []
      );

      if (cycle && cycle.length > 1) {
        const cycleStr = cycle.map(c => path.basename(c)).join(' → ');
        
        context.report({
          loc: { line: 1, column: 0 },
          messageId: 'circular',
          data: {
            cycle: cycleStr,
          },
        });

        circularCache.set(currentFilePath, true);
      }
    }

    return {
      ImportDeclaration: trackImport,
      ExportAllDeclaration: trackImport,
      ExportNamedDeclaration: trackImport,
      'Program:exit': checkCircular,
    };
  },
};
