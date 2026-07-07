# 🧪 Testing Rules - Senior Test Architect Level

## 🚫 ABSOLUTE TESTING BANS (Auto-fail)

### 1. TEST QUALITY:

- ❌ **NO** tests without assertions
- ❌ **NO** flaky or non-deterministic tests
- ❌ **NO** tests that don't test anything useful
- ❌ **NO** skipped tests without justification

### 2. COVERAGE:

- ❌ **NO** production code without tests
- ❌ **NO** critical paths without coverage
- ❌ **NO** utilities without 100% coverage
- ❌ **NO** error cases without testing

### 3. TEST DESIGN:

- ❌ **NO** implementation testing instead of behavior
- ❌ **NO** over-mocking leading to false positives
- ❌ **NO** missing edge case testing
- ❌ **NO** tests that don't fail when they should

## ⚠️ TESTING REQUIREMENTS (Must Have)

### 1. TEST PYRAMID:

- ✅ **70%** Unit tests (fast, isolated)
- ✅ **20%** Integration tests (component interaction)
- ✅ **10%** E2E tests (critical user journeys)
- ✅ **100%** Critical path coverage

### 2. TEST QUALITY:

- ✅ **Meaningful** test names (should describe behavior)
- ✅ **Clear** arrange-act-assert structure
- ✅ **Independent** tests (no shared state)
- ✅ **Fast** execution (< 100ms unit, < 200ms integration)

### 3. TEST COVERAGE:

- ✅ **100%** utility/helper function coverage
- ✅ **90%+** component coverage
- ✅ **100%** error boundary coverage
- ✅ **95%+** user interaction coverage

## 🎯 TESTING METRICS (SaaS Advanced)

### 1. QUALITY METRICS:

- **Test Effectiveness**: > 90% bug catch rate
- **Flakiness Rate**: < 1% flaky tests
- **Test Speed**: < 30s full test suite
- **Maintainability**: < 10% test code duplication
- **Fake Test Rate**: 0% (enforced by coverage-fake-protection)

### 2. COVERAGE METRICS:

- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 95%
- **Statement Coverage**: > 90%
- **Assertion Coverage**: 100% (all tests must have assertions)

### 3. PERFORMANCE METRICS:

- **Unit Test Speed**: < 100ms per test
- **Integration Test Speed**: < 200ms per test
- **E2E Test Speed**: < 2s per test
- **Memory Usage**: < 50MB per test suite

---

## 🔧 COVERAGE FAKE PROTECTION v2.0

### Реализация

**Плагин:** `.opencode/plugins/vitest-plugin-coverage-fake-protection.ts`  
**Setup:** `.opencode/plugins/coverage-fake-setup.ts`

### Что Детектируется

**❌ Fake Tests:**
- Tests без assertions
- Tests с пустым телом
- Tests без expect()/assert()
- Tests где тело — просто значение

**Примеры Fake Tests:**
```typescript
// ❌ FAKE: No assertions
test('should work', () => {
  const result = someFunction();
  // No expect() call
});

// ❌ FAKE: Empty body
test('should do something', () => {});

// ❌ FAKE: Just a value
test('returns true', () => true);

// ✅ OK: Has assertion
test('should return true', () => {
  const result = someFunction();
  expect(result).toBe(true);
});
```

### Конфигурация Vitest

```typescript
// vitest.config.ts
import { defineFakeCoverageConfig } from './.opencode/plugins/vitest-plugin-coverage-fake-protection';

export default defineFakeCoverageConfig({
  minAssertions: 1,
  assertFunctionNames: ['expect', 'assert', 'should'],
  failBuild: true,
  showDetails: true,
});
```

### Coverage Thresholds

```typescript
// vitest.config.ts
export default {
  test: {
    coverage: {
      thresholds: {
        lines: 90,
        branches: 85,
        functions: 95,
        statements: 90,
      },
      // Require actual assertions
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__tests__/**',
        '**/node_modules/**',
      ],
    },
  },
};
```

### ESLint Integration

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // Require expect-expect pattern
    'testing-library/expect-expect': [
      'error',
      { assertFunctionNames: ['expect', 'assert'] }
    ],
  },
};
```

### CI/CD Enforcement

```yaml
# .github/workflows/test-quality.yml
- name: Check Test Quality
  run: npm run test -- --coverage --fail-on-fake
```

## 🔧 TESTING AUTOMATION

### 1. PRE-COMMIT CHECKS:

- 🔍 **Test** coverage validation
- 🔍 **Test** performance benchmarking
- 🔍 **Flaky** test detection
- 🔍 **Test** code quality checks

### 2. CI/CD PIPELINE:

- ✅ **Parallel** test execution
- ✅ **Test** result analytics
- ✅ **Failure** trend analysis
- ✅ **Test** optimization suggestions

### 3. QUALITY GATES:

- 📊 **Test** coverage enforcement
- 📊 **Test** performance budgets
- 📊 **Test** quality metrics
- 📊 **Test** maintenance indicators

## 🚨 CRITICAL TESTING PATTERNS

### 1. TEST DESIGN:

- 🧪 **Behavior-driven** testing
- 🧪 **Test** readability focus
- 🧪 **Minimal** mocking strategy
- 🧪 **Realistic** test data

### 2. TEST MAINTENANCE:

- 🔄 **Regular** test refactoring
- 🔄 **Test** debt tracking
- 🔄 **Test** documentation
- 🔄 **Test** performance monitoring

### 3. TEST INFRASTRUCTURE:

- 🏗️ **Scalable** test architecture
- 🏗️ **Test** environment management
- 🏗️ **Test** data management
- 🏗️ **Test** reporting systems

## 📊 TESTING QUALITY GATES

### ✅ AUTOMATIC APPROVAL:

- 100% critical path coverage
- Zero flaky tests
- All tests pass
- Performance budgets met

### ❌ AUTOMATIC REJECTION:

- Critical path untested
- Flaky tests detected
- Tests failing
- Performance budgets exceeded

---

**Testing Rules enforced at Senior SaaS Advanced level** 🧪
