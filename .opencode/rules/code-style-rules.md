# 🎨 Code Style Rules - Senior Frontend Architect Level

## 🚫 ABSOLUTE STYLE BANS (Auto-fail)

### 1. TYPE SAFETY:

- ❌ **NO** `any` types - only strict typing
- ❌ **NO** implicit any - explicit type annotations
- ❌ **NO** unused variables (except \_ prefix)

### 2. REACT PATTERNS:

- ❌ **NO** missing dependency arrays in useEffect
- ❌ **NO** direct state mutations
- ❌ **NO** unhandled errors in components
- ❌ **NO** missing error boundaries

### 3. CODE ORGANIZATION:

- ❌ **NO** !important in CSS/SCSS
- ❌ **NO** global styles (modules only)
- ❌ **NO** non-semantic HTML tags (div instead button)

## ⚠️ STYLE REQUIREMENTS (Must Have)

### 1. TYPE SAFETY:

- ✅ **STRICT** TypeScript configuration
- ✅ **EXPLICIT** type annotations
- ✅ **PROPER** interface definitions
- ✅ **COMPREHENSIVE** type coverage

### 2. REACT BEST PRACTICES:

- ✅ **CORRECT** hooks usage patterns
- ✅ **PROPER** memoization strategy
- ✅ **COMPLETE** error handling
- ✅ **OPTIMAL** re-render patterns

### 3. CODE QUALITY:

- ✅ **CLEAN** and readable code structure
- ✅ **MEANINGFUL** variable and function names
- ✅ **CONSISTENT** formatting and indentation
- ✅ **PROPER** comments and documentation

## 🎯 STYLE METRICS (SaaS Advanced)

### 1. CODE QUALITY METRICS:

- **Type Coverage**: 100% type safety
- **Complexity**: Cyclomatic complexity < 10
- **Duplication**: Code duplication < 5%
- **Readability**: ESLint score > 90%

### 2. PERFORMANCE METRICS:

- **Render Time**: < 16ms per component
- **Bundle Size**: < 100kb per chunk
- **Memory Usage**: < 10MB increase per operation
- **Hot Reload**: < 2s for changes

### 3. MAINTENANCE METRICS:

- **Tech Debt**: < 5% of codebase
- **Refactoring Cost**: < 15% change for features
- **Onboarding Time**: < 1 week for new developers
- **Bug Rate**: < 1 bug per 1000 lines

## 🔧 STYLE AUTOMATION

### 1. PRE-COMMIT CHECKS:

- 🔍 **ESLint** validation with strict rules
- 🔍 **TypeScript** compilation checks
- 🔍 **Prettier** formatting verification
- 🔍 **Stylelint** CSS quality checks

### 2. CI/CD PIPELINE:

- ✅ **Automated** code quality gates
- ✅ **Performance** budgeting
- ✅ **Security** scanning
- ✅ **Documentation** generation

### 3. QUALITY GATES:

- 📊 **Zero** linting errors policy
- 📊 **100%** type coverage requirement
- 📊 **Performance** budget compliance
- 📊 **Security** vulnerability prevention

## 🚨 CRITICAL STYLE PATTERNS

### 1. TYPE SAFETY PATTERNS:

- 🛡️ **Strict** TypeScript configuration
- 🛡️ **Explicit** type annotations
- 🛡️ **Comprehensive** interface definitions
- 🛡️ **Runtime** type validation

### 2. REACT OPTIMIZATION PATTERNS:

- ⚡ **Proper** memoization strategy
- ⚡ **Efficient** re-render patterns
- ⚡ **Optimal** hook usage
- ⚡ **Clean** component structure

### 3. CODE ORGANIZATION PATTERNS:

- 📁 **Logical** file structure
- 📁 **Consistent** naming conventions
- 📁 **Modular** component design
- 📁 **Maintainable** code architecture

## 📊 STYLE QUALITY GATES

### ✅ AUTOMATIC APPROVAL:

- Zero linting errors
- 100% type coverage
- Performance budgets met
- Security scans clean

### ❌ AUTOMATIC REJECTION:

- Any linting errors
- Missing type annotations
- Performance budget exceeded
- Security vulnerabilities

---

**Code Style Rules enforced at Senior SaaS Advanced level** 🎨
