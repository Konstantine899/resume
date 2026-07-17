# OpenCode AI Agent Instructions

> **Проект:** Resume Portfolio  
> **Версия:** 3.0.0  
> **Дата:** 2026-07-03  
> **Обновлено:** Serena MCP через WSL + 7 MCP серверов

---

## 📊 Ollama Cloud Metrics

**Модель:** `ollama-cloud/qwen3.5:397b-cloud`

**Автоматический сбор метрик:**
- Плагин: `metrics-logger`
- Логи: `D:\Dev\tools\DBObsidian\resume-app\logs\metrics-YYYY-MM-DD.md`
- Baseline: `D:\Dev\projects\resume\.opencode\logs\baseline-metrics.json`

---

## Агенты

### Git Family (5 субагентов)

| Агент | Назначение | Модель |
|-------|------------|--------|
| `git-commit` | Создание коммитов, pre-commit валидация | qwen3.5:397b-cloud |
| `git-branch` | Ветки, merge, rebase, конфликты | qwen3.5:397b-cloud |
| `git-remote` | Remote, fetch, pull, push инструкции | qwen2.5-coder:32b |
| `git-automation` | Hooks, CHANGELOG, PR, tags | qwen3.5:397b-cloud |
| `git-advanced` | Bisect, worktree, LFS, submodule | qwen3.5:397b-cloud |

**Документация:** `GIT-SUBAGENTS-README.md`  
**Общие конвенции:** `git-base-conventions.md`

### Core Agents

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

## Правило: Git операции

**Git commit через `git-commit` субагент:**

```
User → task(subagent_type: "git-commit") → commit
```

- Одиночные git коммиты — через `git-commit` субагент с параметрами (files, message)
- `git push`, `git pull`, `git merge` — через `general` task agent + bash
- Сложные git операции (rebase, bisect, worktree) — через `general` task agent с подробным описанием

**НЕЛЬЗЯ:**
- ❌ `git commit --no-verify` — никогда
- ❌ `git push` без явного запроса пользователя
- ❌ Интерактивные git команды (`-i` flag)

**Плагины агентов (git-commit.md и др.) — это инструкции для модели, не исполняемый код.**
Они задают поведение, но не являются вызываемыми функциями. Dispatch происходит через `task` tool с `subagent_type`.

---

## MCP Серверы (7 активных)

| Сервер | Type | Status | Назначение | Экономия |
|--------|------|--------|------------|----------|
| filesystem | local | ✅ | Работа с файлами | - |
| memory | local | ✅ | Долгосрочная память | 73% токенов |
| context7 | local | ✅ | Документация библиотек | 85% токенов |
| eslint | local | ✅ | Linting кода | - |
| playwright | local | ✅ | Browser automation | - |
| **serena** | **WSL** | ✅ | **Навигация по коду (символы)** | **75-85% токенов** |
| **sequential-thinking** | local | ✅ | Планирование задач | **70% ошибок** |

---

## 🚀 MCP Workflow Паттерны

### Workflow 1: Интеграция Библиотеки

```
1. Context7: query "framer-motion latest version"
2. Memory: search_nodes("Resume Project")
3. Serena: find_symbol("App.tsx")
4. Serena: insert_after_symbol
5. Memory: add_observations
```
**Экономия:** ~85% токенов

---

### Workflow 2: Рефакторинг Компонента

```
1. Sequential Thinking: "План разделения HeaderComponent"
2. Serena: get_symbols_overview("Header.tsx")
3. Serena: find_symbol("HeaderComponent")
4. Serena: insert_after_symbol (создать подкомпоненты)
5. Serena: replace_symbol_body (обновить исходный)
6. Memory: add_observations
```
**Экономия:** ~75% токенов, 90% ошибок предотвращено

---

### Workflow 3: Исправление Багов

```
1. Filesystem: read_file("logs/error.log")
2. Sequential Thinking: "План отладки UserService"
3. Serena: find_symbol("UserService")
4. Serena: replace_symbol_body (добавить validation)
5. Memory: create_entities("Bug Pattern")
```
**Результат:** 10x быстрее

---

### Workflow 4: Работа с FSD Архитектурой

```
1. Memory: search_nodes("FSD Architecture")
2. Sequential Thinking: "План создания feature/auth"
3. Serena: find_symbol("*/index.ts")
4. Serena: insert_after_symbol (добавить export)
5. Skill: fsd-slice-creation
```
**Экономия:** 82% токенов

---

### Workflow 5: Миграция / Обновление

```
1. Sequential Thinking: "План обновления axios v0.27 → v1.6"
2. Context7: query "axios migration guide v1.6"
3. Serena: search_for_pattern("axios\.(get|post)")
4. Serena: replace_symbol_body (для каждого)
5. Memory: add_observations
```
**Экономия:** 2 часа vs 8 часов

---

## 🎯 Оптимальные Комбинации MCP

### A: Быстрая Разработка
**MCP:** Context7 + Serena  
**Экономия:** 85% токенов, 70% времени

### B: Безопасный Рефакторинг
**MCP:** Sequential Thinking + Serena + Memory  
**Экономия:** 75% времени, 90% ошибок предотвращено

### C: Работа с Незнакомым Проектом
**MCP:** Memory + Serena + Context7  
**Экономия:** 82% токенов, 10x быстрее "вспоминания"

### D: Отладка Production
**MCP:** Filesystem + Serena + Sequential Thinking  
**Результат:** 10x быстрее, MTTR часы → минуты

---

## 📎 Связанные документы

- [[opencode-config]] — Полная конфигурация
- [[mcp-servers]] — Детальная документация MCP
- [[obsidian-vault]] — База знаний

---

**Версия:** 3.0.0  
**Последнее обновление:** 2026-07-03  
**MCP серверов:** 7 (filesystem, memory, context7, eslint, playwright, serena-wsl, sequential-thinking)
