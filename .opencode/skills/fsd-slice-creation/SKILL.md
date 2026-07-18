---
name: fsd-slice-creation
description: Создание FSD slice (entity/feature) с правильной структурой папок, типами и public API. Use ONLY when creating new entities or features.
---

# FSD Slice Creation Skill

> **Prerequisite**: Load `.opencode/skills/fsd-design/SKILL.md` first for the full FSD v2.1 decision framework, layer hierarchy, and import rules.

## Когда использовать

Использовать ТОЛЬКО при создании новых:
- **Entities** (бизнес-сущности: user, project, order)
- **Features** (пользовательские взаимодействия: auth, filtering, sorting)

## Структура Entity Slice

```
entities/<entityName>/
├── index.ts                    # Public API
├── model/
│   ├── types.ts                # TypeScript типы
│   ├── constants.ts            # Константы
│   └── selectors.ts            # Redux selectors (если есть store)
├── ui/
│   └── <EntityComponent>/
│       ├── <EntityComponent>.tsx
│       ├── <EntityComponent>.module.scss
│       └── index.ts
├── hooks/
│   └── use<EntityName>.ts
└── api/
    └── <entityName>Api.ts      # API endpoints (если нужны)
```

## Структура Feature Slice

```
features/<featureName>/
├── index.ts                    # Public API
├── model/
│   ├── types.ts                # TypeScript типы
│   └── constants.ts            # Константы
├── ui/
│   └── <FeatureComponent>/
│       ├── <FeatureComponent>.tsx
│       ├── <FeatureComponent>.module.scss
│       └── index.ts
└── hooks/
    └── use<FeatureName>.ts
```

## Правила создания

### 1. Типы (model/types.ts)

```typescript
// ✅ CORRECT
export type EntityName = {
  id: string;
  name: string;
  createdAt: string;
};

export interface EntityNameProps {
  data: EntityName;
  className?: string;
}

// ❌ WRONG - не использовать any
export interface WrongProps {
  data: any;
}
```

### 2. Public API (index.ts)

```typescript
// ✅ CORRECT - named exports
export type { EntityName, EntityNameProps } from './model/types';
export { EntityComponent } from './ui/EntityComponent/EntityComponent';
export { useEntityName } from './hooks/useEntityName';

// ❌ WRONG - не использовать default exports
export { default as EntityComponent } from './ui/EntityComponent';
```

### 3. Компоненты (ui/<Component>/<Component>.tsx)

```typescript
import React from 'react';
import { EntityNameProps } from '../../model/types';
import styles from './<Component>.module.scss';

export const <Component>: React.FC<EntityNameProps> = ({
  data,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Component content */}
    </div>
  );
};
```

### 4. Стили (ui/<Component>/<Component>.module.scss)

```scss
// ✅ CORRECT - CSS Modules
.container {
  display: flex;
  flex-direction: column;
}

// ❌ WRONG - не использовать глобальные стили
:global(.container) {
  display: flex;
}
```

## Запреты

- ❌ Не создавать файлы напрямую в slice (только в подпапках)
- ❌ Не использовать default exports в public API
- ❌ Не импортировать из features/pages/widgets в entities
- ❌ Не размещать бизнес-логику в shared (только utilities)
- ❌ Не создавать God components (>200 строк)

## Чеклист перед завершением

- [ ] Создана правильная структура папок
- [ ] Создан model/types.ts с строгими типами
- [ ] Создан index.ts с named exports
- [ ] Компонент использует CSS Modules
- [ ] Нет нарушений FSD layer dependencies
- [ ] Все типы экспортированы через public API

## Примеры

### Entity: User

```
entities/user/
├── index.ts
├── model/
│   ├── types.ts
│   └── selectors.ts
├── ui/
│   └── UserCard/
│       ├── UserCard.tsx
│       ├── UserCard.module.scss
│       └── index.ts
└── hooks/
    └── useUser.ts
```

### Feature: Auth

```
features/auth/
├── index.ts
├── model/
│   └── types.ts
├── ui/
│   └── LoginForm/
│       ├── LoginForm.tsx
│       ├── LoginForm.module.scss
│       └── index.ts
└── hooks/
    └── useLoginForm.ts
```

---

**FSD Slice Creation Skill - Senior Level** 🏗️
