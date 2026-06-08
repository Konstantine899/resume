# 🔄 Agent Pipelines — Автоматические цепочки задач

> **Статус:** ✅ Phase 1, Step 2 Complete  
> **Версия:** 1.0.0  
> **Последнее обновление:** 2026-06-08

---

## 📋 Что такое пайплайн

**Пайплайн** — это автоматическая последовательность шагов, где каждый шаг:

1. Выполняется определённым агентом
2. Использует результат предыдущего шага
3. Имеет свои критерии успеха/провала
4. Может выполняться параллельно с другими

---

## 🎯 Доступные пайплайны

| Пайплайн             | Триггеры              | Шагов | Время  | Когда использовать |
| -------------------- | --------------------- | ----- | ------ | ------------------ |
| **create-component** | "создай компонент"    | 6     | ~3 мин | Новый UI компонент |
| **code-review**      | "проверь код"         | 5     | ~2 мин | Ревью кода         |
| **fix-bug**          | "исправь баг"         | 4     | ~2 мин | Исправление ошибки |
| **refactor**         | "рефакторинг"         | 5     | ~3 мин | Улучшение кода     |
| **integration-test** | "интеграционный тест" | 5     | ~3 мин | Тестирование       |

---

## 📊 Детальное описание пайплайнов

### 1️⃣ create-component

**Полный цикл создания UI компонента**

```
┌─────────────────────────────────────────────────────────────────┐
│  create-component Pipeline                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: ui-agent (60s)                                        │
│  ├─ Создание .tsx файла с типами                               │
│  ├─ Создание .module.scss стилей                               │
│  └─ Создание .test.tsx тестов                                  │
│           ↓                                                     │
│  Step 2: review-agent (45s)                                    │
│  ├─ Code review                                                  │
│  ├─ Проверка минимального скора (7/10)                         │
│  └─ Блокировка при security/types/architecture проблемах       │
│           ↓                                                     │
│  Step 3: fsd-validator (30s)                                   │
│  ├─ Валидация слоёв FSD                                        │
│  ├─ Проверка импортов                                          │
│  └─ Проверка структуры                                         │
│           ↓                                                     │
│  Step 4: test-generation (45s)                                 │
│  ├─ Создание Vitest тестов                                     │
│  ├─ Покрытие > 80%                                             │
│  └─ Тесты: render + interaction + edge-cases                   │
│           ↓                                                     │
│  Step 5: storybook-test (30s)                                  │
│  ├─ Создание stories                                           │
│  ├─ Default + Variants + Interaction                           │
│  └─ Accessibility check                                        │
│           ↓                                                     │
│  Step 6: orchestrator-summary (10s)                            │
│  └─ Итоговый отчёт                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Пример использования:**

```bash
"Создай компонент кнопки"
"create Button component"
"new component Header"
```

**Результат:**

```
ComponentName/
├── ComponentName.tsx      # Компонент
├── ComponentName.module.scss  # Стили
├── ComponentName.test.tsx # Тесты
├── ComponentName.stories.tsx  # Stories
└── types.ts               # Типы
```

---

### 2️⃣ code-review

**Комплексная проверка кода**

```
┌─────────────────────────────────────────────────────────────────┐
│  code-review Pipeline (Parallel)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: review (60s) — Основной ревью                         │
│  ├─ Bugs                                                         │
│  ├─ Performance                                                  │
│  └─ Readability                                                  │
│           ↓                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Parallel Group (45s)                                    │   │
│  │  ├─ Step 2: security-audit                              │   │
│  │  │   ├─ XSS                                               │   │
│  │  │   ├─ Injection                                         │   │
│  │  │   ├─ Auth                                              │   │
│  │  │   └─ Data leak                                         │   │
│  │  ├─ Step 3: performance-test                             │   │
│  │  │   ├─ Render time                                       │   │
│  │  │   ├─ Bundle size                                       │   │
│  │  │   └─ Memory                                            │   │
│  │  └─ Step 4: fsd-validator                                │   │
│  │      ├─ Layer compliance                                  │   │
│  │      ├─ Circular deps                                     │   │
│  │      └─ Public API                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│           ↓                                                     │
│  Step 5: orchestrator-report (15s)                             │
│  └─ Markdown отчёт со всеми находками                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Пример использования:**

```bash
"Проведи code review"
"review this code"
"проверь код в src/features/auth"
```

**Результат:**

```markdown
## Code Review Report

### Overall Score: 7.5/10

✅ Good:

- Clean code structure
- Good type coverage

⚠️ Warnings:

- Performance: useMemo missing
- Security: XSS risk in line 45

❌ Critical:

- FSD: Import violation (features → entities)
```

---

### 3️⃣ fix-bug

**Диагностика и исправление ошибки**

