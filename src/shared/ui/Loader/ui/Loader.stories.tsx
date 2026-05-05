// src/shared/ui/Loader/ui/Loader.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Loader } from './Loader';

const meta = {
  title: 'Shared/UI/Loader',
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

## Размеры:
- **sm** (16px), **md** (24px), **lg** (32px)

## Цвета:
- **primary** - основной цвет темы (#f4b377)
- **secondary** - вторичный цвет (#6c757d)
- **accent** - акцентный цвет (#50abc5)

## Accessibility:
- \`role="status"\` - объявляет состояние загрузки скринридерам
- \`aria-busy="true"\` - указывает на активный процесс загрузки
- \`aria-label\` - текстовое описание для ассистивных технологий

## Примеры использования:

\`\`\`tsx
<Loader variant="spinner" size="md" color="primary" />
<Loader variant="dots" size="lg" color="accent" />
<Loader variant="pulse" size="sm" color="secondary" />
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
      options: ['spinner', 'dots', 'pulse'],
      description: 'Вариант лоадера',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Размер лоадера',
    },
    color: {
      control: 'radio',
      options: ['primary', 'secondary', 'accent'],
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
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
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
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>SM (16px)</span>
          <Loader variant="spinner" size="sm" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>MD (24px)</span>
          <Loader variant="spinner" size="md" color="primary" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>LG (32px)</span>
          <Loader variant="spinner" size="lg" color="primary" />
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
