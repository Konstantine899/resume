// src/shared/ui/Section/ui/Section.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Section } from './Section';

const meta = {
  title: 'Shared/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Section** — семантический компонент для разделения контента страницы.

## Варианты стилей:

- **default** - Базовый стиль (transparent)
- **alternate** - Альтернативный фон (#f5f5f5)
- **gradient** - Градиентный фон
- **muted** - Приглушённый стиль с borders
- **dark** - Тёмный фон (#1a1a1a)
- **light** - Светлый фон (#ffffff)

## Размеры:

- **sm** - 640px
- **md** - 768px
- **lg** - 1024px (по умолчанию)
- **xl** - 1280px
- **2xl** - 1536px
- **full** - 100%

## Особенности:

- **padding** - Внутренние отступы (none, sm, md, lg, xl, 2xl)
- **margin** - Vertical rhythm (top/bottom)
- **as** - Semantic HTML (section, div, article, aside, main, nav)
- **container** - Встроенный Container support
- **overlay** - Overlay эффект поверх фона
- **background/textColor** - CSS custom properties для темизации

## Примеры:

\`\`\`tsx
<Section>Content</Section>
<Section variant="gradient" padding="2xl">Hero section</Section>
<Section variant="dark" container>Dark section with container</Section>
<Section margin={{ top: 'lg', bottom: 'xl' }}>Section with spacing</Section>
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
      options: ['default', 'alternate', 'gradient', 'muted', 'dark', 'light'],
      description: 'Вариант стиля секции',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
      description: 'Размер секции (max-width)',
    },
    padding: {
      control: 'radio',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Внутренние отступы',
    },
    as: {
      control: 'select',
      options: ['section', 'div', 'article', 'aside', 'main', 'nav'],
      description: 'Semantic HTML элемент',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Полная ширина (игнорирует size)',
    },
    overlay: {
      control: 'boolean',
      description: 'Overlay эффект поверх фона',
    },
    container: {
      control: 'boolean',
      description: 'Встроенный Container',
    },
    background: {
      control: 'text',
      description: 'Кастомный background (CSS custom property)',
    },
    textColor: {
      control: 'text',
      description: 'Кастомный цвет текста (CSS custom property)',
    },
  },
  args: {
    variant: 'default',
    size: 'lg',
    padding: 'lg',
    fullWidth: false,
    overlay: false,
    container: false,
  },
} satisfies Meta<typeof Section>;

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

const SectionContent = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <h2 style={{ margin: 0 }}>Section Title</h2>
    <p style={{ margin: 0, opacity: 0.8 }}>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </p>
    <button
      style={{
        padding: '10px 20px',
        backgroundColor: 'var(--primary)',
        color: 'var(--background)',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        alignSelf: 'flex-start',
      }}
    >
      Action Button
    </button>
  </div>
);

// ============================================
// Basic Variants
// ============================================

export const Default: Story = {
  render: (args) => (
    <Section {...args}>
      <SectionContent />
    </Section>
  ),
};

export const Alternate: Story = {
  render: (args) => (
    <Section {...args} variant="alternate">
      <SectionContent />
    </Section>
  ),
};

export const Gradient: Story = {
  render: (args) => (
    <Section {...args} variant="gradient">
      <SectionContent />
    </Section>
  ),
};

export const Muted: Story = {
  render: (args) => (
    <Section {...args} variant="muted">
      <SectionContent />
    </Section>
  ),
};

export const Dark: Story = {
  render: (args) => (
    <Section {...args} variant="dark">
      <SectionContent />
    </Section>
  ),
};

export const Light: Story = {
  render: (args) => (
    <Section {...args} variant="light">
      <SectionContent />
    </Section>
  ),
};

// ============================================
// Sizes
// ============================================

export const Small: Story = {
  render: (args) => (
    <Section {...args} size="sm">
      <ContentBox>Small (640px)</ContentBox>
    </Section>
  ),
};

export const Medium: Story = {
  render: (args) => (
    <Section {...args} size="md">
      <ContentBox>Medium (768px)</ContentBox>
    </Section>
  ),
};

export const Large: Story = {
  render: (args) => (
    <Section {...args} size="lg">
      <ContentBox>Large (1024px)</ContentBox>
    </Section>
  ),
};

export const ExtraLarge: Story = {
  render: (args) => (
    <Section {...args} size="xl">
      <ContentBox>Extra Large (1280px)</ContentBox>
    </Section>
  ),
};

export const TwoXL: Story = {
  render: (args) => (
    <Section {...args} size="2xl">
      <ContentBox>2XL (1536px)</ContentBox>
    </Section>
  ),
};

export const Full: Story = {
  render: (args) => (
    <Section {...args} size="full">
      <ContentBox>Full Width (100%)</ContentBox>
    </Section>
  ),
};

// ============================================
// All Sizes Comparison
// ============================================

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>sm (640px)</div>
        <Section {...args} size="sm">
          <ContentBox>Small</ContentBox>
        </Section>
      </div>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>md (768px)</div>
        <Section {...args} size="md">
          <ContentBox>Medium</ContentBox>
        </Section>
      </div>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>lg (1024px)</div>
        <Section {...args} size="lg">
          <ContentBox>Large</ContentBox>
        </Section>
      </div>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>xl (1280px)</div>
        <Section {...args} size="xl">
          <ContentBox>Extra Large</ContentBox>
        </Section>
      </div>
      <div>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>2xl (1536px)</div>
        <Section {...args} size="2xl">
          <ContentBox>2XL</ContentBox>
        </Section>
      </div>
    </div>
  ),
};

// ============================================
// Padding
// ============================================

export const PaddingNone: Story = {
  render: (args) => (
    <Section {...args} padding="none">
      <ContentBox>No padding</ContentBox>
    </Section>
  ),
};

export const PaddingSmall: Story = {
  render: (args) => (
    <Section {...args} padding="sm">
      <ContentBox>Small padding (1.5rem)</ContentBox>
    </Section>
  ),
};

export const PaddingMedium: Story = {
  render: (args) => (
    <Section {...args} padding="md">
      <ContentBox>Medium padding (2rem)</ContentBox>
    </Section>
  ),
};

export const PaddingLarge: Story = {
  render: (args) => (
    <Section {...args} padding="lg">
      <ContentBox>Large padding (3rem)</ContentBox>
    </Section>
  ),
};

export const PaddingExtraLarge: Story = {
  render: (args) => (
    <Section {...args} padding="xl">
      <ContentBox>Extra large padding (4rem)</ContentBox>
    </Section>
  ),
};

export const Padding2XL: Story = {
  render: (args) => (
    <Section {...args} padding="2xl">
      <ContentBox>2XL padding (6rem)</ContentBox>
    </Section>
  ),
};

// ============================================
// Vertical Rhythm
// ============================================

export const MarginTop: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ContentBox>Previous section</ContentBox>
      <Section {...args} margin={{ top: 'xl' }}>
        <ContentBox>Section with margin-top-xl</ContentBox>
      </Section>
    </div>
  ),
};

export const MarginBottom: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Section {...args} margin={{ bottom: 'xl' }}>
        <ContentBox>Section with margin-bottom-xl</ContentBox>
      </Section>
      <ContentBox>Next section</ContentBox>
    </div>
  ),
};

export const MarginBoth: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ContentBox>Previous section</ContentBox>
      <Section {...args} margin={{ top: 'lg', bottom: 'lg' }}>
        <ContentBox>Section with margin top & bottom</ContentBox>
      </Section>
      <ContentBox>Next section</ContentBox>
    </div>
  ),
};

// ============================================
// Container Integration
// ============================================

export const WithContainer: Story = {
  render: (args) => (
    <Section {...args} container>
      <ContentBox>Content inside Container</ContentBox>
    </Section>
  ),
};

export const WithContainerMd: Story = {
  render: (args) => (
    <Section {...args} container={{ size: 'md' }}>
      <ContentBox>Content inside Container (md)</ContentBox>
    </Section>
  ),
};

// ============================================
// Overlay
// ============================================

export const WithOverlay: Story = {
  render: (args) => (
    <Section {...args} variant="gradient" overlay>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <ContentBox>Content with overlay</ContentBox>
      </div>
    </Section>
  ),
};

// ============================================
// CSS Custom Properties
// ============================================

export const CustomBackground: Story = {
  render: (args) => (
    <Section
      {...args}
      background="linear-gradient(45deg, #ff6b6b, #4ecdc4)"
      textColor="#ffffff"
      padding="xl"
    >
      <ContentBox>Custom gradient background</ContentBox>
    </Section>
  ),
};

export const CustomColor: Story = {
  render: (args) => (
    <Section {...args} background="#1a1a2e" textColor="#eaeaea" padding="xl">
      <ContentBox>Custom dark theme</ContentBox>
    </Section>
  ),
};

// ============================================
// Real-world Examples
// ============================================

export const HeroSection: Story = {
  render: (args) => (
    <Section {...args} variant="gradient" padding="2xl" size="full">
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '24px', color: '#ffffff' }}>Hero Headline</h1>
        <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9 }}>
          Hero subtext that describes the main value proposition
        </p>
        <button
          style={{
            padding: '16px 32px',
            fontSize: '18px',
            backgroundColor: '#ffffff',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Call to Action
        </button>
      </div>
    </Section>
  ),
};

export const ContentSection: Story = {
  render: (args) => (
    <Section {...args} variant="alternate" padding="xl" container={{ size: 'lg' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: '24px',
              backgroundColor: 'var(--background)',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <h3>Feature {i}</h3>
            <p style={{ opacity: 0.8 }}>Feature description goes here</p>
          </div>
        ))}
      </div>
    </Section>
  ),
};

export const FooterSection: Story = {
  render: (args) => (
    <Section {...args} variant="dark" padding="xl" size="full">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
        {[
          { title: 'Product', links: ['Features', 'Pricing', 'Docs'] },
          { title: 'Company', links: ['About', 'Blog', 'Careers'] },
          { title: 'Resources', links: ['Support', 'Contact', 'Status'] },
          { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
        ].map((column) => (
          <div key={column.title}>
            <h4 style={{ color: '#ffffff', marginBottom: '16px' }}>{column.title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {column.links.map((link) => (
                <li key={link} style={{ marginBottom: '8px' }}>
                  <a
                    href="#"
                    style={{
                      color: '#999999',
                      textDecoration: 'none',
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  ),
};

// ============================================
// Theme Comparison
// ============================================

export const ThemeComparison: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '32px', padding: '20px' }}>
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
        <Section {...args} variant="alternate" padding="lg">
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              borderRadius: '8px',
            }}
          >
            Section content
          </div>
        </Section>
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
        <Section {...args} variant="alternate" padding="lg">
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              borderRadius: '8px',
            }}
          >
            Section content
          </div>
        </Section>
      </div>
    </div>
  ),
};

// ============================================
// Playground
// ============================================

export const Playground: Story = {
  render: (args) => (
    <Section {...args}>
      <SectionContent />
    </Section>
  ),
};

// ============================================
// Interaction Tests
// ============================================

export const Interactive: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Section {...args} variant="default" data-testid="section-default">
        <ContentBox>Default section</ContentBox>
      </Section>
      <Section {...args} variant="alternate" data-testid="section-alternate">
        <ContentBox>Alternate section</ContentBox>
      </Section>
      <Section {...args} variant="dark" container data-testid="section-dark">
        <ContentBox>Dark section with container</ContentBox>
      </Section>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test 1: Verify default section
    const defaultSection = canvas.getByTestId('section-default');
    expect(defaultSection).toBeInTheDocument();
    expect(defaultSection.tagName).toBe('SECTION');

    // Test 2: Verify alternate section
    const alternateSection = canvas.getByTestId('section-alternate');
    expect(alternateSection).toBeInTheDocument();
    expect(alternateSection.className).toMatch(/alternate/);

    // Test 3: Verify dark section with container
    const darkSection = canvas.getByTestId('section-dark');
    expect(darkSection).toBeInTheDocument();
    expect(darkSection.className).toMatch(/dark/);
    expect(darkSection.querySelector('[class*="container"]')).toBeInTheDocument();

    // Test 4: Verify content is rendered
    expect(canvas.getByText('Default section')).toBeInTheDocument();
    expect(canvas.getByText('Alternate section')).toBeInTheDocument();
    expect(canvas.getByText('Dark section with container')).toBeInTheDocument();
  },
};
