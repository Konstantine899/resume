/**
 * ESLint Rule: react-perf/no-missing-error-boundary
 *
 * Ensures that error boundaries are used in the app:
 * - Checks that App component is wrapped in ErrorBoundary
 * - Checks that risky operations are in try-catch
 * - Checks that async operations have error handling
 */

import type { Rule } from 'eslint';

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure error boundaries are used',
      category: 'Performance',
      recommended: 'error',
    },
    fixable: null,
    schema: [],
    messages: {
      missingBoundary: 'App component should be wrapped in ErrorBoundary to catch runtime errors.',
      missingTryCatch: 'Risky operation should be wrapped in try-catch block.',
      missingErrorHandling: 'Async operation should have error handling (catch/onerror).',
    },
  },
  create(context) {
    let hasErrorBoundary = false;
    let inAppComponent = false;

    return {
      // Check for ErrorBoundary import
      ImportDeclaration(node) {
        if (node.source.value.includes('error-boundary')) {
          hasErrorBoundary = true;
        }
      },

      // Check for App component
      FunctionDeclaration(node) {
        if (node.id?.name === 'App') {
          inAppComponent = true;
        }
      },

      'FunctionDeclaration:exit'(node) {
        if (node.id?.name === 'App') {
          inAppComponent = false;

          // Check if App has error boundary
          if (!hasErrorBoundary) {
            context.report({
              node,
              messageId: 'missingBoundary',
            });
          }
        }
      },

      // Check for JSX without ErrorBoundary
      JSXElement(node) {
        if (
          inAppComponent &&
          node.openingElement.name.type === 'JSXIdentifier' &&
          node.openingElement.name.name === 'App'
        ) {
          // Check if parent is ErrorBoundary
          let parent = node.parent;
          let foundBoundary = false;

          while (parent) {
            if (
              parent.type === 'JSXElement' &&
              parent.openingElement.name.type === 'JSXIdentifier' &&
              parent.openingElement.name.name === 'ErrorBoundary'
            ) {
              foundBoundary = true;
              break;
            }
            parent = parent.parent;
          }

          if (!foundBoundary && !hasErrorBoundary) {
            context.report({
              node,
              messageId: 'missingBoundary',
            });
          }
        }
      },

      // Check for missing try-catch in risky operations
      CallExpression(node) {
        const callee = node.callee;

        // Check for JSON.parse, eval, etc.
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'JSON' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'parse'
        ) {
          // Check if inside try-catch
          if (!isInsideTryCatch(node)) {
            context.report({
              node,
              messageId: 'missingTryCatch',
            });
          }
        }
      },

      // Check for async operations without error handling
      CallExpression(node) {
        const callee = node.callee;

        // Check for fetch, axios, etc.
        if (
          (callee.type === 'Identifier' && callee.name === 'fetch') ||
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            ['get', 'post', 'put', 'delete', 'patch'].includes(callee.property.name))
        ) {
          // Check if has .catch() or await in try-catch
          if (!hasErrorHandling(node)) {
            context.report({
              node,
              messageId: 'missingErrorHandling',
            });
          }
        }
      },
    };
  },
};

/**
 * Check if node is inside try-catch
 */
function isInsideTryCatch(node: any): boolean {
  let parent = node.parent;

  while (parent) {
    if (parent.type === 'TryStatement') {
      return true;
    }
    parent = parent.parent;
  }

  return false;
}

/**
 * Check if async operation has error handling
 */
function hasErrorHandling(node: any): boolean {
  // Check for .catch()
  if (
    node.parent &&
    node.parent.type === 'MemberExpression' &&
    node.parent.property.type === 'Identifier' &&
    node.parent.property.name === 'catch'
  ) {
    return true;
  }

  // Check for await in try-catch
  if (isInsideTryCatch(node)) {
    return true;
  }

  // Check for Promise.withErrorHandling (if using custom wrapper)
  if (
    node.parent &&
    node.parent.type === 'CallExpression' &&
    node.parent.callee.type === 'MemberExpression' &&
    node.parent.callee.property.type === 'Identifier' &&
    node.parent.callee.property.name === 'withErrorHandling'
  ) {
    return true;
  }

  return false;
}

export default rule;
