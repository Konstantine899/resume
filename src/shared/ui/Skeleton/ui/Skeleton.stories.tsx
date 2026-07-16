// src/shared/ui/Skeleton/ui/Skeleton.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Shared/Skeleton',
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
// Interaction Tests
// ============================================

export const Interactive: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h4>Text Variant</h4>
          <Skeleton variant="text" width="200px" height="20px" data-testid="skeleton-text" />
        </div>
        <div>
          <h4>Circular Variant</h4>
          <Skeleton variant="circular" width="60px" height="60px" data-testid="skeleton-circular" />
        </div>
        <div>
          <h4>Rectangular Variant</h4>
          <Skeleton
            variant="rectangular"
            width="150px"
            height="100px"
            data-testid="skeleton-rectangular"
          />
        </div>
        <div>
          <h4>Multiple Lines</h4>
          <Skeleton variant="text" lines={4} data-testid="skeleton-lines" />
        </div>
      </div>
    </ThemeContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Verify all variants render with role="status"
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(4);

    // Test 2: Verify accessibility labels
    skeletons.forEach((skeleton) => {
      expect(skeleton).toHaveAttribute('aria-label', 'Загрузка...');
    });

    // Test 3: Verify text variant
    const textSkeleton = canvas.getByTestId('skeleton-text');
    expect(textSkeleton).toBeInTheDocument();

    // Test 4: Verify circular variant
    const circularSkeleton = canvas.getByTestId('skeleton-circular');
    expect(circularSkeleton).toBeInTheDocument();

    // Test 5: Verify rectangular variant
    const rectangularSkeleton = canvas.getByTestId('skeleton-rectangular');
    expect(rectangularSkeleton).toBeInTheDocument();

    // Test 6: Verify multiple lines render
    const linesSkeleton = canvas.getByTestId('skeleton-lines');
    const lines = linesSkeleton.querySelectorAll('[data-testid^="skeleton-line"]');
    expect(lines).toHaveLength(4);

    // Test 7: Verify last line has special marker
    const lastLine = canvas.getByTestId('skeleton-line-last');
    expect(lastLine).toBeInTheDocument();
  },
};
