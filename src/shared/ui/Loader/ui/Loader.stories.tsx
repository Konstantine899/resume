// src/shared/ui/Loader/ui/Loader.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Loader } from './Loader';

const meta = {
  title: 'Shared/Loader',
  component: Loader,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Loader** - компонент индикации загрузки.

## Варианты:
- **spinner** - классический крутящийся индикатор
- **dots** - три пульсирующие точки
- **pulse** - пульсирующий круг
- **double-ring** - два вращающихся кольца (внешнее по часовой, внутреннее против)

## Размеры:
- **xs** (12px), **sm** (24px), **md** (32px), **lg** (48px), **xl** (64px), **xxl** (96px)

## Цвета:
- **primary** - основной цвет загрузчика (#de8041)
- **secondary** - вторичный цвет (#6c757d)
- **accent** - акцентный цвет (#50abc5)
- **orange** - оранжевый (#f4b377)

## Accessibility:
- \`role="status"\` - объявляет состояние загрузки скринридерам
- \`aria-busy="true"\` - указывает на активный процесс загрузки
- \`aria-label\` - текстовое описание для ассистивных технологий
- \`prefers-reduced-motion\` - автоматическое отключение анимации

## Примеры использования:

\`\`\`tsx
<Loader variant="spinner" size="md" color="primary" />
<Loader variant="dots" size="lg" color="accent" />
<Loader variant="pulse" size="sm" color="secondary" />
<Loader variant="double-ring" size="xl" color="primary" /> // Для Avatar
\`\`\`
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
      options: ['spinner', 'dots', 'pulse', 'double-ring'],
      description: 'Вариант лоадера',
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Размер лоадера',
    },
    color: {
      control: 'radio',
      options: ['primary', 'secondary', 'accent', 'orange'],
      description: 'Цвет лоадера',
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
} satisfies Meta<typeof Loader>;

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

export const Spinner: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="md" color="primary" />
    </ThemeContainer>
  ),
};

export const Dots: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="dots" size="md" color="primary" />
    </ThemeContainer>
  ),
};

export const Pulse: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="pulse" size="md" color="primary" />
    </ThemeContainer>
  ),
};

export const DoubleRing: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="double-ring" size="md" color="primary" />
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Два вращающихся кольца — внешний по часовой стрелке, внутренний против. Используется в Avatar компонентах.',
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
      <Loader variant="spinner" size="sm" color="primary" />
    </ThemeContainer>
  ),
};

export const Medium: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="md" color="primary" />
    </ThemeContainer>
  ),
};

export const Large: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="lg" color="primary" />
    </ThemeContainer>
  ),
};

export const ExtraLarge: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="xl" color="primary" />
    </ThemeContainer>
  ),
};

export const DoubleExtraLarge: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="xxl" color="primary" />
    </ThemeContainer>
  ),
};

// ============================================
// Colors
// ============================================

export const Primary: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="md" color="primary" />
    </ThemeContainer>
  ),
};

export const Secondary: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="md" color="secondary" />
    </ThemeContainer>
  ),
};

export const Accent: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="md" color="accent" />
    </ThemeContainer>
  ),
};

export const Orange: Story = {
  render: () => (
    <ThemeContainer>
      <Loader variant="spinner" size="md" color="orange" />
    </ThemeContainer>
  ),
};

// ============================================
// Real-world Examples
// ============================================

export const InlineWithText: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Loader variant="spinner" size="sm" color="primary" />
        <span style={{ color: 'var(--foreground)' }}>Загрузка данных...</span>
      </div>
    </ThemeContainer>
  ),
};

export const InsideCard: Story = {
  render: () => (
    <ThemeContainer>
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <Loader variant="dots" size="lg" color="accent" />
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
      <Loader variant="spinner" size="lg" color="primary" />
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
          <Loader variant="spinner" size="md" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Spinner
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Loader variant="dots" size="md" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Dots
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Loader variant="pulse" size="md" color="primary" />
          <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
            Pulse
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Loader variant="double-ring" size="md" color="primary" />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>XS (12px)</span>
          <Loader variant="spinner" size="xs" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>SM (24px)</span>
          <Loader variant="spinner" size="sm" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>MD (32px)</span>
          <Loader variant="spinner" size="md" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>LG (48px)</span>
          <Loader variant="double-ring" size="lg" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>XL (64px)</span>
          <Loader variant="double-ring" size="xl" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>XXL (96px)</span>
          <Loader variant="double-ring" size="xxl" color="primary" />
        </div>
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
        <Loader variant="spinner" size="md" color="primary" />
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
        <Loader variant="spinner" size="md" color="primary" />
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
      {/* Avatar About (lg) */}
      <div style={{ textAlign: 'center' }}>
        <Loader variant="double-ring" size="lg" color="primary" label="Loading avatar" />
        <p style={{ fontSize: '12px', marginTop: '16px', color: 'var(--foreground-muted)' }}>
          Avatar About (LG)
        </p>
      </div>

      {/* Avatar Hero (xl) */}
      <div style={{ textAlign: 'center' }}>
        <Loader variant="double-ring" size="xl" color="primary" label="Loading avatar" />
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
          'Использование Loader в Avatar компонентах. Double-ring variant с primary цветом (#DE8041) для консистентности с дизайном.',
      },
    },
  },
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
          <Loader variant="spinner" size="md" color="primary" />
          <Loader variant="dots" size="md" color="primary" />
          <Loader variant="pulse" size="md" color="primary" />
          <Loader variant="double-ring" size="md" color="primary" />
        </div>
      </div>
    </ThemeContainer>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Accessibility фича — при включении `prefers-reduced-motion` в настройках ОС все анимации автоматически отключаются.',
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
};
