/**
 * ESLint Plugin: eslint-plugin-react-perf
 *
 * Performance-focused ESLint rules for React:
 * - no-uncleanup-effects: Detect missing cleanup in useEffect
 * - no-missing-memo: Detect expensive computations without memoization
 * - no-leaked-event-listeners: Detect event listeners without cleanup
 */

export const noUncleanupEffects = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect missing cleanup in useEffect',
      category: 'Performance',
      recommended: 'error',
    },
    fixable: null,
    schema: [],
    messages: {
      missingCleanup:
        'useEffect hook should return a cleanup function to prevent memory leaks. Add a return statement that cleans up event listeners, timers, and subscriptions.',
      missingDependency:
        'useEffect hook is missing dependency array. This may cause memory leaks due to stale closures.',
    },
  },
  create(context: any) {
    return {
      CallExpression(node: any) {
        if (node.callee.name === 'useEffect') {
          const args = node.arguments;

          // Check if cleanup function is returned
          if (args.length > 0 && args[0].type === 'ArrowFunctionExpression') {
            const body = args[0].body;

            // Check for return statement
            if (body.type === 'BlockStatement') {
              const hasReturn = body.body.some(
                (stmt: any) => stmt.type === 'ReturnStatement' && stmt.argument !== null
              );

              if (!hasReturn) {
                context.report({
                  node,
                  messageId: 'missingCleanup',
                });
              }
            }
          }

          // Check if dependency array is present
          if (args.length < 2) {
            context.report({
              node,
              messageId: 'missingDependency',
            });
          }
        }
      },
    };
  },
};

export const noMissingMemo = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect expensive computations without memoization',
      category: 'Performance',
      recommended: 'warn',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          complexity: {
            type: 'number',
            description: 'Minimum complexity to require memoization',
            default: 3,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingMemo:
        'Complex computation (complexity: {{complexity}}) should be wrapped in useMemo to prevent unnecessary re-calculations.',
    },
  },
  create(context: any) {
    const options = context.options[0] || {};
    const minComplexity = options.complexity || 3;

    return {
      CallExpression(node: any) {
        // Check for array methods that create new arrays
        if (
          node.callee.property &&
          ['map', 'filter', 'reduce', 'sort', 'forEach'].includes(node.callee.property.name)
        ) {
          // Check if inside useMemo
          let parent = node.parent;
          let insideMemo = false;

          while (parent) {
            if (parent.type === 'CallExpression' && parent.callee.name === 'useMemo') {
              insideMemo = true;
              break;
            }
            parent = parent.parent;
          }

          if (!insideMemo) {
            context.report({
              node,
              messageId: 'missingMemo',
              data: {
                complexity: minComplexity,
              },
            });
          }
        }
      },
    };
  },
};

export const noLeakedEventListeners = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect event listeners without cleanup',
      category: 'Performance',
      recommended: 'error',
    },
    fixable: null,
    schema: [],
    messages: {
      missingCleanup:
        'addEventListener in useEffect should be cleaned up with removeEventListener to prevent memory leaks.',
    },
  },
  create(context: any) {
    return {
      CallExpression(node: any) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.name === 'addEventListener'
        ) {
          // Check if inside useEffect with cleanup
          let parent = node.parent;
          let inEffectWithCleanup = false;

          while (parent) {
            if (parent.type === 'CallExpression' && parent.callee.name === 'useEffect') {
              // Check if effect returns cleanup
              const effectFn = parent.arguments[0];
              if (
                effectFn &&
                effectFn.type === 'ArrowFunctionExpression' &&
                effectFn.body.type === 'BlockStatement'
              ) {
                const hasReturn = effectFn.body.body.some(
                  (stmt: any) =>
                    stmt.type === 'ReturnStatement' &&
                    stmt.argument &&
                    stmt.argument.type === 'CallExpression' &&
                    stmt.argument.callee.type === 'MemberExpression' &&
                    stmt.argument.callee.property.name === 'removeEventListener'
                );

                if (hasReturn) {
                  inEffectWithCleanup = true;
                }
              }
              break;
            }
            parent = parent.parent;
          }

          if (!inEffectWithCleanup) {
            context.report({
              node,
              messageId: 'missingCleanup',
            });
          }
        }
      },
    };
  },
};

export const rules = {
  'no-uncleanup-effects': noUncleanupEffects,
  'no-missing-memo': noMissingMemo,
  'no-leaked-event-listeners': noLeakedEventListeners,
};

export const configs = {
  recommended: {
    plugins: ['react-perf'],
    rules: {
      'react-perf/no-uncleanup-effects': 'error',
      'react-perf/no-missing-memo': 'warn',
      'react-perf/no-leaked-event-listeners': 'error',
    },
  },
};

export default {
  rules,
  configs,
};
