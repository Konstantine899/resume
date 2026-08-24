import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, waitFor, within } from '@storybook/test';
import { useState } from 'react';
import { Image } from './Image';
import type { RemoteImageProps } from '../model/types';

// ============================================
// Data-driven fixtures (Senior+ requirement #8)
// ============================================

interface ImageFixture {
  src: string | { src: string; srcSet?: string };
  alt: string;
  variant?: RemoteImageProps['variant'];
  size?: RemoteImageProps['size'];
  objectFit?: RemoteImageProps['objectFit'];
  htmlWidth?: number;
  htmlHeight?: number;
  description: string;
}

const imageFixtures: ImageFixture[] = [
  {
    src: 'https://picsum.photos/800/600',
    alt: 'City landscape',
    variant: 'default',
    size: 'lg',
    objectFit: 'cover',
    htmlWidth: 800,
    htmlHeight: 600,
    description: '16:9 landscape',
  },
  {
    src: 'https://picsum.photos/400/600',
    alt: 'Portrait',
    variant: 'rounded',
    size: 'md',
    objectFit: 'contain',
    htmlWidth: 400,
    htmlHeight: 600,
    description: '2:3 portrait',
  },
  {
    src: 'https://picsum.photos/600/600',
    alt: 'Square',
    variant: 'circular',
    size: 'md',
    objectFit: 'cover',
    htmlWidth: 600,
    htmlHeight: 600,
    description: '1:1 square',
  },
  {
    src: 'https://picsum.photos/1200/400',
    alt: 'Banner',
    variant: 'thumbnail',
    size: 'full',
    objectFit: 'cover',
    htmlWidth: 1200,
    htmlHeight: 400,
    description: '3:1 banner',
  },
];

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

type ImageStateDemoProps = {
  initialSrc: string;
  alt: string;
} & Partial<Omit<RemoteImageProps, 'alt'>>;

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

// ============================================
// Basic Stories
// ============================================

export const Default: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Default image',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'Default image' });
    const figure = img.closest('figure');
    await expect(figure?.getAttribute('data-variant')).toBe('default');
    await expect(figure?.getAttribute('data-size')).toBe('md');
    await expect(figure?.getAttribute('data-loading')).toBeTruthy();
  },
};

export const Rounded: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Rounded image',
    variant: 'rounded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'Rounded image' });
    await expect(img.closest('figure')?.getAttribute('data-variant')).toBe('rounded');
  },
};

export const Circular: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Circular image',
    variant: 'circular',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    const figure = img.closest('figure');
    await expect(figure?.getAttribute('data-variant')).toBe('circular');
  },
};

export const Thumbnail: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Thumbnail image',
    variant: 'thumbnail',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    const figure = img.closest('figure');
    await expect(figure?.getAttribute('data-variant')).toBe('thumbnail');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'Small image' });
    const figure = img.closest('figure');
    await expect(figure?.getAttribute('data-size')).toBe('sm');
    await expect(figure?.getAttribute('style')).toContain('width: 64px');
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
  args: {
    src: '',
    placeholder: 'skeleton',
    forceLoading: true,
    size: 'lg',
    alt: 'Skeleton placeholder (deterministic)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skeleton placeholder с использованием forceLoading для детерминированного состояния загрузки (без таймеров).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'Skeleton placeholder (deterministic)' });
    const figure = img.closest('figure');
    expect(figure).toHaveAttribute('data-loading', 'loading');
    // ImageSkeleton wrapper is aria-hidden; Skeleton inside renders role=status + rectangular variant
    const ariaHiddenContainer = figure?.querySelector('[aria-hidden="true"]');
    expect(ariaHiddenContainer).not.toBeNull();
    const skeleton = ariaHiddenContainer?.querySelector('[role="status"]');
    expect(skeleton).not.toBeNull();
    expect(skeleton?.getAttribute('data-variant')).toBe('rectangular');
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
  args: {
    src: '',
    placeholder: 'spinner',
    forceLoading: true,
    size: 'lg',
    alt: 'Spinner placeholder (deterministic)',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Spinner placeholder с использованием forceLoading для детерминированного состояния загрузки (без таймеров).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'Spinner placeholder (deterministic)' });
    const figure = img.closest('figure');
    expect(figure).toHaveAttribute('data-loading', 'loading');
    const status = figure?.querySelector('[role="status"]');
    expect(status).not.toBeNull();
    expect(figure?.querySelector('[data-testid="spinner-circle"]')).not.toBeNull();
  },
};

// ============================================
// Interactive State Stories
// ============================================

