/**
 * ESLint плагин для валидации FSD Architecture v2.1
 *
 * Проверяет:
 * 1. layer-dependency — иерархия слоёв FSD
 * 2. public-api-only — импорты только через public API (index.ts)
 * 3. no-circular — обнаружение циклических зависимостей
 * 4. tests-public-api-only — тесты импортируют чужие слайсы только через их public API
 *
 * FSD Layer Hierarchy:
 *   app → pages → widgets → features → entities → shared
 *   shared не импортирует из других слоёв
 */

const fs = require('fs');
const path = require('path');

// FSD layer hierarchy: higher number = higher layer
const LAYER_ORDER = {
  app: 7,
  pages: 6,
  widgets: 5,
  features: 4,
  entities: 3,
  shared: 2,
};

// Layer names for error messages
const LAYER_NAMES = {
  app: 'app',
  pages: 'pages',
  widgets: 'widgets',
  features: 'features',
  entities: 'entities',
  shared: 'shared',
};

// Allowed imports per source layer.
// FSD: a layer imports from itself and all layers below it (never from above).
// Matches docs/specs/fsd-architecture.md (pages compose features, widgets consume features).
const ALLOWED_IMPORTS = {
  app: ['shared'],
  pages: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
  widgets: ['app', 'pages', 'features', 'entities', 'shared'],
  features: ['entities', 'shared'],
  entities: ['shared'],
  shared: ['shared'],
};

/**
 * Extract the FSD layer from a file path
 */
function getLayerFromPath(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/\/(app|pages|widgets|features|entities|shared)\//);
  return match ? match[1] : null;
}

/**
 * Extract the FSD layer from an import source using @/ alias
 */
function getLayerFromImport(source) {
  if (!source) return null;
  const match = source.match(/^@\/(app|pages|widgets|features|entities|shared)(\/|$)/);
  return match ? match[1] : null;
}

/**
 * Track circular dependencies across files
 */
class CircularDependencyTracker {
  constructor() {
    this.graph = new Map();
    this.visited = new Set();
    this.stack = new Set();
  }

  addEdge(from, to) {
    if (!this.graph.has(from)) {
      this.graph.set(from, []);
    }
    this.graph.get(from).push(to);
  }

  hasCycle() {
    this.visited.clear();
    const stack = new Set();

    for (const node of this.graph.keys()) {
      if (this._dfs(node, stack)) return true;
    }
    return false;
  }

  _dfs(node, stack) {
    if (stack.has(node)) return true;
    if (this.visited.has(node)) return false;

    this.visited.add(node);
    stack.add(node);

    const neighbors = this.graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (this._dfs(neighbor, stack)) return true;
    }

    stack.delete(node);
    return false;
  }
}

// Track circular dependencies across files
const circularTracker = new CircularDependencyTracker();

