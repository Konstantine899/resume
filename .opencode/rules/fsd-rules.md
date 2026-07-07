# 🏗️ FSD Rules - Senior FSD Architect Level

## 🚫 ABSOLUTE FSD BANS (Auto-fail)

### 1. LAYER VIOLATIONS:

- ❌ **NO** imports from higher layers to lower layers
- ❌ **NO** circular dependencies between layers
- ❌ **NO** bypassing public API of layers
- ❌ **NO** direct entity manipulation from features

### 2. ARCHITECTURE QUALITY:

- ❌ **NO** God components or utils
- ❌ **NO** business logic in shared layer
- ❌ **NO** UI logic in entities layer
- ❌ **NO** API calls in features layer

### 3. CODE ORGANIZATION:

- ❌ **NO** default exports from public API
- ❌ **NO** mixed concerns in single file
- ❌ **NO** improper file placement
- ❌ **NO** missing index.ts exports

## ⚠️ FSD REQUIREMENTS (Must Have)

### 1. LAYER COMPLIANCE:

- ✅ **STRICT** layer dependency hierarchy
- ✅ **CLEAN** public API for each layer
- ✅ **PROPER** data flow between layers
- ✅ **CORRECT** file placement according to FSD

### 2. ARCHITECTURE QUALITY:

- ✅ **MODULAR** component structure
- ✅ **SEPARATED** business and UI logic
- ✅ **PROPER** API layer isolation
- ✅ **CLEAN** dependency graph

### 3. CODE ORGANIZATION:

- ✅ **CLEAR** file naming conventions
- ✅ **PROPER** index.ts re-exports
- ✅ **CONSISTENT** folder structure
- ✅ **MAINTAINABLE** code separation

## 🎯 FSD METRICS v2.0 (Concrete & Measurable)

### Реализация

**Инструмент:** `.opencode/plugins/fsd-metrics-collector.ts`

### 1. ARCHITECTURE METRICS (Automated)

| Метрика | Формула | Target | Порог |
|---------|---------|--------|-------|
| **Layer Purity** | `(clean_imports / total_imports) * 100` | > 95% | < 95% = block commit |
| **Circular Dependencies** | `count(cycles)` | 0 | > 0 = block merge |
| **Public API Quality** | `(exports_via_index / total_exports) * 100` | 100% | < 100% = warn |
| **File Placement** | `(correct_location / total_files) * 100` | 100% | < 100% = warn |

### 2. CODE QUALITY METRICS (Heuristic)

| Метрика | Формула | Target | Порог |
|---------|---------|--------|-------|
| **Component Cohesion** | Average of component scores | > 90% | < 80% = block |
| **Responsibilities** | Count per component | 1-2 | > 3 = warn, > 4 = block |
| **Dependency Depth** | Max import chain depth | < 3 | > 3 = warn |
| **Interface Stability** | `(stable_exports / total_exports) * 100` | > 95% | < 90% = warn |

**Component Scoring:**
- 1-2 responsibilities: 100% ✅
- 3 responsibilities: 70% ⚠️
- 4 responsibilities: 40% ❌
- 5+ responsibilities: 10% ❌

### 3. PERFORMANCE METRICS (Enforced)

| Метрика | Target | Instrument |
|---------|--------|------------|
| **Build Time** | < 30s | `vite build --mode analyze` |
| **Bundle Size** | < 100kb/chunk | `vite-plugin-bundle-size` |
| **Tree Shaking** | > 90% | `rollup-plugin-visualizer` |
| **Hot Reload** | < 2s | Vite HMR monitoring |

---

## 🔧 AUTOMATED ENFORCEMENT

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/bash

# Layer dependency check
npx tsx .opencode/plugins/fsd-metrics-collector.ts
if [ $? -ne 0 ]; then
  echo "❌ FSD layer violation detected"
  exit 1
fi

# Circular dependency check
npx madge --circular src/
if [ $? -ne 0 ]; then
  echo "❌ Circular dependencies detected"
  exit 1
fi

