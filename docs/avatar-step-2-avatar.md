# 📍 Шаг 2: Рефакторинг Avatar компонента

**Время:** 25 минут  
**Статус:** ⏳ Ожидает выполнения  
**Слой:** `shared/ui`

---

## 🎯 Цель шага

Рефакторить компонент `Avatar` на композицию с `AppImage`:

- Упростить API компонента
- Делегировать загрузку изображения компоненту AppImage
- Обновить Storybook stories
- Сохранить существующую функциональность

---

## 📁 Изменяемые файлы

```
src/shared/ui/Avatar/
├── ui/
│   ├── Avatar.tsx            # ✅ Обновить (композиция)
│   └── Avatar.stories.tsx    # ✅ Обновить (новые story)
├── types.ts                  # ✅ Обновить
└── ui/Avatar.module.scss     # ✅ Обновить (скелетон стили)
```

---

## 📝 Инструкция

### 2.1: Обновление Avatar.tsx

**Файл:** `src/shared/ui/Avatar/ui/Avatar.tsx`

**Задача:** Переписать на композицию с AppImage

````typescript
import { CSSProperties, useMemo } from 'react';
import { classNames } from '@/shared/lib/classNames/classNames';
import cls from './Avatar.module.scss';
import { AppImage } from '@/shared/ui/AppImage';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Icon } from '@/shared/ui/Icon';
import UserIcon from '@/shared/assets/icons/user-filled.svg';

export type AvatarShape = 'circle' | 'square';

export interface AvatarProps {
  className?: string;
  src?: string;
  size?: number;
  alt?: string;
  fallbackInverted?: boolean;
  shape?: AvatarShape;
}

/**
 * Avatar - Компонент аватара пользователя
 *
 * @example
 * ```tsx
 * <Avatar
 *   src="/photo/konstantin.jpg"
 *   size={224}
 *   shape="circle"
 *   alt="Konstantin Atroshchenko"
 * />
 * ```
 */
export const Avatar = (props: AvatarProps) => {
  const {
    className,
    src,
    size = 100,
    alt,
    fallbackInverted,
    shape = 'circle',
  } = props;

  const mods = {
    [cls.circle]: shape === 'circle',
    [cls.square]: shape === 'square',
  };

  const styles = useMemo<CSSProperties>(
    () => ({
      width: size,
      height: size,
    }),
    [size],
  );

  // Fallback: скелетон во время загрузки
  const fallback = (
    <Skeleton
      width={size}
      height={size}
      border="50%"
      className={cls.skeleton}
    />
  );

  // Error fallback: иконка пользователя при ошибке
  const errorFallback = (
    <Icon
      inverted={fallbackInverted}
      width={size}
      height={size}
      Svg={UserIcon}
      className={cls.iconFallback}
    />
  );

  return (
    <AppImage
      fallback={fallback}
      errorFallback={errorFallback}
      className={classNames(cls.Avatar, mods, [className])}
      src={src}
      alt={alt}
      style={styles}
      priority={true} // Avatar в Hero - LCP элемент
    />
  );
};

Avatar.displayName = 'Avatar';
````

**Что изменилось:**

- ❌ Удалено: управление состоянием загрузки
- ❌ Удалено: обработка ошибок изображения
- ✅ Добавлено: композиция с AppImage
- ✅ Добавлено: automatic loading/error states
- ✅ Сохранено: кастомные размеры в пикселях
- ✅ Сохранено: поддержка форм (circle/square)

**Проверка:**

- [ ] Файл обновлён
- [ ] TypeScript компилируется
- [ ] Компонент рендерится

---

### 2.2: Обновление types.ts

**Файл:** `src/shared/ui/Avatar/types.ts`

```typescript
// Экспорт типов компонента
export type { AvatarProps, AvatarShape } from './ui/Avatar';
```

**Проверка:**

- [ ] Типы экспортируются корректно
- [ ] TypeScript видит типы

---

### 2.3: Обновление Avatar.module.scss

**Файл:** `src/shared/ui/Avatar/ui/Avatar.module.scss`

**Задача:** Добавить стили для скелетона и иконки fallback

```scss
@import '@/shared/styles/variables/colors';
@import '@/shared/styles/variables/radius';
@import '@/shared/styles/variables/transition';

.Avatar {
  display: block;
  object-fit: cover;
  border-radius: $radius-full;
  transition: opacity $transition-duration $transition-easing;

  &.circle {
    border-radius: $radius-full;
  }

  &.square {
    border-radius: $border-radius-lg;
  }

  // Стили для скелетона (loading state)
  .skeleton {
    border-radius: inherit;
    background: linear-gradient(
      90deg,
      var(--background-secondary) 25%,
      var(--background) 50%,
      var(--background-secondary) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }

  // Стили для иконки fallback (error state)
  .iconFallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-secondary);
    border-radius: inherit;
  }
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

**Проверка:**

- [ ] Скелетон анимируется
- [ ] Цвета соответствуют теме
- [ ] Border radius применяется

---

### 2.4: Обновление Avatar.stories.tsx

**Файл:** `src/shared/ui/Avatar/ui/Avatar.stories.tsx`

**Задача:** Обновить существующие story и добавить новые

#### Добавить импорт Developer entity:

```typescript
import { DEVELOPER_DATA } from '@/entities/Developer';
```

#### Обновить story для кастомного размера:

```typescript
/**
 * Avatar для Hero секции (224px)
 */
