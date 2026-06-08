# Style Guide - Enterprise Code Standards

## TypeScript Правила:

- **Строгая типизация**: Никаких `any`, только явные интерфейсы
- **Именование интерфейсов**: Префикс I - `IComponentProps`
- **Неиспользуемые переменные**: Разрешены только с \_ префиксом
- **Модульная структура**: Один интерфейс/тип на файл в model/types.ts

## React Best Practices:

- **Функциональные компоненты**: С хуками, без классов
- **Мемоизация**: useMemo для тяжелых вычислений, useCallback для функций
- **Error Boundaries**: Обязательны для асинхронных компонентов
- **Оптимизация рендеров**: React.memo для часто перерисовываемых компонентов

## SCSS Modules Конвенции:

- **BEM методология**: `.block__element--modifier`
- **Нет глобальных стилей**: Только модульные импорты
- **Переменные**: Только в `shared/styles/variables.scss`
- **Миксины**: Только в `shared/styles/mixins.scss`

## Именование:

- **Компоненты**: PascalCase - `UserProfile.tsx`
- **Файлы**: kebab-case - `user-profile.module.scss`
- **Переменные**: camelCase - `userProfileData`
- **Константы**: UPPER_CASE - `API_ENDPOINT`

## Code Organization:

- **Импорты порядок**: React → Внешние → Внутренние → Стили
- **Комментарии**: JSDoc для функций, // для пояснений
- **Разделение логики**: Хуки в отдельных файлах `hooks/useFeature.ts`
- **Тесты**: Рядом с компонентом `ComponentName.test.tsx`

## Accessibility Standards:

- **Семантическая верстка**: button вместо div, nav вместо div
- **ARIA атрибуты**: Обязательны для кастомных компонентов
- **Keyboard navigation**: Tab индекс и фокус управление
- **Screen reader поддержка**: aria-label, aria-describedby
