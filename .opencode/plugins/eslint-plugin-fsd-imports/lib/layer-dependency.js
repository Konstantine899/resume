/**
 * ESLint Rule: fsd-imports/layer-dependency
 * 
 * Validates FSD layer dependency rules:
 * - app → shared
 * - pages → app, shared
 * - widgets → app, pages, shared
 * - features → entities, shared
 * - entities → shared
 * - shared → (nothing)
 */

const path = require('path');

// FSD Layer hierarchy (lower index = lower layer)
const LAYER_ORDER = [
  'shared',
  'entities',
  'features',
  'widgets',
  'pages',
  'app',
];

// Allowed imports for each layer (can import from these layers)
const ALLOWED_IMPORTS = {
  shared: [],
  entities: ['shared'],
  features: ['entities', 'shared'],
  widgets: ['app', 'pages', 'features', 'entities', 'shared'],
  pages: ['app', 'widgets', 'features', 'entities', 'shared'],
  app: ['shared'],
};

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce FSD layer dependency rules',
      category: 'Architecture',
      recommended: 'error',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          allowed: {
            type: 'object',
            description: 'Custom allowed imports per layer',
          },
          srcDir: {
            type: 'string',
            description: 'Source directory (default: "src")',
            default: 'src',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      invalidImport:
        'Import from "{{importLayer}}" layer is not allowed in "{{currentLayer}}" layer. Allowed layers: {{allowedLayers}}',
      cannotDetermineLayer:
        'Cannot determine layer for file: "{{filePath}}"',
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const srcDir = options.srcDir || 'src';
    const customAllowed = options.allowed || {};

    /**
     * Determine FSD layer from file path
     */
    function getLayerFromPath(filePath) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const srcIndex = normalizedPath.indexOf(srcDir);
      
      if (srcIndex === -1) {
        return null;
      }

      const pathAfterSrc = normalizedPath.substring(srcIndex + srcDir.length + 1);
      const pathSegments = pathAfterSrc.split('/');

      if (pathSegments.length === 0) {
        return null;
      }

      const potentialLayer = pathSegments[0].toLowerCase();

      // Check if first segment is a valid layer
      if (LAYER_ORDER.includes(potentialLayer)) {
        return potentialLayer;
      }

      // Check for slice-based layers (e.g., src/features/auth/...)
      // In this case, we need to check if the path contains a layer name
      for (const layer of LAYER_ORDER) {
        if (normalizedPath.includes(`/${layer}/`)) {
          return layer;
        }
      }

      return null;
    }

    /**
     * Get allowed layers for current layer
     */
    function getAllowedLayers(currentLayer) {
      if (customAllowed[currentLayer]) {
        return customAllowed[currentLayer];
      }
      return ALLOWED_IMPORTS[currentLayer] || [];
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

      const currentFilePath = context.getFilename();
      const currentLayer = getLayerFromPath(currentFilePath);

      if (!currentLayer) {
        return; // Cannot determine layer, skip validation
      }

      // Resolve import path
      let importLayer;
      
      if (importSource.startsWith('@/')) {
        // Alias import (e.g., @/entities/user/...)
        const importPath = importSource.substring(2); // Remove @/
        importLayer = getLayerFromPath(importPath);
      } else if (importSource.startsWith('.')) {
        // Relative import - resolve to absolute
        const currentDir = path.dirname(currentFilePath);
        const resolvedPath = path.resolve(currentDir, importSource);
        importLayer = getLayerFromPath(resolvedPath);
      } else {
        return; // Unknown import type
      }

      if (!importLayer) {
        return; // Cannot determine import layer, skip
      }

      // Check if import is allowed
      const allowedLayers = getAllowedLayers(currentLayer);
      
      if (!allowedLayers.includes(importLayer)) {
        const currentLayerIndex = LAYER_ORDER.indexOf(currentLayer);
        const importLayerIndex = LAYER_ORDER.indexOf(importLayer);

        // Allow same-layer imports (e.g., features → features)
        if (currentLayer === importLayer) {
          return;
        }

        // Check if importing from higher layer (violation)
        if (importLayerIndex > currentLayerIndex) {
          context.report({
            node,
            messageId: 'invalidImport',
            data: {
              importLayer,
              currentLayer,
              allowedLayers: allowedLayers.length > 0 
                ? allowedLayers.join(', ') 
                : 'none',
            },
          });
        }
      }
    }

    return {
      ImportDeclaration: checkImport,
      ExportAllDeclaration: checkImport,
      ExportNamedDeclaration: checkImport,
    };
  },
};
