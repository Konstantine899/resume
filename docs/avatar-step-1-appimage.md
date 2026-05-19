# 📍 Шаг 1: Создание AppImage компонента

**Время:** 20 минут  
**Статус:** ⏳ Ожидает выполнения  
**Слой:** `shared/ui`

---

## 🎯 Цель шага

Создать универсальный компонент `AppImage` для обработки изображений с:

- Автоматическим loading state
- Error fallback при ошибке загрузки
- Поддержкой priority для LCP оптимизации
- Полной совместимостью с HTML img атрибутами

---

## 📁 Создаваемые файлы

```
src/shared/ui/AppImage/
├── ui/
│   ├── AppImage.tsx        # ✅ Создать
│   └── AppImage.stories.tsx # ✅ Создать
└── index.ts                # ✅ Создать
```

---

## 📝 Инструкция

### 1.1: Создание AppImage.tsx

**Файл:** `src/shared/ui/AppImage/ui/AppImage.tsx`

````typescript
import {
  ImgHTMLAttributes,
  memo,
  ReactElement,
  useLayoutEffect,
  useState,
} from 'react';

export interface AppImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
  fallback?: ReactElement; // отображается во время загрузки
  errorFallback?: ReactElement; // отображается при ошибке
  priority?: boolean; // для LCP оптимизации
}

/**
 * AppImage - Универсальный компонент для изображений с loading/error states
 *
 * @example
 * ```tsx
 * <AppImage
 *   src="/photo.jpg"
 *   fallback={<Skeleton width={200} height={200} />}
 *   errorFallback={<Icon Svg={UserIcon} />}
 *   priority={true}
 * />
 * ```
 */
