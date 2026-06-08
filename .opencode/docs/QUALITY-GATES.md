# 🚪 Quality Gates — Автоматическая проверка качества

> **Статус:** ✅ Phase 2, Step 1 Complete  
> **Версия:** 1.0.0  
> **Последнее обновление:** 2026-06-08

---

## 📋 Что такое Quality Gates

**Quality Gates** — это автоматические проверки качества кода, которые выполняются:

1. **Перед коммитом** — базовая проверка
2. **Перед мержем** — комплексная проверка
3. **Перед деплоем** — production готовность

Каждая проверка:

- Выполняется специализированным агентом
- Имеет критерии успеха/провала
- Может блокировать процесс
- Генерирует отчёт с рекомендациями

---

## 🎯 Типы Quality Gates

### 1️⃣ Pre-Commit Gate

**Базовая проверка перед коммитом**

| Check             | Агент            | Blocking | Критерии                          |
| ----------------- | ---------------- | -------- | --------------------------------- |
| FSD Validation    | fsd-validator    | ✅ Да    | 100% compliance, no circular deps |
| Code Review       | review           | ✅ Да    | Score ≥ 7, no critical issues     |
| Test Coverage     | test-generation  | ✅ Да    | Coverage ≥ 90%                    |
| Security Scan     | review           | ✅ Да    | No vulnerabilities                |
| Performance Check | performance-test | ❌ Нет   | Render < 16ms, bundle < 50kb      |
| Style Validation  | style            | ❌ Нет   | SASS architecture, CSS modules    |

**Время выполнения:** ~3 мин

**Пример:**

```bash
$ git commit -m "Add Header component"

🚪 Running Pre-Commit Quality Gate...
├─ ✅ FSD Validation (1.2s) — 100% compliant
├─ ✅ Code Review (4.1s) — Score: 8.5/10
├─ ✅ Test Coverage (3.8s) — 87% covered
├─ ✅ Security Scan (3.1s) — No issues
├─ ⚠️ Performance (2.8s) — Bundle: 52kb (warning)
└─ ⚠️ Style (1.5s) — Minor issues

✅ Quality Gate PASSED (2 warnings)
```

---

### 2️⃣ Pre-Merge Gate

**Комплексная проверка перед мержем**

| Check               | Агент            | Blocking | Критерии                            |
| ------------------- | ---------------- | -------- | ----------------------------------- |
| Full Review         | review           | ✅ Да    | Score ≥ 8, no critical/major issues |
| Integration Tests   | integration-test | ✅ Да    | Pass rate 100%, coverage 95%        |
| Architecture Review | fsd-validator    | ✅ Да    | Score ≥ 9, 100% compliance          |
| Security Audit      | review           | ✅ Да    | Security score ≥ 9                  |
| Performance Budget  | performance-test | ✅ Да    | Bundle < 500kb, load < 3s           |

**Время выполнения:** ~5 мин

**Пример:**

```bash
$ git merge feature/header-component

🚪 Running Pre-Merge Quality Gate...
├─ ✅ Full Review (5.2s) — Score: 8.5/10
├─ ✅ Integration Tests (45.3s) — 100% pass, 96% coverage
├─ ✅ Architecture Review (3.1s) — Score: 9/10
├─ ✅ Security Audit (4.8s) — Score: 9.5/10
└─ ✅ Performance Budget (3.2s) — All budgets met

✅ Quality Gate PASSED — Ready to merge
```

---

### 3️⃣ Pre-Deploy Gate

**Production готовность**

| Check                  | Агент            | Blocking | Критерии                          |
| ---------------------- | ---------------- | -------- | --------------------------------- |
| Production Review      | review           | ✅ Да    | Production ready, no console.logs |
| E2E Tests              | integration-test | ✅ Да    | Pass rate 100%, critical flows    |
| Security Final         | review           | ✅ Да    | No vulnerabilities, env check     |
| Performance Production | performance-test | ✅ Да    | Lighthouse > 90, CWV good         |

**Время выполнения:** ~5 мин

**Пример:**

```bash
$ npm run deploy

🚪 Running Pre-Deploy Quality Gate...
├─ ✅ Production Review (4.2s) — Ready
├─ ✅ E2E Tests (62.1s) — 100% pass, all critical flows
├─ ✅ Security Final (3.8s) — Clean
└─ ✅ Performance (4.5s) — Lighthouse: 94

✅ Quality Gate PASSED — Deploying to production
```

---

## 🔧 Конфигурация

### quality-gates.jsonc

```jsonc
{
  "gates": {
    "pre-commit": {
      /* ... */
    },
    "pre-merge": {
      /* ... */
    },
    "pre-deploy": {
      /* ... */
    },
  },
  "autoFix": {
    "enabled": true,
    "maxIterations": 3,
    "fixableIssues": ["style", "types", "minor-bugs"],
  },
  "reporting": {
    "enabled": true,
    "format": "markdown",
    "outputFile": ".opencode/logs/quality-report.md",
  },
}
```

