# Variables Module

Декомпозированный модуль CSS переменных для FSD архитектуры.

## Структура

| Файл                | Назначение                  | Переменные                          |
| ------------------- | --------------------------- | ----------------------------------- |
| `_colors.scss`      | Цветовая палитра            | `$primary-light`, `$text-primary`   |
| `_typography.scss`  | Шрифты и размеры            | `$font-family-base`, `$font-size-*` |
| `_breakpoints.scss` | Breakpoints и контейнеры    | `$breakpoint-*`, `$container-*`     |
| `_spacing.scss`     | Шкала отступов              | `$spacing-*` (numeric scale)        |
| `_radius.scss`      | Border radius               | `$border-radius-*`, `$radius-*`     |
| `_shadows.scss`     | Тени                        | `$shadow-*`                         |
| `_transition.scss`  | Transition durations        | `$transition-*`, `$animation-*`     |
| `_sidebar.scss`     | Sidebar-specific переменные | `$sidebar-width-*`, `$burger-size`  |

## Использование

### Импорт всех переменных:

```scss
@use '@/shared/styles/variables' as *;

.element {
  color: $text-primary;
  padding: $spacing-4;
}
```

### Селективный импорт:

```scss
@use '@/shared/styles/variables/colors' as *;
@use '@/shared/styles/variables/spacing' as *;

.button {
  color: $primary-light;
  padding: $spacing-2 $spacing-4;
}
```

### Импорт с алиасом:

```scss
@use '@/shared/styles/variables/colors' as colors;

.button {
  color: colors.$primary-light;
}
```

## Категории переменных

### Colors

- Standard palette: `$primary-color`, `$secondary-color`, etc.
- Portfolio theme: `$primary-light`, `$primary-dark`, `$accent`
- Text: `$text-primary`, `$text-secondary`, `$text-muted`
- Background: `$background`, `$background-alt`
- Border: `$border-color`, `$border-color-dark`

### Typography

- Font family: `$font-family-base`
- Font sizes: `$font-size-xs` → `$font-size-9xl`
- Font weights: `$font-weight-light` → `$font-weight-bold`

### Spacing

- Legacy: `$spacing-xs`, `$spacing-sm`, `$spacing-md`, `$spacing-lg`, `$spacing-xl`
- Numeric: `$spacing-1` → `$spacing-24` (Tailwind-like scale)

### Breakpoints

- `$breakpoint-xs`: 480px
- `$breakpoint-sm`: 640px
- `$breakpoint-md`: 768px
- `$breakpoint-lg`: 1024px
- `$breakpoint-xl`: 1280px
- `$breakpoint-2xl`: 1536px

## Maps для программного доступа

```scss
// Получение значения из map
@use '@/shared/styles/variables' as *;

.element {
  // Через map-get
  padding: map-get($spacing-scale, 4);

  // Или напрямую
  padding: $spacing-4;
}
```

## Примеры

```scss
// Карточка с использованием переменных
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;

.card {
  padding: $spacing-6;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  color: $text-primary;
  background: $background;

  @include md {
    padding: $spacing-8;
  }
}
```

````

Теперь создам wrapper для обратной совместимости:

```scss src/shared/styles/variables.scss
// ============================================
// Wrapper for backward compatibility
// ============================================
@forward 'variables/index';
````