```
┌─────────────────────────────────────────────────────────────────┐
│  fix-bug Pipeline                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: diagnose (45s)                                        │
│  ├─ Анализ ошибки                                              │
│  ├─ Поиск корневой причины                                     │
│  └─ Output: diagnosis                                          │
│           ↓                                                     │
│  Step 2: fix (60s, retry x2)                                   │
│  ├─ Исправление ошибки                                         │
│  ├─ Input: diagnosis                                           │
│  └─ Retry при неудаче                                          │
│           ↓                                                     │
│  Step 3: verify (30s)                                          │
│  ├─ Проверка исправления                                       │
│  └─ Retry при неудаче                                          │
│           ↓                                                     │
│  Step 4: test-regression (30s)                                 │
│  ├─ Тест на регрессию                                          │
│  └─ Edge case проверка                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Пример использования:**

```bash
"Исправь баг с формой логина"
"fix bug in authentication"
"error when submitting form"
```

---

### 4️⃣ refactor

**Безопасный рефакторинг кода**

```
┌─────────────────────────────────────────────────────────────────┐
│  refactor Pipeline (with backup & rollback)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: analyze (45s)                                         │
│  ├─ Анализ технического долга                                  │
│  └─ Output: debt-report                                        │
│           ↓                                                     │
│  Step 2: plan (30s)                                            │
│  ├─ План рефакторинга                                          │
│  ├─ Input: debt-report                                         │
│  └─ Приоритизация                                              │
│           ↓                                                     │
│  Step 3: execute (90s, rollback on fail)                       │
│  ├─ Выполнение рефакторинга                                    │
│  ├─ Input: plan                                                │
│  └─ Preserve behavior                                          │
│           ↓                                                     │
│  Step 4: verify (30s, rollback on fail)                        │
│  ├─ Проверка архитектуры                                       │
│  └─ Input: refactor-result                                     │
│           ↓                                                     │
│  Step 5: test (45s)                                            │
│  ├─ Проверка существующих тестов                               │
│  └─ Input: refactor-result                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Пример использования:**

```bash
"Рефакторинг модуля авторизации"
"refactor user service"
"improve code quality in features"
```

---

### 5️⃣ integration-test

**Создание интеграционных тестов**

```
┌─────────────────────────────────────────────────────────────────┐
│  integration-test Pipeline                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: analyze (30s)                                         │
│  ├─ Анализ компонента/фичи                                     │
│  └─ Output: test-plan                                          │
│           ↓                                                     │
│  Step 2: setup-mocks (30s)                                     │
│  ├─ Настройка MSW моков                                        │
│  ├─ Input: test-plan                                           │
│  └─ API mocking                                                │
│           ↓                                                     │
│  Step 3: write (60s, retry x2)                                 │
│  ├─ Написание тестов                                           │
│  ├─ Input: test-plan + mocks                                   │
│  └─ Coverage > 90%                                             │
│           ↓                                                     │
│  Step 4: execute (90s)                                         │
│  ├─ Запуск тестов                                              │
│  ├─ Input: tests                                               │
│  └─ Отчёт о результатах                                        │
│           ↓                                                     │
│  Step 5: report (15s)                                          │
│  └─ Итоговый отчёт о тестах                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Пример использования:**

```bash
"Создай интеграционные тесты для формы"
"integration test for login form"
"e2e test for checkout flow"
```

---

## 🔧 Конфигурация

### pipelines.jsonc

```jsonc
{
  "pipelines": {
    "create-component": {
      /* ... */
    },
    "code-review": {
      /* ... */
    },
    "fix-bug": {
      /* ... */
    },
    "refactor": {
      /* ... */
    },
    "integration-test": {
      /* ... */
    },
  },
  "globalSettings": {
    "maxConcurrentPipelines": 2,
    "defaultTimeout": 300,
    "retryOnFail": true,
    "maxRetries": 2,
  },
}
```

---

## 🚀 Как использовать

### Автоматический запуск (по триггерам)

```bash
# Пайплайн сам определится по ключевым словам
"Создай компонент кнопки"        → create-component
"Проведи ревью кода"             → code-review
"Исправь ошибку в форме"         → fix-bug
"Рефакторинг сервиса"            → refactor
"Напиши интеграционные тесты"    → integration-test
```

### Явный запуск

```bash
# Через команду
/task pipeline create-component
/task pipeline code-review
/task pipeline fix-bug
```

### С параметрами

```bash
# Указать конкретный файл
"Создай компонент кнопки в src/shared/ui"

# Указать опции
"Code review с фокусом на безопасность"
"Refactor с созданием бэкапа"
```

---

## 📊 Статусы шагов

| Статус      | Значение       | Что делать           |
| ----------- | -------------- | -------------------- |
| ✅ Success  | Шаг выполнен   | Переход к следующему |
| ⚠️ Warning  | Предупреждение | Продолжение с логом  |
| ❌ Fail     | Ошибка         | Зависит от onFail    |
| ⏸️ Skipped  | Пропущено      | Условие не выполнено |
| 🔄 Retrying | Повтор         | Попытка retry        |
| 🔙 Rollback | Откат          | Возврат к бэкапу     |

---

## 🎯 OnFail стратегии

| Стратегия  | Поведение           | Когда             |
| ---------- | ------------------- | ----------------- |
| `stop`     | Остановить пайплайн | Критичные шаги    |
| `continue` | Продолжить          | Опциональные шаги |
| `retry`    | Повторить (max 2)   | Временные ошибки  |
| `rollback` | Откатить изменения  | Рефакторинг       |
| `never`    | Никогда не падать   | Финальные отчёты  |

---

## 📈 Мониторинг

### Логи

```bash
# Путь к логам
.opencode/logs/pipelines.log

