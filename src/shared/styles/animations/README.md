# Animations Module

Декомпозированный модуль анимаций для FSD архитектуры.

## Структура

| Файл              | Назначение           | Keyframes                                     |
| ----------------- | -------------------- | --------------------------------------------- |
| `_fade.scss`      | Fade in/out анимации | `fadeUp`, `fadeIn`, `fadeOut`                 |
| `_scale.scss`     | Scale анимации       | `scaleIn`, `scaleOut`                         |
| `_transform.scss` | Transform анимации   | `theme-spin`, `globe-rotate`, `language-fade` |
| `_pulse.scss`     | Pulse анимации       | `pulse-glow`                                  |

## Использование

### Импорт всех анимаций:

```scss
@use '@/shared/styles/animations' as *;

.element {
  @include animate-fade-up;
}
```

### Селективный импорт:

```scss
@use '@/shared/styles/animations/fade' as *;

.element {
  @include animate-fade-up(0.2s); // С задержкой
}
```

## Доступные миксины

- `animate-fade-up($delay)` - Fade up с опциональной задержкой
- `animate-fade-in($delay)` - Fade in с опциональной задержкой
- `animate-scale-in($delay)` - Scale in с опциональной задержкой
- `animate-theme-spin` - Анимация переключения темы
- `animate-globe-rotate($duration)` - Вращение глобуса
- `animate-language-fade` - Анимация переключения языка
- `pulse-glow` - Пульсирующее свечение

## Примеры

```scss
// Hero секция с fade up
.hero {
  @include animate-fade-up;

  &.visible {
    // Анимация применится при добавлении класса visible
  }
}

// Theme switcher с spin
.theme-icon {
  @include animate-theme-spin;
}

// Pulse effect для индикаторов
.indicator {
  @include pulse-glow;
}
```
