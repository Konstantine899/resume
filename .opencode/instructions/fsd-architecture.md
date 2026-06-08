# FSD Architecture Rules

## Layer Dependencies:

- **entities** → могут импортировать только `shared`
- **features** → могут импортировать `entities` и `shared`
- **pages** → могут импортировать `features`, `entities`, `shared`
- **widgets** → могут импортировать `features`, `entities`, `shared`
- **shared** → могут импортировать только `shared`

## Strict Import Rules:

✅ **Разрешено**: `import { Button } from 'shared/ui'`
✅ **Разрешено**: `import { userModel } from 'entities/user'` (из features/pages/widgets)
❌ **Запрещено**: `import { authApi } from 'features/auth'` (из entities/shared)

## File Structure Conventions:

- Каждый слой содержит: `ui/`, `model/`, `lib/`, `api/` (при необходимости)
- Компоненты: `ComponentName.tsx` + `ComponentName.module.scss`
- Типы: `model/types.ts`
- Константы: `model/constants.ts`
- Хуки: `hooks/useFeatureName.ts`

## Public API Rules:

- Каждый слой должен иметь `index.ts` с публичным API
- Не экспортировать внутренние реализации
- Использовать named exports вместо default

## Circular Dependencies:

- Обнаруживать и запрещать циклические зависимости
- Максимальная глубина вложенности: 3 уровня
