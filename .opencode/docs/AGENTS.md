# OpenCode AI Agent Instructions

> **Проект:** Resume Portfolio  
> **Версия:** 1.0.0  
> **Дата:** 2026-06-14

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
