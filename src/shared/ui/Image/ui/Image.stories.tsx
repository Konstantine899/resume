import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Image } from './Image';
import type { ImageProps } from '../model/types';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Loader } from '@/shared/ui/Loader';
import styles from './Image.module.scss';

const meta = {
  title: 'Shared/UI/Image',
  component: Image,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Универсальный компонент Image с поддержкой:
- Lazy loading (native + Intersection Observer)
- Различные варианты оформления (default, rounded, circular, thumbnail)
- Размеры (sm, md, lg, full)
- Object-fit контроль
- Placeholder'ы (blur, skeleton, color)
- Fallback при ошибке загрузки
- Полная accessibility поддержка (WCAG 2.1 AA)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'rounded', 'circular', 'thumbnail'],
      description: 'Визуальный стиль изображения',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'full'],
      description: 'Размер изображения',
    },
    objectFit: {
      control: 'select',
      options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
      description: 'Режим заполнения контейнера',
    },
    placeholder: {
      control: 'select',
      options: ['blur', 'skeleton', 'color'],
      description: 'Тип placeholder во время загрузки',
    },
    lazyMode: {
      control: 'select',
      options: ['native', 'intersection', 'eager'],
      description: 'Режим отложенной загрузки',
    },
    decorative: {
      control: 'boolean',
      description: 'Декоративное изображение (скрывает от скринридеров)',
    },
    priority: {
      control: 'boolean',
      description: 'Приоритетная загрузка',
    },
    showPlaceholder: {
      control: 'boolean',
      description: 'Показывать placeholder во время загрузки',
    },
    blurAmount: {
      control: 'number',
      description: 'Сила blur эффекта для placeholder',
    },
    quality: {
      control: 'number',
      description: 'Качество изображения (0-100)',
    },
    fallback: {
      control: 'text',
      description: 'Fallback изображение или контент при ошибке',
    },
    width: {
      control: 'text',
      description: 'Переопределение ширины',
    },
    height: {
      control: 'text',
      description: 'Переопределение высоты',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS класс',
    },
    children: {
      control: 'text',
      description: 'Дочерние элементы (overlay)',
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Local Test Images (SVG Data URIs)
// ============================================

const TEST_IMAGE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect fill='%23f0f0f0' width='256' height='256'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23999'%3ETest Image%3C/text%3E%3C/svg%3E`;

const TEST_IMAGE_WIDE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23e0e0e0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23888'%3EWide Image%3C/text%3E%3C/svg%3E`;

const BROKEN_IMAGE_URL =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22256%22%20height%3D%22256%22%3E%3C%2Fsvg%3E'; // Invalid SVG

// ============================================
// Interactive State Demo Component
// ============================================

type ImageStateDemoProps = { initialSrc: string; alt: string } & Partial<Omit<ImageProps, 'alt'>>;

const ImageStateDemo: React.FC<ImageStateDemoProps> = ({ initialSrc, alt, ...props }) => {
  const [forceError, setForceError] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const src = forceError ? BROKEN_IMAGE_URL : initialSrc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setForceError(false)}
          style={{
            padding: '8px 16px',
            background: !forceError ? '#4CAF50' : '#f0f0f0',
            color: !forceError ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✓ Loaded
        </button>
        <button
          onClick={() => setForceError(true)}
          style={{
            padding: '8px 16px',
            background: forceError ? '#f44336' : '#f0f0f0',
            color: forceError ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✗ Error
        </button>
        <button
          onClick={() => setShowPlaceholder((p) => !p)}
          style={{
            padding: '8px 16px',
            background: showPlaceholder ? '#2196F3' : '#f0f0f0',
            color: showPlaceholder ? 'white' : 'black',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showPlaceholder ? 'Hide' : 'Show'} Placeholder
        </button>
      </div>

      <Image src={src} alt={alt} showPlaceholder={showPlaceholder} {...props} />

      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
        <p>Use buttons to simulate different states:</p>
        <p>
          <strong>Loaded</strong> — нормальная загрузка | <strong>Error</strong> — ошибка загрузки |{' '}
          <strong>Placeholder</strong> — показать/скрыть placeholder
        </p>
      </div>
    </div>
  );
};

// ============================================
// Loading Placeholder Demo Component
// ============================================

/**
 * Демонстрация placeholder во время загрузки.
 * data URI грузится мгновенно, поэтому loadingStatus никогда не становится 'loading'.
 * Этот компонент симулирует фазу загрузки на 3 секунды, используя UI Kit компоненты,
 * затем переключается на реальное изображение.
 */
const LoadingPlaceholderDemo: React.FC<{
  placeholder: 'skeleton' | 'spinner';
  label: string;
}> = ({ placeholder, label }) => {
  const [showLoaded, setShowLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoaded) {
    return (
      <div>
        <div
          className={styles.placeholder}
          style={{
            width: 256,
            height: 256,
            borderRadius: 8,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {placeholder === 'skeleton' ? (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          ) : (
            <Loader variant="spinner" />
          )}
        </div>
        <p
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--foreground-muted)',
            marginTop: 8,
          }}
        >
          ⏳ {label}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Image
        src={TEST_IMAGE_SVG}
        alt="Loaded"
        placeholder={placeholder}
        size="lg"
        showPlaceholder
      />
      <p
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--foreground-muted)',
          marginTop: 8,
        }}
      >
        ✅ Image loaded — placeholder скрыт
      </p>
    </div>
  );
};

// ============================================
// Basic Stories
// ============================================

export const Default: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Default image',
  },
};

export const Rounded: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Rounded image',
    variant: 'rounded',
  },
};