---

## 🚀 Как использовать

### Автоматический запуск

```bash
# Pre-commit запускается автоматически при git commit
git commit -m "Add feature"

# Pre-merge запускается при git merge
git merge feature-branch

# Pre-deploy запускается при deploy
npm run deploy
```

### Ручной запуск

```bash
# Запустить конкретный gate
/task quality-gate pre-commit
/task quality-gate pre-merge
/task quality-gate pre-deploy

# Запустить конкретную проверку
/task quality-check fsd-validation
/task quality-check security-scan
```

### В пайплайнах

```bash
# Quality gate автоматически включается в пайплайны
"Создай компонент"
→ create-component pipeline
→ pre-commit quality gate (автоматически)
```

---

## 📊 Критерии проверок

### FSD Validation

| Критерий              | Требование | Blocking |
| --------------------- | ---------- | -------- |
| Layer Compliance      | 100%       | ✅ Да    |
| Circular Dependencies | 0          | ✅ Да    |
| Public API Compliance | 100%       | ✅ Да    |

### Code Review

| Критерий        | Требование                        | Blocking |
| --------------- | --------------------------------- | -------- |
| Min Score       | ≥ 7 (pre-commit), ≥ 8 (pre-merge) | ✅ Да    |
| Critical Issues | 0                                 | ✅ Да    |
| Security Issues | 0                                 | ✅ Да    |

### Test Coverage

| Критерий       | Требование                            | Blocking |
| -------------- | ------------------------------------- | -------- |
| Min Coverage   | ≥ 90% (pre-commit), ≥ 95% (pre-merge) | ✅ Да    |
| Required Tests | render, interaction, edge-cases       | ✅ Да    |

### Security Scan

| Критерий        | Требование | Blocking |
| --------------- | ---------- | -------- |
| Vulnerabilities | 0          | ✅ Да    |
| XSS Risks       | 0          | ✅ Да    |
| Auth Issues     | 0          | ✅ Да    |

### Performance

| Критерий    | Требование                        | Blocking           |
| ----------- | --------------------------------- | ------------------ |
| Render Time | < 16ms                            | ❌ Нет (warning)   |
| Bundle Size | < 50kb (component), < 500kb (app) | ⚠️ Зависит         |
| Load Time   | < 3s                              | ✅ Да (pre-deploy) |

---

## 🔄 Auto-Fix

**Автоматическое исправление проблем**

### Что исправляется автоматически:

```json
"fixableIssues": [
  "style",        // Стилевые проблемы
  "types",        // Типы TypeScript
  "minor-bugs"    // Мелкие баги
]
```

### Что НЕ исправляется автоматически:

```json
"skipFixFor": [
  "security",     // Проблемы безопасности
  "architecture", // Архитектурные проблемы
  "major-bugs"   // Серьёзные баги
]
```

### Процесс Auto-Fix:

```
❌ Check failed
    ↓
🔄 Auto-fix attempt 1
    ↓
✅ Check passed → Continue
    ↓
❌ Check failed → Auto-fix attempt 2
    ↓
❌ Check failed → Auto-fix attempt 3
    ↓
❌ Check failed → Block (manual fix required)
```

**Пример:**

```bash
$ git commit -m "Add component"

🚪 Pre-Commit Gate...
├─ ❌ Code Review (Score: 6.5/10)
│   └─ Issue: Missing types
├─ 🔄 Auto-fix attempt 1...
├─ ✅ Code Review (Score: 7.5/10)
└─ ✅ All checks passed

✅ Committed with auto-fix
```

---

## 📈 Отчётность

### Формат отчёта

```markdown
# Quality Gate Report

**Gate:** Pre-Commit  
**Date:** 2026-06-08T10:30:00Z  
**Result:** ✅ PASSED (2 warnings)

## Summary

| Check          | Status     | Duration | Score        |
| -------------- | ---------- | -------- | ------------ |
| FSD Validation | ✅ Pass    | 1.2s     | 100%         |
| Code Review    | ✅ Pass    | 4.1s     | 8.5/10       |
| Test Coverage  | ✅ Pass    | 3.8s     | 87%          |
| Security Scan  | ✅ Pass    | 3.1s     | Clean        |
| Performance    | ⚠️ Warning | 2.8s     | 52kb         |
| Style          | ⚠️ Warning | 1.5s     | Minor issues |

## Warnings

### Performance

- Bundle size: 52kb (limit: 50kb)
- Suggestion: Code splitting

### Style

- Minor naming inconsistency
- Suggestion: Use camelCase

## Auto-Fix Applied

- Fixed: Missing types in Header.tsx
- Iterations: 1

## Recommendations

1. Consider code splitting for larger bundles
2. Fix naming convention in next iteration
```

