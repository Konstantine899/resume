// src/shared/ui/Container/ui/Container.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Container } from './Container';

const meta = {
  title: 'Shared/Container',
  component: Container,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Container** — компонент для ограничения ширины и центрирования контента.

## Размеры:

- **sm** - 640px (маленький)
- **md** - 768px (средний)
- **lg** - 1024px (большой, по умолчанию)
- **xl** - 1280px (очень большой)
- **full** - 100% (полная ширина)

## Особенности:

- **centered** - центрирование контента (по умолчанию true)
- **fullWidth** - полная ширина (игнорирует size)
- **padding** - внутренние отступы (none, sm, md, lg, xl)

## Примеры:

\`\`\`tsx
<Container>Content</Container>
<Container size="xl">Large content</Container>
<Container fullWidth padding="lg">Full width with padding</Container>
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
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Размер контейнера (max-width)',
    },
    centered: {
      control: 'boolean',
      description: 'Центрировать контент',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Полная ширина (игнорирует size)',
    },
    padding: {
      control: 'radio',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Внутренние отступы',
    },
  },
  args: {
    size: 'lg',
    centered: true,
    padding: 'md',
    fullWidth: false,
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Helper Components
// ============================================

const ContentBox = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: '20px',
      backgroundColor: 'var(--primary)',
      color: 'var(--background)',
      borderRadius: '8px',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

const SizeLabel = ({ size }: { size: string }) => (
  <div
    style={{
      fontSize: '12px',
      color: 'var(--foreground)',
      opacity: 0.7,
      marginBottom: '8px',
    }}
  >
    Size: {size}
  </div>
);

// ============================================
// Basic Sizes
// ============================================

export const Small: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="sm (640px)" />
      <Container {...args} size="sm">
        <ContentBox>Small container content</ContentBox>
      </Container>
    </div>
  ),
};

export const Medium: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="md (768px)" />
      <Container {...args} size="md">
        <ContentBox>Medium container content</ContentBox>
      </Container>
    </div>
  ),
};

export const Large: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="lg (1024px)" />
      <Container {...args} size="lg">
        <ContentBox>Large container content (default)</ContentBox>
      </Container>
    </div>
  ),
};

export const ExtraLarge: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="xl (1280px)" />
      <Container {...args} size="xl">
        <ContentBox>Extra large container content</ContentBox>
      </Container>
    </div>
  ),
};

export const Full: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="full (100%)" />
      <Container {...args} size="full">
        <ContentBox>Full width container content</ContentBox>
      </Container>
    </div>
  ),
};

// ============================================
// All Sizes Comparison
// ============================================

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <SizeLabel size="sm (640px)" />
        <Container {...args} size="sm">
          <ContentBox>Small</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="md (768px)" />
        <Container {...args} size="md">
          <ContentBox>Medium</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="lg (1024px)" />
        <Container {...args} size="lg">
          <ContentBox>Large</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="xl (1280px)" />
        <Container {...args} size="xl">
          <ContentBox>Extra Large</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="full (100%)" />
        <Container {...args} size="full">
          <ContentBox>Full Width</ContentBox>
        </Container>
      </div>
    </div>
  ),
};

// ============================================
// Padding
// ============================================

export const PaddingNone: Story = {
  render: (args) => (
    <Container {...args} padding="none">
      <ContentBox>No padding</ContentBox>
    </Container>
  ),
};

export const PaddingSmall: Story = {
  render: (args) => (
    <Container {...args} padding="sm">
      <ContentBox>Small padding (1rem)</ContentBox>
    </Container>
  ),
};

export const PaddingMedium: Story = {
  render: (args) => (
    <Container {...args} padding="md">
      <ContentBox>Medium padding (1.5rem)</ContentBox>
    </Container>
  ),
};

export const PaddingLarge: Story = {
  render: (args) => (
    <Container {...args} padding="lg">
      <ContentBox>Large padding (2rem)</ContentBox>
    </Container>
  ),
};

export const PaddingExtraLarge: Story = {
  render: (args) => (
    <Container {...args} padding="xl">
      <ContentBox>Extra large padding (3rem)</ContentBox>
    </Container>
  ),
};

// ============================================
// Centered
// ============================================

export const Centered: Story = {
  render: (args) => (
    <Container {...args} centered>
      <ContentBox>Centered (default)</ContentBox>
    </Container>
  ),
};

export const NotCentered: Story = {
  render: (args) => (
    <Container {...args} centered={false}>
      <ContentBox>Not centered</ContentBox>
    </Container>
  ),
};

// ============================================
// Full Width
// ============================================

export const FullWidth: Story = {
  render: (args) => (
    <Container {...args} fullWidth>
      <ContentBox>Full width (ignores size)</ContentBox>
    </Container>
  ),
};

// ============================================
// Real-world Examples
// ============================================

export const PageLayout: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Container {...args} size="xl">
        <header
          style={{
            padding: '20px',
            backgroundColor: 'var(--primary)',
            color: 'var(--background)',
            borderRadius: '8px',
          }}
        >
          <h1 style={{ margin: 0 }}>Page Header</h1>
          <p style={{ margin: '8px 0 0', opacity: 0.8 }}>Navigation would go here</p>
        </header>
      </Container>

      <Container {...args} size="lg">
        <main
          style={{
            padding: '20px',
            backgroundColor: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
          }}
        >
          <h2>Main Content</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </main>
      </Container>

      <Container {...args} size="md">
        <footer
          style={{
            padding: '20px',
            backgroundColor: 'var(--foreground)',
            color: 'var(--background)',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0 }}>Footer content</p>
        </footer>
      </Container>
    </div>
  ),
};

export const ResponsiveGrid: Story = {
  render: (args) => (
    <Container {...args} size="xl">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              padding: '20px',
              backgroundColor: 'var(--primary)',
              color: 'var(--background)',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            Card {i}
          </div>
        ))}
      </div>
    </Container>
  ),
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
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h4 style={{ marginBottom: '16px', color: '#333' }}>Light Theme</h4>
        <Container {...args} size="md">
          <div
            style={{
              padding: '20px',
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '8px',
            }}
          >
            Container content
          </div>
        </Container>
      </div>
      <div
        data-theme="dark"
        style={{
          flex: 1,
          padding: '24px',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333',
        }}
      >
        <h4 style={{ marginBottom: '16px', color: '#fff' }}>Dark Theme</h4>
        <Container {...args} size="md">
          <div
            style={{
              padding: '20px',
              backgroundColor: '#007bff',
              color: '#fff',
              borderRadius: '8px',
            }}
          >
            Container content
          </div>
        </Container>
      </div>
    </div>
  ),
};

// ============================================
// Playground
// ============================================

export const Playground: Story = {
  render: (args) => (
    <Container {...args}>
      <ContentBox>
        <div>Adjust controls to see different configurations</div>
      </ContentBox>
    </Container>
  ),
};

// ============================================
// Interaction Tests
// ============================================

export const Interactive: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Container {...args} size="lg" data-testid="container-lg">
        <ContentBox>Large container</ContentBox>
      </Container>
      <Container {...args} size="md" data-testid="container-md">
        <ContentBox>Medium container</ContentBox>
      </Container>
      <Container {...args} fullWidth data-testid="container-full">
        <ContentBox>Full width container</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Verify large container
    const lgContainer = canvas.getByTestId('container-lg');
    expect(lgContainer).toBeInTheDocument();

    // Test 2: Verify medium container
    const mdContainer = canvas.getByTestId('container-md');
    expect(mdContainer).toBeInTheDocument();

    // Test 3: Verify full width container
    const fullContainer = canvas.getByTestId('container-full');
    expect(fullContainer).toBeInTheDocument();

    // Test 4: Verify content is rendered
    expect(canvas.getByText('Large container')).toBeInTheDocument();
    expect(canvas.getByText('Medium container')).toBeInTheDocument();
    expect(canvas.getByText('Full width container')).toBeInTheDocument();
  },
};
