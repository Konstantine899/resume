/**
 * Performance Budget: Render Time Thresholds
 *
 * Realistic render time thresholds for different component types:
 * - Simple components: < 8ms
 * - Medium components: < 16ms
 * - Complex components: < 50ms
 * - Slow device multiplier: 3x
 */

import { PerformanceObserver } from 'perf_hooks';

interface RenderTimeBudget {
  simple: { max: number; description: string };
  medium: { max: number; description: string };
  complex: { max: number; description: string };
}

interface ComponentCategory {
  pattern: RegExp;
  category: 'simple' | 'medium' | 'complex';
}

const RENDER_BUDGETS: RenderTimeBudget = {
  simple: {
    max: 8, // 8ms = 125fps target
    description: 'Buttons, icons, badges, simple UI elements',
  },
  medium: {
    max: 16, // 16ms = 60fps target
    description: 'Cards, forms, inputs, moderate complexity',
  },
  complex: {
    max: 50, // 50ms = 20fps acceptable for complex UI
    description: 'Dashboards, lists with many items, data-heavy components',
  },
};

const COMPONENT_CATEGORIES: ComponentCategory[] = [
  // Simple components
  { pattern: /^(Button|Icon|Badge|Avatar|Link|Label)$/i, category: 'simple' },
  { pattern: /^(Heading|Paragraph|Text|Span|Divider)$/i, category: 'simple' },

  // Medium components
  {
    pattern: /^(Card|Input|Textarea|Select|Checkbox|Radio|Switch|Modal|Tooltip|Popover)$/i,
    category: 'medium',
  },
  { pattern: /^(Form|Dialog|Dropdown|Menu|Tabs|Accordion|Pagination)$/i, category: 'medium' },

  // Complex components
  {
    pattern: /^(Dashboard|DataTable|VirtualList|InfiniteList|Chart|Graph|Map)$/i,
    category: 'complex',
  },
  { pattern: /^(Editor|Viewer|Gallery|Timeline|Calendar|Scheduler)$/i, category: 'complex' },
];

/**
 * Categorize component by name
 */
export function categorizeComponent(componentName: string): 'simple' | 'medium' | 'complex' {
  for (const { pattern, category } of COMPONENT_CATEGORIES) {
    if (pattern.test(componentName)) {
      return category;
    }
  }

  // Default to medium for unknown components
  return 'medium';
}

/**
 * Get render time budget for component
 */
export function getRenderBudget(componentName: string, isSlowDevice = false): number {
  const category = categorizeComponent(componentName);
  const budget = RENDER_BUDGETS[category].max;

  // Apply slow device multiplier
  return isSlowDevice ? budget * 3 : budget;
}

/**
 * Check if render time exceeds budget
 */
export function checkRenderTime(
  componentName: string,
  renderTime: number,
  isSlowDevice = false
): {
  passed: boolean;
  budget: number;
  actual: number;
  category: string;
  overhead: number;
} {
  const category = categorizeComponent(componentName);
  const budget = getRenderBudget(componentName, isSlowDevice);
  const passed = renderTime <= budget;
  const overhead = Math.max(0, renderTime - budget);

  return {
    passed,
    budget,
    actual: renderTime,
    category,
    overhead,
  };
}

/**
 * Setup performance observer for render monitoring
 */
export function setupRenderMonitoring(
  options: {
    onViolation?: (component: string, renderTime: number, budget: number) => void;
    slowDeviceMultiplier?: number;
  } = {}
) {
  const { onViolation, slowDeviceMultiplier = 3 } = options;

  // Check if Performance API is available
  if (typeof PerformanceObserver === 'undefined') {
    console.warn('PerformanceObserver not available, render monitoring disabled');
    return;
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'measure' && entry.name.startsWith('react-render-')) {
        const componentName = entry.name.replace('react-render-', '');
        const renderTime = entry.duration;

        const { passed, budget, actual, category, overhead } = checkRenderTime(
          componentName,
          renderTime,
          false // Could detect slow device via navigator.connection
        );

        if (!passed && onViolation) {
          onViolation(componentName, actual, budget);
        }

        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
          const status = passed ? '✅' : '❌';
          console.log(
            `${status} ${componentName} (${category}): ${actual.toFixed(2)}ms / ${budget}ms` +
              (overhead > 0 ? ` (+${overhead.toFixed(2)}ms over)` : '')
          );
        }
      }
    }
  });

  observer.observe({ entryTypes: ['measure'] });

  return observer;
}

/**
 * Generate render time report
 */
export function generateRenderReport(
  measurements: Array<{
    component: string;
    renderTime: number;
    isSlowDevice?: boolean;
  }>
): string {
  let report = '# Render Time Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total measurements: ${measurements.length}\n\n`;
  report += '---\n\n';

  const violations = measurements.filter((m) => {
    const { passed } = checkRenderTime(m.component, m.renderTime, m.isSlowDevice);
    return !passed;
  });

  const byCategory = {
    simple: { total: 0, passed: 0, avgTime: 0 },
    medium: { total: 0, passed: 0, avgTime: 0 },
    complex: { total: 0, passed: 0, avgTime: 0 },
  };

  for (const m of measurements) {
    const category = categorizeComponent(m.component);
    const { passed } = checkRenderTime(m.component, m.renderTime, m.isSlowDevice);

    byCategory[category].total++;
    if (passed) byCategory[category].passed++;
    byCategory[category].avgTime += m.renderTime;
  }

  // Calculate averages
  for (const cat of Object.keys(byCategory)) {
    const key = cat as keyof typeof byCategory;
    if (byCategory[key].total > 0) {
      byCategory[key].avgTime /= byCategory[key].total;
    }
  }

  // Summary
  report += '## Summary\n\n';
  report += `Total measurements: ${measurements.length}\n`;
  report += `Violations: ${violations.length} (${((violations.length / measurements.length) * 100).toFixed(1)}%)\n\n`;

  // By Category
  report += '## By Category\n\n';
  for (const [cat, data] of Object.entries(byCategory)) {
    const budget = RENDER_BUDGETS[cat as keyof RenderTimeBudget].max;
    report += `### ${cat.charAt(0).toUpperCase() + cat.slice(1)} Components\n\n`;
    report += `- Budget: ${budget}ms\n`;
    report += `- Average: ${data.avgTime.toFixed(2)}ms\n`;
    report += `- Passed: ${data.passed}/${data.total} (${((data.passed / data.total) * 100).toFixed(1)}%)\n\n`;
  }

  // Violations
  if (violations.length > 0) {
    report += '## Violations\n\n';

    // Sort by overhead
    violations
      .map((v) => ({
        ...v,
        ...checkRenderTime(v.component, v.renderTime, v.isSlowDevice),
      }))
      .sort((a, b) => b.overhead - a.overhead)
      .slice(0, 20)
      .forEach((v) => {
        report += `- **${v.component}** (${v.category}): ${v.actual.toFixed(2)}ms / ${v.budget}ms (+${v.overhead.toFixed(2)}ms)\n`;
      });
  }

  return report;
}

export default {
  RENDER_BUDGETS,
  COMPONENT_CATEGORIES,
  categorizeComponent,
  getRenderBudget,
  checkRenderTime,
  setupRenderMonitoring,
  generateRenderReport,
};
