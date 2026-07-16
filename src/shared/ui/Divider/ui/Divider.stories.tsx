// src/shared/ui/Divider/ui/Divider.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Divider } from './Divider';

const meta = {
  title: 'Shared/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Divider** — компонент для визуального разделения контента.

## Варианты использования:

- **horizontal** — горизонтальный разделитель (по умолчанию)
- **vertical** — вертикальный разделитель

## Стили линий:

- **solid** — сплошная линия
- **dashed** — пунктирная линия
- **dotted** — точечная линия

## Accessibility:

- \`role="separator"\` — объявляет элемент как разделитель
- \`aria-orientation\` — указывает ориентацию (horizontal/vertical)

## Примеры:

\`\`\`tsx
<Divider />
<Divider orientation="vertical" />
<Divider variant="dashed" thickness={2} />
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
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Ориентация разделителя',
    },
    variant: {
      control: 'radio',
      options: ['solid', 'dashed', 'dotted'],
      description: 'Стиль линии',
    },
    thickness: {
      control: 'range',
      min: 1,
      max: 10,
      step: 1,
      description: 'Толщина линии (px)',
    },
  },
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 1,
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Helper Components
// ============================================

const Container = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '20px',
      backgroundColor: 'var(--background)',
      borderRadius: '8px',
    }}
  >
    {children}
  </div>
);

const ContentContainer = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
);

// ============================================
// Basic Variants (с args и контекстом)
// ============================================

export const Solid: Story = {
  render: (args) => (
    <Container>
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: 0 }}>Section Above</h4>
        <p style={{ margin: '8px 0 0', color: 'var(--foreground)', opacity: 0.8 }}>
          Content above the divider
        </p>
      </div>
      <Divider {...args} />
      <div style={{ marginTop: '16px' }}>
        <h4 style={{ margin: 0 }}>Section Below</h4>
        <p style={{ margin: '8px 0 0', color: 'var(--foreground)', opacity: 0.8 }}>
          Content below the divider
        </p>
      </div>
    </Container>
  ),
  args: {
    variant: 'solid',
    thickness: 1,
  },
};

export const Dashed: Story = {
  ...Solid,
  args: {
    variant: 'dashed',
    thickness: 2,
  },
};

export const Dotted: Story = {
  ...Solid,
  args: {
    variant: 'dotted',
    thickness: 2,
  },
};

// ============================================
// Orientation
// ============================================

export const Horizontal: Story = {
  ...Solid,
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 1,
  },
};

export const Vertical: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100px' }}>
      <div style={{ textAlign: 'center', padding: '8px' }}>
        <strong>Left Panel</strong>
      </div>
      <Divider {...args} />
      <div style={{ textAlign: 'center', padding: '8px' }}>
        <strong>Right Panel</strong>
      </div>
    </div>
  ),
  args: {
    orientation: 'vertical',
    variant: 'solid',
    thickness: 1,
  },
};

// ============================================
// Thickness
// ============================================

export const Thickness1px: Story = {
  render: (args) => (
    <ContentContainer>
      <Container>
        <span>1px thickness</span>
        <Divider {...args} thickness={1} />
      </Container>
      <Container>
        <span>2px thickness</span>
        <Divider {...args} thickness={2} />
      </Container>
      <Container>
        <span>3px thickness</span>
        <Divider {...args} thickness={3} />
      </Container>
      <Container>
        <span>5px thickness</span>
        <Divider {...args} thickness={5} />
      </Container>
      <Container>
        <span>10px thickness</span>
        <Divider {...args} thickness={10} />
      </Container>
    </ContentContainer>
  ),
  args: {
    variant: 'solid',
  },
};

export const Thickness2px: Story = {
  ...Solid,
  args: {
    thickness: 2,
  },
};

export const Thickness5px: Story = {
  ...Solid,
  args: {
    thickness: 5,
  },
};

// ============================================
// Combined Examples
// ============================================

export const AllVariants: Story = {
  render: (args) => (
    <ContentContainer>
      <Container>
        <h4 style={{ marginBottom: '12px' }}>Solid</h4>
        <Divider {...args} variant="solid" />
      </Container>
      <Container>
        <h4 style={{ marginBottom: '12px' }}>Dashed</h4>
        <Divider {...args} variant="dashed" />
      </Container>
      <Container>
        <h4 style={{ marginBottom: '12px' }}>Dotted</h4>
        <Divider {...args} variant="dotted" />
      </Container>
    </ContentContainer>
  ),
};

export const AllThicknesses: Story = {
  render: (args) => (
    <ContentContainer>
      {[1, 2, 3, 5, 10].map((thickness) => (
        <Container key={thickness}>
          <div style={{ marginBottom: '8px', fontSize: '14px' }}>{thickness}px thickness</div>
          <Divider {...args} thickness={thickness} />
        </Container>
      ))}
    </ContentContainer>
  ),
};

export const ContentSeparation: Story = {
  render: (args) => (
    <Container>
      <section>
        <h3 style={{ marginBottom: '8px' }}>Section 1</h3>
        <p style={{ marginBottom: '16px' }}>Content above divider</p>
        <Divider {...args} />
        <h3 style={{ marginTop: '16px', marginBottom: '8px' }}>Section 2</h3>
        <p>Content below divider</p>
      </section>
    </Container>
  ),
};

export const VerticalLayoutStory: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '120px' }}>
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <strong>Item 1</strong>
      </div>
      <Divider {...args} orientation="vertical" />
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <strong>Item 2</strong>
      </div>
      <Divider {...args} orientation="vertical" variant="dashed" />
      <div style={{ textAlign: 'center', padding: '16px' }}>
        <strong>Item 3</strong>
      </div>
    </div>
  ),
  args: {
    variant: 'solid',
    thickness: 1,
  },
};

// ============================================
// Theme Comparison
// ============================================

export const ThemeComparison: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        gap: '32px',
        padding: '20px',
      }}
    >
      <div
        data-theme="light"
        style={{
          flex: 1,
          padding: '24px',
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #e0e0e0)',
        }}
      >
        <h4 style={{ marginBottom: '16px', color: 'var(--text-primary, #333)' }}>Light Theme</h4>
        <Divider {...args} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary, #666)', fontSize: '14px' }}>
          Divider on light background
        </p>
      </div>
      <div
        data-theme="dark"
        style={{
          flex: 1,
          padding: '24px',
          backgroundColor: 'var(--bg-primary, #1a1a1a)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #333)',
        }}
      >
        <h4 style={{ marginBottom: '16px', color: 'var(--text-primary, #fff)' }}>Dark Theme</h4>
        <Divider {...args} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary, #999)', fontSize: '14px' }}>
          Divider on dark background
        </p>
      </div>
    </div>
  ),
};

// ============================================
// Playground (для демонстрации Controls)
// ============================================

export const Playground: Story = {
  render: (args) => (
    <Container>
      <Divider {...args} />
    </Container>
  ),
  args: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: 1,
  },
};

// ============================================
// Interaction Tests
// ============================================

export const Interactive: Story = {
  render: (args) => (
    <ContentContainer>
      <Container>
        <Divider {...args} data-testid="divider-horizontal" />
      </Container>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100px' }}>
        <Divider {...args} orientation="vertical" data-testid="divider-vertical" />
      </div>
      <Container>
        <Divider {...args} variant="dashed" thickness={2} data-testid="divider-dashed" />
      </Container>
    </ContentContainer>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Verify horizontal divider
    const horizontalDivider = canvas.getByTestId('divider-horizontal');
    expect(horizontalDivider).toBeInTheDocument();
    expect(horizontalDivider).toHaveAttribute('role', 'separator');
    expect(horizontalDivider).toHaveAttribute('aria-orientation', 'horizontal');

    // Test 2: Verify vertical divider
    const verticalDivider = canvas.getByTestId('divider-vertical');
    expect(verticalDivider).toBeInTheDocument();
    expect(verticalDivider).toHaveAttribute('aria-orientation', 'vertical');

    // Test 3: Verify dashed variant
    const dashedDivider = canvas.getByTestId('divider-dashed');
    expect(dashedDivider).toHaveClass(/dashed/);

    // Test 4: Verify thickness
    expect(dashedDivider).toHaveStyle({ height: '2px' });
  },
};
