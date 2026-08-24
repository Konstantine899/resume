# Mixins Module

Декомпозированный модуль SASS миксинов для FSD архитектуры.

## Структура

| Файл               | Назначение            | Основные миксины                                        |
| ------------------ | --------------------- | ------------------------------------------------------- |
| `_responsive.scss` | Media query миксины   | `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `max-*`            |
| `_layout.scss`     | Flex, grid, container | `flex-center`, `flex-between`, `grid-cols`, `container` |
| `_typography.scss` | Text size & weight    | `text-*`, `font-*`                                      |
| `_theme.scss`      | Theme & card миксины  | `theme-transition`, `card`, `work-history-card`         |
| `_hover.scss`      | Hover эффекты         | `hover-lift`, `hover-slide`, `hover-scale`              |
| `_components.scss` | Component mixins      | `button-base`, `input-base`, `code-block`               |
| `_section.scss`    | Section миксины       | `section-base`, `section-title`                         |
| `_utilities.scss`  | Utility миксины       | `terminal-dot-*`                                        |

## Использование

### Импорт всех миксинов:

```scss
@use '@/shared/styles/mixins' as *;

.element {
  @include flex-center;
  @include md {
    padding: $spacing-4;
  }
}
```

### Селективный импорт:

```scss
@use '@/shared/styles/mixins/responsive' as *;
@use '@/shared/styles/mixins/layout' as *;

.container {
  @include flex-between;

  @include lg {
    padding: $spacing-8;
  }
}
```

### Импорт с алиасом:

```scss
@use '@/shared/styles/mixins/hover' as hover-effects;

.card {
  @include hover-effects.hover-lift;
}
```

## Категории миксинов

### Responsive

- Min-width: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`
- Max-width: `max-xs`, `max-sm`, `max-md`, `max-lg`, `max-xl`
- Generic: `respond-to($breakpoint)`

### Layout

- Flex: `flex-center`, `flex-between`, `flex-start`, `flex-col`
- Grid: `grid-cols($cols)`, `grid-gap($gap)`
- Container: `container`

### Typography

- Sizes: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`
- Weights: `font-light`, `font-normal`, `font-medium`, `font-semibold`, `font-bold`

### Theme

- `theme-transition` - плавный переход темы
- `card` / `card-gradient` - базовая карточка
- `work-history-card` - карточка истории работы

### Hover

- `hover-lift` - подъём при наведении
- `hover-slide` - сдвиг вправо при наведении
- `hover-scale($amount)` - масштабирование при наведении

### Components

- `button-base` - базовые стили кнопки
- `input-base` - базовые стили инпута
- `code-block` - стили блока кода

### Section

- `section-base` - базовые стили секции
- `section-title` - заголовок секции с градиентом

### Utilities

- `terminal-dot`, `terminal-dot-red`, `terminal-dot-yellow`, `terminal-dot-green`

## Примеры

```scss
// Карточка проекта
@use '@/shared/styles/mixins' as *;
@use '@/shared/styles/variables' as *;

.project-card {
  @include card;
  @include hover-lift;
  padding: $spacing-6;
  border-radius: $radius-lg;

  @include md {
    padding: $spacing-8;
  }

  .title {
    @include text-xl;
    @include font-semibold;
  }
}

// Секция
.section {
  @include section-base;

  .title {
    @include section-title;
  }
}

// Кнопка
.button {
  @include button-base;
  @include hover-scale;

  &.primary {
    background: $primary-light;
    color: #fff;
  }
}
```

````

Теперь создам wrapper для обратной совместимости:

```scss src/shared/styles/mixins.scss
// ============================================
// Wrapper for backward compatibility
// ============================================
@forward 'mixins/index';
````