---

## 🧪 Примеры использования

### Пример 1: Успешный коммит

```bash
$ git commit -m "Add Login form"

🚪 Running Pre-Commit Quality Gate...
├─ ✅ FSD Validation (1.1s)
├─ ✅ Code Review (3.8s) — Score: 8/10
├─ ✅ Test Coverage (3.2s) — 92%
├─ ✅ Security Scan (2.9s)
├─ ✅ Performance (2.5s)
└─ ✅ Style (1.3s)

✅ Quality Gate PASSED
✅ Committed successfully
```

### Пример 2: Коммит с auto-fix

```bash
$ git commit -m "Update component"

🚪 Running Pre-Commit Quality Gate...
├─ ✅ FSD Validation (1.2s)
├─ ❌ Code Review (4.1s) — Score: 6/10
│   └─ Issue: Missing PropTypes
├─ 🔄 Auto-fix attempt 1...
├─ ✅ Code Review (2.3s) — Score: 7.5/10
├─ ✅ Test Coverage (3.5s) — 91%
└─ ✅ All other checks passed

✅ Quality Gate PASSED (auto-fix applied)
✅ Committed successfully
```

### Пример 3: Блокировка коммита

```bash
$ git commit -m "Add feature"

🚪 Running Pre-Commit Quality Gate...
├─ ✅ FSD Validation (1.1s)
├─ ❌ Code Review (4.2s) — Score: 5/10
│   └─ Critical: Security vulnerability
├─ 🔄 Auto-fix attempt 1...
├─ ❌ Code Review (2.8s) — Still 5/10
├─ 🔄 Auto-fix attempt 2...
├─ ❌ Code Review (2.9s) — Still 5/10
├─ 🔄 Auto-fix attempt 3...
├─ ❌ Code Review (3.1s) — Still 5/10
└─ ❌ Quality Gate FAILED

❌ Commit blocked — Manual fix required
   Issue: Security vulnerability (XSS risk)
   File: src/components/Form.tsx:45
   Fix: Sanitize user input
```

---

## 📊 Метрики

### Логи

```bash
# Путь к логам
.opencode/logs/quality-gates.log

# Формат
{
  "timestamp": "2026-06-08T11:00:00Z",
  "gate": "pre-commit",
  "check": "code-review",
  "status": "pass",
  "score": 8.5,
  "duration": 4.1,
  "autoFix": false
}
```

### Метрики для мониторинга

| Метрика               | Описание                  | Цель             |
| --------------------- | ------------------------- | ---------------- |
| `gate.passRate`       | Процент успешных проверок | > 90%            |
| `gate.failReasons`    | Причины провалов          | Track top 3      |
| `check.latency`       | Время проверки            | Зависит от check |
| `autoFix.successRate` | Процент успешных auto-fix | > 70%            |
| `autoFix.iterations`  | Среднее число попыток     | < 2              |

---

## 🎯 Best Practices

### ✅ Делай

- Запускай pre-commit перед каждым коммитом
- Исправляй warnings вовремя
- Смотри отчёты quality gate
- Настрой auto-fix для рутинных проблем

### ❌ Не делай

- Не пропускай quality gates
- Не игнорируй security warnings
- Не отключай blocking checks
- Не коммить с failing gates

---

## 🐛 Troubleshooting

### Проблема: Quality gate падает постоянно

**Решение:**

1. Посмотри отчёт: `.opencode/logs/quality-report.md`
2. Исправь критические проблемы
3. Запусти повторно: `/task quality-gate pre-commit`

### Проблема: Auto-fix не помогает

**Решение:**

1. Проверь тип проблемы (не все исправляются автоматически)
2. Исправь вручную
3. Обнови критерии в `quality-gates.jsonc`

### Проблема: Слишком долго выполняется

**Решение:**

1. Включи `parallelChecks: true`
2. Уменьши timeout
3. Отключи некритичные проверки

---

## 📝 Changelog

### v1.0.0 (2026-06-08)

- ✅ 3 quality gates (pre-commit, pre-merge, pre-deploy)
- ✅ 6 проверок для pre-commit
- ✅ 5 проверок для pre-merge
- ✅ 4 проверки для pre-deploy
- ✅ Auto-fix система
- ✅ Отчётность в Markdown
- ✅ Логирование метрик

### Planned (v1.1.0)

- ⏳ Custom gates
- ⏳ Advanced auto-fix
- ⏳ Quality dashboard
- ⏳ Historical trends

---

## 🔗 Связанные документы

- [quality-gates.jsonc](./quality-gates.jsonc) — Конфиг проверок
- [pipelines.jsonc](./pipelines.jsonc) — Пайплайны
- [orchestrator.jsonc](./orchestrator.jsonc) — Роутинг моделей

---

## 👤 Автор

Создано в рамках настройки Senior-level Multi-Agent Orchestration System
