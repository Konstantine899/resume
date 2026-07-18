# OpenCode Quick Start Guide

> **Проект:** Resume Portfolio  
> **Версия:** 2.0.0  
> **Дата:** 2026-07-18  
> **Статус:** ✅ Active

---

## 📋 Содержание

1. [Быстрая установка](#быстрая-установка)
2. [Первый запуск](#первый-запуск)
3. [Базовые команды](#базовые-команды)
4. [Создание первого компонента](#создание-первого-компонента)
5. [Code Review](#code-review)
6. [Генерация тестов](#генерация-тестов)
7. [Полезные команды](#полезные-команды)
8. [Следующие шаги](#следующие-шаги)

---

## Быстрая установка

### Требования

- ✅ **Node.js** 18+ ([Скачать](https://nodejs.org/))
- ✅ **OpenCode** ([Скачать](https://opencode.ai/))
- ✅ **Git** (опционально)

### Шаг 1: Установка OpenCode

```powershell
# Windows: скачайте установщик с https://opencode.ai/
# Установите в директорию по умолчанию

# Проверка установки
# Откройте OpenCode из меню Пуск
```

### Шаг 2: Настройка проекта

```powershell
# Перейдите в директорию проекта
cd D:\Dev\projects\resume

# Проверка структуры .opencode
Get-ChildItem .opencode

# Проверка конфигурации
Get-Content .opencode\opencode.json | Select-Object -First 20
```

### Шаг 3: Настройка переменных окружения

**Создайте файл `.env` в корне проекта:**

```bash
# Context7 MCP (документация библиотек)
CONTEXT7_API_KEY=your-api-key-here

# Получите API ключ на https://context7.upstash.com/
```

---

## Первый запуск

### Запуск OpenCode

1. **Откройте OpenCode** из меню Пуск
2. **Выберите проект:** `D:\Dev\projects\resume`
3. **Дождитесь инициализации** (первый запуск может занять 1-2 минуты)

### Проверка подключения

**Введите команду в чат OpenCode:**

```
/agents
```

**Ожидаемый результат:**
```
Available Agents:
- review (P1) - Code review
- fsd-design-skill (P1) - FSD дизайн (SKILL.md + references)
- guard (P0) - Безопасность
- orchestrator (P1) - Координация
- integration-test (P1) - Интеграционные тесты
- performance-test (P2) - Тесты производительности
- style (P2) - Валидация стилей
- git-commit (P1) - Git операции
```

### Проверка MCP серверов

**Введите команду:**

```
/mcp-status
```

**Ожидаемый результат:**
```
MCP Servers:
✅ filesystem - Connected
✅ memory - Connected
✅ context7 - Connected
✅ eslint - Connected
✅ playwright - Connected
✅ sequential-thinking - Connected
✅ serena - Connected
```

---

## Базовые команды

### Навигация

```bash
# Список доступных команд
/help

# Список агентов
/agents

# Статус агентов
/agent-status

# Информация об агенте
/agent-info orchestrator
```

### Работа с файлами

```bash
# Открыть файл
/open src/shared/ui/Button/Button.tsx

# Создать файл
/create src/shared/ui/Button/Button.test.tsx

# Редактировать файл
/edit src/shared/ui/Button/Button.tsx
```

### Code Review

```bash
# Code review файла
/review src/shared/ui/Button/Button.tsx

# Code review директории
/review src/shared/ui

# Security audit
/review src/features/auth --focus security
```

### Тесты

```bash
# Создать тесты
/test-generate src/shared/ui/Button

# Запустить тесты
npm run test

# Проверить coverage
/test-coverage src
```

---

## Создание первого компонента

### Шаг 1: Вызов пайплайна

**Введите команду в чат OpenCode:**

```
/create-component Button --layer shared
```

**Или используйте естественный язык:**

```
Создай Button компонент с вариантами primary, secondary, danger и размерами sm, md, lg
```

### Шаг 2: Ожидание выполнения

Пайплайн выполнит следующие шаги:

```
[1/6] component-boilerplate skill → создание компонента... ✅
[2/6] review агент → code review... ✅
[3/6] eslint-plugin-fsd-imports → валидация архитектуры... ✅
[4/6] test-generation skill → создание тестов... ✅
[5/6] storybook-setup skill → создание stories... ✅
[6/6] summary → итоговый отчёт... ✅
```

### Шаг 3: Проверка результата

**Созданные файлы:**

```
src/shared/ui/Button/
├── index.ts                 # Public API
├── model/
│   └── types.ts             # TypeScript типы
├── ui/
│   └── Button/
│       ├── Button.tsx       # Компонент
│       ├── Button.module.scss  # Стили
│       └── index.ts         # Export
├── Button.test.tsx          # Unit тесты
└── Button.stories.tsx       # Storybook stories
```

### Шаг 4: Проверка компонента

**Откройте созданный компонент:**

```
/open src/shared/ui/Button/ui/Button/Button.tsx
```

**Пример содержимого:**

```typescript
import React, { useState, useCallback } from 'react';
import { ButtonProps } from './model/types';
import styles from './Button.module.scss';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onClick?.();
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, onClick]);

  return (
    <button
      className={`${styles.container} ${styles[variant]} ${styles[size]} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
```

---

## Code Review

### Review созданного компонента

**Введите команду:**

```
/review src/shared/ui/Button
```

**Ожидаемый результат:**

```markdown
# Code Review Report

## Summary
- **Файлов проверено:** 6
- **Оценка:** 8.5/10
- **Статус:** ✅ Good

## Найденные проблемы

### ⚠️ Warning (2)

1. **Button.tsx:23** - Missing aria-label for icon-only buttons
   - Severity: Low
   - Suggestion: Add aria-label when children is empty

2. **Button.module.scss:15** - Hardcoded color value
   - Severity: Low
   - Suggestion: Use variable from shared/styles/variables

### ✅ Passed (4)

- TypeScript types: ✅ Strict mode
- CSS Modules: ✅ Proper architecture
- Accessibility: ✅ Good (minor issues)
- Performance: ✅ Optimized

## Recommendations

1. Добавить aria-label для кнопок с иконками
2. Вынести цвета в переменные
3. Добавить loading state в тесты
```

### Исправление проблем

**Введите команду:**

```
/fix-issues src/shared/ui/Button
```

**Пайплайн исправит проблемы:**

```
[1/3] diagnose → анализ проблем... ✅
[2/3] fix → исправление... ✅
[3/3] verify → проверка... ✅
```

---

## Генерация тестов

### Создание тестов

**Если тесты не были созданы автоматически:**

```
/test-generate src/shared/ui/Button
```

**Ожидаемый результат:**

```markdown
# Test Generation Report

## Созданные тесты

### Unit Tests (Button.test.tsx)

✅ Render tests (3)
- renders Button with children
- renders with different variants
- renders with different sizes

✅ Interaction tests (3)
- calls onClick when clicked
- does not call onClick when disabled
- shows loading state

✅ Edge cases (2)
- handles rapid clicks
- handles async onClick

### Coverage

- Lines: 92%
- Functions: 100%
- Branches: 88%

## Status: ✅ Complete
```

### Запуск тестов

```powershell
# Запуск всех тестов
npm run test

# Запуск тестов конкретного компонента
npm run test -- Button

# Запуск с coverage
npm run test:coverage
```

---

## Полезные команды

### Быстрые команды

```bash
# Создать компонент (через orchestrator)
# /orchestrator "create <name> component in <layer> layer"

# Code review
/review <path>

# Исправить баг
/review <path> --fix

# Рефакторинг
/review <path> --refactor

# Валидация FSD
npx eslint src/ --no-ignore

# Проверка безопасности
/review <path> --focus security

# Проверка производительности
/performance-test <path>
```

### Команды для работы с агентами

```bash
# Вызвать конкретного агента
@orchestrator Create a Input component
@review Check this code: <code>
@review Create tests for <component>
@orchestrator Handle this complex task: <task>
```

### Команды для навигации

```bash
# Открыть файл
/open <path>

# Создать файл
/create <path>

# Редактировать файл
/edit <path> <changes>

# Найти файл
/find <pattern>

# Найти в файлах
/grep <pattern>
```

---

## Следующие шаги

### 1. Изучение документации

- [CONFIGURATION.md](./CONFIGURATION.md) — Подробная конфигурация
- [AGENTS.md](./AGENTS.md) — Главная инструкция для AI
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Решение проблем

### 2. Практические задачи

**Задача 1: Создать форму логина**

```
/orchestrator "Создать форму логина с валидацией email/password, 
              remember me чекбоксом и кнопкой отправки"
```

**Задача 2: Code review существующего кода**

```
/review src/features/auth
```

**Задача 3: Рефакторинг компонента**

```
/refactor src/shared/ui/Button --optimize performance
```

### 3. Настройка под себя

**Изучите и настройте:**

1. **opencode.json** — главная конфигурация
2. **config/quality-gates.jsonc** — критерии качества
3. **config/pipelines.jsonc** — пайплайны
4. **agents/*.md** — инструкции агентам

### 4. Продвинутые возможности

**Мульти-агентные пайплайны:**

```
/orchestrator "Создать полный CRUD для User entity:
               1. UI компоненты
               2. API integration
               3. Тесты
               4. Документация"
```

**Адверсариальный review:**

```
/review src/features/auth --focus security,performance
```

**Анализ производительности:**

```
/perf-check src --metrics render-time,bundle-size,memory
```

---

## FAQ

### Q: Как переключить модель?

**A:** Используйте команду `switch-profile.md` в commands/:

```
/switch-profile
```

Доступные профили: `opencode/deepseek-v4-flash-free`, `ollama-cloud/qwen3.5:397b-cloud`.

### Q: Как отключить Guard Agent?

**A:** Guard Agent нельзя отключить (это security feature). Но можно настроить правила в `opencode.json`.

### Q: Как добавить своего агента?

**A:** Создайте файл `.opencode/agents/my-agent.md` с инструкциями и добавьте в `opencode.json`.

### Q: Где хранятся логи?

**A:** Логи хранятся в `.opencode/logs/`:
- `guard-audit.log` — аудит Guard
- `quality-gates.log` — Quality Gates
- `pipelines.log` — Пайплайны

### Q: Как очистить контекст?

**A:** 

```
/clear-context
```

Или вручную удалите файлы в `.opencode/context/`.

---

## Связанные документы

- [CONFIGURATION.md](./CONFIGURATION.md) — Конфигурация OpenCode
- [AGENTS.md](./AGENTS.md) — Главная инструкция для AI
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Решение проблем

---

**Версия документации:** 1.0.0  
**Дата создания:** 2026-06-14
