# 🧠 Shared Context — Общая память между агентами

> **Статус:** ✅ Phase 1, Step 3 Complete  
> **Версия:** 1.0.0  
> **Последнее обновление:** 2026-06-08

---

## 📋 Что такое Shared Context

**Shared Context** — это централизованное хранилище данных, которое позволяет агентам:

1. **Делиться информацией** между задачами
2. **Запоминать контекст** проекта
3. **Избегать повторения** одних и тех же ошибок
4. **Ускорять работу** за счёт кэширования

---

## 🗂️ Структура хранилища

```
.opencode/context/
├── context-store.json      # 🔄 Временный контекст задач
├── project-memory.json     # 📚 Долгосрочная память проекта
├── task-context.json       # 📝 Контекст текущих задач
└── logs/
    └── context.log         # 📊 Логи операций
```

---

## 📊 Категории памяти

### 1️⃣ Decisions (Архитектурные решения)

**Зачем:** Запоминать важные решения по архитектуре

**Пример:**

```json
{
  "id": "dec-001",
  "type": "decision",
  "category": "architecture",
  "title": "FSD Layer Structure",
  "description": "Используем FSD с 5 слоями: app, pages, widgets, features, entities, shared",
  "timestamp": "2026-06-08T10:00:00Z",
  "agents": ["orchestrator", "fsd-validator"],
  "tags": ["fsd", "architecture", "decision"]
}
```

**TTL:** Бессрочно (не истекает)

---

### 2️⃣ Patterns (Паттерны кода)

**Зачем:** Запоминать используемые паттерны и лучшие практики

**Пример:**

```json
{
  "id": "pat-001",
  "type": "pattern",
  "category": "code-style",
  "title": "Component Structure",
  "description": "Все компоненты создают с типами, стилями и тестами",
  "template": "ComponentName.tsx + ComponentName.module.scss + ComponentName.test.tsx",
  "timestamp": "2026-06-08T10:00:00Z",
  "agents": ["ui", "review"],
  "tags": ["component", "pattern", "structure"]
}
```

**TTL:** Бессрочно (не истекает)

---

### 3️⃣ Mistakes (Ошибки и исправления)

**Зачем:** Запоминать ошибки чтобы не повторять

**Пример:**

```json
{
  "id": "mist-001",
  "type": "mistake",
  "category": "bug",
  "title": "Import Violation",
  "description": "Features не должен импортировать из widgets",
  "fix": "Переместить логику в shared или использовать props",
  "timestamp": "2026-06-08T10:00:00Z",
  "agents": ["fsd-validator"],
  "tags": ["fsd", "import", "violation"],
  "expiresAt": "2026-06-15T10:00:00Z"
}
```

**TTL:** 7 дней (авто-удаление)

---

### 4️⃣ Preferences (Предпочтения разработчика)

**Зачем:** Запоминать личные предпочтения

**Пример:**

```json
{
  "id": "pref-001",
  "type": "preference",
  "category": "style",
  "title": "Naming Convention",
  "description": "Используем camelCase для переменных, PascalCase для компонентов",
  "timestamp": "2026-06-08T10:00:00Z",
  "agents": ["review", "ui"],
  "tags": ["naming", "convention", "style"]
}
```

**TTL:** Бессрочно (не истекает)

---

## 🔄 Как работает

```
┌─────────────────────────────────────────────────────────────────┐
│  Task: "Создай компонент Button"                                │
└────────┬────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│  1. Orchestrator читает контекст                               │
│     ├─ Проверяет patterns (как создавать компоненты)            │
│     ├─ Проверяет preferences (стиль кода)                      │
│     └─ Проверяет mistakes (какие ошибки избегать)              │
└────────┬────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. UI-Agent создаёт компонент                                  │
│     ├─ Использует pattern: Component Structure                 │
│     ├─ Применяет preference: camelCase                         │
│     └─ Избегает mistake: Import Violation                      │
└────────┬────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Review-Agent проверяет                                      │
│     ├─ Сверяется с patterns                                     │
│     ├─ Проверяет preferences                                    │
│     └─ Обновляет context (добавляет новые findings)            │
└────────┬────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. Контекст обновляется                                        │
│     ├─ Добавляется новое решение                                │
│     ├─ Обновляется статистика                                   │
│     └─ Синхронизируется с хранилищем                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 API для работы с контекстом

### Чтение контекста

```typescript
// Получить все записи категории
const decisions = await context.get('decisions');

// Получить по ID
const pattern = await context.getById('pat-001');

// Поиск по тегам
const fsdItems = await context.search({ tags: ['fsd'] });

// Получить недавние
const recent = await context.recent(10);
```

### Запись в контекст

```typescript
// Добавить запись
await context.add({
  type: 'decision',
  category: 'architecture',
  title: 'New Decision',
  description: '...',
  tags: ['fsd', 'architecture'],
});

