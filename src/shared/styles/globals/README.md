# Globals Module

Декомпозированный модуль глобальных стилей для FSD архитектуры.

## Структура

| Файл               | Назначение              | Стили                                                |
| ------------------ | ----------------------- | ---------------------------------------------------- |
| `_reset.scss`      | Reset стилей            | `*`, `html`, `body`, `a`, `button`                   |
| `_theme.scss`      | CSS переменные для тем  | `:root`, `[data-theme='dark']`                       |
| `_typography.scss` | Глобальная типографика  | `h1-h6`, `code`, `pre`                               |
| `_utilities.scss`  | Utility классы          | `.sr-only`, `.clearfix`, `.visually-hidden`          |
| `_scrollbar.scss`  | Кастомный скроллбар     | `::-webkit-scrollbar-*`                              |
| `_gradient.scss`   | Gradient utility классы | `.gradient-text`, `.gradient-bg`, `.gradient-border` |

## Использование

### В app/layout.tsx или главном entry point:

```scss
@use '@/shared/styles/globals' as *;
```

### Селективный импорт (если нужны только конкретные стили):

```scss
@use '@/shared/styles/globals/theme' as *;
@use '@/shared/styles/globals/scrollbar' as *;
```

## CSS Custom Properties

### Доступные переменные:

- `--background` - основной фон
- `--foreground` - основной цвет текста
- `--foreground-muted` - приглушённый текст
- `--card-bg` - фон карточек
- `--card-border` - граница карточек
- `--shadow-color` - цвет теней
- `--primary` - основной акцентный цвет
- `--primary-dark` - тёмная версия акцента
- `--accent` - дополнительный акцент
- `--code-bg` - фон блоков кода

### Использование в компонентах:

```scss
.component {
  background-color: var(--background);
  color: var(--foreground);
  border-color: var(--card-border);
}
```

## Utility классы

### `.sr-only` - Screen reader only

```html
<span class="sr-only">Только для скринридеров</span>
```

### `.gradient-text` - Градиентный текст

```html
<h1 class="gradient-text">Заголовок</h1>
```

### `.gradient-bg` - Градиентный фон

```html
<div class="gradient-bg">Контент</div>
```

## Пример подключения

```scss
// src/app/styles/global.scss
@use '@/shared/styles/globals' as *;
@use '@/shared/styles/variables' as *;
@use '@/shared/styles/mixins' as *;
@use '@/shared/styles/animations' as *;
```

## Примечания

- Глобальные стили импортируются **один раз** в корневом layout
- Не использовать в компонентах (для компонентов — CSS Modules)
- CSS переменные работают во всём приложении после подключения

````

Теперь создам wrapper для обратной совместимости и обновлю главный файл подключения:

```scss src/shared/styles/globals.scss
// ============================================
// Wrapper for backward compatibility
// ============================================
@forward 'globals/index';
````
