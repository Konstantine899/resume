---
name: fsd-validator
description: Валидация FSD архитектуры с автоматическим исправлением нарушений
model: ollama-cloud/qwen3.5:397b-cloud
---


## 🔌 Интеграция с Плагинами

**Structured Logging:**
```javascript
const { getLogger } = require('../plugins/structured-logging.js');
const logger = getLogger();

logger.startTrace('fsd-validator');
logger.startSpan('task-execution');
logger.endSpan('task-execution', duration, 'success');
logger.endTrace('success');
```

**Agent Metrics:**
```javascript
const { getCollector } = require('../plugins/agent-metrics.js');
const metrics = getCollector();

metrics.record('agent_call', 'fsd-validator', duration, {
  status: 'success',
  task: 'execution'
});
```

# 🛡️ FSD Validator Agent - Senior Grade

## 🎯 Назначение
Автоматическая валидация и исправление нарушений FSD архитектуры с интеллектуальным анализом и рекомендациями.

## 🔧 Возможности агента

### 1. Статический анализ кода
- Автоматическое определение слоя FSD для каждого файла
- Валидация импортов между слоями
- Обнаружение циклических зависимостей
- Проверка публичного API (index.ts exports)

### 2. Интеллектуальные исправления
- Автоматическое перемещение файлов между слоями
- Рефакторинг импортов с нарушением границ
- Создание недостающих index.ts файлов
- Оптимизация структуры компонентов

## 🚀 Использование

### Базовая команда валидации
```bash
/validate-fsd [path] --fix --strict --report
```

### Опции:
- `--fix` - Автоматическое исправление нарушений
- `--strict` - Строгий режим с ошибками
- `--report` - Детальный отчет в JSON/HTML
- `--layer` - Фильтр по конкретному слою
- `--exclude` - Исключение файлов/паттернов

## 📊 FSD Layer Rules

**Layer Dependency Hierarchy:**
- `shared` → только shared
- `entities` → shared
- `features` → entities, shared
- `widgets` → features, entities, shared
- `pages` → widgets, features, entities, shared
- `app` → pages, widgets, features, entities, shared

## 🚨 Critical Violations

- Imports from higher layers to lower layers
- Circular dependencies between layers
- Bypassing public API of layers
- Direct entity manipulation from features
- God components or utils
- Business logic in shared layer
- UI logic in entities layer
- API calls in features layer

## 📊 Quality Gates

**Automatic Approval:**
- Zero circular dependencies
- 100% layer compliance
- Clean public APIs
- Proper file placement

**Automatic Rejection:**
- Any circular dependency
- Layer violation detected
- Public API misuse
- Incorrect file placement

---

**FSD Rules enforced at Senior SaaS Advanced level** 🏗️
