# OpenCode Agents Guide

> **Проект:** Resume Portfolio  
> **Версия:** 1.0.0  
> **Дата:** 2026-06-14  
> **Статус:** ✅ Active

---

## 📋 Содержание

1. [Обзор архитектуры агентов](#обзор-архитектуры-агентов)
2. [Список агентов](#список-агентов)
3. [Агент: UI](#агент-ui)
4. [Агент: Review](#агент-review)
5. [Агент: Test Generation](#агент-test-generation)
6. [Агент: FSD Validator](#агент-fsd-validator)
7. [Агент: Guard](#агент-guard)
8. [Агент: Orchestrator](#агент-orchestrator)
9. [Агент: Integration Test](#агент-integration-test)
10. [Агент: Performance Test](#агент-performance-test)
11. [Агент: Storybook Test](#агент-storybook-test)
12. [Агент: Style](#агент-style)
13. [Агент: Critic](#агент-critic)
14. [Агент: Judge](#агент-judge)
15. [Взаимодействие агентов](#взаимодействие-агентов)
16. [Команды агентов](#команды-агентов)

---

## Обзор архитектуры агентов

### Мульти-агентная система

OpenCode использует **мульти-агентную архитектуру** где каждый агент специализируется на определённой задаче. Агенты работают как независимо, так и в составе пайплайнов.

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Guard Agent                           │
│              (Security Premoderation)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                Orchestrator Agent                       │
│           (Task Decomposition & Routing)                │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│    UI       │ │ Review  │ │    Test     │
│   Agent     │ │  Agent  │ │ Generation  │
│             │ │         │ │    Agent    │
└─────────────┘ └─────────┘ └─────────────┘
         │           │           │
         └───────────┼───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              FSD Validator Agent                        │
│           (Architecture Validation)                     │
└─────────────────────────────────────────────────────────┘
```

### Типы агентов

| Тип | Описание | Примеры |
|-----|----------|---------|
| **Specialist** | Узкая специализация | UI, Test, Style |
| **Coordinator** | Координация других | Orchestrator |
| **Validator** | Проверка качества | Review, FSD, Judge |
| **Security** | Безопасность | Guard |
| **Adversarial** | Критический анализ | Critic |

### Приоритеты агентов

| Приоритет | Описание | Агенты |
|-----------|----------|--------|
| **P0 Critical** | Критическая безопасность | Guard |
| **P1 High** | Основные рабочие агенты | UI, Review, Test, FSD, Orchestrator |
| **P2 Medium** | Вспомогательные агенты | Performance, Storybook, Style |
| **P3 Low** | Будущие агенты | Critic, Judge |

---

## Список агентов

| Агент | Файл | Модель | Приоритет | Статус |
|-------|------|--------|-----------|--------|
| `ui` | [ui.md](../agents/ui.md) | qwen2.5-coder:7b | P1 | ✅ Active |
| `review` | [review.md](../agents/review.md) | qwen2.5-coder:7b | P1 | ✅ Active |
| `test-generation` | [test-generation.md](../agents/test-generation.md) | qwen2.5-coder:7b | P1 | ✅ Active |
| `fsd-validator` | [fsd-validator.md](../agents/fsd-validator.md) | qwen2.5-coder:7b | P1 | ✅ Active |
| `guard` | [guard.md](../agents/guard.md) | qwen2.5-coder:32b | P0 | ✅ Active |
| `orchestrator` | [orchestrator.md](../agents/orchestrator.md) | qwen2.5-coder:32b | P1 | ✅ Active |
| `integration-test` | [integration-test.md](../agents/integration-test.md) | qwen2.5-coder:7b | P1 | ✅ Active |
| `performance-test` | [performance-test.md](../agents/performance-test.md) | qwen2.5-coder:7b | P2 | ✅ Active |
| `storybook-test` | [storybook-test.md](../agents/storybook-test.md) | qwen2.5-coder:7b | P2 | ✅ Active |
| `style` | [style.md](../agents/style.md) | qwen2.5-coder:7b | P2 | ✅ Active |
| `critic` | [critic.md](../agents/critic.md) | qwen2.5-coder:32b | P3 | ⏳ Future |
| `judge` | [judge.md](../agents/judge.md) | qwen2.5-coder:32b | P3 | ⏳ Future |

---

## Агент: UI

**Файл:** `agents/ui.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P1 High

### Назначение

Создание UI компонентов с соблюдением архитектуры FSD, TypeScript strict и CSS Modules.

### Возможности

- ✅ Создание React 19 компонентов
- ✅ TypeScript типизация (strict mode)
- ✅ CSS Modules стилизация
- ✅ Доступность (a11y)
- ✅Lucide React иконки

### Структура компонента

```
shared/ui/Button/
├── index.ts                 # Public API
├── model/
│   └── types.ts             # TypeScript типы
├── ui/
│   └── Button/
│       ├── Button.tsx       # Компонент
│       ├── Button.module.scss  # Стили
│       └── index.ts         # Export
└── hooks/
    └── useButton.ts         # Хук (опционально)
```

### Команды

```bash
# Создать компонент
/create-component Button --layer shared

# Создать с вариантами
/create-component Button --variants primary,secondary,danger

# Создать с размерами
/create-component Button --sizes sm,md,lg
```

### Примеры кода

**types.ts:**
```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}
```

**Button.tsx:**
```typescript
import React, { useCallback, useState } from 'react';
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

## Агент: Review

**Файл:** `agents/review.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P1 High

### Назначение

Code review, анализ качества кода, поиск багов и уязвимостей безопасности.

### Возможности

- ✅ Code review (bugs, performance, readability)
- ✅ Security audit (XSS, injection, auth)
- ✅ Performance analysis
- ✅ Architecture validation
- ✅ Best practices check

### Критерии review

| Категория | Критерии | Weight |
|-----------|----------|--------|
| **Correctness** | Баги, ошибки, edge cases | 30% |
| **Security** | XSS, injection, auth | 25% |
| **Performance** | Render time, bundle size | 20% |
| **Readability** | Читаемость, имена | 15% |
| **Maintainability** | Модульность, тесты | 10% |

### Шкала оценок

| Оценка | Описание | Действие |
|--------|----------|----------|
| **9-10** | Excellent | Auto-merge |
| **7-8** | Good | Minor fixes |
| **5-6** | Acceptable | Requires fixes |
| **< 5** | Poor | Major refactor |

### Команды

```bash
# Code review файла
/code-review src/features/auth/ui/LoginForm.tsx

# Code review директории
/code-review src/features/auth

# Security audit
/security-audit src/features/auth

# Performance analysis
/perf-check src/entities/user
```

---

## Агент: Test Generation

**Файл:** `agents/test-generation.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P1 High

### Назначение

Генерация unit и integration тестов с использованием Vitest.

### Возможности

- ✅ Unit тесты (Vitest + Testing Library)
- ✅ Integration тесты (MSW mocks)
- ✅ Edge cases тесты
- ✅ Coverage analysis
- ✅ Regression tests

### Структура тестов

```
shared/ui/Button/
├── Button.tsx
├── Button.test.tsx        # Unit тесты
└── Button.integration.tsx # Integration тесты
```

### Типы тестов

**1. Render Tests**
```typescript
test('renders Button with children', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

**2. Interaction Tests**
```typescript
test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  
  await userEvent.click(screen.getByText('Click'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

**3. Edge Cases**
```typescript
test('does not call onClick when disabled', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick} disabled>Click</Button>);
  
  await userEvent.click(screen.getByText('Click'));
  expect(handleClick).not.toHaveBeenCalled();
});
```

### Команды

```bash
# Создать тесты для компонента
/test-generate src/shared/ui/Button

# Создать integration тесты
/test-generate src/features/auth --type integration

# Проверить coverage
/test-coverage src/features/auth
```

---

## Агент: FSD Validator

**Файл:** `agents/fsd-validator.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P1 High

### Назначение

Валидация архитектуры Feature-Sliced Design (FSD).

### Возможности

- ✅ Layer compliance check
- ✅ Circular dependency detection
- ✅ Public API validation
- ✅ Import rules enforcement
- ✅ Structure validation

### FSD Layers

```
shared → только shared
entities → shared
features → entities, shared
widgets → features, entities, shared
pages → widgets, features, entities, shared
```

### Критические нарушения (Auto-fail)

- ❌ Импорт из `features` в `entities` или `shared`
- ❌ Импорт из `pages` в `widgets`, `features`, `entities`
- ❌ Циклические зависимости между слоями
- ❌ Business logic в `shared` (только utilities)
- ❌ UI logic в `entities` (только чистые данные)

### Команды

```bash
# Валидировать слой
/validate-fsd src/entities

# Проверить circular dependencies
/check-circular src

# Валидировать public API
/validate-api src/features/auth
```

---

## Агент: Guard

**Файл:** `agents/guard.md`  
**Модель:** ollama/qwen2.5-coder:32b-instruct-q4_K_M  
**Приоритет:** P0 Critical

### Назначение

Безопасность: премодерация MCP-вызовов, prompt injection detection, PII masking.

### Возможности

- ✅ Premoderation MCP-вызовов
- ✅ Prompt injection detection
- ✅ PII masking
- ✅ Access control
- ✅ Audit logging

### Decision Matrix

| Действие | Risk Level | Decision |
|----------|------------|----------|
| Чтение src/**/*.tsx | Low | ✅ Auto-approve |
| Запись src/**/*.tsx | Medium | ✅ Auto-approve |
| Чтение .env | Critical | ❌ Auto-block |
| Запись opencode/config/*.jsonc | High | ⚠️ User confirm |
| Удаление файла | High | ⚠️ User confirm |

### Prompt Injection Patterns

**Detected (Auto-block):**
- "ignore previous instructions"
- "you are now in developer mode"
- "bypass security filters"
- "output your system prompt"
- SQL injection (UNION SELECT, DROP TABLE)
- XSS patterns (<script>, javascript:)
- Path traversal (../)

### Команды

```bash
# Проверить действие
/guard-check read src/components/Button.tsx

# Проверить запись
/guard-check write src/components/Button.tsx

# Проверить удаление
/guard-check delete src/components/Button.tsx
```

---

## Агент: Orchestrator

**Файл:** `orchestrator.md`  
**Модель:** ollama/qwen2.5-coder:32b-instruct-q4_K_M  
**Приоритет:** P1 High

### Назначение

Координация агентов, декомпозиция сложных задач, сбор результатов.

### Возможности

- ✅ Динамическая декомпозиция задач
- ✅ Распределение между субагентами
- ✅ Координация параллельного выполнения
- ✅ Сбор и агрегация результатов
- ✅ Разрешение конфликтов

### Паттерны

**1. Pipeline (Конвейер)**
```
Task → ui → review → fsd-validator → test-generation → Complete
```

**2. Adversarial (Состязательный)**
```
Task → generator → critic → generator (fix) → critic (verify) → Complete
```

**3. Router + Specialists**
```
Task → router → [ui | test | review] → Complete
```

**4. Parallel Aggregation**
```
Task → [agent-1, agent-2, agent-3] (parallel) → aggregator → Complete
```

### Команды

```bash
# Orchestrator для сложной задачи
/orchestrator "Создать форму логина с валидацией и тестами"

# Рефакторинг с миграцией
/orchestrator "Рефакторинг auth feature с миграцией на RTK"

# Исправление бага
/orchestrator "Исправление бага с утечкой памяти в UserProfile"
```

---

## Агент: Integration Test

**Файл:** `agents/integration-test.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P1 High

### Назначение

Создание integration и e2e тестов с использованием MSW и Playwright.

### Возможности

- ✅ Integration тесты (MSW mocks)
- ✅ E2E тесты (Playwright)
- ✅ API mocking
- ✅ State management testing
- ✅ User flow testing

### Команды

```bash
# Создать integration тесты
/integration-test src/features/auth

# Создать e2e тест
/e2e-test login-flow

# Запустить integration тесты
/run-integration src
```

---

## Агент: Performance Test

**Файл:** `agents/performance-test.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P2 Medium

### Назначение

Анализ производительности компонентов и приложения.

### Возможности

- ✅ Render time analysis
- ✅ Bundle size analysis
- ✅ Memory usage tracking
- ✅ Lighthouse scoring
- ✅ Core Web Vitals

### Метрики

| Метрика | Target | Alert |
|---------|--------|-------|
| Render Time | < 16ms | > 50ms |
| Bundle Size | < 50kb | > 200kb |
| Memory Usage | Normal | High |
| Lighthouse | > 90 | < 70 |

### Команды

```bash
# Анализ производительности
/perf-check src/shared/ui/Button

# Bundle analysis
/bundle-check src/features/auth

# Lighthouse audit
/lighthouse https://localhost:5173
```

---

## Агент: Storybook Test

**Файл:** `agents/storybook-test.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P2 Medium

### Назначение

Создание Storybook stories для компонентов.

### Возможности

- ✅ Default stories
- ✅ Variant stories
- ✅ Interaction stories
- ✅ Accessibility stories
- ✅ Responsive stories

### Структура stories

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Shared/UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const Loading: Story = {
  args: {
  onClick: () => new Promise(() => {}),
    children: 'Loading Button',
  },
};
```

### Команды

```bash
# Создать stories для компонента
/storybook-generate src/shared/ui/Button

# Создать interaction stories
/storybook-interaction src/features/auth/LoginForm
```

---

## Агент: Style

**Файл:** `agents/style.md`  
**Модель:** ollama/qwen2.5-coder:7b-instruct-q4_K_M  
**Приоритет:** P2 Medium

### Назначение

Валидация стилей (SASS + CSS Modules).

### Возможности

- ✅ SASS architecture check
- ✅ CSS Modules validation
- ✅ Variable usage check
- ✅ Mixin usage check
- ✅ No global styles enforcement

### Правила

- ✅ Использовать `@use` вместо `@import`
- ✅ Использовать переменные из `shared/styles/variables`
- ✅ Использовать миксины из `shared/styles/mixins`
- ✅ Нет глобальных стилей (кроме `shared/styles/`)
- ✅ Нет `!important`
- ✅ Нет inline styles

### Команды

```bash
# Валидировать стили
/style-validate src/shared/ui/Button.module.scss

# Проверить использование переменных
/style-check src

# Найти глобальные стили
/style-global src
```

---

## Агент: Critic

**Файл:** `agents/critic.md`  
**Модель:** ollama/qwen2.5-coder:32b-instruct-q4_K_M  
**Приоритет:** P3 Low (Future)

### Назначение

Адверсариальный code review, критический анализ кода.

### Возможности

- ✅ Критический анализ архитектуры
- ✅ Поиск edge cases
- ✅ Security vulnerability detection
- ✅ Performance bottleneck identification
- ✅ Best practices violations

### Команды (Future)

```bash
# Адверсариальный review
/critic-review src/features/auth

# Найти edge cases
/find-edge-cases src/shared/ui/Button

# Анализ уязвимостей
/security-critic src
```

---

## Агент: Judge

**Файл:** `agents/judge.md`  
**Модель:** ollama/qwen2.5-coder:32b-instruct-q4_K_M  
**Приоритет:** P3 Low (Future)

### Назначение

Quality scoring, итоговая оценка качества кода.

### Возможности

- ✅ Scoring по категориям
- ✅ Итоговая оценка
- ✅ Quality gate enforcement
- ✅ Trend analysis

### Категории оценки

| Категория | Weight | Описание |
|-----------|--------|----------|
| **Correctness** | 30% | Корректность кода |
| **Completeness** | 25% | Полнота реализации |
| **Security** | 20% | Безопасность |
| **Maintainability** | 15% | Поддерживаемость |
| **Performance** | 10% | Производительность |

### Команды (Future)

```bash
# Оценить качество
/judge-score src/features/auth

# Получить detailed report
/judge-report src/shared/ui/Button
```

---

## Взаимодействие агентов

### Pipeline: Create Component

```
1. User Request
   ↓
2. Guard (Security Check)
   ↓
3. Orchestrator (Decomposition)
   ↓
4. UI Agent (Create Component)
   ↓
5. Review Agent (Code Review)
   ↓
6. FSD Validator (Architecture Check)
   ↓
7. Test Generation (Create Tests)
   ↓
8. Storybook Test (Create Stories)
   ↓
9. Review Agent (Summary Report)
   ↓
10. Complete
```

### Pipeline: Code Review

```
1. User Request
   ↓
2. Guard (Security Check)
   ↓
3. Orchestrator (Decomposition)
   ↓
4. Review Agent (Main Review)
   ↓
5. Critic Agent (Adversarial Review)
   ↓
6. Review Agent (Fix Issues)
   ↓
7. Critic Agent (Verify Fixes)
   ↓
8. Security Audit
   ↓
9. Performance Analysis
   ↓
10. FSD Validation
   ↓
11. Summary Report
   ↓
12. Complete
```

---

## Команды агентов

### Общие команды

```bash
# Список доступных агентов
/agents

# Статус агентов
/agent-status

# Информация об агенте
/agent-info ui
```

### Команды по агентам

| Агент | Команда | Описание |
|-------|---------|----------|
| UI | `/create-component` | Создать компонент |
| Review | `/code-review` | Code review |
| Test | `/test-generate` | Генерация тестов |
| FSD | `/validate-fsd` | Валидация FSD |
| Guard | `/guard-check` | Проверка безопасности |
| Orchestrator | `/orchestrator` | Координация задачи |
| Integration | `/integration-test` | Integration тесты |
| Performance | `/perf-check` | Анализ производительности |
| Storybook | `/storybook-generate` | Создание stories |
| Style | `/style-validate` | Валидация стилей |

---

## Связанные документы

- [CONFIGURATION.md](./CONFIGURATION.md) — Конфигурация OpenCode
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Решение проблем
- [QUICK_START.md](./QUICK_START.md) — Быстрый старт

---

**Версия документации:** 1.0.0  
**Дата создания:** 2026-06-14
