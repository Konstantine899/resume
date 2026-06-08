# 🎯 Model Orchestrator System

> **Статус:** ✅ Phase 1 Complete  
> **Версия:** 1.0.0  
> **Последнее обновление:** 2026-06-08

---

## 📋 Что реализовано

### ✅ Компоненты системы

```
.opencode/
├── orchestrator.jsonc              # ⚙️ Конфиг роутинга моделей
├── agents/orchestrator.md          # 🤖 Агент-диспетчер
├── instructions/orchestrator-guide.md  # 📚 Гайд по классификации
├── logs/                           # 📊 Папка для логов
└── opencode.json                   # 🔧 Интеграция в главный конфиг
```

---

## 🚀 Как использовать

### Автоматический роутинг (по умолчанию)

```bash
# Простая задача → deepseek:1.3b
"Исправь опечатку в Header.tsx"

# Стандартная задача → qwen:7b
"Создай компонент формы логина"

# Сложная задача → qwen:32b
"Оптимизируй производительность рендеринга"

# Экспертная задача → deepseek:671b
"Проведи аудит безопасности API"
```

### Ручное переопределение

```bash
# Явное указание уровня
"Создай компонент @expert"
"Исправь баг @complex"
"Отформатируй @simple"
```

### Через теги

```bash
# Добавить теги в запрос
"Создай форму #component #feature"  → Standard
"Аудит безопасности #security #audit" → Expert
```

---

## 📊 Матрица моделей

| Уровень  | Модель        | Токены | Время | Когда                  |
| -------- | ------------- | ------ | ----- | ---------------------- |
| Simple   | deepseek:1.3b | 500    | 10s   | Правки, форматирование |
| Standard | qwen:7b       | 2000   | 30s   | Компоненты, тесты      |
| Complex  | qwen:32b      | 8000   | 60s   | Рефакторинг, отладка   |
| Expert   | deepseek:671b | 16000  | 120s  | Архитектура, аудит     |

---

## 🔧 Конфигурация

### orchestrator.jsonc

```jsonc
{
  "routing": {
    "simple": {
      /* ... */
    },
    "standard": {
      /* ... */
    },
    "complex": {
      /* ... */
    },
    "expert": {
      /* ... */
    },
  },
  "fallback": {
    "enabled": true,
    "onTimeout": "downgrade",
    "onError": "retry",
  },
  "autoDetect": {
    "enabled": true,
    "keywords": {
      /* ... */
    },
    "filePatterns": {
      /* ... */
    },
  },
}
```

---

## 📈 Мониторинг

### Логи

```bash
# Путь к логам
.opencode/logs/orchestrator.log

# Формат лога
{
  "timestamp": "2026-06-08T10:30:00Z",
  "task": "create component",
  "model": "qwen:7b",
  "level": "standard",
  "duration": 2.3,
  "tokens": 1200,
  "success": true
}
```

### Метрики

| Метрика            | Описание            | Цель   |
| ------------------ | ------------------- | ------ |
| `task.latency`     | Время выполнения    | < 30s  |
| `task.tokenUsage`  | Потребление токенов | < 5000 |
| `task.successRate` | Процент успеха      | > 95%  |
| `fallback.rate`    | Частота fallback    | < 5%   |

---

## 🔄 Fallback цепочка

```
Expert (120s timeout)
    ↓ timeout/error
Complex (60s timeout)
    ↓ timeout/error
Standard (30s timeout)
    ↓ timeout/error
Simple (10s timeout)
```

---

## 🧪 Тестирование

### Проверка работы

```bash
# 1. Простая задача
"Исправь опечатку"
→ Ожидаемо: deepseek:1.3b, < 10s

# 2. Стандартная задача
"Создай компонент"
→ Ожидаемо: qwen:7b, < 30s

# 3. Сложная задача
"Оптимизируй производительность"
→ Ожидаемо: qwen:32b, < 60s

# 4. Экспертная задача
"Аудит безопасности"
→ Ожидаемо: deepseek:671b, < 120s
```

### Проверка fallback

```bash
# Искусственный таймаут
"Выполни задачу @expert" (отключи сеть)
→ Ожидаемо: fallback на complex
```

---

## 🎯 Best Practices

### ✅ Делай

- Добавляй теги к задачам (`#component`, `#security`)
- Используй явные указания для критичных задач (`@expert`)
- Проверяй логи после сложных задач
- Настраивай `orchestrator.jsonc` под свой workflow

### ❌ Не делай

- Не игнорируй fallback ошибки
- Не отключай логирование в production
- не используй `@expert` для простых задач
- Не меняй timeout без необходимости

---

## 🐛 Troubleshooting

### Проблема: Задача выполняется медленно

**Решение:**

1. Проверь лог: `.opencode/logs/orchestrator.log`
2. Посмотри какую модель выбрали
3. Если перебор — используй `@simple` или `@standard`

### Проблема: Частые fallback

**Решение:**

1. Проверь доступность Ollama: `ollama list`
2. Увеличь timeout в `orchestrator.jsonc`
3. Проверь сеть для cloud моделей

### Проблема: Неправильный выбор модели

**Решение:**

1. Добавь явные теги в запрос
2. Обнови `keywords` в `orchestrator.jsonc`
3. Используй ручное переопределение `@level`

---

## 📝 Changelog

### v1.0.0 (2026-06-08)

- ✅ Базовый роутинг задач
- ✅ 4 уровня сложности
- ✅ Fallback цепочка
- ✅ Авто-детект по ключевым словам
- ✅ Логирование метрик
- ✅ Интеграция в opencode.json

### Planned (v1.1.0)

- ⏳ Авто-обучение на ошибках
- ⏳ Динамическая настройка timeout
- ⏳ Predictive model selection
- ⏳ Dashboard для мониторинга

---

## 🔗 Связанные документы

- [orchestrator.jsonc](./orchestrator.jsonc) — Конфиг роутинга
- [orchestrator-guide.md](./instructions/orchestrator-guide.md) — Гайд по классификации
- [orchestrator.md](./agents/orchestrator.md) — Агент-диспетчер
- [AGENTS.md](./AGENTS.md) — Все агенты проекта

---

## 👤 Автор

Создано в рамках настройки Senior-level Multi-Agent Orchestration System
