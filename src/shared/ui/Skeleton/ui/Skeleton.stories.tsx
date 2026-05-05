// src/shared/ui/Skeleton/ui/Skeleton.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Shared/UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Skeleton** - компонент для отображения состояния загрузки контента.

Использует shimmer эффект и автоматически адаптируется под текущую тему (light/dark).

## Варианты использования:

- **text** - для заголовков, параграфов и текстовых блоков
- **circular** - для аватаров, иконок и круглых элементов
- **rectangular** - для изображений, карточек и прямоугольных блоков

## Accessibility:

- \`role="status"\` - объявляет состояние загрузки скринридерам
- \`aria-label="Загрузка..."\` - текстовое описание для ассистивных технологий

## Примеры:

\`\`\`tsx
<Skeleton variant="text" width="200px" height="20px" />
<Skeleton variant="circular" width="100px" height="100px" />
<Skeleton variant="rectangular" width="300px" height="200px" />
<Skeleton variant="text" width="300px" lines={4} />
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
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      description: 'Вариант скелетона',
    },
    width: {
      control: 'text',
      description: 'Ширина компонента (px, %, rem, etc.)',
    },
    height: {
      control: 'text',
      description: 'Высота компонента (px, %, rem, etc.)',
    },
    lines: {
      control: 'range',
      min: 1,
      max: 10,
      step: 1,
      description: 'Количество строк для текстового варианта',
    },
    delay: {
      control: 'range',
      min: 0,
      max: 2,
      step: 0.1,
      description: 'Задержка перед началом анимации (сек)',
    },
    duration: {
      control: 'range',
      min: 0.5,
      max: 3,
      step: 0.1,
      description: 'Длительность анимации (сек)',
    },
  },
  args: {
    variant: 'text',
    width: '200px',
    height: '20px',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Helper Components
// ============================================

const ThemeContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: 'var(--background)',
      padding: '40px',
      borderRadius: '12px',
      minWidth: '400px',
    }}
  >
    {children}
  </div>
);

// ============================================
// Basic Variants
// ============================================

export const Text: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="text" width="200px" height="20px" />
    </ThemeContainer>
  ),
};

export const Circular: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="circular" width="100px" height="100px" />
    </ThemeContainer>
  ),
};

export const Rectangular: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="rectangular" width="300px" height="200px" />
    </ThemeContainer>
  ),
};

// ============================================
// Multiple Lines
// ============================================

export const MultipleLines: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="text" width="300px" lines={4} />
    </ThemeContainer>
  ),
};

// ============================================
// Sizes
// ============================================

export const Small: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="text" width="100px" height="12px" />
    </ThemeContainer>
  ),
};

export const Medium: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="text" width="200px" height="16px" />
    </ThemeContainer>
  ),
};

export const Large: Story = {
  render: () => (
    <ThemeContainer>
      <Skeleton variant="text" width="300px" height="24px" />
    </ThemeContainer>
  ),
};

// ============================================
// Real-world Examples
// ============================================

export const AvatarWithText: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Skeleton variant="circular" width="48px" height="48px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton variant="text" width="120px" height="16px" />
          <Skeleton variant="text" width="80px" height="14px" />
        </div>
      </div>
    </ThemeContainer>
  ),
};

export const Card: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ width: '300px' }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="150px"
          style={{ marginBottom: '16px' }}
        />
        <Skeleton variant="text" width="80%" height="20px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="60%" height="20px" />
      </div>
    </ThemeContainer>
  ),
};

export const WorkHistoryItem: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Skeleton variant="circular" width="48px" height="48px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton variant="text" width="60%" height="18px" />
          <Skeleton variant="text" width="40%" height="14px" />
          <Skeleton variant="text" width="100%" height="14px" />
        </div>
      </div>
    </ThemeContainer>
  ),
};

export const SkillsList: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100px" height="36px" />
        ))}
      </div>
    </ThemeContainer>
  ),
};

export const ProjectListItem: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '16px' }}>
        <Skeleton variant="rectangular" width="120px" height="90px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton variant="text" width="70%" height="18px" />
          <Skeleton variant="text" width="50%" height="14px" />
        </div>
      </div>
    </ThemeContainer>
  ),
};

// ============================================
// Full Examples
// ============================================

export const FullCard: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ width: '320px' }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="180px"
          style={{ marginBottom: '16px' }}
        />
        <Skeleton variant="text" width="90%" height="20px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="70%" height="16px" style={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="60%" height="16px" />
      </div>
    </ThemeContainer>
  ),
};

export const ProfileHeader: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Skeleton variant="circular" width="80px" height="80px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Skeleton variant="text" width="180px" height="24px" />
          <Skeleton variant="text" width="140px" height="18px" />
          <Skeleton variant="text" width="100px" height="14px" />
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
          minWidth: '300px',
        }}
      >
        <h4 style={{ marginBottom: '20px', color: 'var(--foreground)' }}>Light Theme</h4>
        <Skeleton variant="text" width="200px" height="20px" style={{ marginBottom: '12px' }} />
        <Skeleton variant="circular" width="60px" height="60px" />
      </div>
      <div
        data-theme="dark"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          minWidth: '300px',
        }}
      >
        <h4 style={{ marginBottom: '20px', color: 'var(--foreground)' }}>Dark Theme</h4>
        <Skeleton variant="text" width="200px" height="20px" style={{ marginBottom: '12px' }} />
        <Skeleton variant="circular" width="60px" height="60px" />
      </div>
    </div>
  ),
};
