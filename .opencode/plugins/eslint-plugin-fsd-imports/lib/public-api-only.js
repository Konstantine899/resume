/**
 * ESLint Rule: fsd-imports/public-api-only
 * 
 * Enforces importing only through public API (index.ts files)
 * Prevents direct imports from internal files
 */

const path = require('path');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce importing through public API (index.ts)',
      category: 'Architecture',
      recommended: 'error',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowInternal: {
            type: 'array',
            items: { type: 'string' },
            description: 'Directories that can be imported directly (e.g., ["lib", "constants", "types"])',
          },
          disallowPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Patterns that are always disallowed (e.g., ["**/ui/**", "**/api/**"])',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      directImport:
        'Direct import from "{{importPath}}" is not allowed. Import through index.ts instead.',
      internalPath:
        'Import from internal path "{{importPath}}" is not allowed. Use public API.',
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const allowInternal = options.allowInternal || ['lib', 'constants', 'types', 'model'];
    const disallowPatterns = options.disallowPatterns || ['**/ui/**', '**/api/**'];

    /**
     * Check if path matches glob pattern (simplified)
     */
    function matchesPattern(filePath, pattern) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      
      if (pattern.startsWith('**/')) {
        return normalizedPath.includes(pattern.substring(3));
      }
      
      return normalizedPath.includes(pattern);
    }

    /**
     * Check if import is through internal path
     */
    function isInternalPath(importPath) {
      // Check if importing from allowed internal directories
      for (const allowed of allowInternal) {
        if (importPath.includes(`/${allowed}/`) || importPath.endsWith(`/${allowed}`)) {
          return false;
        }
      }

      // Check if importing from disallowed patterns
      for (const pattern of disallowPatterns) {
        if (matchesPattern(importPath, pattern)) {
          return true;
        }
      }

      // Check if importing specific file instead of index
      if (importPath.endsWith('.ts') || importPath.endsWith('.tsx')) {
        const fileName = path.basename(importPath);
        if (fileName !== 'index.ts' && fileName !== 'index.tsx') {
          return true;
        }
      }

      return false;
    }

    /**
     * Check import statement
     */
    function checkImport(node) {
      const importSource = node.source.value;

      // Skip external packages
      if (!importSource.startsWith('@') && !importSource.startsWith('.')) {
        return;
      }

      // Skip relative imports within same directory
      if (importSource.startsWith('.') && !importSource.includes('/')) {
        return;
      }

      // Check if it's a direct internal import
      if (isInternalPath(importSource)) {
        context.report({
          node,
          messageId: 'internalPath',
          data: {
            importPath: importSource,
          },
        });
      }
    }

    return {
      ImportDeclaration: checkImport,
      ExportAllDeclaration: checkImport,
      ExportNamedDeclaration: checkImport,
    };
  },
};
