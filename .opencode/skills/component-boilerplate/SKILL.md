---
name: component-boilerplate
description: Создание React компонентов с правильной структурой, типами, стилями и тестами. Use ONLY when creating new UI components in shared/ui.
---

# Component Boilerplate Skill

## Когда использовать

Использовать ТОЛЬКО при создании новых UI компонентов в:
- `shared/ui/` - переиспользуемые компоненты
- `entities/<name>/ui/` - entity-specific компоненты
- `features/<name>/ui/` - feature-specific компоненты

## Структура компонента

```
<ComponentName>/
├── <ComponentName>.tsx         # Основной компонент
├── <ComponentName>.module.scss # Стили (CSS Modules)
├── <ComponentName>.stories.tsx # Storybook stories
├── <ComponentName>.test.tsx    # Vitest тесты
└── index.ts                    # Public API (если компонент в папке)
```

## Шаблон компонента

### 1. Основной файл (Component.tsx)

```typescript
import React from 'react';
import { ComponentNameProps } from './model/types'; // или ../../model/types
import styles from './ComponentName.module.scss';

export const ComponentName: React.FC<ComponentNameProps> = ({
  className = '',
  children,
  // другие props
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {children}
    </div>
  );
};
```

### 2. Типы (model/types.ts)

```typescript
export type ComponentNameSize = 'sm' | 'md' | 'lg';
export type ComponentNameVariant = 'primary' | 'secondary';

export interface ComponentNameProps {
  children?: React.ReactNode;
  size?: ComponentNameSize;
  variant?: ComponentNameVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}
```

### 3. Стили (ComponentName.module.scss)

```scss
// Базовые стили
.container {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Размеры
.sm {
  width: 32px;
  height: 32px;
}

.md {
  width: 48px;
  height: 48px;
}

.lg {
  width: 64px;
  height: 64px;
}

// Варианты
.primary {
  background-color: #007bff;
  color: white;
}

.secondary {
  background-color: #6c757d;
  color: white;
}

// Состояния
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 4. Storybook Stories (ComponentName.stories.tsx)

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Shared/UI/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

// Базовый story
export const Default: Story = {
  args: {
    children: 'Content',
    size: 'md',
    variant: 'primary',
  },
};

// Все размеры
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
    </div>
  ),
};

// Все варианты
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
    </div>
  ),
};

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};
```

### 5. Тесты (ComponentName.test.tsx)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('должен рендериться с children', () => {
    render(<ComponentName>Test Content</ComponentName>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('должен применять className', () => {
    const { container } = render(
      <ComponentName className="custom-class">Content</ComponentName>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('должен вызывать onClick', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick}>Click me</ComponentName>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('не должен вызывать onClick когда disabled', () => {
    const handleClick = vi.fn();
    render(
      <ComponentName onClick={handleClick} disabled>
        Click me
      </ComponentName>
    );
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('должен иметь правильный size class', () => {
    const { container } = render(
      <ComponentName size="lg">Content</ComponentName>
    );
    expect(container.firstChild).toHaveClass('lg');
  });
});
```

## Правила

### 1. Типизация

- ✅ Всегда использовать React.FC<Props> или FC<Props>
- ✅ Все props должны быть типизированы
- ✅ Использовать interface для props
- ✅ Избегать any, unknown только с валидацией

### 2. Стили

- ✅ Только CSS Modules (.module.scss)
- ✅ BEM-like naming в SCSS
- ✅ Использовать className prop для внешних стилей
- ✅ Избегать !important

### 3. Доступность

- ✅ Semantic HTML (button для кликабельных)
- ✅ ARIA attributes где нужно
- ✅ Keyboard navigation support
- ✅ Focus management

### 4. Производительность

- ✅ React.memo для тяжелых компонентов
- ✅ useCallback для event handlers
- ✅ useMemo для дорогих вычислений
- ✅ Правильные key в списках

## Запреты

- ❌ Не использовать inline styles
- ❌ Не использовать global CSS
- ❌ Не использовать !important
- ❌ Не использовать div вместо button для кликабельных
- ❌ Не пропускать типизацию props
- ❌ Не создавать компоненты >300 строк

## Чеклист перед завершением

- [ ] Компонент типизирован строго
- [ ] CSS Modules используются
- [ ] Storybook stories созданы
- [ ] Vitest тесты написаны
- [ ] Accessibility проверен
- [ ] Все состояния покрыты (disabled, loading, error)
- [ ] Public API экспортирует правильно

---

**Component Boilerplate Skill - Senior Level** ⚛️