export const AppImage = memo((props: AppImageProps) => {
  const {
    className,
    src,
    alt = 'image',
    fallback,
    errorFallback,
    priority,
    ...otherProps
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useLayoutEffect(() => {
    const img = new Image();
    img.src = src ?? '';

    // Preload для критических изображений
    if (priority) {
      img.fetchPriority = 'high';
    }

    img.onload = () => {
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
  }, [src, priority]);

  if (isLoading && fallback) {
    return fallback;
  }

  if (hasError && errorFallback) {
    return errorFallback;
  }

  return <img className={className} src={src} alt={alt} {...otherProps} />;
});

AppImage.displayName = 'AppImage';
````

**Проверка:**

- [ ] Файл создан
- [ ] TypeScript компилируется
- [ ] ESLint без ошибок

---

### 1.2: Создание AppImage.stories.tsx

**Файл:** `src/shared/ui/AppImage/ui/AppImage.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppImage } from './AppImage';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Icon } from '@/shared/ui/Icon';
import UserIcon from '@/shared/assets/icons/user-filled.svg';

const meta = {
  title: 'Shared/AppImage',
  component: AppImage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**AppImage** - Универсальный компонент для изображений с loading/error states.

## Особенности:
- Автоматический loading state (показывает fallback во время загрузки)
- Error fallback при ошибке загрузки
- Поддержка priority для LCP оптимизации
- Полная совместимость с HTML img атрибутами

## Примеры:

\`\`\`tsx
<AppImage
  src="/photo.jpg"
  fallback={<Skeleton width={200} height={200} />}
  errorFallback={<Icon Svg={UserIcon} />}
  priority={true}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    fallback: {
      control: false,
      description: 'Компонент для отображения во время загрузки',
    },
    errorFallback: {
      control: false,
      description: 'Компонент для отображения при ошибке',
    },
    priority: {
      control: 'boolean',
      description: 'Приоритетная загрузка для LCP',
    },
  },
} satisfies Meta<typeof AppImage>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Базовые примеры
// ============================================

/**
 * Загрузка изображения с скелетоном
 */
export const WithSkeleton: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=11',
    alt: 'User avatar',
    fallback: <Skeleton width={150} height={150} border="50%" />,
    errorFallback: <Icon width={150} height={150} Svg={UserIcon} />,
  },
};

/**
 * Ошибка загрузки с fallback
 */
export const InvalidSource: Story = {
  args: {
    src: 'invalid-url.jpg',
    alt: 'Invalid image',
    fallback: <Skeleton width={150} height={150} />,
    errorFallback: (
      <div
        style={{
          width: 150,
          height: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--background-secondary)',
          borderRadius: '50%',
        }}
      >
        <Icon width={64} height={64} Svg={UserIcon} />
      </div>
    ),
  },
};

/**
 * Приоритетная загрузка (LCP)
 */
export const WithPriority: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=12',
    alt: 'Priority image',
    fallback: <Skeleton width={150} height={150} />,
    priority: true,
  },
};

// ============================================
// Theme Container
// ============================================

const ThemeContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'flex',
      gap: '32px',
      padding: '40px',
    }}
  >
    <div
      data-theme="light"
      style={{
        backgroundColor: 'var(--background)',
        padding: '20px',
        borderRadius: '12px',
      }}
    >
      <h4 style={{ marginBottom: '16px', color: 'var(--foreground)' }}>
        Light Theme
      </h4>
      {children}
    </div>
    <div
      data-theme="dark"
      style={{
        backgroundColor: 'var(--background)',
        padding: '20px',
        borderRadius: '12px',
      }}
    >
      <h4 style={{ marginBottom: '16px', color: 'var(--foreground)' }}>
        Dark Theme
      </h4>
      {children}
    </div>
  </div>
);

/**
 * Сравнение тем
 */
export const ThemeComparison: Story = {
  render: () => (
    <ThemeContainer>
      <AppImage
        src="https://i.pravatar.cc/150?img=13"
        alt="Theme test"
        fallback={<Skeleton width={150} height={150} border="50%" />}
        errorFallback={<Icon width={150} height={150} Svg={UserIcon} />}
      />
    </ThemeContainer>
  ),
};
```

**Проверка:**

- [ ] Файл создан
- [ ] Storybook отображает 4 story
- [ ] Все story работают в обеих темах

---

### 1.3: Создание index.ts

**Файл:** `src/shared/ui/AppImage/index.ts`

```typescript
// Экспорт компонента
export { AppImage } from './ui/AppImage';

// Экспорт типов
export type { AppImageProps } from './ui/AppImage';
```

**Проверка:**

- [ ] Файл создан
- [ ] Экспорты работают
- [ ] TypeScript видит типы

---

## ✅ Чек-лист завершения шага

### Файлы:

- [ ] `src/shared/ui/AppImage/ui/AppImage.tsx` создан
- [ ] `src/shared/ui/AppImage/ui/AppImage.stories.tsx` создан
- [ ] `src/shared/ui/AppImage/index.ts` создан

### Функциональность:

- [ ] Компонент рендерится с fallback
- [ ] Loading state работает
- [ ] Error fallback работает
- [ ] Priority атрибут применяется

### Storybook:

- [ ] `WithSkeleton` story работает
- [ ] `InvalidSource` story работает
- [ ] `WithPriority` story работает
- [ ] `ThemeComparison` story работает
- [ ] Обе темы (light/dark) отображаются корректно

### Код:

- [ ] TypeScript компилируется без ошибок
- [ ] ESLint без предупреждений
- [ ] `npm run type-check` проходит
- [ ] `npm run lint` проходит

---

## 🚨 Возможные проблемы

### Проблема 1: TypeScript ошибки

**Симптомы:**

```
Property 'fetchPriority' does not exist on type 'HTMLImageElement'
```

**Решение:**

```typescript
// Добавить type assertion
if (priority) {
  (img as any).fetchPriority = 'high';
}
```

### Проблема 2: Storybook не видит stories

**Симптомы:**

- AppImage не появляется в Storybook sidebar

**Решение:**

```bash
# Перезапустить Storybook
npm run storybook

# Проверить путь в .storybook/main.ts
# stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)']
```

### Проблема 3: Fallback не отображается

**Симптомы:**

- Изображение загружается мгновенно, fallback не виден

**Решение:**

```typescript
// Проверить что fallback передан
<AppImage
  fallback={<Skeleton width={150} height={150} />}
  // ...
/>

// Для тестирования замедлить сеть в DevTools:
# DevTools → Network → Slow 3G
```

---

## 🔗 Следующий шаг

После успешного завершения этого шага, перейти к:

**[📍 Шаг 2: Рефакторинг Avatar](./avatar-step-2-avatar.md)**

---

## 📊 Прогресс

```
[✅] Шаг 1: AppImage        ← Текущий
[⏳] Шаг 2: Avatar
[⏳] Шаг 3: Developer Entity
[⏳] Шаг 4: Utils Cleanup
[⏳] Шаг 5: Hero Integration
[⏳] Шаг 6: Testing
```

**Время выполнения:** ~20 минут