export const Circular: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Circular image',
    variant: 'circular',
  },
};

export const Thumbnail: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Thumbnail image',
    variant: 'thumbnail',
  },
};

// ============================================
// Size Stories
// ============================================

export const SizeSmall: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Small image',
    size: 'sm',
  },
};

export const SizeMedium: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Medium image',
    size: 'md',
  },
};

export const SizeLarge: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Large image',
    size: 'lg',
  },
};

export const SizeFull: Story = {
  args: {
    src: TEST_IMAGE_WIDE_SVG,
    alt: 'Full width image',
    size: 'full',
  },
  decorators: [
    (StoryComponent) => (
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <StoryComponent />
      </div>
    ),
  ],
};

// ============================================
// Object Fit Stories
// ============================================

export const ObjectFitCover: Story = {
  args: {
    src: TEST_IMAGE_WIDE_SVG,
    alt: 'Cover fit',
    size: 'md',
    objectFit: 'cover',
  },
};

export const ObjectFitContain: Story = {
  args: {
    src: TEST_IMAGE_WIDE_SVG,
    alt: 'Contain fit',
    size: 'md',
    objectFit: 'contain',
  },
};

// ============================================
// Placeholder Stories
// ============================================

export const PlaceholderBlur: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Blur placeholder',
    placeholder: 'blur',
    blurAmount: 10,
  },
};

export const PlaceholderSkeleton: Story = {
  render: () => (
    <LoadingPlaceholderDemo placeholder="skeleton" label="Skeleton placeholder (3 сек)" />
  ),
  args: {
    src: '',
    alt: 'Skeleton placeholder',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton placeholder с использованием shared Skeleton компонента. ' +
          'Первые 3 секунды демонстрируется анимация загрузки, затем изображение загружается.',
      },
    },
  },
};

export const PlaceholderColor: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Color placeholder',
    placeholder: 'color',
  },
};

export const PlaceholderSpinner: Story = {
  render: () => (
    <LoadingPlaceholderDemo placeholder="spinner" label="Spinner placeholder (3 сек)" />
  ),
  args: {
    src: '',
    alt: 'Spinner placeholder',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Spinner placeholder с использованием shared Loader компонента. ' +
          'Первые 3 секунды демонстрируется анимация загрузки, затем изображение загружается.',
      },
    },
  },
};

// ============================================
// Interactive State Stories
// ============================================

export const InteractiveStates: Story = {
  render: (args) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { alt, src: _src, ...rest } = args;
    return (
      <ImageStateDemo initialSrc={TEST_IMAGE_SVG} alt={alt || 'Interactive state demo'} {...rest} />
    );
  },
  args: {
    src: '',
    alt: 'Interactive state demo',
    variant: 'rounded',
    size: 'lg',
    placeholder: 'skeleton',
    showPlaceholder: true,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Интерактивная демонстрация состояний**

Используйте кнопки для переключения между состояниями:
- **Loaded** — изображение загружено успешно
- **Error** — симуляция ошибки загрузки (показывает fallback)
- **Show/Hide Placeholder** — управление видимостью placeholder

Placeholder автоматически скрывается после загрузки изображения.
        `,
      },
    },
  },
};

// ============================================
// Loading States Stories
// ============================================

export const LoadingModes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--foreground-muted)' }}>
          Priority (eager)
        </p>
        <Image src={TEST_IMAGE_SVG} alt="Priority loading" priority lazyMode="eager" size="md" />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--foreground-muted)' }}>
          Lazy (native)
        </p>
        <Image src={TEST_IMAGE_SVG} alt="Lazy loading" lazyMode="native" size="md" />
      </div>
    </div>
  ),
  args: {
    src: '',
    alt: 'Loading modes',
  },
};

// ============================================
// Error State Stories
// ============================================

export const ErrorWithFallback: Story = {
  args: {
    src: BROKEN_IMAGE_URL,
    alt: 'Error with fallback',
    fallback: TEST_IMAGE_SVG, // Use valid SVG as fallback image
  },
};

export const ErrorWithCustomFallback: Story = {
  render: (args) => (
    <Image
      {...args}
      fallback={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            padding: '20px',
          }}
        >
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <span style={{ fontSize: '14px', color: '#666' }}>Failed to load image</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '6px 12px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      }
    />
  ),
  args: {
    src: BROKEN_IMAGE_URL,
    alt: 'Error with custom fallback',
    size: 'lg',
  },
  parameters: {
    docs: {
      description: {
        story: `
**Кастомный fallback с retry кнопкой**

Fallback может быть любым ReactNode:
- Текст
- Иконка
- Кнопка для повторной попытки
- Комбинация элементов

Идеально для production UX.
        `,
      },
    },
  },
};

// ============================================
// Accessibility Stories
// ============================================

export const DecorativeImage: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: '',
    decorative: true,
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'image-alt', enabled: false }],
      },
    },
  },
};

export const ContentImage: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Descriptive alt text for screen readers',
  },
};

// ============================================
// Advanced Stories
// ============================================

export const WithChildren: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Image with overlay',
    variant: 'rounded',
    children: (
      <div
        style={{
          color: 'white',
          background: 'rgba(0,0,0,0.5)',
          padding: '8px 16px',
          borderRadius: '4px',
        }}
      >
        Overlay Text
      </div>
    ),
  },
};

export const AllFeatures: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'All features combined',
    variant: 'thumbnail',
    size: 'lg',
    objectFit: 'cover',
    placeholder: 'skeleton',
    priority: false,
    showPlaceholder: true,
    blurAmount: 10,
    quality: 80,
  },
};
