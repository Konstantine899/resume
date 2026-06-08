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

## 🎯 PERFORMANCE METRICS (SaaS Advanced)

### 1. RENDER METRICS:

- **First Render Time**: < 100ms
- **Interaction Response**: < 16ms
- **Re-render Count**: < 3 per user action
- **Animation Performance**: 60fps consistent

### 2. BUNDLE METRICS:

- **Main Chunk Size**: < 100kb
- **Total Bundle Size**: < 500kb
- **Tree Shaking Efficiency**: > 90%
- **Code Splitting**: 5+ logical chunks

### 3. MEMORY METRICS:

- **Memory Growth**: < 5MB per session
- **Heap Size**: < 50MB sustained
- **Garbage Collection**: < 1% of CPU time
- **Event Listeners**: < 100 active

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
