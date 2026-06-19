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

## Правила

- TypeScript strict mode (никаких any)
- FSD архитектура (layer dependencies)
- CSS Modules (нет глобальных стилей)
- Accessibility (ARIA, keyboard navigation)
- Тесты coverage ≥ 90%

---

## MCP Серверы

- filesystem — работа с файлами
- memory — долгосрочная память
- context7 — документация библиотек
- eslint — linting
- playwright — browser automation
