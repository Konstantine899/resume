import type { Meta, StoryObj } from '@storybook/react';
import { Image } from './Image';

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
// Basic Stories
// ============================================

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Default image',
  },
};

export const Rounded: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Rounded image',
    variant: 'rounded',
  },
};

export const Circular: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Circular image',
    variant: 'circular',
  },
};

export const Thumbnail: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Thumbnail image',
    variant: 'thumbnail',
  },
};

// ============================================
// Size Stories
// ============================================

export const SizeSmall: Story = {
  args: {
    src: 'https://picsum.photos/64/64',
    alt: 'Small image',
    size: 'sm',
  },
};

export const SizeMedium: Story = {
  args: {
    src: 'https://picsum.photos/128/128',
    alt: 'Medium image',
    size: 'md',
  },
};

export const SizeLarge: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Large image',
    size: 'lg',
  },
};

export const SizeFull: Story = {
  args: {
    src: 'https://picsum.photos/800/400',
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
    src: 'https://picsum.photos/400/200',
    alt: 'Cover fit',
    size: 'md',
    objectFit: 'cover',
  },
};

export const ObjectFitContain: Story = {
  args: {
    src: 'https://picsum.photos/400/200',
    alt: 'Contain fit',
    size: 'md',
    objectFit: 'contain',
  },
};

export const ObjectFitFill: Story = {
  args: {
    src: 'https://picsum.photos/400/200',
    alt: 'Fill fit',
    size: 'md',
    objectFit: 'fill',
  },
};

export const ObjectFitNone: Story = {
  args: {
    src: 'https://picsum.photos/400/200',
    alt: 'None fit',
    size: 'md',
    objectFit: 'none',
  },
};

export const ObjectFitScaleDown: Story = {
  args: {
    src: 'https://picsum.photos/400/200',
    alt: 'Scale-down fit',
    size: 'md',
    objectFit: 'scale-down',
  },
};

// ============================================
// Placeholder Stories
// ============================================

export const PlaceholderBlur: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Blur placeholder',
    placeholder: 'blur',
    blurAmount: 10,
  },
};

export const PlaceholderSkeleton: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Skeleton placeholder',
    placeholder: 'skeleton',
  },
};

export const PlaceholderColor: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Color placeholder',
    placeholder: 'color',
  },
};

// ============================================
// Loading States Stories
// ============================================

export const PriorityLoading: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Priority loading',
    priority: true,
    lazyMode: 'eager',
  },
};

export const LazyLoading: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
    alt: 'Lazy loading',
    lazyMode: 'native',
  },
};

// ============================================
// Error State Stories
// ============================================

export const ErrorWithFallback: Story = {
  args: {
    src: 'https://invalid-url.example/broken.jpg',
    alt: 'Error with fallback',
    fallback: 'https://picsum.photos/256/256?fallback',
  },
};

export const ErrorWithText: Story = {
  args: {
    src: 'https://invalid-url.example/broken.jpg',
    alt: 'Error with text',
    fallback: 'Image unavailable',
  },
};

// ============================================
// Accessibility Stories
// ============================================

export const DecorativeImage: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
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
    src: 'https://picsum.photos/256/256',
    alt: 'Descriptive alt text for screen readers',
  },
};

// ============================================
// Advanced Stories
// ============================================

export const WithChildren: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
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

export const CustomDimensions: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Custom dimensions',
    width: '300px',
    height: '200px',
    objectFit: 'cover',
  },
};

export const AllFeatures: Story = {
  args: {
    src: 'https://picsum.photos/256/256',
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