export const InteractiveStates: Story = {
  render: (args) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { alt, src: _src, type: _type, ...rest } = args;
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errorBtn = canvas.getByText('✗ Error');
    await expect(errorBtn).toBeInTheDocument();

    // Click error button and verify error state
    await errorBtn.click();
    const img = await canvas.findByRole('img');
    const figure = img.closest('figure');
    await expect(figure?.getAttribute('data-loading')).toBe('error');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const eagerImg = canvas.getByRole('img', { name: 'Priority loading' });
    const lazyImg = canvas.getByRole('img', { name: 'Lazy loading' });
    await expect(eagerImg).toHaveAttribute('loading', 'eager');
    await expect(lazyImg).toHaveAttribute('loading', 'lazy');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img', { name: 'Error with fallback' });

    // Trigger the error path deterministically (jsdom/browser onError for the
    // invalid SVG data-URI is not guaranteed in the test runner).
    fireEvent.error(img);

    // aria-describedby is set only in the error state (IMG-08)
    await waitFor(() => {
      expect(img.getAttribute('aria-describedby')).toBeTruthy();
    });

    // The describedby reference resolves to the fallback node (IMG-08)
    const describedById = img.getAttribute('aria-describedby');
    await expect(describedById).toBeTruthy();
    const fallbackNode = describedById ? document.getElementById(describedById) : null;
    await expect(fallbackNode).not.toBeNull();
    await expect(fallbackNode?.tagName).toBe('IMG');

    // Verify fallback has correct class
    await expect(fallbackNode).toHaveClass(/fallback/);
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    fireEvent.error(img);

    // Wait for custom fallback to appear
    await waitFor(() => {
      expect(canvas.getByText('Failed to load image')).toBeInTheDocument();
    });
    expect(canvas.getByText('⚠️')).toBeInTheDocument();
    expect(canvas.getByText('Retry')).toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    const figure = img.closest('figure');
    await expect(figure?.getAttribute('data-variant')).toBe('thumbnail');
    await expect(figure?.getAttribute('data-size')).toBe('lg');
    await expect(img).toHaveAttribute('data-loading', 'loaded');
  },
};

// ============================================
// UI Kit Best Practices (MUI, Chakra patterns)
// ============================================

export const PolymorphicAsProp: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Polymorphic image',
    variant: 'rounded',
    size: 'md',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div>
        <Image {...args} />
        <p>Default (figure)</p>
      </div>
      <div>
        <Image {...args} as="picture" />
        <p>As picture</p>
      </div>
      <div>
        <Image {...args} as="div" />
        <p>As div</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0].closest('figure')).toBeInTheDocument();
    expect(images[1].closest('picture')).toBeInTheDocument();
    expect(images[2].closest('div')).toBeInTheDocument();
    // Verify all have correct variant classes
    const figures = images.map((img) => img.closest('figure') as HTMLElement);
    await expect(figures[0]).toHaveClass(/variantRounded/);
    await expect(figures[1]).toHaveClass(/variantRounded/);
    await expect(figures[2]).toHaveClass(/variantRounded/);
  },
};

export const HtmlWidthHeight: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Image with explicit HTML dimensions',
    htmlWidth: 400,
    htmlHeight: 300,
    variant: 'default',
    size: 'full',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: 24 }}>
      <div>
        <Image {...args} />
        <p>htmlWidth=400, htmlHeight=300</p>
      </div>
      <div>
        <Image {...args} htmlWidth={800} htmlHeight={600} />
        <p>htmlWidth=800, htmlHeight=600</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(2);
    await expect(images[0]).toHaveAttribute('width', '400');
    await expect(images[0]).toHaveAttribute('height', '300');
    await expect(images[1]).toHaveAttribute('width', '800');
    await expect(images[1]).toHaveAttribute('height', '600');
  },
};

export const ResponsiveSrcSet: Story = {
  args: {
    src: {
      src: TEST_IMAGE_SVG,
      srcSet: `${TEST_IMAGE_SVG} 2x, ${TEST_IMAGE_SVG} 3x`,
    },
    alt: 'Responsive image with srcSet',
    htmlWidth: 400,
    htmlHeight: 300,
    variant: 'rounded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    await expect(img).toHaveAttribute('src');
    await expect(img).toHaveAttribute('srcset');
    await expect(img).toHaveAttribute('width', '400');
    await expect(img).toHaveAttribute('height', '300');
  },
};

export const DataDrivenGrid: StoryObj<typeof Image> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
      {imageFixtures.map((fixture, index) => (
        <div key={index}>
          <Image
            src={fixture.src}
            alt={fixture.alt}
            variant={fixture.variant}
            size={fixture.size}
            objectFit={fixture.objectFit}
            htmlWidth={fixture.htmlWidth}
            htmlHeight={fixture.htmlHeight}
          />
          <p style={{ marginTop: 8, fontSize: 14 }}>{fixture.description}</p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(4);
    // Verify grid positioning
    const figures = images.map((img) => img.closest('figure') as HTMLElement);
    expect(figures[0]).toHaveStyle({ gridColumn: '1 / 2' });
    expect(figures[1]).toHaveStyle({ gridColumn: '2 / 3' });
    // Verify dimensions match fixtures
    await expect(images[0]).toHaveAttribute('width', '800');
    await expect(images[1]).toHaveAttribute('width', '400');
    await expect(images[2]).toHaveAttribute('width', '600');
    await expect(images[3]).toHaveAttribute('width', '1200');
  },
};

// ============================================
// Composite Stories (AllVariants, AllSizes, etc.)
// ============================================

export const AllVariants: StoryObj<typeof Image> = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['default', 'rounded', 'circular', 'thumbnail'] as const).map((variant) => (
        <div key={variant}>
          <Image src={TEST_IMAGE_SVG} alt={`${variant} variant`} variant={variant} size="md" />
          <p style={{ marginTop: 8, textTransform: 'capitalize' }}>{variant}</p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(4);
    const figures = images.map((img) => img.closest('figure') as HTMLElement);
    await expect(figures[0].getAttribute('data-variant')).toBe('default');
    await expect(figures[1].getAttribute('data-variant')).toBe('rounded');
    await expect(figures[2].getAttribute('data-variant')).toBe('circular');
    await expect(figures[3].getAttribute('data-variant')).toBe('thumbnail');
  },
};

