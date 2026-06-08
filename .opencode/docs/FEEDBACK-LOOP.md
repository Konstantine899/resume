# 🔁 Feedback Loop — Обучение на ошибках

> **Статус:** ✅ Phase 2, Step 3 Complete  
> **Версия:** 1.0.0  
> **Последнее обновление:** 2026-06-08

---

## 📋 Что такое Feedback Loop

**Feedback Loop** — это система автоматического обучения на ошибках, которая:

1. **Анализирует ошибки** из выполненных задач
2. **Генерирует правила** для предотвращения повторения
3. **Предлагает улучшения** на основе паттернов
4. **Отслеживает прогресс** во времени

---

## 🎯 Источники обучения

### 1️⃣ Mistakes (Ошибки)

**Автоматическое применение изученных ошибок**

```json
{
  "mistakes": {
    "enabled": true,
    "source": ".opencode/context/project-memory.json",
    "category": "mistakes",
    "autoApply": true,
    "ttl": 604800
  }
}
```

**Пример:**

```
Ошибка: Import violation (features → widgets)
↓
Запомнено в context
↓
Применено при следующей задаче
↓
Предотвращено повторение
```

---

### 2️⃣ Task Results (Результаты задач)

**Анализ завершённых задач**

```json
{
  "taskResults": {
    "enabled": true,
    "source": ".opencode/context/task-context.json",
    "analyzePatterns": true
  }
}
```

**Что анализируется:**

- Успешные паттерны
- Частые ошибки
- Время выполнения
- Используемые модели

---

### 3️⃣ Quality Gates (Проверки качества)

**Парсинг провалов quality gates**

```json
{
  "qualityGates": {
    "enabled": true,
    "source": ".opencode/logs/quality-gates.log",
    "parseFailures": true
  }
}
```

**Пример:**

```
Quality Gate Failed: Security vulnerability
↓
Анализ причины
↓
Генерация правила
↓
Предотвращение в будущем
```

---

### 4️⃣ Manual Feedback (Ручная обратная связь)

**Приоритетные ручные правки**

```json
{
  "manualFeedback": {
    "enabled": true,
    "source": ".opencode/feedback/manual.json",
    "priority": "high"
  }
}
```

**Пример:**

```json
{
  "type": "correction",
  "description": "Не использовать var, только let/const",
  "priority": "high",
  "autoApply": true
}
```

---

## 🔍 Анализ паттернов

### Detect Recurring Issues

**Поиск повторяющихся проблем**

```
Task 1: Missing types → Fixed
Task 5: Missing types → Fixed
Task 8: Missing types → Fixed
↓
Pattern detected: "Missing types in 30% of tasks"
↓
Rule generated: "Always include types"
```

---

### Detect Common Mistakes

**Анализ частых ошибок**

```
Error analysis (last 100 tasks):
- 25%: Type errors
- 20%: FSD violations
- 15%: Security issues
- 10%: Performance problems
- 30%: Other

↓

Focus areas identified:
1. Improve type checking
2.加强 FSD validation
3. Enhance security scans
```

---

### Detect Performance Bottlenecks

**Поиск узких мест**

```
Task duration analysis:
- Code review: avg 45s (target: 30s) ⚠️
- Test generation: avg 60s (target: 45s) ⚠️
- Component creation: avg 30s (target: 30s) ✅

↓

Optimization suggestions:
1. Parallel code review checks
2. Cache test templates
```

---

### Detect Quality Trends

**Отслеживание трендов качества**

```
Quality Score over time:
Week 1: 7.5/10
Week 2: 7.8/10 ↑
Week 3: 8.2/10 ↑
Week 4: 8.5/10 ↑

↓

Trend: Improving (+1.0 in 4 weeks)
Effectiveness: High
```

---

## 📊 Метрики обучения

| Метрика              | Описание               | Цель        |
| -------------------- | ---------------------- | ----------- |
| `learnedMistakes`    | Запомнено ошибок       | > 10/неделю |
| `generatedRules`     | Сгенерировано правил   | > 5/неделю  |
| `appliedSuggestions` | Применено советов      | > 20/неделю |
| `improvementRate`    | Улучшение качества     | > 5%/месяц  |
| `recurringIssueRate` | Повторяющиеся проблемы | < 10%       |

---

## 🎯 Авто-улучшения

### Generate Rules

**Автоматическая генерация правил**

```json
{
  "ruleGeneration": {
    "enabled": true,
    "outputPath": ".opencode/rules/auto-generated/",
    "reviewRequired": true,
    "autoEnable": false
  }
}
```

**Пример сгенерированного правила:**

````markdown
# Auto-Generated Rule: No Var

**Type:** Code Style  
**Priority:** High  
**Generated:** 2026-06-08  
**Source:** Recurring issue detection

## Rule

❌ Don't use `var`
✅ Use `let` or `const`

## Reason

Detected in 15% of tasks:

- Hoisting issues
- Scope confusion
- Modern standard is let/const

## Examples

❌ Bad:

```ts
var count = 0;
```
````

✅ Good:

```ts
const count = 0;
```

````

---

### Update Patterns

**Обновление паттернов кода**

```json
{
  "autoImprovement": {
    "updatePatterns": true,
    "suggestFixes": true,
    "autoApplyFixes": false,
    "requireApproval": true
  }
}
````

**Пример:**

```
Old pattern: Component without types
↓
Analysis: 80% of components have types
↓
New pattern: Component with types (recommended)
↓
Suggestion applied to new components
```

---

### Suggest Fixes

**Предложения по улучшению**

**Типы советов:**

- `best-practice` — Лучшие практики
- `performance-tip` — Советы по производительности
- `security-warning` — Предупреждения безопасности
- `architecture-improvement` — Улучшения архитектуры
- `code-style-suggestion` — Советы по стилю

**Пример:**

```bash
$ "Создай компонент"

💡 Suggestion detected:
  Type: Performance Tip
  Message: Consider React.memo for this component
  Reason: Component re-renders frequently
  Apply? (y/n)
```

---

## 📈 Отчётность

### Weekly Feedback Report

```markdown
# Feedback Loop Report

**Period:** 2026-06-01 — 2026-06-08  
**Generated:** 2026-06-08T12:00:00Z

## Summary

| Metric              | Value  | Change |
| ------------------- | ------ | ------ |
| Tasks Completed     | 47     | +12%   |
| Mistakes Learned    | 15     | +5     |
| Rules Generated     | 7      | +3     |
| Suggestions Applied | 28     | +8     |
| Quality Score       | 8.5/10 | +0.3   |

## Top Mistakes (This Week)

1. Missing types (8 occurrences)
   - Rule generated: "Always include types"
   - Status: ✅ Active

2. FSD import violation (5 occurrences)
   - Rule generated: "Check imports before commit"
   - Status: ✅ Active

3. Security warning (3 occurrences)
   - Rule generated: "Sanitize user input"
   - Status: ✅ Active

## Generated Rules

| Rule           | Type         | Status            |
| -------------- | ------------ | ----------------- |
| No Var         | Code Style   | ✅ Active         |
| Always Types   | Code Quality | ✅ Active         |
| FSD Imports    | Architecture | ✅ Active         |
| Security First | Security     | ⏳ Pending Review |

## Quality Trends
```

Quality Score Over Time:
8.0 ┤ ●
│ ●
7.5 ┤ ●
│ ●
7.0 ┤ ●
└────────────────────────
W1 W2 W3 W4

```

## Recommendations

1. Review pending security rule
2. Apply performance suggestions
3. Continue type coverage improvements
```

---

## 🧪 Примеры использования

### Пример 1: Обучение на ошибке

```bash
$ "Исправь баг"

❌ Bug fix failed: Type mismatch
↓
📝 Mistake recorded:
  Type: Type Error
  File: src/components/Form.tsx
  Issue: Missing type annotation
↓
✅ Future tasks will check types automatically
```

### Пример 2: Генерация правила

```bash
$ Analysis complete (100 tasks)

📊 Pattern detected:
  Issue: Missing PropTypes (25% of components)
  Impact: Runtime type errors
  Solution: Always include PropTypes

📝 Rule generated:
  Name: Always PropTypes
  Path: .opencode/rules/auto-generated/
  Status: Pending review

✅ Review and enable rule:
  /task review-rule always-prop-types
```

### Пример 3: Предложение улучшения

```bash
$ "Создай компонент"

💡 Suggestion:
  Type: Best Practice
  Message: Add displayName for debugging
  Reason: Improves React DevTools experience
  Confidence: 95%

  Apply? (y/n) y

✅ Component created with displayName
```

---

## 🎯 Best Practices

### ✅ Делай

- Регулярно смотри feedback reports
- Review сгенерированные правила
- Применяй советы по улучшению
- Отмечай ручные правки

### ❌ Не делай

- Не игнорируй recurring issues
- Не отключай auto-learning
- Не пропускай review правил
- Не отклоняй все советы

---

## 📝 Changelog

### v1.0.0 (2026-06-08)

- ✅ 4 источника обучения
- ✅ Анализ паттернов
- ✅ Авто-генерация правил
- ✅ Система советов
- ✅ Weekly отчёты
- ✅ Метрики обучения

### Planned (v1.1.0)

- ⏳ ML-based pattern detection
- ⏳ Advanced analytics
- ⏳ Learning dashboard
- ⏳ Predictive suggestions

---

## 🔗 Связанные документы

- [feedback-loop.jsonc](./feedback-loop.jsonc) — Конфиг обучения
- [context.jsonc](./context.jsonc) — Контекст
- [quality-gates.jsonc](./quality-gates.jsonc) — Quality gates

---

## 👤 Автор

Создано в рамках настройки Senior-level Multi-Agent Orchestration System