// Обновить запись
await context.update('dec-001', {
  description: 'Updated description',
});

// Удалить запись
await context.delete('mist-001');
```

### Операции с памятью

```typescript
// Очистить истёкшие
await context.cleanup();

// Экспорт памяти
const exportData = await context.export();

// Импорт памяти
await context.import(exportData);

// Полная очистка
await context.clear();
```

---

## 📊 Примеры использования

### Пример 1: Запоминание решения

```bash
$ "Запомни: используем только функциональные компоненты"

✅ Decision saved:
  ID: dec-002
  Type: decision
  Category: code-style
  Title: Functional Components Only
  Tags: [component, pattern, decision]
  Expires: never

📦 Context updated: 1 new decision
```

### Пример 2: Использование паттерна

```bash
$ "Создай компонент"

📖 Reading patterns...
  ✓ Found: Component Structure
  ✓ Applying: .tsx + .scss + .test.tsx

✅ Component created with pattern
```

### Пример 3: Избегание ошибки

```bash
$ "Проверь архитектуру"

⚠️ Checking mistakes...
  ✓ Found: Import Violation (features → widgets)
  ✓ Validating: No violations found

✅ Architecture valid (learned from past mistakes)
```

---

## 🔧 Конфигурация

### context.jsonc

```jsonc
{
  "sharedContext": {
    "enabled": true,
    "storage": ".opencode/context/context-store.json",
    "ttl": 3600,
    "shareBetween": ["orchestrator", "review", "ui"],
  },
  "projectMemory": {
    "categories": {
      "decisions": { "enabled": true, "ttl": 86400 },
      "patterns": { "enabled": true, "ttl": 86400 },
      "mistakes": { "enabled": true, "ttl": 604800 },
      "preferences": { "enabled": true, "ttl": null },
    },
  },
  "sync": {
    "enabled": true,
    "interval": 60,
    "onTaskComplete": true,
  },
}
```

---

## 📈 Мониторинг

### Логи

```bash
# Путь к логам
.opencode/logs/context.log

# Формат
{
  "timestamp": "2026-06-08T11:30:00Z",
  "operation": "write",
  "category": "decisions",
  "agent": "orchestrator",
  "taskId": "task-123",
  "duration": 12
}
```

### Метрики

| Метрика          | Описание           | Цель      |
| ---------------- | ------------------ | --------- |
| `context.reads`  | Чтение контекста   | > 100/час |
| `context.writes` | Запись в контекст  | > 10/час  |
| `context.hits`   | Полезные чтения    | > 80%     |
| `context.misses` | Бесполезные чтения | < 20%     |
| `context.size`   | Размер хранилища   | < 10MB    |

---

## 🎯 Best Practices

### ✅ Делай

- Регулярно проверяй context-store
- Обновляй patterns при изменении стандартов
- Используй mistakes для обучения
- Экспортируй память при бэкапе

### ❌ Не делай

- Не храни чувствительные данные
- Не игнорируй cleanup
- Не отключай sync
- Не превышай maxSize

---

## 🔐 Безопасность

### Исключения (не сохраняем)

```json
"excludePatterns": [
  "**/*.env",
  "**/package-lock.json",
  "**/.git/**",
  "**/node_modules/**"
]
```

### Чувствительные ключи

```json
"sensitiveKeys": [
  "password",
  "secret",
  "token",
  "key",
  "auth"
]
```

---

## 🧪 Тестирование

### Проверка работы

```bash
# 1. Записать решение
"Запомни решение: используем TypeScript strict mode"

# 2. Прочитать решение
"Какое решение по TypeScript?"

# 3. Проверить применение
"Создай компонент" (должен использовать strict types)

# 4. Проверить очистку
Посмотреть .opencode/context/context-store.json
```

---

## 📝 Changelog

### v1.0.0 (2026-06-08)

- ✅ Базовое хранилище контекста
- ✅ 4 категории памяти
- ✅ TTL и авто-очистка
- ✅ Синхронизация между агентами
- ✅ Логирование операций
- ✅ Privacy фильтрация

### Planned (v1.1.0)

- ⏳ Auto-learning из ошибок
- ⏳ Context suggestions
- ⏳ Advanced search
- ⏳ Context visualization

---

## 🔗 Связанные документы

- [context.jsonc](./context.jsonc) — Конфиг контекста
- [orchestrator.jsonc](./orchestrator.jsonc) — Роутинг моделей
- [pipelines.jsonc](./pipelines.jsonc) — Пайплайны
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) — Документация оркестратора

---

## 👤 Автор

Создано в рамках настройки Senior-level Multi-Agent Orchestration System
