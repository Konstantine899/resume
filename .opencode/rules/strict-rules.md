# Strict Validation Rules v2.0 — Автоматический Enforcement

**Статус:** ✅ Active  
**Версия:** 2.0.0  
**Дата:** 2026-07-07  
**Реализация:** ESLint + lint-staged + CI/CD

---

## 🚫 ТИПЫ ДАННЫХ (Auto-fail):

| Правило | ESLint Rule | Уровень |
|---------|-------------|---------|
| ❌ `any` типы | `@typescript-eslint/no-explicit-any` | error |
| ❌ implicit any | `@typescript-eslint/no-implicit-any` | error |
| ❌ unused vars | `@typescript-eslint/no-unused-vars` | error |
| ❌ non-null assertion | `@typescript-eslint/no-non-null-assertion` | error |
| ❌ require() | `@typescript-eslint/no-var-requires` | error |

## 🚫 ARCHITECTURE (Auto-fail):

| Правило | ESLint Rule | Уровень |
|---------|-------------|---------|
| ❌ FSD violations | `fsd-imports/layer-dependency` | error |
| ❌ circular deps | `import/no-cycle` | error |
| ❌ default exports | `no-default-export` | error |
| ❌ implicit coercion | `no-implicit-coercion` | error |

## 🚫 REACT (Auto-fail):

| Правило | ESLint Rule | Уровень |
|---------|-------------|---------|
| ❌ missing deps | `react-hooks/exhaustive-deps` | error |
| ❌ rules of hooks | `react-hooks/rules-of-hooks` | error |
| ❌ state mutations | `no-param-reassign` | error |
| ❌ missing boundaries | `eslint-plugin-react-perf` | error |

## 🚫 SECURITY (Auto-fail):

| Правило | ESLint Rule | Уровень |
|---------|-------------|---------|
| ❌ console.log | `no-console` | error |
| ❌ eval() | `no-eval` | error |
| ❌ implied eval | `no-implied-eval` | error |
| ❌ new Function() | `no-new-func` | error |
| ❌ javascript: URLs | `no-script-url` | error |

## 🚫 PERFORMANCE (Auto-fail):

| Правило | Инструмент | Уровень |
|---------|------------|---------|
| ❌ memory leaks | `@testing-library/react` detectLeaks | error |
| ❌ unoptimized | ESLint + perf-budget | error |
| ❌ missing memo | `react-perf/no-missing-memo` | warn |

## 🚫 CODE STYLE (Auto-fail):

| Правило | ESLint Rule | Уровень |
|---------|-------------|---------|
| ❌ !important | `stylelint/no-important` | error |
| ❌ global styles | `stylelint/no-global-styles` | error |
| ❌ non-semantic HTML | `jsx-a11y/no-noninteractive-element` | error |

---

## ⚡ AUTOMATIC ENFORCEMENT PIPELINE

### 1. Pre-commit (lint-staged)

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --max-warnings 0",
      "prettier --write"
    ]
  }
}
```

**Блокирует коммит при:**
- Любом ESLint error
- Любом warning (max-warnings 0)
- TypeScript compilation errors

### 2. CI/CD Pipeline

```yaml
# .github/workflows/strict-validation.yml
name: Strict Validation

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Type Check (Strict)
        run: npm run type-check:strict
      
      - name: Lint (Strict)
        run: npm run lint:strict
      
      - name: Validate All
        run: npm run validate:strict
```

**Блокирует merge при:**
- Failed type check
- Any linting error
- Performance budget exceeded

### 3. NPM Scripts

```json
{
  "scripts": {
    "type-check:strict": "tsc --noEmit --maxNodeModuleJsDepth 0 --skipLibCheck false",
    "lint:strict": "eslint . --ext .ts,.tsx --max-warnings 0",
    "validate:strict": "npm run type-check:strict && npm run lint:strict"
  }
}
```

---

## 📊 Enforcement Flow

```
User makes change
       ↓
Pre-commit hook (lint-staged)
       ↓
eslint --max-warnings 0
       ↓
Pass? → Commit created
Fail? → Commit blocked + error message
       ↓
CI Pipeline (on push)
       ↓
type-check:strict + lint:strict
       ↓
Pass? → Merge allowed
Fail? → Merge blocked + PR comment
```

---

## 🔧 Конфигурация

### eslint.config.js

```javascript
const strictRules = {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-implicit-any': 'error',
  'no-console': 'error',
  'no-eval': 'error',
  'no-default-export': 'error',
  // ... (полный список в eslint.config.js)
};

export default tseslint.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: strictRules,
  }
);
```

### tsconfig.json (Strict Mode)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false
  }
}
```

---

## 🎯 Success Criteria

```
✅ 0 any типов в коде
✅ 0 implicit any в коде
✅ 0 console.log в production коде
✅ 0 default exports из public API
✅ 0 FSD layer violations
✅ 0 circular dependencies
✅ 100% pre-commit enforcement
✅ 100% CI enforcement
```

---

## 📚 Связанные документы

- [[code-style-rules.md]] — Code style правила
- [[fsd-rules.md]] — FSD архитектура
- [[guard-rules.md]] — Guard Agent безопасность
- [[eslint.config.js]] — ESLint конфигурация
- [[tsconfig.json]] — TypeScript конфигурация

---

**Strict Rules v2.0 enforced at Senior Security Architect Level** 🛡️
