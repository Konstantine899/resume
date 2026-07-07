# ⚡ Performance Rules - Senior Performance Architect Level

## 🚫 ABSOLUTE PERFORMANCE BANS (Auto-fail)

### 1. RENDER PERFORMANCE:

- ❌ **NO** render times > 16ms (blocks 60fps)
- ❌ **NO** unnecessary re-renders (> 3 per interaction)
- ❌ **NO** memory leaks in components
- ❌ **NO** blocking main thread operations

### 2. BUNDLE SIZE:

- ❌ **NO** bundle chunks > 100kb
- ❌ **NO** unused code in production bundles
- ❌ **NO** duplicate dependencies
- ❌ **NO** missing code splitting

### 3. MEMORY USAGE:

- ❌ **NO** memory growth > 10MB per operation
- ❌ **NO** event listener leaks
- ❌ **NO** missing cleanup in useEffect
- ❌ **NO** large object retention

## ⚠️ PERFORMANCE REQUIREMENTS (Must Have)

### 1. RENDER OPTIMIZATION:

- ✅ **OPTIMAL** re-render patterns with memoization
- ✅ **EFFICIENT** event handling and debouncing
- ✅ **PROPER** virtualization for large lists
- ✅ **CORRECT** useEffect dependencies and cleanup

### 2. BUNDLE OPTIMIZATION:

- ✅ **AGGRESSIVE** tree shaking and dead code elimination
- ✅ **STRATEGIC** code splitting by routes and features
- ✅ **PROPER** dependency management and deduplication
- ✅ **OPTIMAL** asset compression and caching

### 3. MEMORY EFFICIENCY:

- ✅ **PROPER** garbage collection awareness
- ✅ **COMPLETE** cleanup of event listeners and timeouts
- ✅ **EFFICIENT** data structures and algorithms
- ✅ **OPTIMAL** caching strategies

## 🎯 PERFORMANCE METRICS v2.0 (Concrete & Measurable)

### Реализация

**Инструмент:** `.opencode/plugins/render-time-budgets.ts`

### 1. RENDER METRICS (Categorized)

| Тип компонента | Budget (normal) | Budget (slow device) | Примеры |
|----------------|-----------------|---------------------|---------|
| **Simple** | < 8ms (125fps) | < 24ms | Button, Icon, Badge, Avatar, Link |
| **Medium** | < 16ms (60fps) | < 48ms | Card, Input, Modal, Tooltip, Form |
| **Complex** | < 50ms (20fps) | < 150ms | Dashboard, DataTable, VirtualList, Chart |

**Slow Device:** Moto G4, 4x CPU slowdown (Lighthouse)

### 2. BUNDLE METRICS (Enforced)

| Метрика | Target | Enforcement |
|---------|--------|-------------|
| **Main Chunk Size** | < 100kb | `vite-plugin-bundle-size` |
| **Total Bundle Size** | < 500kb | `vite-plugin-bundle-size` |
| **Vendor Chunk** | < 200kb | `vite-plugin-bundle-size` |
| **Tree Shaking** | > 90% | `rollup-plugin-visualizer` |

### 3. MEMORY METRICS (Monitored)

| Метрика | Target | Alert |
|---------|--------|-------|
| **Memory Growth** | < 5MB/session | > 10MB = warn |
| **Heap Size** | < 50MB sustained | > 100MB = critical |
| **Garbage Collection** | < 1% CPU | > 5% = warn |
| **Event Listeners** | < 100 active | > 200 = leak detected |

---

## 🔧 RENDER TIME ENFORCEMENT

### Development Monitoring

```typescript
// src/app/providers/render-monitor.tsx
import { setupRenderMonitoring } from '.opencode/plugins/render-time-budgets';

export function RenderMonitorProvider({ children }: { children: React.ReactNode }) {
  setupRenderMonitoring({
    onViolation: (component, renderTime, budget) => {
      console.warn(
        `⚠️ Render time violation: ${component} took ${renderTime.toFixed(2)}ms ` +
        `(budget: ${budget}ms)`
      );
      
      // Send to analytics
      sendToAnalytics('render_violation', { component, renderTime, budget });
    },
  });
  
  return <>{children}</>;
}
```

### Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse Performance

on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/
          runs: 3
          settings: |
            {
              "throttling": {
                "cpuSlowdownRate": 4  // 4x slowdown = slow device
              }
            }
          assert:
            - "first-contentful-paint:<1000"
            - "largest-contentful-paint:<2500"
            - "total-blocking-time:<300"
            - "cumulative-layout-shift:<0.1"
```

### React Profiler Integration

```typescript
// src/app/providers/profiler.tsx
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  const { categorizeComponent, getRenderBudget } = 
    await import('.opencode/plugins/render-time-budgets');
  
  const category = categorizeComponent(id);
  const budget = getRenderBudget(id, false);
  
  if (actualDuration > budget) {
    console.warn(
      `⚠️ ${id} (${category}): ${actualDuration.toFixed(2)}ms > ${budget}ms budget`
    );
  }
}

export function ProfilerProvider({ children }: { children: React.ReactNode }) {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}
```

### Performance Budget JSON

```json
// performance-budget.json
{
  "render": {
    "simple": { "max": 8, "unit": "ms" },
    "medium": { "max": 16, "unit": "ms" },
    "complex": { "max": 50, "unit": "ms" },
    "slowDeviceMultiplier": 3
  },
  "lighthouse": {
    "fcp": { "max": 1000, "unit": "ms" },
    "lcp": { "max": 2500, "unit": "ms" },
    "tbt": { "max": 300, "unit": "ms" },
    "cls": { "max": 0.1, "unit": "score" }
  }
}
```

### CI/CD Enforcement

```yaml
# .github/workflows/performance-budget.yml
name: Performance Budget

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build with analysis
        run: npm run build:analyze
      
      - name: Check bundle size
        uses: preactjs/compressed-size-action@v2
        with:
          pattern: './dist/**/*.js'
          limit: '100KB'
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          assert:
            - "first-contentful-paint:<1000"
            - "largest-contentful-paint:<2500"
```

## 🔧 PERFORMANCE AUTOMATION

### 1. PRE-COMMIT CHECKS:

- 🔍 **Bundle size** monitoring with thresholds
- 🔍 **Render performance** profiling
- 🔍 **Memory usage** leak detection
- 🔍 **Performance budget** enforcement

### 2. CI/CD PIPELINE:

- ✅ **Automated** performance regression testing
- ✅ **Real user monitoring** (RUM) integration
- ✅ **Lighthouse CI** scoring and enforcement
- ✅ **Web Vitals** compliance checking

### 3. PRODUCTION MONITORING:

- 📊 **Real-time** performance dashboards
- 📊 **Anomaly detection** for performance issues
- 📊 **User experience** scoring and tracking
- 📊 **Performance debt** tracking and management

## 🚨 CRITICAL PERFORMANCE PATTERNS

### 1. REACT OPTIMIZATION:

- ⚡ **Proper** use of memo, useCallback, useMemo
- ⚡ **Efficient** component structure and composition
- ⚡ **Optimal** state management and data flow
- ⚡ **Correct** useEffect and event handling

### 2. BUNDLE OPTIMIZATION:

- 📦 **Strategic** code splitting by feature
- 📦 **Aggressive** tree shaking configuration
- 📦 **Proper** dependency optimization
- 📦 **Optimal** asset delivery strategies

### 3. MEMORY MANAGEMENT:

- 🧠 **Efficient** data structures and algorithms
- 🧠 **Proper** cleanup and resource management
- 🧠 **Optimal** caching and memoization
- 🧠 **Correct** garbage collection awareness

## 📊 PERFORMANCE QUALITY GATES

### ✅ AUTOMATIC APPROVAL:

- Web Vitals scores > 90
- Bundle size under budget
- No memory leaks detected
- Performance budgets met

### ❌ AUTOMATIC REJECTION:

- Core Web Vitals failures
- Bundle size over budget
- Memory leaks detected
- Performance regressions

---

**Performance Rules enforced at Senior SaaS Advanced level** ⚡
