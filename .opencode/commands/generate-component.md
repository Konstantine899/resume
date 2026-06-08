---
description: Генерация React компонента с полной структурой (tsx, scss, stories, tests)
---

# Generate Component

Создает новый React компонент со всей необходимой структурой.

## Что создает

```
<ComponentName>/
├── <ComponentName>.tsx
├── <ComponentName>.module.scss
├── <ComponentName>.stories.tsx
├── <ComponentName>.test.tsx
└── index.ts
```

## Использование

```bash
/generate-component <name> --layer <layer> --slice <slice>
```

## Параметры

- `name` - имя компонента (PascalCase)
- `layer` - слой FSD (shared, entities, features, widgets, pages)
- `slice` - слайс (опционально для shared)

## Примеры

```bash
# Shared компонент
/generate-component Button --layer shared

# Entity компонент
/generate-component UserCard --layer entities --slice user

# Feature компонент
/generate-component LoginForm --layer features --slice auth
```

## Требования

- ✅ TypeScript строгая типизация
- ✅ CSS Modules
- ✅ Storybook stories
- ✅ Vitest тесты
- ✅ Accessibility support
- ✅ Named exports
