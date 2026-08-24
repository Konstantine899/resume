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
      <Container {...args} size="sm" data-testid="container-sm">
        <ContentBox>Small container content</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-sm');
    expect(container).toHaveAttribute('data-size', 'sm');
    expect(canvas.getByText('Small container content')).toBeInTheDocument();
  },
};

export const Medium: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="md (768px)" />
      <Container {...args} size="md" data-testid="container-md">
        <ContentBox>Medium container content</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-md');
    expect(container).toHaveAttribute('data-size', 'md');
    expect(canvas.getByText('Medium container content')).toBeInTheDocument();
  },
};

export const Large: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="lg (1024px)" />
      <Container {...args} size="lg" data-testid="container-lg">
        <ContentBox>Large container content (default)</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-lg');
    expect(container).toHaveAttribute('data-size', 'lg');
    expect(canvas.getByText('Large container content (default)')).toBeInTheDocument();
  },
};

export const ExtraLarge: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="xl (1280px)" />
      <Container {...args} size="xl" data-testid="container-xl">
        <ContentBox>Extra large container content</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-xl');
    expect(container).toHaveAttribute('data-size', 'xl');
    expect(canvas.getByText('Extra large container content')).toBeInTheDocument();
  },
};

export const Full: Story = {
  render: (args) => (
    <div>
      <SizeLabel size="full (100%)" />
      <Container {...args} size="full" data-testid="container-full">
        <ContentBox>Full width container content</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-full');
    expect(container).toHaveAttribute('data-size', 'full');
    expect(canvas.getByText('Full width container content')).toBeInTheDocument();
  },
};

// ============================================
// All Sizes Comparison
// ============================================

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <SizeLabel size="sm (640px)" />
        <Container {...args} size="sm" data-testid="container-sm">
          <ContentBox>Small</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="md (768px)" />
        <Container {...args} size="md" data-testid="container-md">
          <ContentBox>Medium</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="lg (1024px)" />
        <Container {...args} size="lg" data-testid="container-lg">
          <ContentBox>Large</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="xl (1280px)" />
        <Container {...args} size="xl" data-testid="container-xl">
          <ContentBox>Extra Large</ContentBox>
        </Container>
      </div>
      <div>
        <SizeLabel size="full (100%)" />
        <Container {...args} size="full" data-testid="container-full">
          <ContentBox>Full Width</ContentBox>
        </Container>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('container-sm')).toHaveAttribute('data-size', 'sm');
    expect(canvas.getByTestId('container-md')).toHaveAttribute('data-size', 'md');
    expect(canvas.getByTestId('container-lg')).toHaveAttribute('data-size', 'lg');
    expect(canvas.getByTestId('container-xl')).toHaveAttribute('data-size', 'xl');
    expect(canvas.getByTestId('container-full')).toHaveAttribute('data-size', 'full');
    expect(canvas.getByText('Small')).toBeInTheDocument();
    expect(canvas.getByText('Medium')).toBeInTheDocument();
    expect(canvas.getByText('Large')).toBeInTheDocument();
    expect(canvas.getByText('Extra Large')).toBeInTheDocument();
    expect(canvas.getByText('Full Width')).toBeInTheDocument();
  },
};

// ============================================
// Padding
// ============================================

export const PaddingNone: Story = {
  render: (args) => (
    <Container {...args} padding="none" data-testid="padding-none">
      <ContentBox>No padding</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('padding-none');
    expect(container).toHaveAttribute('data-padding', 'none');
    expect(canvas.getByText('No padding')).toBeInTheDocument();
  },
};

export const PaddingSmall: Story = {
  render: (args) => (
    <Container {...args} padding="sm" data-testid="padding-sm">
      <ContentBox>Small padding (1rem)</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('padding-sm');
    expect(container).toHaveAttribute('data-padding', 'sm');
    expect(canvas.getByText('Small padding (1rem)')).toBeInTheDocument();
  },
};

export const PaddingMedium: Story = {
  render: (args) => (
    <Container {...args} padding="md" data-testid="padding-md">
      <ContentBox>Medium padding (1.5rem)</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('padding-md');
    expect(container).toHaveAttribute('data-padding', 'md');
    expect(canvas.getByText('Medium padding (1.5rem)')).toBeInTheDocument();
  },
};

export const PaddingLarge: Story = {
  render: (args) => (
    <Container {...args} padding="lg" data-testid="padding-lg">
      <ContentBox>Large padding (2rem)</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('padding-lg');
    expect(container).toHaveAttribute('data-padding', 'lg');
    expect(canvas.getByText('Large padding (2rem)')).toBeInTheDocument();
  },
};

export const PaddingExtraLarge: Story = {
  render: (args) => (
    <Container {...args} padding="xl" data-testid="padding-xl">
      <ContentBox>Extra large padding (3rem)</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('padding-xl');
    expect(container).toHaveAttribute('data-padding', 'xl');
    expect(canvas.getByText('Extra large padding (3rem)')).toBeInTheDocument();
  },
};