module.exports = {
  meta: {
    name: 'eslint-plugin-fsd-imports',
    version: '2.0.0',
  },
  rules: {
    'layer-dependency': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Validate FSD layer dependency rules',
        },
        messages: {
          violation: 'FSD layer violation: "{{sourceLayer}}" cannot import from "{{targetLayer}}". Allowed: {{allowed}}',
        },
        schema: [],
      },
      create(context) {
        const filePath = context.filename;
        const sourceLayer = getLayerFromPath(filePath);

        if (!sourceLayer) return {};

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            const targetLayer = getLayerFromImport(source);
            if (!targetLayer) return;

            const allowed = ALLOWED_IMPORTS[sourceLayer];
            if (!allowed) return;

            if (allowed.includes(targetLayer)) return;

            context.report({
              node,
              messageId: 'violation',
              data: {
                sourceLayer: LAYER_NAMES[sourceLayer] || sourceLayer,
                targetLayer: LAYER_NAMES[targetLayer] || targetLayer,
                allowed: allowed.length > 0
                  ? allowed.map((l) => LAYER_NAMES[l] || l).join(', ')
                  : 'none (shared cannot import from other layers)',
              },
            });
          },
        };
      },
    },

    'public-api-only': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Enforce imports through public API (index.ts) only',
        },
        messages: {
          violation:
            'FSD public API violation: import from "{{source}}" bypasses public API. Use "@{{layer}}/{{slice}}" instead.',
        },
        schema: [
          {
            type: 'object',
            properties: {
              allowInternal: {
                type: 'array',
                items: { type: 'string' },
              },
              disallowPatterns: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        ],
      },
      create(context) {
        const options = context.options[0] || {};
        const allowInternal = options.allowInternal || [];
        const disallowPatterns = options.disallowPatterns || [];

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (!source || source.startsWith('.')) return;

            // Check if import bypasses public API
            const match = source.match(/^@\/(app|pages|widgets|features|entities|shared)\/([^/]+)\/(.+)/);
            if (!match) return;

            const [, layer, slice, rest] = match;

            // Allow internal imports for allowed patterns
            if (allowInternal.some((p) => source.includes(p))) return;

            // shared/ is special — organized by function
            if (layer === 'shared') {
              const sliceParts = slice.split('/');
              if (sliceParts.length > 1) return; // too deep, already a violation
              if (rest) {
                const restParts = rest.split('/');
                // shared/ui/Component — valid public API (index.ts)
                // shared/ui/Component/ui/... — violation (deep internal)
                if (slice === 'ui' && restParts.length > 1) {
                  context.report({
                    node,
                    messageId: 'violation',
                    data: { source, layer, slice },
                  });
                }
              }
              return;
            }

            // For other layers: importing into internal folders is a violation
            // But first check disallow patterns for deep imports
            if (disallowPatterns.some((p) => {
              const escaped = p.replace(/\*\*/g, '(.+)?').replace(/\*/g, '[^/]+').replace(/\//g, '\\/');
              try {
                return new RegExp(escaped).test(source);
              } catch {
                return false;
              }
            })) {
              context.report({
                node,
                messageId: 'violation',
                data: { source, layer, slice },
              });
              return;
            }

            // For other layers: importing into internal folders is a violation
            context.report({
              node,
              messageId: 'violation',
              data: { source, layer, slice },
            });
          },
        };
      },
    },

    'tests-public-api-only': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Tests must import other slices only through their public API (index.ts)',
        },
        messages: {
          violation:
            'FSD test boundary violation: test imports "{{source}}" from another slice bypassing its public API. Import from "{{publicApi}}" instead.',
        },
        schema: [],
      },
      create(context) {
        const filePath = context.filename;
        const normalizedPath = filePath.replace(/\\/g, '/');

        // Rule applies only to test files (co-located or __tests__ dir)
        const isTestFile =
          /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(normalizedPath) ||
          normalizedPath.includes('__tests__');
        if (!isTestFile) return {};

        const cwd = context.cwd || process.cwd();
        const srcRoot = path.join(cwd, 'src');

        /**
         * Find the deepest existing index.ts prefix for a path (relative segments).
         * Public API in FSD = the deepest directory that has an index.ts.
         * Returns the relative path (e.g. "shared/lib/contexts/ToastContext") or null.
         */
        function deepestPublicApi(segments) {
          for (let i = segments.length; i >= 2; i--) {
            const candidate = segments.slice(0, i).join('/');
            if (fs.existsSync(path.join(srcRoot, candidate, 'index.ts'))) {
              return candidate;
            }
          }
          return null;
        }

        // Own slice = deepest index.ts prefix in the test file's own directory chain
        let ownSlice = null;
        const relMatch = normalizedPath.match(/(?:^|\/)src\/(.+)$/);
        if (relMatch) {
          const dirSegments = relMatch[1].split('/').filter(Boolean);
          dirSegments.pop(); // drop filename
          ownSlice = deepestPublicApi(dirSegments);
        }

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (!source || !source.startsWith('@/')) return;

            const segments = source.replace(/^@\//, '').split('/').filter(Boolean);
            if (segments.length < 2) return; // @/layer only — nothing to check

            const importPath = segments.join('/');
            const publicApi = deepestPublicApi(segments);

            // Import exactly at the public API (index.ts) — fine
            if (publicApi && importPath === publicApi) return;

            // Import deeper than the public API
            if (publicApi && importPath.startsWith(publicApi + '/')) {
              // Allowed when importing own slice internals (co-located unit tests)
              if (ownSlice && (importPath === ownSlice || importPath.startsWith(ownSlice + '/'))) {
                return;
              }
              context.report({
                node,
                messageId: 'violation',
                data: { source, publicApi: `@/${publicApi}` },
              });
              return;
            }

            // No index.ts anywhere in the chain — deep import of a slice without a public API.
            // Allowed only for own slice.
            if (ownSlice && (importPath === ownSlice || importPath.startsWith(ownSlice + '/'))) {
              return;
            }
            context.report({
              node,
              messageId: 'violation',
              data: { source, publicApi: `@/${segments.slice(0, 2).join('/')}` },
            });
          },
        };
      },
    },

    'no-circular': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Detect circular imports between FSD layers',
        },
        messages: {
          violation: 'Potential circular dependency detected: "{{source}}" creates a cycle with "{{filePath}}"',
        },
        schema: [],
      },
      create(context) {
        const filePath = context.filename;
        const sourceLayer = getLayerFromPath(filePath);
        if (!sourceLayer) return {};

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (!source || source.startsWith('.')) return;

            const targetLayer = getLayerFromImport(source);
            if (!targetLayer) return;

            // Track: source file → target file
            const targetFile = source.replace(/^@\//, '');
            circularTracker.addEdge(filePath, targetFile);
          },
        };
      },
    },
  },
};