# Public API enforcement
npx eslint --rule 'fsd-imports/public-api-only: error' src/
if [ $? -ne 0 ]; then
  echo "❌ Public API violation detected"
  exit 1
fi
```

### ESLint Plugin

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['fsd-imports'],
  rules: {
    'fsd-imports/layer-dependency': [
      'error',
      {
        allowed: {
          'app': ['shared'],
          'pages': ['app', 'shared'],
          'widgets': ['app', 'pages', 'shared'],
          'features': ['entities', 'shared'],
          'entities': ['shared'],
          'shared': []
        }
      }
    ],
    'fsd-imports/no-circular': 'error',
    'fsd-imports/public-api-only': [
      'error',
      {
        allowInternal: ['lib', 'constants', 'types', 'model'],
        disallowPatterns: ['**/ui/**', '**/api/**']
      }
    ],
    'fsd-imports/enforce-index-exports': 'error'
  }
};
```

### TypeScript Plugin

```json
// tsconfig.json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "fsd-imports",
        "enforcePublicAPI": true,
        "allowBypassPatterns": ["**/lib/**", "**/constants/**", "**/types/**"],
        "requireIndexExports": true
      }
    ]
  }
}
```

### CI/CD Pipeline

```yaml
# .github/workflows/fsd-validation.yml
name: FSD Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Collect FSD Metrics
        run: npx tsx .opencode/plugins/fsd-metrics-collector.ts
      
      - name: Check Layer Purity
        run: |
          METRICS=$(npx tsx .opencode/plugins/fsd-metrics-collector.ts --json)
          PURITY=$(echo $METRICS | jq '.layerPurity.score')
          if (( $(echo "$PURITY < 95" | bc -l) )); then
            echo "❌ Layer purity below 95%"
            exit 1
          fi
      
      - name: Check Circular Dependencies
        run: npx madge --circular src/
```

### Weekly Report

```yaml
# .github/workflows/fsd-report.yml
name: Weekly FSD Report

on:
  schedule:
    - cron: '0 0 * * 0'

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate FSD Report
        run: npx tsx .opencode/plugins/fsd-metrics-collector.ts --report
      
      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: fsd-report
          path: .opencode/logs/fsd-metrics.md
```

## 🔧 FSD AUTOMATION

### 1. PRE-COMMIT CHECKS:

- 🔍 **Layer dependency** validation
- 🔍 **Circular dependency** detection
- 🔍 **Public API** compliance checking
- 🔍 **File placement** verification

### 2. CI/CD PIPELINE:

- ✅ **Architecture** quality gates
- ✅ **Dependency graph** analysis
- ✅ **Bundle size** monitoring
- ✅ **Refactoring readiness** assessment

### 3. QUALITY GATES:

- 📊 **Layer purity** enforcement
- 📊 **Circular dependency** prevention
- 📊 **Public API** stability monitoring
- 📊 **Architecture debt** tracking

## 🚨 CRITICAL FSD PATTERNS

### 1. ARCHITECTURE DESIGN:

- 🏗️ **Clean separation** of concerns
- 🏗️ **Proper layer** responsibilities
- 🏗️ **Stable public** APIs
- 🏗️ **Future-proof** structure

### 2. CODE ORGANIZATION:

- 📁 **Logical grouping** of functionality
- 📁 **Consistent naming** conventions
- 📁 **Proper file** structure
- 📁 **Maintainable** codebase

### 3. DEPENDENCY MANAGEMENT:

- 🔄 **Minimal dependencies** between layers
- 🔄 **Clear data flow** patterns
- 🔄 **Proper abstraction** levels
- 🔄 **Clean interface** definitions

## 📊 FSD QUALITY GATES

### ✅ AUTOMATIC APPROVAL:

- Zero circular dependencies
- 100% layer compliance
- Clean public APIs
- Proper file placement

### ❌ AUTOMATIC REJECTION:

- Any circular dependency
- Layer violation detected
- Public API misuse
- Incorrect file placement

---

**FSD Rules enforced at Senior SaaS Advanced level** 🏗️
