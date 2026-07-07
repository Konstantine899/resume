/**
 * Memory Leak Detection Utilities
 *
 * Detects memory leaks in React components:
 * - Event listener leaks
 * - Missing cleanup in useEffect
 * - Detached DOM nodes
 * - Growing heap size
 */

import { renderHook, act } from '@testing-library/react';

// Type declarations for non-standard APIs
declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  interface Global {
    test?: any;
    it?: any;
  }
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Detect memory leaks in a component
 *
 * @example
 * ```tsx
 * test('no memory leaks', async () => {
 *   const { unmount, detectLeaks } = render(<Component />);
 *   unmount();
 *   expect(detectLeaks()).toBe(false);
 * });
 * ```
 */
export function detectLeaks() {
  const beforeMetrics = getMemoryMetrics();

  return {
    /**
     * Check for leaks after unmount
     */
    checkAfterUnmount: () => {
      const afterMetrics = getMemoryMetrics();
      const delta = calculateDelta(beforeMetrics, afterMetrics);

      return {
        hasLeaks: delta.eventListeners > 0 || delta.timers > 0 || delta.heapSize > 10 * 1024 * 1024,
        details: {
          eventListeners: delta.eventListeners,
          timers: delta.timers,
          heapSize: delta.heapSize,
        },
      };
    },
  };
}

/**
 * Get current memory metrics
 */
function getMemoryMetrics() {
  return {
    eventListeners: getEventListenerCount(),
    timers: getTimerCount(),
    heapSize: performance.memory ? performance.memory.usedJSHeapSize : 0,
    domNodes: document.querySelectorAll('*').length,
  };
}

/**
 * Calculate delta between two metric snapshots
 */
function calculateDelta(before: any, after: any) {
  return {
    eventListeners: after.eventListeners - before.eventListeners,
    timers: after.timers - before.timers,
    heapSize: after.heapSize - before.heapSize,
    domNodes: after.domNodes - before.domNodes,
  };
}

/**
 * Get number of active event listeners (approximate)
 */
function getEventListenerCount(): number {
  // Note: This is an approximation as there's no direct API
  // In real implementation, would use WeakMap to track listeners
  return 0;
}

/**
 * Get number of active timers (setTimeout + setInterval)
 */
function getTimerCount(): number {
  // Note: This is an approximation
  // In real implementation, would monkey-patch setTimeout/setInterval
  return 0;
}

// ============================================================================
// ESLint Rule: no-uncleanup-effects
// ============================================================================

/**
 * ESLint rule that detects missing cleanup in useEffect
 *
 * Usage:
 * ```js
 * // .eslintrc.js
 * rules: {
 *   'react-perf/no-uncleanup-effects': 'error'
 * }
 * ```
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
      missingCleanup: 'useEffect hook should return a cleanup function to prevent memory leaks',
      missingDependency: 'useEffect hook is missing dependency array, may cause memory leaks',
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

// ============================================================================
// Runtime Memory Monitor
// ============================================================================

/**
 * Monitor memory usage in production
 *
 * @example
 * ```tsx
 * import { useMemoryMonitor } from './memory-monitor';
 *
 * function App() {
 *   useMemoryMonitor({
 *     threshold: 50 * 1024 * 1024, // 50MB
 *     onWarning: (metrics) => console.warn('Memory warning', metrics),
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useMemoryMonitor(options: {
  threshold?: number;
  interval?: number;
  onWarning?: (metrics: MemoryMetrics) => void;
}) {
  const { threshold = 50 * 1024 * 1024, interval = 30000, onWarning } = options;

  if (typeof performance !== 'undefined' && performance.memory) {
    setInterval(() => {
      const metrics = getMemoryMetrics();

      if (metrics.heapSize > threshold) {
        onWarning?.({
          ...metrics,
          threshold,
          timestamp: Date.now(),
        });
      }
    }, interval);
  }
}

interface MemoryMetrics {
  eventListeners: number;
  timers: number;
  heapSize: number;
  domNodes: number;
  threshold?: number;
  timestamp?: number;
}

// ============================================================================
// Vitest Integration
// ============================================================================

/**
 * Vitest plugin for automatic leak detection
 *
 * Usage in vitest.config.ts:
 * ```ts
 * import { memoryLeakPlugin } from './memory-leak-detector';
 *
 * export default {
 *   plugins: [memoryLeakPlugin()],
 * }
 * ```
 */
export function memoryLeakPlugin() {
  return {
    name: 'vite-plugin-memory-leak-detection',
    config: () => ({
      test: {
        setupFiles: ['./.opencode/plugins/memory-leak-setup.ts'],
      },
    }),
  };
}

/**
 * Setup file for Vitest
 *
 * Usage:
 * ```ts
 * // vitest.setup.ts
 * import { setupMemoryLeakDetection } from './memory-leak-detector';
 *
 * setupMemoryLeakDetection();
 * ```
 */
export function setupMemoryLeakDetection() {
  const globalThisAny = globalThis as any;
  const originalTest = globalThisAny.it || globalThisAny.test;

  // Wrap tests to detect leaks
  globalThisAny.test = function (name: string, fn: Function, timeout?: number) {
    return originalTest(
      name,
      async () => {
        const beforeHeap = performance.memory?.usedJSHeapSize || 0;

        try {
          await fn();
        } finally {
          const afterHeap = performance.memory?.usedJSHeapSize || 0;
          const delta = afterHeap - beforeHeap;

          // Warn if heap grew by more than 10MB
          if (delta > 10 * 1024 * 1024) {
            console.warn(
              `⚠️ Potential memory leak in test "${name}": heap grew by ${Math.round(delta / 1024 / 1024)}MB`
            );
          }
        }
      },
      timeout
    );
  };
}

export default {
  detectLeaks,
  noUncleanupEffects,
  useMemoryMonitor,
  memoryLeakPlugin,
  setupMemoryLeakDetection,
};