export const AllSizes: StoryObj<typeof Image> = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
      {(['sm', 'md', 'lg', 'full'] as const).map((size) => (
        <div key={size}>
          <Image src={TEST_IMAGE_SVG} alt={`${size} size`} size={size} variant="default" />
          <p style={{ marginTop: 8, textTransform: 'uppercase' }}>{size}</p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(4);
    const figures = images.map((img) => img.closest('figure') as HTMLElement);
    await expect(figures[0].getAttribute('data-size')).toBe('sm');
    await expect(figures[1].getAttribute('data-size')).toBe('md');
    await expect(figures[2].getAttribute('data-size')).toBe('lg');
    await expect(figures[3].getAttribute('data-size')).toBe('full');
    // Verify actual dimensions
    await expect(figures[0]).toHaveStyle({ width: '64px', height: '64px' });
    await expect(figures[1]).toHaveStyle({ width: '128px', height: '128px' });
    await expect(figures[2]).toHaveStyle({ width: '256px', height: '256px' });
  },
};

export const AllObjectFits: StoryObj<typeof Image> = {
  args: {},
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 100px)', gap: 16 }}>
      {(['cover', 'contain', 'fill', 'none', 'scale-down'] as const).map((fit) => (
        <div key={fit} style={{ border: '1px solid #ccc' }}>
          <Image
            src={TEST_IMAGE_SVG}
            alt={`${fit} object-fit`}
            objectFit={fit}
            size="md"
            variant="default"
          />
          <p style={{ marginTop: 4, fontSize: 12, textAlign: 'center' }}>{fit}</p>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(5);
    const fits = ['cover', 'contain', 'fill', 'none', 'scale-down'];
    images.forEach((img, i) => {
      expect(img).toHaveStyle({ objectFit: fits[i] });
    });
  },
};

// ============================================
// Accessibility Stories
// ============================================

export const DecorativeAndContentComparison: StoryObj<typeof Image> = {
  args: {},
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      <div>
        <Image
          src={TEST_IMAGE_SVG}
          alt="Descriptive alt text for screen readers"
          variant="rounded"
          size="md"
        />
        <p style={{ marginTop: 8 }}>Content image (with alt)</p>
      </div>
      <div>
        <Image src={TEST_IMAGE_SVG} alt="" decorative variant="rounded" size="md" />
        <p style={{ marginTop: 8 }}>Decorative image (aria-hidden)</p>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const images = canvas.getAllByRole('img');
    expect(images).toHaveLength(2);
    await expect(images[0]).toHaveAttribute('alt', 'Descriptive alt text for screen readers');
    await expect(images[0].closest('figure')).not.toHaveClass(/decorative/);
    await expect(images[1]).toHaveAttribute('alt', '');
    await expect(images[1].closest('figure')).toHaveClass(/decorative/);
    // Verify decorative image has pointer-events: none
    const decorativeFigure = images[1].closest('figure');
    await expect(decorativeFigure).toHaveStyle({ 'pointer-events': 'none' });
  },
};

// ============================================
// Edge Cases
// ============================================

export const DarkMode: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Dark mode image',
    variant: 'thumbnail',
    size: 'lg',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    const figure = img.closest('figure');
    await expect(figure).toBeInTheDocument();
    // Verify thumbnail styles render in dark mode
    await expect(figure).toHaveClass(/variantThumbnail/);
    // Verify dark mode CSS variables are applied
    await expect(figure).toHaveStyle({ 'background-color': 'rgb(255, 255, 255, 0.05)' });
  },
};

export const PriorityLoading: Story = {
  args: {
    src: TEST_IMAGE_SVG,
    alt: 'Priority image (LCP candidate)',
    variant: 'default',
    size: 'full',
    priority: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByRole('img');
    await expect(img).toHaveAttribute('fetchpriority', 'high');
    await expect(img).toHaveAttribute('loading', 'eager');
    // Verify image-rendering for crisp edges (performance optimization)
    await expect(img).toHaveStyle({ 'image-rendering': 'crisp-edges' });
  },
};
