# 🏗️ Архитектура OpenCode Project

> **Статус:** ✅ Correct Architecture  
> **Версия:** 2.0.0  
> **Дата:** 2026-06-08

---

## ✅ Правильная структура

### Двухуровневая архитектура OpenCode

```
┌─────────────────────────────────────────────────────────────────┐
│                    GLOBAL CONFIGURATION                         │
│  Path: C:\Users\Konstantine\.config\opencode\                  │
│  Purpose: Пользовательские настройки, API ключи, провайдеры    │
│  Git: ❌ НЕ коммитить (персональное)                           │
│                                                                 │
│  Files:                                                         │
│  ├── opencode.jsonc         # Главный конфиг                   │
│  ├── .env                     # API ключи (ЗАЩИЩЕНО)           │
│  ├── .gitignore               # Защита .env                    │
│  └── ENV-SETUP.md             # Документация                   │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PROJECT CONFIGURATION                         │
│  Path: D:\Dev\projects\resume\.opencode\                       │
│  Purpose: Настройки проекта, правила, агенты, пайплайны        │
│  Git: ✅ КОММИТИТЬ (кроме логов/секретов)                      │
│                                                                 │
│  Files (COMMIT):                                                │
│  ├── opencode.json              # Конфиг проекта               │
│  ├── orchestrator.jsonc         # Роутинг моделей              │
│  ├── pipelines.jsonc            # Пайплайны                    │
│  ├── context.jsonc              # Конфиг контекста             │
│  ├── quality-gates.jsonc        # Quality gates                │
│  ├── parallel-execution.jsonc   # Parallel execution           │
│  ├── feedback-loop.jsonc        # Feedback loop                │
│  ├── AGENTS.md                  # Документация                 │
│  ├── instructions/              # Инструкции проекта           │
│  ├── rules/                     # Правила проекта              │
│  ├── agents/                    # Агенты проекта               │
│  └── skills/                    # Навыки проекта               │
│                                                                 │
│  Files (DO NOT COMMIT):                                         │
│  ├── logs/                      # Логи выполнения              │
│  ├── context/                   # Хранилище контекста          │
│  ├── health/                    # Health checks                │
│  ├── telemetry/                 # Телеметрия                   │
│  ├── backups/                   # Бэкапы                       │
│  └── *.log                      # Лог файлы                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Текущая структура проекта

```
D:\Dev\projects\resume\
├── .gitignore                    # ✅ Создан (защищает .opencode/logs/, .opencode/context/)
├── .opencode/                    # ✅ Проектная конфигурация
│   ├── opencode.json             # ✅ Коммитить
│   ├── orchestrator.jsonc        # ✅ Коммитить
│   ├── pipelines.jsonc           # ✅ Коммитить
│   ├── context.jsonc             # ✅ Коммитить
│   ├── quality-gates.jsonc       # ✅ Коммитить
│   ├── parallel-execution.jsonc  # ✅ Коммитить
│   ├── feedback-loop.jsonc       # ✅ Коммитить
│   ├── AGENTS.md                 # ✅ Коммитить
│   ├── AUDIT-REPORT.md           # ✅ Коммитить
│   ├── IMPLEMENTATION-REPORT.md  # ✅ Коммитить
│   ├── SUMMARY.md                # ✅ Коммитить
│   ├── SETUP-ENV.md              # ✅ Коммитить
│   ├── logs/                     # ❌ НЕ коммитить (.gitignore)
│   ├── context/                  # ❌ НЕ коммитить (.gitignore)
│   ├── instructions/             # ✅ Коммитить
│   ├── rules/                    # ✅ Коммитить
│   ├── agents/                   # ✅ Коммитить
│   └── skills/                   # ✅ Коммитить
└── src/                          # Исходный код
```

---

## 🔐 Что коммитить, а что нет

### ✅ КОММИТИТЬ В GIT (Configuration as Code)

| Файл            | Почему коммитить         |
| --------------- | ------------------------ |
| `opencode.json` | Конфигурация проекта     |
| `*.jsonc`       | Конфигурация компонентов |
| `*.md`          | Документация             |
| `instructions/` | Инструкции проекта       |
| `rules/`        | Правила проекта          |
| `agents/`       | Агенты проекта           |
| `skills/`       | Навыки проекта           |

**Преимущества:**

- ✅ Версионирование конфигурации
- ✅ Команда использует одинаковые настройки
- ✅ Code review для конфигов
- ✅ Откат изменений при проблемах

---

### ❌ НЕ КОММИТИТЬ В GIT (Runtime files)

| Файл/Папка             | Почему не коммитить                  |
| ---------------------- | ------------------------------------ |
| `.opencode/logs/`      | Логи выполнения (меняются постоянно) |
| `.opencode/context/`   | Хранилище контекста (персональное)   |
| `.opencode/health/`    | Health check файлы (runtime)         |
| `.opencode/telemetry/` | Телеметрия (персональное)            |
| `.opencode/backups/`   | Бэкапы контекста (большие файлы)     |
| `*.log`                | Лог файлы (постоянно меняются)       |

**Защищено через `.gitignore`:**

```gitignore
.opencode/logs/
.opencode/context/
.opencode/health/
.opencode/telemetry/
.opencode/backups/
.opencode/**/*.log
```

---

## 🎯 Best Practices

### ✅ Правильно

```bash
# Структура проекта
my-project/
├── .gitignore
├── .opencode/              # ✅ Коммитить (кроме logs/, context/)
│   ├── opencode.json       # ✅
│   ├── orchestrator.jsonc  # ✅
│   ├── pipelines.jsonc     # ✅
│   ├── rules/              # ✅
│   ├── agents/             # ✅
│   └── logs/               # ❌ В .gitignore
└── src/
```

### ❌ Неправильно

```bash
# НЕ храните .opencode вне проекта
my-project/
├── src/
└── ../some-other-place/.opencode  # ❌ Плохо!