export const CustomSize: Story = {
  args: {
    src: DEVELOPER_DATA.avatarUrl,
    name: DEVELOPER_DATA.fullName,
    size: 224, // Hero секция
    shape: 'circle',
  },
};
```

#### Добавить story для loading state:

```typescript
/**
 * Состояние загрузки (скелетон)
 */
export const Loading: Story = {
  args: {
    src: undefined, // Имитация загрузки
    name: DEVELOPER_DATA.fullName,
    size: 100,
    shape: 'circle',
  },
};
```

#### Обновить Sizes story для числовых размеров:

```typescript
/**
 * Различные размеры (в пикселях)
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
      <Avatar size={24} name={DEVELOPER_DATA.fullName} />   {/* xs */}
      <Avatar size={32} name={DEVELOPER_DATA.fullName} />   {/* sm */}
      <Avatar size={40} name={DEVELOPER_DATA.fullName} />   {/* md */}
      <Avatar size={48} name={DEVELOPER_DATA.fullName} />   {/* lg */}
      <Avatar size={64} name={DEVELOPER_DATA.fullName} />   {/* xl */}
    </div>
  ),
};
```

#### Обновить DeveloperWithPhoto story:

```typescript
/**
 * Avatar с реальным фото разработчика
 */
export const DeveloperWithPhoto: Story = {
  args: {
    src: DEVELOPER_DATA.avatarUrl || 'https://i.pravatar.cc/150?img=11',
    alt: `${DEVELOPER_DATA.fullName} avatar`,
    name: DEVELOPER_DATA.fullName,
    size: 'xl',
    shape: 'circle',
  },
};
```

**Проверка:**

- [ ] Все story работают
- [ ] CustomSize отображает 224px
- [ ] Loading показывает скелетон
- [ ] Sizes использует числовые значения

---

## ✅ Чек-лист завершения шага

### Файлы:

- [ ] `Avatar.tsx` обновлён (композиция с AppImage)
- [ ] `types.ts` обновлён
- [ ] `Avatar.module.scss` обновлён (скелетон стили)
- [ ] `Avatar.stories.tsx` обновлён

### Функциональность:

- [ ] Avatar рендерится с скелетоном
- [ ] Error fallback работает (иконка)
- [ ] Кастомные размеры работают (в пикселях)
- [ ] Формы работают (circle/square)
- [ ] Priority для LCP установлен

### Storybook:

- [ ] `CustomSize` story работает (224px)
- [ ] `Loading` story работает (скелетон)
- [ ] `Sizes` story обновлена (числовые размеры)
- [ ] `DeveloperWithPhoto` story работает
- [ ] Theme comparison виден

### Код:

- [ ] TypeScript компилируется
- [ ] ESLint без ошибок
- [ ] `npm run type-check` проходит
- [ ] `npm run lint` проходит

---

## 🚨 Возможные проблемы

### Проблема 1: Avatar не рендерится

**Симптомы:**

```
Cannot read property 'circle' of undefined
```

**Решение:**

```scss
// Проверить что Avatar.module.scss импортирован
import cls from './Avatar.module.scss';

// Проверить что классы существуют в SCSS
.Avatar {
  &.circle { ... }
  &.square { ... }
}
```

### Проблема 2: Скелетон не анимируется

**Симптомы:**

- Скелетон отображается статично

**Решение:**

```scss
// Проверить @keyframes
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

// Проверить что animation применён
.skeleton {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}
```

### Проблема 3: Storybook показывает ошибки

**Симптомы:**

```
Cannot find module '@/entities/Developer'
```

**Решение:**

```typescript
// Убедиться что Developer entity создан (Шаг 3)
// Или временно использовать mock:
const DEVELOPER_DATA = {
  fullName: 'Konstantin Atroshchenko',
  avatarUrl: 'https://i.pravatar.cc/150?img=11',
};
```

### Проблема 4: Размеры не применяются

**Симптомы:**

- Avatar отображается в размере по умолчанию

**Решение:**

```typescript
// Проверить что style prop передаётся
<AppImage
  style={styles} // { width: size, height: size }
  // ...
/>

// Проверить что size prop передаётся
<Avatar size={224} ... />
```

---

## 🔗 Предыдущий шаг

[📍 Шаг 1: Создание AppImage](./avatar-step-1-appimage.md)

## 🔗 Следующий шаг

[📍 Шаг 3: Создание Developer Entity](./avatar-step-3-entity.md)

---

## 📊 Прогресс

```
[✅] Шаг 1: AppImage
[✅] Шаг 2: Avatar         ← Текущий
[⏳] Шаг 3: Developer Entity
[⏳] Шаг 4: Utils Cleanup
[⏳] Шаг 5: Hero Integration
[⏳] Шаг 6: Testing
```

**Время выполнения:** ~25 минут
