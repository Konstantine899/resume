---
description: Добавление Storybook stories для компонента с interaction tests и a11y
---

# Add Storybook Story

Добавляет Storybook stories для существующего компонента.

## Что создает

- Базовую meta конфигурацию
- Default story
- Stories для всех sizes
- Stories для всех variants
- Stories для всех states
- Interaction tests
- Accessibility checks

## Использование

```bash
/add-story <component-path>
```

## Примеры

```bash
# Добавить story для shared компонента
/add-story shared/ui/Button

# Добавить story для entity компонента
/add-story entities/user/ui/UserCard

# Добавить story для feature компонента
/add-story features/auth/ui/LoginForm
```

## Требования

- ✅ Story coverage > 95%
- ✅ Interaction test coverage > 80%
- ✅ Accessibility compliance > 90%
- ✅ Все states покрыты
- ✅ Edge cases добавлены

## Story Structure

```typescript
export const Default: Story = { /* ... */ };
export const Sizes: Story = { /* ... */ };
export const Variants: Story = { /* ... */ };
export const Disabled: Story = { /* ... */ };
export const Loading: Story = { /* ... */ };
export const Error: Story = { /* ... */ };
export const WithInteraction: Story = { play: async () => { /* ... */ } };
```