// ============================================
// Centered
// ============================================

export const Centered: Story = {
  render: (args) => (
    <Container {...args} centered data-testid="container-centered">
      <ContentBox>Centered (default)</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-centered');
    expect(container.className).toMatch(/centered/);
    expect(canvas.getByText('Centered (default)')).toBeInTheDocument();
  },
};

export const NotCentered: Story = {
  render: (args) => (
    <Container {...args} centered={false} data-testid="container-not-centered">
      <ContentBox>Not centered</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-not-centered');
    expect(container.className).not.toMatch(/centered/);
    expect(canvas.getByText('Not centered')).toBeInTheDocument();
  },
};

// ============================================
// Full Width
// ============================================

export const FullWidth: Story = {
  render: (args) => (
    <Container {...args} fullWidth data-testid="container-fullwidth">
      <ContentBox>Full width (ignores size)</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-fullwidth');
    expect(container.className).toMatch(/fullWidth/);
    expect(canvas.getByText('Full width (ignores size)')).toBeInTheDocument();
  },
};

// ============================================
// Real-world Examples
// ============================================

export const PageLayout: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Container {...args} size="xl" data-testid="page-header">
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

      <Container {...args} size="lg" data-testid="page-main">
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

      <Container {...args} size="md" data-testid="page-footer">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('page-header')).toHaveAttribute('data-size', 'xl');
    expect(canvas.getByTestId('page-main')).toHaveAttribute('data-size', 'lg');
    expect(canvas.getByTestId('page-footer')).toHaveAttribute('data-size', 'md');
    expect(canvas.getByText('Page Header')).toBeInTheDocument();
    expect(canvas.getByText('Main Content')).toBeInTheDocument();
    expect(canvas.getByText('Footer content')).toBeInTheDocument();
  },
};

export const ResponsiveGrid: Story = {
  render: (args) => (
    <Container {...args} size="xl" data-testid="grid-container">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('grid-container')).toBeInTheDocument();
    expect(canvas.getByText('Card 1')).toBeInTheDocument();
    expect(canvas.getByText('Card 2')).toBeInTheDocument();
    expect(canvas.getByText('Card 3')).toBeInTheDocument();
    expect(canvas.getByText('Card 4')).toBeInTheDocument();
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
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
        }}
      >
        <h4 style={{ marginBottom: '16px', color: '#333' }}>Light Theme</h4>
        <Container {...args} size="md" data-testid="theme-light">
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
        <Container {...args} size="md" data-testid="theme-dark">
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lightContainer = canvas.getByTestId('theme-light');
    const darkContainer = canvas.getByTestId('theme-dark');
    expect(lightContainer).toBeInTheDocument();
    expect(darkContainer).toBeInTheDocument();
    expect(lightContainer).toHaveAttribute('data-size', 'md');
    expect(darkContainer).toHaveAttribute('data-size', 'md');
    expect(canvas.getByText('Light Theme')).toBeInTheDocument();
    expect(canvas.getByText('Dark Theme')).toBeInTheDocument();
  },
};

// ============================================
// Playground
// ============================================

export const Playground: Story = {
  render: (args) => (
    <Container {...args} data-testid="playground">
      <ContentBox>
        <div>Adjust controls to see different configurations</div>
      </ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('playground');
    expect(container).toBeInTheDocument();
    expect(canvas.getByText('Adjust controls to see different configurations')).toBeInTheDocument();
  },
};

// ============================================
// Polymorphic Stories
// ============================================

export const AsSection: Story = {
  render: () => (
    <Container component="section" aria-label="Content section" data-testid="container-section">
      <ContentBox>This container renders as a section element</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-section');
    expect(container.tagName).toBe('SECTION');
    expect(container).toHaveAttribute('aria-label', 'Content section');
  },
} as Story;

export const AsArticle: Story = {
  render: () => (
    <Container component="article" data-testid="container-article">
      <ContentBox>This container renders as an article element</ContentBox>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('container-article');
    expect(container.tagName).toBe('ARTICLE');
  },
} as Story;

export const WithContainerLayout: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Container component="header" size="xl" centered data-testid="layout-header">
        <ContentBox>Header Section (xl)</ContentBox>
      </Container>
      <Container component="main" size="lg" centered data-testid="layout-main">
        <ContentBox>Main Content (lg)</ContentBox>
      </Container>
      <Container component="footer" size="md" centered data-testid="layout-footer">
        <ContentBox>Footer Section (md)</ContentBox>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const header = canvas.getByTestId('layout-header');
    const main = canvas.getByTestId('layout-main');
    const footer = canvas.getByTestId('layout-footer');
    expect(header.tagName).toBe('HEADER');
    expect(main.tagName).toBe('MAIN');
    expect(footer.tagName).toBe('FOOTER');
    expect(canvas.getByText('Header Section (xl)')).toBeInTheDocument();
    expect(canvas.getByText('Main Content (lg)')).toBeInTheDocument();
    expect(canvas.getByText('Footer Section (md)')).toBeInTheDocument();
  },
} as Story;

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
