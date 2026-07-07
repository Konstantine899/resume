# OpenCode Configuration Documentation

> **Проект:** Resume Portfolio  
> **Версия конфигурации:** 2.1.0  
> **Дата обновления:** 2026-06-14  
> **Статус:** ✅ Active

---

## 📋 Содержание

1. [Обзор конфигурации](#обзор-конфигурации)
2. [Структура файлов](#структура-файлов)
3. [Главный конфиг opencode.json](#главный-конфиг-opencodejson)
4. [Конфигурация Quality Gates](#конфигурация-quality-gates)
5. [Пайплайны](#пайплайны)
6. [Параллельное выполнение](#параллельное-выполнение)
7. [Feedback Loop](#feedback-loop)
8. [Context & Memory](#context--memory)
9. [Агенты](#агенты)
10. [Навыки](#навыки)
11. [Правила](#правила)
12. [MCP серверы](#mcp-серверы)
13. [Безопасность](#безопасность)
14. [Траблшутинг](#траблшутинг)

---

## Обзор конфигурации

### Технологический стек OpenCode

| Компонент | Версия | Описание |
|-----------|--------|----------|
| Framework | opencode.ai | AI-powered coding assistant |
| Model (Primary) | ollama/qwen2.5-coder:7b-instruct-q4_K_M | Основная модель для кодинга |
| Model (Small) | ollama/deepseek-coder:1.3b-instruct-q4_K_M | Лёгкая модель для простых задач |
| MCP Servers | 5 активных | FileSystem, Memory, Context7, ESLint, Playwright |
| Agents | 12 специализированных | UI, Review, Test, FSD, Guard, и др. |

### Основные возможности

- ✅ **Мульти-агентная архитектура** — специализированные агенты для разных задач
- ✅ **Quality Gates** — автоматическая проверка качества кода
- ✅ **Пайплайны** — автоматические цепочки выполнения задач
- ✅ **Guard Agent** — безопасность и премодерация действий
- ✅ **FSD Architecture** — валидация Feature-Sliced Design
- ✅ **MCP Integration** — подключение внешних инструментов

---

## Структура файлов

```
.opencode/
├── opencode.json                    # Главный конфиг
├── opencode.json.bak                # Резервная копия
├── opencode.json.old                # Старая версия
├── package.json                     # Зависимости OpenCode
│
├── config/                          # Конфигурация
│   ├── quality-gates.jsonc          # Quality Gates
│   ├── pipelines.jsonc              # Пайплайны
│   ├── parallel-execution.jsonc     # Параллельное выполнение
│   ├── feedback-loop.jsonc          # Feedback Loop
│   └── context.jsonc                # Context & Memory
│
├── docs/                            # Документация (создаётся)
│   ├── CONFIGURATION.md             # Этот файл
│   ├── AGENTS_GUIDE.md              # Руководство по агентам
│   ├── TROUBLESHOOTING.md           # Решение проблем
│   └── QUICK_START.md               # Быстрый старт
│
├── agents/                          # Специализированные агенты
│   ├── ui.md                        # UI компоненты
│   ├── review.md                    # Code review
│   ├── test-generation.md           # Генерация тестов
│   ├── fsd-validator.md             # Валидация FSD
│   ├── guard.md                     # Безопасность
│   ├── orchestrator.md              # Координация
│   └── ...                          # Другие агенты
│
├── skills/                          # Навыки агентов
│   ├── component-boilerplate/       # Шаблон компонента
│   ├── fsd-slice-creation/          # Создание FSD slice
│   ├── test-generation/             # Генерация тестов
│   └── storybook-setup/             # Настройка Storybook
│
├── rules/                           # Правила проекта
│   ├── fsd-rules.md                 # FSD архитектура
│   ├── code-style-rules.md          # Стиль кода
│   ├── security-rules.md            # Безопасность
│   ├── testing-rules.md             # Тестирование
│   └── guard-rules.md               # Guard Agent правила
│
├── instructions/                    # Инструкции
│   ├── project-structure.md         # Структура проекта
│   ├── fsd-architecture.md          # FSD архитектура
│   ├── style-guide.md               # Стиль руководства
│   └── review-guidelines.md         # Гайдлайны review
│
├── commands/                        # Команды
│   ├── generate-component.md        # Генерация компонента
│   ├── code-review.md               # Code review
│   ├── run-tests.md                 # Запуск тестов
│   └── validate-fsd.md              # Валидация FSD
│
├── context/                         # Runtime контекст (в .gitignore)
│   ├── context-store.json           # Хранилище контекста
│   ├── project-memory.json          # Память проекта
│   └── task-context.json            # Контекст задачи
│
├── logs/                            # Runtime логи (в .gitignore)
│   ├── guard-audit.log              # Аудит Guard
│   ├── quality-gates.log            # Логи Quality Gates
│   └── pipelines.log                # Логи пайплайнов
│
└── logs/                            # Runtime логи
    ├── guard-audit.log              # Аудит Guard
    ├── quality-gates.log            # Quality Gates
    └── pipelines.log                # Пайплайны
```

---

## Главный конфиг opencode.json

### Базовая настройка

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "ollama/qwen2.5-coder:7b-instruct-q4_K_M",
  "small_model": "ollama/deepseek-coder:1.3b-instruct-q4_K_M",
  "logLevel": "INFO",
  "snapshot": true,
  "instructions": [".opencode/docs/AGENTS.md"]
}
```

| Параметр | Значение | Описание |
|----------|----------|----------|
| `$schema` | URL | JSON Schema для валидации конфига |
| `model` | Ollama model | Основная модель для сложных задач |
| `small_model` | Ollama model | Лёгкая модель для простых задач |
| `logLevel` | INFO | Уровень логирования (DEBUG/INFO/WARN/ERROR) |
| `snapshot` | true | Сохранять снимки состояния |
| `instructions` | Array | Пути к инструкциям для агентов |

### Guard Agent настройка

```json
{
  "guard_agent": "guard",
  "guard": {
    "enabled": true,
    "premoderation": true,
    "promptInjectionDetection": true,
    "piiMasking": true,
    "auditLogging": true
  }
}
```

| Параметр | Значение | Описание |
|----------|----------|----------|
| `guard_agent` | "guard" | Имя агента безопасности |
| `enabled` | true | Включить Guard |
| `premoderation` | true | премодерация MCP-вызовов |
| `promptInjectionDetection` | true | Детектирование атак |
| `piiMasking` | true | Маскировка персональных данных |
| `auditLogging` | true | Логирование всех действий |

### Permissions

```json
{
  "permission": {
    "*": "ask",
    "filesystem:read": "auto-approve",
    "filesystem:write": "auto-approve",
    "filesystem:delete": "deny",
    "shell:dangerous": "deny"
  }
}
```

| Permission | Действие | Описание |
|------------|----------|----------|
| `*` | ask | По умолчанию спрашивать |
| `filesystem:read` | auto-approve | Чтение файлов автоматически |
| `filesystem:write` | auto-approve | Запись файлов автоматически |
| `filesystem:delete` | deny | Удаление файлов запрещено |
| `shell:dangerous` | deny | Опасные shell-команды запрещены |

### Skills

```json
{
  "skills": {
    "paths": [".opencode/skills"]
  }
}
```

**Навыки агентов:**
- `component-boilerplate` — шаблон компонента
- `fsd-slice-creation` — создание FSD slice
- `test-generation` — генерация тестов
- `storybook-setup` — настройка Storybook

### MCP серверы

```json
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"],
      "args": ["D:/Dev/projects", "D:/Dev/tools"],
      "enabled": true
    },
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
      "args": ["--db-path", "D:/Dev/memory.db"],
      "enabled": true,
      "timeout": 120000
    },
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp"],
      "args": ["--api-key", "${CONTEXT7_API_KEY}"],
      "enabled": true,
      "timeout": 120000
    },
    "eslint": {
      "type": "local",
      "command": ["npx", "-y", "@eslint/mcp"],
      "enabled": true
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp"],
      "enabled": true
    },
    "rag": {
      "type": "local",
      "command": ["npx", "-y", "mcp-server-rg"],
      "args": ["--root", "D:/Dev/projects/resume/.opencode"],
      "enabled": true,
      "timeout": 120000,
      "description": "RAG сервер для семантического поиска по документации",
      "indexPaths": [
        "docs/**/*.md",
        "instructions/**/*.md",
        "rules/**/*.md",
        "agents/**/*.md",
        "skills/**/*.md",
        "AGENT.md"
      ]
    }
  }
}
```

| MCP Server | Назначение | Статус |
|------------|------------|--------|
| `filesystem` | Доступ к файловой системе | ✅ Active |
| `memory` | Долгосрочная память | ✅ Active |
| `context7` | Документация библиотек | ✅ Active |
| `eslint` | Linting кода | ✅ Active |
| `playwright` | Browser automation | ✅ Active |
| `rag` | Семантический поиск | ✅ Active |

### Compaction

```json
{
  "compaction": {
    "auto": true,
    "tail_turns": 10
  }
}
```

| Параметр | Значение | Описание |
|----------|----------|----------|
| `auto` | true | Автоматическая компактизация |
| `tail_turns` | 10 | Хранить последние 10 ходов |

### Tool Output

```json
{
  "tool_output": {
    "max_lines": 300,
    "max_bytes": 16384
  }
}
```

| Параметр | Значение | Описание |
|----------|----------|----------|
| `max_lines` | 300 | Максимум строк вывода |
| `max_bytes` | 16384 | Максимум байт вывода |

---

## Конфигурация Quality Gates

**Файл:** `config/quality-gates.jsonc`

### Gates

| Gate | Назначение | Blocking |
|------|------------|----------|
| `pre-commit` | Проверка перед коммитом | ✅ Да |
| `pre-merge` | Проверка перед мержем | ✅ Да |
| `pre-deploy` | Проверка перед деплоем | ✅ Да |

### Pre-Commit Checks

| Check | Agent | Timeout | Blocking | Criteria |
|-------|-------|---------|----------|----------|
| FSD Validation | fsd-validator | 30s | ✅ | 100% layer compliance |
| Code Review | review | 60s | ✅ | Min score 7/10 |
| Test Coverage | test-generation | 45s | ✅ | Min 90% coverage |
| Security Scan | review | 45s | ✅ | Zero vulnerabilities |
| Performance Check | performance-test | 45s | ❌ | Render < 16ms |
| Style Validation | style | 30s | ❌ | CSS Modules |
| Judge Score | judge | 30s | ✅ | Min score 7/10 |

### Auto-Fix

```json
{
  "autoFix": {
    "enabled": true,
    "maxIterations": 3,
    "agent": "review",
    "fixableIssues": ["style", "types", "minor-bugs"],
    "skipFixFor": ["security", "architecture", "major-bugs"]
  }
}
```

---

## Пайплайны

**Файл:** `config/pipelines.jsonc`

### Доступные пайплайны

| Pipeline | Trigger | Steps | Описание |
|----------|---------|-------|----------|
| `create-component` | "create component" | 6 | Создание UI компонента |
| `code-review` | "code review" | 8 | Комплексная проверка кода |
| `fix-bug` | "fix bug" | 4 | Исправление бага |
| `refactor` | "refactor" | 5 | Безопасный рефакторинг |
| `integration-test` | "integration test" | 5 | Интеграционное тестирование |

### Pipeline: create-component

```
1. ui агент → создание компонента
2. review агент → code review
3. fsd-validator → валидация архитектуры
4. test-generation → создание тестов
5. storybook-test → создание stories
6. summary → итоговый отчёт
```

### Pipeline: code-review

```
1. review → основной review
2. critic → адверсариальный review
3. fix → исправление проблем
4. verify → проверка исправлений
5. security → проверка безопасности
6. performance → анализ производительности
7. fsd → валидация архитектуры
8. summary → итоговый отчёт
```

---

## Параллельное выполнение

**Файл:** `config/parallel-execution.jsonc`

### Parallel Groups

| Group | Max Concurrent | Tasks | Описание |
|-------|----------------|-------|----------|
| `test-suite` | 3 | unit, integration, e2e | Параллельный запуск тестов |
| `code-review-suite` | 2 | security, performance, architecture | Параллельные проверки |
| `component-creation` | 3 | component, styles, types | Параллельное создание файлов |
| `quality-gate-checks` | 3 | security, performance, style | Параллельные проверки gates |
| `documentation-generation` | 2 | api-docs, component-docs | Параллельная генерация docs |

### Стратегии планирования

| Strategy | Max Concurrent | Описание |
|----------|----------------|----------|
| `balanced` | 3 | Баланс скорости и загрузки |
| `speed` | 5 | Максимальная скорость |
| `conservative` | 2 | Минимальная нагрузка |

---

## Feedback Loop

**Файл:** `config/feedback-loop.jsonc`

### Learning Sources

| Source | Category | Auto-Apply |
|--------|----------|-----------|
| `mistakes` | mistakes | ✅ Да |
| `taskResults` | completed-tasks | ✅ Да |
| `qualityGates` | failures | ✅ Да |
| `manualFeedback` | manual | ✅ Да |

### Analysis Triggers

- ✅ On Quality Gate Fail
- ✅ On Recurring Error
- ✅ On Performance Degradation
- ✅ On Security Issue
- ✅ On Architecture Violation

---

## Context & Memory

**Файл:** `config/context.jsonc`

### Project Memory Categories

| Category | TTL | Auto-Expire | Описание |
|----------|-----|-------------|----------|
| `decisions` | 24h | ❌ | Архитектурные решения |
| `patterns` | 24h | ❌ | Паттерны кода |
| `mistakes` | 7 days | ✅ | Ошибки и исправления |
| `preferences` | ∞ | ❌ | Предпочтения разработчика |

### Shared Context

- **Storage:** `.opencode/context/context-store.json`
- **TTL:** 3600s (1 hour)
- **Max Size:** 10MB
- **Cache:** LRU strategy

---

## Агенты

### Список агентов

| Агент | Приоритет | Модель | Описание |
|-------|-----------|--------|----------|
| `ui` | P1 | qwen2.5-coder:7b | UI компоненты |
| `review` | P1 | qwen2.5-coder:7b | Code review |
| `test-generation` | P1 | qwen2.5-coder:7b | Генерация тестов |
| `fsd-validator` | P1 | qwen2.5-coder:7b | Валидация FSD |
| `guard` | P0 | qwen2.5-coder:32b | Безопасность |
| `orchestrator` | P1 | qwen2.5-coder:32b | Координация |
| `integration-test` | P1 | qwen2.5-coder:7b | Интеграционные тесты |
| `performance-test` | P2 | qwen2.5-coder:7b | Тесты производительности |
| `storybook-test` | P2 | qwen2.5-coder:7b | Storybook stories |
| `style` | P2 | qwen2.5-coder:7b | Валидация стилей |
| `critic` | ⏳ Future | - | Адверсариальный review |
| `judge` | ⏳ Future | - | Quality scoring |

### Агенты (подробно)

См. отдельный документ: [AGENTS_GUIDE.md](./AGENTS_GUIDE.md)

---

## Навыки

### Список навыков

| Навык | Описание | Использование |
|-------|----------|---------------|
| `component-boilerplate` | Шаблон компонента | Создание UI компонентов |
| `fsd-slice-creation` | Создание FSD slice | Добавление entities/features |
| `test-generation` | Генерация тестов | Unit/Integration тесты |
| `storybook-setup` | Настройка Storybook | Stories для компонентов |

---

## Правила

### Список правил

| Правило | Описание | Критичность |
|---------|----------|-------------|
| `fsd-rules.md` | FSD архитектура | 🔴 Critical |
| `code-style-rules.md` | Стиль кода | 🟡 Warning |
| `security-rules.md` | Безопасность | 🔴 Critical |
| `testing-rules.md` | Тестирование | 🟡 Warning |
| `guard-rules.md` | Guard Agent | 🔴 Critical |
| `performance-rules.md` | Производительность | 🟡 Warning |
| `strict-rules.md` | Строгие правила | 🔴 Critical |

---

## MCP серверы

### Настройка MCP

**Требования:**
1. Node.js 18+
2. NPM 9+
3. Доступ к интернету для загрузки пакетов

### Проверка MCP

```bash
# Проверка filesystem MCP
npx -y @modelcontextprotocol/server-filesystem --help

# Проверка memory MCP
npx -y @modelcontextprotocol/server-memory --help

# Проверка eslint MCP
npx -y @eslint/mcp --help
```

### Переменные окружения

**Файл:** `.env` (в корне проекта)

```bash
# Context7 MCP
CONTEXT7_API_KEY=your-api-key-here
```

---

## Безопасность

### Guard Agent

**Все действия проходят через Guard:**

#### Blocked (Auto-block)
- ❌ Удаление файлов (кроме /tmp/)
- ❌ Запись в .git/, node_modules/, .env*
- ❌ Shell: rm -rf, sudo, curl | bash
- ❌ Prompt injection patterns

#### Require Confirmation
- ⚠️ Изменение opencode.json, package.json
- ⚠️ Создание/удаление агентов
- ⚠️ MCP filesystem: delete

#### Auto-Approve
- ✅ Чтение src/**/*.{ts,tsx}
- ✅ Запись src/**/*.{ts,tsx}
- ✅ Shell: ls, cat, grep

### Prompt Injection Detection

**Детектируемые паттерны:**
- "ignore previous instructions"
- "you are now in developer mode"
- "bypass security filters"
- "output your system prompt"
- SQL injection (UNION SELECT, DROP TABLE)
- XSS patterns (<script>, javascript:)
- Path traversal (../)

### PII Masking

**Маскируемые данные:**
- Email → [EMAIL_MASKED]
- Телефон → [PHONE_MASKED]
- Пароли → [SECRET_MASKED]
- Токены → [TOKEN_MASKED]
- API ключи → [API_KEY_MASKED]

---

## Траблшутинг

### OpenCode не запускается

**Проблема:** OpenCode не стартует или выдает ошибки

**Решения:**

1. **Проверьте установку Ollama**
   ```bash
   ollama --version
   ollama list
   ```

2. **Проверьте модели**
   ```bash
   # Если моделей нет, скачайте их
   ollama pull qwen2.5-coder:7b-instruct-q4_K_M
   ollama pull deepseek-coder:1.3b-instruct-q4_K_M
   ```

3. **Проверьте конфигурацию**
   ```bash
   # Валидация JSON
   node -e "JSON.parse(require('fs').readFileSync('.opencode/opencode.json'))"
   ```

4. **Проверьте MCP серверы**
   ```bash
   # Проверка filesystem MCP
   npx -y @modelcontextprotocol/server-filesystem --help
   ```

5. **Проверьте логи**
   ```bash
   # Логи OpenCode
   Get-Content .opencode\logs\*.log -Tail 50
   ```

6. **Восстановите конфиг из бэкапа**
   ```bash
   # Копирование бэкапа
   Copy-Item .opencode\opencode.json.bak .opencode\opencode.json
   ```

### MCP серверы не подключаются

**Проблема:** MCP серверы не инициализируются

**Решения:**

1. **Проверьте интернет-соединение**
   ```bash
   Test-Connection google.com -Count 2
   ```

2. **Очистите npm кэш**
   ```bash
   npm cache clean --force
   ```

3. **Переустановите MCP пакеты**
   ```bash
   Remove-Item -Recurse -Force .opencode\node_modules
   npm install --prefix .opencode
   ```

4. **Проверьте переменные окружения**
   ```bash
   # Проверка CONTEXT7_API_KEY
   echo $env:CONTEXT7_API_KEY
   ```

### Quality Gates не работают

**Проблема:** Quality Gates не выполняются

**Решения:**

1. **Проверьте конфигурацию**
   ```bash
   # Валидация JSONC
   node -e "JSON.parse(require('fs').readFileSync('.opencode/config/quality-gates.jsonc').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ''))"
   ```

2. **Проверьте агентов**
   ```bash
   # Проверка наличия файлов агентов
   Test-Path .opencode\agents\review.md
   Test-Path .opencode\agents\fsd-validator.md
   ```

3. **Проверьте права доступа**
   ```bash
   # Проверка прав на запись
   Add-Content .opencode\logs\test.log "test"
   ```

### Агенты не отвечают

**Проблема:** Агенты не реагируют на команды

**Решения:**

1. **Проверьте инструкции**
   ```bash
   # Проверка пути к инструкциям
   Test-Path .opencode\docs\AGENTS.md
   ```

2. **Перезапустите OpenCode**
   ```bash
   # Закройте и откройте заново
   ```

3. **Очистите контекст**
   ```bash
   # Очистка контекста (если есть проблемы)
   Remove-Item .opencode\context\*.json -Force
   ```

---

## Полезные команды

### Управление конфигурацией

```bash
# Валидация конфига
node -e "JSON.parse(require('fs').readFileSync('.opencode/opencode.json'))"

# Проверка структуры
Get-ChildItem .opencode -Recurse -File | Select-Object FullName

# Бэкап конфига
Copy-Item .opencode\opencode.json .opencode\opencode.json.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')
```

### Управление агентами

```bash
# Список агентов
Get-ChildItem .opencode\agents\*.md

# Список навыков
Get-ChildItem .opencode\skills\*/SKILL.md

# Список правил
Get-ChildItem .opencode\rules\*.md
```

### Логи

```bash
# Последние логи Guard
Get-Content .opencode\logs\guard-audit.log -Tail 50

# Последние логи Quality Gates
Get-Content .opencode\logs\quality-gates.log -Tail 50

# Все логи за сегодня
Get-ChildItem .opencode\logs\*.log | Where-Object { $_.LastWriteTime -gt (Get-Date).Date }
```

---

## Связанные документы

- [AGENTS_GUIDE.md](./AGENTS_GUIDE.md) — Руководство по агентам
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Решение проблем
- [QUICK_START.md](./QUICK_START.md) — Быстрый старт

---

**Версия документации:** 1.0.0  
**Дата создания:** 2026-06-14