# НЕ коммитьте логи
my-project/
├── .opencode/
│   ├── opencode.json    # ✅
│   └── logs/            # ❌ Должно быть в .gitignore
```

---

## 🔄 Глобальный vs Проектный уровень

### Глобальный (`~/.config/opencode/`)

**Что хранить:**

- ✅ API ключи (в `.env`)
- ✅ Провайдеры (Ollama, OpenAI, etc.)
- ✅ Модели по умолчанию
- ✅ Пользовательские предпочтения
- ✅ MCP серверы (глобальные)

**Не хранить:**

- ❌ Проект-специфичные настройки
- ❌ Правила проекта
- ❌ Агенты проекта

---

### Проектный (`<project>/.opencode/`)

**Что хранить:**

- ✅ Конфигурация проекта
- ✅ Правила проекта (FSD, code style)
- ✅ Агенты проекта
- ✅ Пайплайны проекта
- ✅ Quality gates проекта
- ✅ Инструкции проекта

**Не хранить:**

- ❌ API ключи (только в глобальном)
- ❌ Логи выполнения
- ❌ Персональные предпочтения

---

## 📊 Сравнение архитектур

| Аспект         | Текущая (✅)           | Альтернатива (❌)  |
| -------------- | ---------------------- | ------------------ |
| **Глобальный** | `~/.config/opencode/`  | В проекте          |
| **Проектный**  | `<project>/.opencode/` | В глобальном       |
| **API ключи**  | В глобальном `.env`    | В проектном `.env` |
| **Правила**    | В проектном            | В глобальном       |
| **Git**        | Проектный коммитится   | Всё персональное   |
| **Команда**    | ✅ Одинаковые правила  | ❌ У каждого свои  |

---

## 🎯 Ваша текущая архитектура

```
✅ Глобальный: C:\Users\Konstantine\.config\opencode\
   ├── opencode.jsonc        # ✅ Провайдеры, модели
   ├── .env                  # ✅ API ключи (защищено)
   └── .gitignore            # ✅ Защита .env

✅ Проектный: D:\Dev\projects\resume\.opencode\
   ├── opencode.json         # ✅ Конфиг проекта
   ├── orchestrator.jsonc    # ✅ Роутинг
   ├── pipelines.jsonc       # ✅ Пайплайны
   ├── context.jsonc         # ✅ Контекст
   ├── quality-gates.jsonc   # ✅ Quality gates
   ├── parallel-execution.jsonc # ✅ Parallel
   ├── feedback-loop.jsonc   # ✅ Feedback
   ├── AGENTS.md             # ✅ Документация
   ├── instructions/         # ✅ Инструкции
   ├── rules/                # ✅ Правила
   ├── agents/               # ✅ Агенты
   ├── skills/               # ✅ Навыки
   ├── logs/                 # ❌ В .gitignore
   └── context/              # ❌ В .gitignore
```

**Вердикт:** ✅ **АРХИТЕКТУРА ПРАВИЛЬНАЯ**

---

## 🔍 Проверка

### Что можно коммитить:

```bash
git add .opencode/opencode.json
git add .opencode/orchestrator.jsonc
git add .opencode/pipelines.jsonc
git add .opencode/*.jsonc
git add .opencode/*.md
git add .opencode/instructions/
git add .opencode/rules/
git add .opencode/agents/
git add .opencode/skills/
```

### Что НЕЛЬЗЯ коммитить:

```bash
git add .opencode/logs/        # ❌ Запрещено в .gitignore
git add .opencode/context/     # ❌ Запрещено в .gitignore
git add .opencode/*.log        # ❌ Запрещено в .gitignore
```

---

## 📚 Документация

| Документ                                               | Описание              |
| ------------------------------------------------------ | --------------------- |
| [SUMMARY.md](./SUMMARY.md)                             | Итоговый отчёт        |
| [IMPLEMENTATION-REPORT.md](./IMPLEMENTATION-REPORT.md) | Детали внедрения      |
| [.gitignore](../.gitignore)                            | Защита runtime файлов |

---

**Архитектура:** ✅ Correct (Two-Level Configuration)  
**Статус:** ✅ Production Ready  
**Версия:** 2.0.0
