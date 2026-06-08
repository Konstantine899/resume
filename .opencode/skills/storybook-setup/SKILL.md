---
name: storybook-setup
description: Настройка Storybook stories с interaction tests, accessibility checks и documentation. Use ONLY when adding Storybook coverage to components.
---

# Storybook Setup Skill

## Когда использовать

Использовать ТОЛЬКО при:
- Создании новых Storybook stories для компонентов
- Добавлении interaction tests
- Настройке accessibility testing
- Создании документации компонентов

## Структура stories файла

```typescript
<ComponentName>.stories.tsx
```

## Минимальная конфигурация

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Shared/UI/ComponentName', // или Entities/<Name>/..., Features/<Name>/...
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
```

## Обязательные stories

### 1. Default Story

```typescript
export const Default: Story = {
  args: {
    // Все props со значениями по умолчанию
  },
};
```

### 2. All Sizes (если есть size prop)

```typescript
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <ComponentName size="sm">Small</ComponentName>
      <ComponentName size="md">Medium</ComponentName>
      <ComponentName size="lg">Large</ComponentName>
      <ComponentName size="xl">XL</ComponentName>
    </div>
  ),
};
```

### 3. All Variants (если есть variant prop)

```typescript
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <ComponentName variant="primary">Primary</ComponentName>
      <ComponentName variant="secondary">Secondary</ComponentName>
      <ComponentName variant="outline">Outline</ComponentName>
    </div>
  ),
};
```

### 4. States (disabled, loading, error)

```typescript
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled State',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading State',
  },
};

export const Error: Story = {
  args: {
    hasError: true,
    children: 'Error State',
  },
};
```

### 5. Edge Cases

```typescript
export const LongContent: Story = {
  args: {
    children: 'Very long content that should wrap and show how the component handles overflow situations',
  },
};

export const Empty: Story = {
  args: {
    children: undefined,
  },
};
```

## Interaction Tests

### Basic Interaction

```typescript
import { userEvent } from '@storybook/test';
import { expect, within } from '@storybook/test';

export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Find element
    const button = canvas.getByRole('button');
    
    // Click
    await userEvent.click(button);
    
    // Assert
    await expect(button).toHaveAttribute('data-clicked', 'true');
  },
};
```

### Form Interaction

```typescript
export const FormInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Type
    const input = canvas.getByLabelText('Email');
    await userEvent.type(input, 'test@example.com');
    
    // Select
    const select = canvas.getByRole('combobox');
    await userEvent.selectOptions(select, 'option1');
    
    // Submit
    const submitButton = canvas.getByRole('button', { name: 'Submit' });
    await userEvent.click(submitButton);
    
    // Assert
    await expect(canvas.getByText('Success')).toBeInTheDocument();
  },
};
```

### Error State Interaction

```typescript
export const ErrorHandling: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    
    // Trigger error
    const invalidInput = canvas.getByRole('textbox');
    await userEvent.type(invalidInput, 'invalid{Enter}');
    
    // Assert error shown
    await expect(canvas.getByText('Invalid input')).toBeInTheDocument();
  },
};
```

## Accessibility Tests

### A11y Configuration

```typescript
const meta: Meta<typeof ComponentName> = {
  // ...
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'html-has-lang', enabled: true },
        ],
      },
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa'],
        },
      },
    },
  },
};
```

### Keyboard Navigation Test

```typescript
export const KeyboardNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Tab through elements
    await userEvent.tab();
    await expect(canvas.getByRole('button')).toHaveFocus();
    
    await userEvent.tab();
    await expect(canvas.getByRole('textbox')).toHaveFocus();
    
    // Enter key
    await userEvent.keyboard('{Enter}');
    
    // Escape key
    await userEvent.keyboard('{Escape}');
  },
};
```

## Story Organization

### Path Structure

```
Shared/UI/           - shared/ui компоненты
Entities/<Name>/     - entity-specific компоненты
Features/<Name>/     - feature-specific компоненты
Widgets/<Name>/      - widget компоненты
Pages/<Name>/        - page компоненты
```

### Grouping Stories

```typescript
// В одном файле
export const Primary: Story = { /* ... */ };
export const Secondary: Story = { /* ... */ };

// Или через под-заголовки
const meta: Meta = {
  title: 'Shared/UI/Button/Primary',
  // ...
};
```

## Metrics

| Метрика | Требование |
|---------|------------|
| Story Coverage | > 95% компонентов |
| Interaction Tests | > 80% интерактивных компонентов |
| Accessibility | > 90% compliance |
| Visual Tests | > 70% критических компонентов |

## Чеклист

- [ ] Meta настроен с title, component, parameters
- [ ] Default story создан
- [ ] Все sizes покрыты
- [ ] Все variants покрыты
- [ ] Все states покрыты (disabled, loading, error)
- [ ] Edge cases добавлены
- [ ] Interaction tests для интерактивных элементов
- [ ] Accessibility config добавлен
- [ ] Keyboard navigation протестирован
- [ ] Tags установлены (autodocs)

## Запреты

- ❌ Не создавать stories без args для всех props
- ❌ Не пропускать disabled/Loading states
- ❌ Не игнорировать accessibility
- ❌ Не создавать interaction tests без assertions
- ❌ Не использовать hard-coded значения без controls

---

**Storybook Setup Skill - Senior Level** 📚
