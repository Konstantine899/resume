# OpenCode AI Agent Instructions

> **Проект:** Resume Portfolio  
> **Версия:** 1.0.0  
> **Дата:** 2026-06-19  
> **Обновлено:** Добавлена конфигурация Ollama Cloud metrics

---

## 📊 Ollama Cloud Metrics

**Модель:** `ollama-cloud/qwen3.5:397b-cloud` (Tier 4, 397B параметров)

**Автоматический сбор метрик:**
- Плагин: `metrics-logger` (глобальный + локальный)
- Логи: `D:\Dev\tools\DBObsidian\resume-app\logs\metrics-YYYY-MM-DD.md`
- Baseline: `D:\Dev\projects\resume\.opencode\logs\baseline-metrics.json` (7 дней)
- Task Scheduler: Ежедневно в 22:05

**Документация:** [[ollama-cloud-metrics]] в Obsidian vault

---

## Агенты

### ui
Создание UI компонентов (React 19 + TypeScript + CSS Modules)

### review
Code review, анализ качества, поиск багов

### test-generation
Генерация unit и integration тестов (Vitest)

### fsd-validator
Валидация архитектуры Feature-Sliced Design

### guard
Безопасность: премодерация MCP, prompt injection detection

### orchestrator
Координация мульти-агентных задач

### integration-test
Integration и e2e тесты (Playwright, MSW)

### performance-test
Анализ производительности

### storybook-test
Создание Storybook stories

### style
Валидация стилей (SASS + CSS Modules)

---

##  Правило: Все операции через Orchestrator

**ВСЕГДА использовать Orchestrator для:**

1. **Git операции** (commit, push, pull, merge, rebase)
2. **Мульти-агентные задачи** (координация между агентами)
3. **Сложные задачи** (требующие нескольких шагов/агентов)
4. **Публичные изменения** (commit, push, PR)

**НЕЛЬЗЯ:**
- ❌ Вызывать агентов напрямую (git, ui, test, и т.д.)
- ❌ Делать git операции через bash
- ❌ Принимать решения о коммитах самостоятельно

**Workflow:**
```
User Request → Orchestrator → Агент(ы) → Orchestrator → User
```

**Исключения:**
- ✅ Прямые запросы к инструментам (filesystem, grep, glob)
- ✅ Чтение/запись файлов
- ✅ Поиск по коду

---

## MCP Серверы

- filesystem — работа с файлами
- memory — долгосрочная память
- context7 — документация библиотек
- eslint — linting
- playwright — browser automation
