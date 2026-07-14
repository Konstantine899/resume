import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Spinner } from './Spinner';

const meta = {
  title: 'Shared/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Spinner** — компонент вращающегося индикатора загрузки.

## Варианты:
- **spinner** (default) — классическое крутящееся кольцо
- **double-ring** — два вращающихся кольца (внешнее по часовой, внутреннее против)

## Размеры:
- **xs** (12px), **sm** (24px), **md** (32px), **lg** (48px), **xl** (64px), **xxl** (96px)

## Цвета:
- **primary** (основной), **secondary** (вторичный), **accent** (акцентный), **orange** (оранжевый)

## Кастомизация:
- **speed** — slow / normal / fast
- **thickness** — thin / normal / thick
- **trackColor** — цвет фоновой части кольца

## Accessibility:
- \`role="status"\` — объявляет состояние загрузки скринридерам
- \`aria-busy="true"\` — указывает на активный процесс
- \`aria-label\` — текстовое описание
- \`prefers-reduced-motion\` — автоматическое отключение анимации
        `,
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['spinner', 'double-ring'],
      description: 'Вариант спиннера',
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Размер спиннера',
    },
    color: {
      control: 'radio',
      options: ['primary', 'secondary', 'accent', 'orange'],
      description: 'Цвет спиннера',
    },
    speed: {
      control: 'radio',
      options: ['slow', 'normal', 'fast'],
      description: 'Скорость анимации',
    },
    thickness: {
      control: 'radio',
      options: ['thin', 'normal', 'thick'],
      description: 'Толщина линии',
    },
    trackColor: {
      control: 'color',
      description: 'Цвет трека (фоновой части кольца)',
    },
    label: {
      control: 'text',
      description: 'Текст для screen readers',
    },
  },
  args: {
    variant: 'spinner',
    size: 'md',
    color: 'primary',
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

// ============================================
// Helper Components
// ============================================

const ThemeContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: 'var(--background)',
      padding: '24px',
      borderRadius: '12px',
      minWidth: '200px',
    }}
  >
    {children}
  </div>
);

// ============================================
// Basic Variants
// ============================================

export const SingleSpinner: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner variant="spinner" size="md" color="primary" />
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Классический крутящийся индикатор. Используется в Button, Input, Textarea, Image.',
      },
    },
  },
};

export const DoubleRing: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner variant="double-ring" size="md" color="primary" />
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Два вращающихся кольца — внешний по часовой стрелке, внутренний против. ' +
          'Подходит для Avatar, Hero и крупных зон загрузки.',
      },
    },
  },
};

// ============================================
// Sizes
// ============================================

export const Small: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner size="sm" color="primary" />
    </ThemeContainer>
  ),
};

export const Medium: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner size="md" color="primary" />
    </ThemeContainer>
  ),
};

export const Large: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner size="lg" color="primary" />
    </ThemeContainer>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner size="xl" color="primary" />
    </ThemeContainer>
  ),
};

export const DoubleExtraLarge: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner size="xxl" color="primary" />
    </ThemeContainer>
  ),
};

// ============================================
// Colors
// ============================================

export const Primary: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner color="primary" />
    </ThemeContainer>
  ),
};

export const Secondary: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner color="secondary" />
    </ThemeContainer>
  ),
};

export const Accent: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner color="accent" />
    </ThemeContainer>
  ),
};

export const Orange: Story = {
  render: () => (
    <ThemeContainer>
      <Spinner color="orange" />
    </ThemeContainer>
  ),
};

// ============================================
// Customization
// ============================================

export const SlowSpeed: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner speed="slow" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Slow (1.2s)
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner speed="normal" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Normal (0.8s)
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner speed="fast" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Fast (0.4s)
          </p>
        </div>
      </div>
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Speed slow (1.2s) / normal (0.8s) / fast (0.4s). Влияет на длительность полного оборота.',
      },
    },
  },
};

export const ThicknessOptions: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner thickness="thin" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Thin (1.5px)
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner thickness="normal" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Normal (2px)
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner thickness="thick" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Thick (3px)
          </p>
        </div>
      </div>
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Thickness thin (1.5px) / normal (2px) / thick (3px). Влияет на толщину линии кольца.',
      },
    },
  },
};

export const WithTrackColor: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner trackColor="#e0e0e0" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Light track
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner trackColor="#50abc5" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Colored track
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner trackColor="transparent" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Transparent (default)
          </p>
        </div>
      </div>
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'trackColor задаёт цвет фоновой части кольца. По умолчанию transparent.',
      },
    },
  },
};

// ============================================
// Real-world Examples
// ============================================

export const InlineWithText: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Spinner size="sm" color="primary" />
        <span style={{ color: 'var(--foreground)' }}>Загрузка данных...</span>
      </div>
    </ThemeContainer>
  ),
};

export const FullScreen: Story = {
  render: () => (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--background)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <Spinner size="lg" color="primary" />
    </div>
  ),
};

// ============================================
// All Variants Comparison
// ============================================

export const AllVariants: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner variant="spinner" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Spinner
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner variant="double-ring" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Double Ring
          </p>
        </div>
      </div>
    </ThemeContainer>
  ),
};

// ============================================
// All Sizes Comparison
// ============================================

export const AllSizes: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map((s) => (
          <div
            key={s}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}
          >
            <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
              {s.toUpperCase()}
            </span>
            <Spinner size={s} color="primary" />
          </div>
        ))}
      </div>
    </ThemeContainer>
  ),
};

// ============================================
// Theme Comparison
// ============================================

export const ThemeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div
        data-theme="light"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          minWidth: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Spinner color="primary" />
      </div>
      <div
        data-theme="dark"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          minWidth: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Spinner color="primary" />
      </div>
    </div>
  ),
};

// ============================================
// Avatar Use Case
// ============================================

export const AvatarLoading: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '32px',
        alignItems: 'center',
        padding: '32px',
        backgroundColor: 'var(--background)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="double-ring" size="lg" color="primary" label="Loading avatar" />
        <p style={{ fontSize: '12px', marginTop: '16px', color: 'var(--foreground-muted)' }}>
          Avatar About (LG)
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="double-ring" size="xl" color="primary" label="Loading avatar" />
        <p style={{ fontSize: '12px', marginTop: '16px', color: 'var(--foreground-muted)' }}>
          Avatar Hero (XL)
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Использование Spinner в Avatar компонентах. Double-ring variant с primary цветом для консистентности с дизайном.',
      },
    },
  },
};

// ============================================
// Speed with Double Ring
// ============================================

export const DoubleRingSpeed: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner variant="double-ring" speed="slow" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Slow
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner variant="double-ring" speed="normal" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Normal
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Spinner variant="double-ring" speed="fast" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Fast
          </p>
        </div>
      </div>
    </ThemeContainer>
  ),
};

// ============================================
// Reduced Motion Demo
// ============================================

export const ReducedMotion: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--foreground-muted)', marginBottom: '8px' }}>
          При включении <code>prefers-reduced-motion</code> в ОС анимация автоматически отключается
        </p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Spinner variant="spinner" color="primary" />
          <Spinner variant="double-ring" color="primary" />
        </div>
      </div>
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility — при `prefers-reduced-motion` в ОС все анимации отключаются.',
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
};
