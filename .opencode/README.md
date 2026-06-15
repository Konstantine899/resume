# 🏗️ OpenCode Clean Architecture

> **Статус:** ✅ Complete  
> **Версия:** 2.1.0  
> **Дата:** 2026-06-08

---

## 📁 Новая структура

```
.opencode/
├── opencode.json              # Главный конфиг (корень)
│
├── config/                    # ← КОНФИГУРАЦИЯ
│   ├── pipelines.jsonc        # Пайплайны
│   ├── context.jsonc          # Контекст
│   ├── quality-gates.jsonc    # Quality gates
│   ├── parallel-execution.jsonc  # Parallel execution
│   └── feedback-loop.jsonc    # Feedback loop
│
├── docs/                      # ← ДОКУМЕНТАЦИЯ
│   ├── AGENTS.md              # Агенты
│   ├── ARCHITECTURE.md        # Архитектура
│   ├── AUDIT-REPORT.md        # Аудит
│   ├── IMPLEMENTATION-REPORT.md  # Внедрение
│   ├── SUMMARY.md             # Итоги
│   └── SETUP-ENV.md           # Настройка .env
│
├── instructions/              # ← ИНСТРУКЦИИ
├── rules/                     # ← ПРАВИЛА
├── agents/                    # ← АГЕНТЫ
├── skills/                    # ← НАВЫКИ
│
├── logs/                      # ← RUNTIME (в .gitignore)
└── context/                   # ← RUNTIME (в .gitignore)
```

---

## 📊 Сравнение: До и После

### ❌ ДО (15 файлов в корне)

```
.opencode/
├── opencode.json
├── pipelines.jsonc
├── context.jsonc
├── quality-gates.jsonc
├── parallel-execution.jsonc
├── feedback-loop.jsonc
├── AGENTS.md
├── AUDIT-REPORT.md
├── IMPLEMENTATION-REPORT.md
├── SUMMARY.md
├── SETUP-ENV.md
├── ARCHITECTURE.md
├── instructions/
├── rules/
├── agents/
├── skills/
├── logs/
└── context/
```

**Проблема:** Визуальный шум, сложно найти нужное

---

### ✅ ПОСЛЕ (6 папок в корне)

```
.opencode/
├── opencode.json              # Главный конфиг
├── config/                    # 6 конфигов
├── docs/                      # 6 документов
├── instructions/
├── rules/
├── agents/
├── skills/
├── logs/
└── context/
```

**Преимущество:** Чёткая структура, легко найти нужное

---

## 🎯 Принципы архитектуры

### 1. Разделение ответственности

| Папка           | Назначение                | В Git? |
| --------------- | ------------------------- | ------ |
| `config/`       | Конфигурация системы      | ✅ Да  |
| `docs/`         | Документация и отчёты     | ✅ Да  |
| `instructions/` | Инструкции для агентов    | ✅ Да  |
| `rules/`        | Правила проекта           | ✅ Да  |
| `agents/`       | Специализированные агенты | ✅ Да  |
| `skills/`       | Навыки агентов            | ✅ Да  |
| `logs/`         | Логи выполнения           | ❌ Нет |
| `context/`      | Хранилище контекста       | ❌ Нет |

---

### 2. Конфигурация vs Документация

**Конфигурация (`config/`):**

- Машиночитаемые файлы (JSON/JSONC)
- Используются системой во время выполнения
- Версионируются

**Документация (`docs/`):**

- Человекочитаемые файлы (Markdown)
- Для разработчиков и команды
- Версионируется

---

### 3. Runtime vs Configuration

**Configuration (коммитить):**

- Конфиги
- Документация
- Правила
- Инструкции

**Runtime (НЕ коммитить):**

- Логи
- Контекст
- Бэкапы
- Телеметрия

---

## 📝 Что изменилось

### Перемещённые файлы

| Файл                       | Откуда       | Куда                |
| -------------------------- | ------------ | ------------------- |
| `pipelines.jsonc`          | `.opencode/` | `.opencode/config/` |
| `context.jsonc`            | `.opencode/` | `.opencode/config/` |
| `quality-gates.jsonc`      | `.opencode/` | `.opencode/config/` |
| `parallel-execution.jsonc` | `.opencode/` | `.opencode/config/` |
| `feedback-loop.jsonc`      | `.opencode/` | `.opencode/config/` |
| `AGENTS.md`                | `.opencode/` | `.opencode/docs/`   |
| `AUDIT-REPORT.md`          | `.opencode/` | `.opencode/docs/`   |
| `IMPLEMENTATION-REPORT.md` | `.opencode/` | `.opencode/docs/`   |
| `SUMMARY.md`               | `.opencode/` | `.opencode/docs/`   |
| `SETUP-ENV.md`             | `.opencode/` | `.opencode/docs/`   |
| `ARCHITECTURE.md`          | `.opencode/` | `.opencode/docs/`   |

### Обновлённые пути

**Файл:** `opencode.json`

```jsonc
// ✅ СТАЛО
"instructions": [".opencode/docs/AGENTS.md"]
```

---

## 🎯 Преимущества новой архитектуры

### 1. Чистота

- ✅ В корне только папки (визуально проще)
- ✅ Чёткое разделение ответственности
- ✅ Легко найти нужный файл

### 2. Масштабируемость

- ✅ Легко добавлять новые конфиги
- ✅ Легко добавлять новую документацию
- ✅ Не увеличивается беспорядок

### 3. Поддерживаемость

- ✅ Понятная структура для новых разработчиков
- ✅ Разделение config/docs/runtime
- ✅ Следует best practices

### 4. Навигация

```bash
# Найти конфиг
ls .opencode/config/

# Найти документацию
ls .opencode/docs/

# Найти правила
ls .opencode/rules/
```

---

## 📚 Навигация

### Конфигурация

- [opencode.json](../opencode.json) — Главный конфиг
- [config/pipelines.jsonc](./config/pipelines.jsonc) — Пайплайны
- [config/context.jsonc](./config/context.jsonc) — Контекст
- [config/quality-gates.jsonc](./config/quality-gates.jsonc) — Quality gates
- [config/parallel-execution.jsonc](./config/parallel-execution.jsonc) — Parallel
- [config/feedback-loop.jsonc](./config/feedback-loop.jsonc) — Feedback

### Документация

- [docs/AGENTS.md](./docs/AGENTS.md) — Агенты
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Архитектура
- [docs/AUDIT-REPORT.md](./docs/AUDIT-REPORT.md) — Аудит
- [docs/IMPLEMENTATION-REPORT.md](./docs/IMPLEMENTATION-REPORT.md) — Внедрение
- [docs/SUMMARY.md](./docs/SUMMARY.md) — Итоги
- [docs/SETUP-ENV.md](./docs/SETUP-ENV.md) — Настройка .env

---

## ✅ Чек-лист миграции

- [x] Созданы папки `config/` и `docs/`
- [x] Перемещены конфиги в `config/`
- [x] Перемещена документация в `docs/`
- [x] Обновлён `opencode.json` (пути)
- [x] Обновлён `.gitignore`
- [x] Создана документация архитектуры

---

**Архитектура:** ✅ Clean Architecture  
**Статус:** Complete  
**Версия:** 2.1.0
