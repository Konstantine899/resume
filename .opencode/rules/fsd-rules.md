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

## 🎯 FSD METRICS (SaaS Advanced)

### 1. ARCHITECTURE METRICS:

- **Layer Purity**: > 95% clean layer dependencies
- **Circular Dependencies**: 0 circular imports
- **Public API Quality**: 100% proper exports
- **File Placement**: 100% correct file location

### 2. CODE QUALITY METRICS:

- **Component Cohesion**: > 90% single responsibility
- **Dependency Depth**: < 3 levels deep
- **Interface Stability**: > 95% stable APIs
- **Refactoring Cost**: < 10% code change for feature addition

### 3. PERFORMANCE METRICS:

- **Build Time**: < 30s for full build
- **Bundle Size**: < 100kb per chunk
- **Tree Shaking**: > 90% dead code elimination
- **Hot Reload**: < 2s for component changes

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