# Формат
{
  "timestamp": "2026-06-08T11:00:00Z",
  "pipeline": "create-component",
  "step": "2-review",
  "agent": "review",
  "status": "success",
  "duration": 42.3,
  "result": { "score": 8.5 }
}
```

### Метрики

| Метрика                | Описание        | Цель            |
| ---------------------- | --------------- | --------------- |
| `pipeline.duration`    | Общее время     | < 5 мин         |
| `pipeline.successRate` | Процент успеха  | > 90%           |
| `step.latency`         | Время шага      | Зависит от шага |
| `retry.rate`           | Частота retry   | < 10%           |
| `rollback.rate`        | Частота откатов | < 5%            |

---

## 🧪 Примеры использования

### Пример 1: Создание компонента

```bash
$ "Создай компонент Header"

🚀 Pipeline: create-component
├─ ✅ Step 1: ui (2.3s) — Header.tsx создан
├─ ✅ Step 2: review (4.1s) — Score: 8.5/10
├─ ✅ Step 3: fsd-validator (1.2s) — FSD compliant
├─ ✅ Step 4: test-generation (3.8s) — Coverage: 87%
├─ ✅ Step 5: storybook-test (2.1s) — 3 stories
└─ ✅ Step 6: summary (0.5s) — Pipeline complete

📦 Created files:
  - src/shared/ui/Header/Header.tsx
  - src/shared/ui/Header/Header.module.scss
  - src/shared/ui/Header/Header.test.tsx
  - src/shared/ui/Header/Header.stories.tsx
  - src/shared/ui/Header/types.ts

⏱️ Total: 14.0s
```

### Пример 2: Code Review

```bash
$ "Проведи code review src/features/auth"

🚀 Pipeline: code-review
├─ ✅ Step 1: review (5.2s) — Score: 7/10
├─ ⚡ Parallel:
│   ├─ ✅ Step 2: security (3.1s) — 1 warning
│   ├─ ✅ Step 3: performance (2.8s) — OK
│   └─ ⚠️ Step 4: fsd-validator (1.5s) — 1 violation
└─ ✅ Step 5: report (0.8s) — Report generated

📋 Findings:
  ✅ 5 good practices
  ⚠️ 2 warnings
  ❌ 1 critical (FSD violation)

⏱️ Total: 9.4s (parallel execution)
```

### Пример 3: Исправление бага

```bash
$ "Исправь баг с формой логина"

🚀 Pipeline: fix-bug
├─ ✅ Step 1: diagnose (3.5s) — Root cause found
├─ ✅ Step 2: fix (5.2s) — Bug fixed
├─ ✅ Step 3: verify (2.1s) — Fix verified
└─ ✅ Step 4: test-regression (2.8s) — No regression

🐛 Bug fixed:
  - Issue: Form submission failed
  - Cause: Missing type check
  - Fix: Added validation

⏱️ Total: 13.6s
```

---

## 🐛 Troubleshooting

### Проблема: Пайплайн падает на шаге

**Решение:**

1. Проверь лог: `.opencode/logs/pipelines.log`
2. Посмотри `onFail` стратегию шага
3. Исправь причину ошибки
4. Запусти повторно

### Проблема: Слишком долго выполняется

**Решение:**

1. Проверь timeout в `pipelines.jsonc`
2. Включи parallel execution где возможно
3. Уменьши maxRetries
4. Используй более быструю модель

### Проблема: Параллельные шаги выполняются последовательно

**Решение:**

1. Проверь `settings.parallel: true`
2. Укажи `parallelGroups` явно
3. Убедись что шаги независимы

---

## 📝 Changelog

### v1.0.0 (2026-06-08)

- ✅ 5 базовых пайплайнов
- ✅ Sequential и Parallel выполнение
- ✅ OnFail стратегии
- ✅ Retry логика
- ✅ Rollback для рефакторинга
- ✅ Логирование и метрики

### Planned (v1.1.0)

- ⏳ Кастомные пайплайны
- ⏳ Conditional steps
- ⏳ Pipeline composer UI
- ⏳ Advanced metrics dashboard

---

## 🔗 Связанные документы

- [pipelines.jsonc](./pipelines.jsonc) — Конфиг пайплайнов
- [orchestrator.jsonc](./orchestrator.jsonc) — Роутинг моделей
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) — Документация оркестратора

---

## 👤 Автор

Создано в рамках настройки Senior-level Multi-Agent Orchestration System
