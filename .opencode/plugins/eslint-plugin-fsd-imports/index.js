/**
 * ESLint Plugin: eslint-plugin-fsd-imports
 * 
 * Enforces Feature-Sliced Design architecture rules:
 * - Layer dependency validation
 * - No circular dependencies
 * - Public API enforcement
 * - Index exports requirement
 */

const layerDependency = require('./lib/layer-dependency');
const noCircular = require('./lib/no-circular');
const publicApiOnly = require('./lib/public-api-only');

module.exports = {
  meta: {
    name: 'eslint-plugin-fsd-imports',
    version: '1.0.0',
  },
  rules: {
    'layer-dependency': layerDependency,
    'no-circular': noCircular,
    'public-api-only': publicApiOnly,
  },
  configs: {
    recommended: {
      plugins: ['fsd-imports'],
      rules: {
        'fsd-imports/layer-dependency': 'error',
        'fsd-imports/no-circular': 'error',
        'fsd-imports/public-api-only': [
          'error',
          {
            allowInternal: ['lib', 'constants', 'types', 'model'],
            disallowPatterns: ['**/ui/**', '**/api/**'],
          },
        ],
      },
    },
    strict: {
      plugins: ['fsd-imports'],
      rules: {
        'fsd-imports/layer-dependency': ['error', { strict: true }],
        'fsd-imports/no-circular': 'error',
        'fsd-imports/public-api-only': [
          'error',
          {
            allowInternal: [],
            disallowPatterns: ['**/ui/**', '**/api/**', '**/hooks/**'],
          },
        ],
      },
    },
  },
};
