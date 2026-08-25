import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Shared/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Skeleton** — компонент для отображения состояния загрузки контента.

Использует shimmer эффект и автоматически адаптируется под текущую тему (light/dark).

## Варианты использования:
- **text** — для заголовков, параграфов и текстовых блоков
- **circular** — для аватаров, иконок и круглых элементов
- **rectangular** — для изображений, карточек и прямоугольных блоков
- **rounded** — для скруглённых блоков (border-radius из \`$border-radius-md\`, переопределяется через \`--skeleton-radius\`)

## Stagger-задержка:
- \`staggerStep\` (0-1, дефолт \`0.1\`) — шаг задержки между строками в multi-line text варианте

## CSS-переменные:
- \`--skeleton-duration\`, \`--skeleton-delay\` — управление анимацией
- \`--skeleton-highlight\` — цвет блика shimmer-эффекта (переопределяется пользователем)
- \`--skeleton-radius\` — радиус скругления для rounded варианта

## Accessibility:
- \`role="status"\` — объявляет состояние загрузки скринридерам
- \`aria-busy="true"\` — указывает что контент загружается
- \`aria-label\` — текстовое описание для ассистивных технологий (i18n)
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
      options: ['text', 'circular', 'rectangular', 'rounded'],
      description: 'Вариант скелетона',
    },
    width: { control: 'text', description: 'Ширина (px, %, rem)' },
    height: { control: 'text', description: 'Высота (px, %, rem)' },
    lines: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Количество строк для текстового варианта',
    },
    delay: {
      control: { type: 'range', min: 0, max: 2, step: 0.1 },
      description: 'Задержка анимации (сек)',
    },
    staggerStep: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Шаг stagger-задержки между строками (multi-line text)',
    },
    duration: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.1 },
      description: 'Длительность анимации (сек)',
    },
    loading: {
      control: 'boolean',
      description: 'Признак состояния загрузки (true → скелетон, false → children)',
    },
    children: {
      control: 'text',
      description: 'Контент, рендерится когда loading === false',
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Group 1 — Basic Variants
// ============================================

export const Text: Story = {
  args: { variant: 'text', width: '200px', height: '20px' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  },
};

export const Circular: Story = {
  args: { variant: 'circular', width: '100px', height: '100px' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  },
};

export const Rectangular: Story = {
  args: { variant: 'rectangular', width: '300px', height: '200px' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  },
};

export const Rounded: Story = {
  args: { variant: 'rounded', width: '200px', height: '60px' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveClass(/rounded/);
  },
};

export const WithDelay: Story = {
  args: { variant: 'text', width: '200px', height: '20px', delay: 0.5, duration: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveStyle({ '--skeleton-delay': '0.5s', '--skeleton-duration': '2s' });
  },
};

export const CustomHighlight: Story = {
  args: { variant: 'text', width: '200px', height: '20px' },
  render: (args) => (
    <Skeleton {...args} style={{ '--skeleton-highlight': 'rgba(255, 0, 0, 0.4)' }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveStyle({ '--skeleton-highlight': 'rgba(255, 0, 0, 0.4)' });
  },
};

export const LoadingWrapper: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button type="button" onClick={() => setLoading((prev) => !prev)}>
          Toggle loading
        </button>
        <Skeleton loading={loading} width="200px" height="20px">
          <div data-testid="loading-wrapper-content">Контент загружен</div>
        </Skeleton>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // loading=true (default) → скелетон виден, контент скрыт
    expect(canvas.getByRole('status')).toBeInTheDocument();
    expect(canvas.queryByTestId('loading-wrapper-content')).not.toBeInTheDocument();
    // Клик → loading=false → контент виден, скелетон исчезает
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle loading' }));
    expect(canvas.getByTestId('loading-wrapper-content')).toBeInTheDocument();
    expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    // Повторный клик → скелетон снова виден
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle loading' }));
    expect(canvas.getByRole('status')).toBeInTheDocument();
    expect(canvas.queryByTestId('loading-wrapper-content')).not.toBeInTheDocument();
  },
};

// ============================================
// Group 2 — Multi-line
// ============================================

export const MultipleLines: Story = {
  args: { variant: 'text', width: '300px', lines: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lines = canvas.getAllByTestId(/skeleton-line/);
    expect(lines).toHaveLength(4);
    const lastLine = canvas.getByTestId('skeleton-line-last');
    expect(lastLine).toBeInTheDocument();
  },
};

// ============================================
// Group 3 — Real-world Examples
// ============================================

const wrapper = (story: React.ReactNode) => (
  <div
    style={{ backgroundColor: 'var(--background)', padding: 40, borderRadius: 12, minWidth: 400 }}
  >
    {story}
  </div>
);

export const AvatarWithText: Story = {
  render: () =>
    wrapper(
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Skeleton variant="circular" width="48px" height="48px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton variant="text" width="120px" height="16px" />
          <Skeleton variant="text" width="80px" height="14px" />
        </div>
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  },
};

export const Card: Story = {
  render: () =>
    wrapper(
      <div style={{ width: 300 }}>
        <Skeleton variant="rectangular" width="100%" height="150px" style={{ marginBottom: 16 }} />
        <Skeleton variant="text" width="80%" height="20px" style={{ marginBottom: 8 }} />
        <Skeleton variant="text" width="60%" height="20px" />
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  },
};

export const WorkHistoryItem: Story = {
  render: () =>
    wrapper(
      <div style={{ display: 'flex', gap: 16 }}>
        <Skeleton variant="circular" width="48px" height="48px" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton variant="text" width="60%" height="18px" />
          <Skeleton variant="text" width="40%" height="14px" />
          <Skeleton variant="text" width="100%" height="14px" />
        </div>
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(4);
  },
};

export const SkillsList: Story = {
  render: () =>
    wrapper(
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" width="100px" height="36px" />
        ))}
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(8);
  },
};

export const FullCard: Story = {
  render: () =>
    wrapper(
      <div style={{ width: 320 }}>
        <Skeleton variant="rectangular" width="100%" height="180px" style={{ marginBottom: 16 }} />
        <Skeleton variant="text" width="90%" height="20px" style={{ marginBottom: 8 }} />
        <Skeleton variant="text" width="70%" height="16px" style={{ marginBottom: 8 }} />
        <Skeleton variant="text" width="60%" height="16px" />
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(4);
  },
};

export const ProfileHeader: Story = {
  render: () =>
    wrapper(
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Skeleton variant="circular" width="80px" height="80px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton variant="text" width="180px" height="24px" />
          <Skeleton variant="text" width="140px" height="18px" />
          <Skeleton variant="text" width="100px" height="14px" />
        </div>
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(4);
  },
};

// ============================================
// Group 4 — Composite
// ============================================

export const Sizes: Story = {
  render: () =>
    wrapper(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton variant="text" width="100px" height="12px" />
        <Skeleton variant="text" width="200px" height="16px" />
        <Skeleton variant="text" width="300px" height="24px" />
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  },
};

export const AllVariants: Story = {
  render: () =>
    wrapper(
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Skeleton variant="text" width="100px" height="20px" />
        <Skeleton variant="circular" width="60px" height="60px" />
        <Skeleton variant="rectangular" width="150px" height="100px" />
        <Skeleton variant="rounded" width="150px" height="100px" />
      </div>
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeletons = canvas.getAllByRole('status');
    expect(skeletons).toHaveLength(4);
  },
};
