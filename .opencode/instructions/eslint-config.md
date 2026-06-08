# ESLint Configuration Reference

## Current ESLint Rules (from eslint.config.js):

- **no-unused-vars**: off (используется unused-imports)
- **unused-imports/no-unused-imports**: error
- **unused-imports/no-unused-vars**: warn (с ignorePattern ^\_)
- **no-console**: warn
- **@typescript-eslint/no-explicit-any**: warn
- **react-hooks/recommended**: включены
- **react-refresh/only-export-components**: warn

## Extension Rules to Enforce:

- **import/order**: Сортировка импортов
- **react/jsx-sort-props**: Сортировка пропсов
- **prefer-const**: Константы вместо let
- **no-implicit-coercion**: Явное преобразование типов

## Auto-fixable Rules:

- **import/order**: Автоматическая сортировка
- **prettier/prettier**: Форматирование через Prettier
- **react/jsx-sort-props**: Сортировка пропсов
