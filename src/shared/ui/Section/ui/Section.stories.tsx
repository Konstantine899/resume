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
- **default** — Базовый стиль (transparent)
- **alternate** — Альтернативный фон
- **gradient** — Градиентный фон
- **muted** — Приглушённый стиль с borders
- **dark** — Тёмный фон
- **light** — Светлый фон

## Размеры: sm | md | lg | xl | 2xl | full
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
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
    padding: {
      control: 'radio',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    as: {
      control: 'select',
      options: ['section', 'div', 'article', 'aside', 'main', 'nav'],
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
// Helpers
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
// Variants
// ============================================

export const Default: Story = {
  render: (args) => (
    <Section {...args}>
      <SectionContent />
    </Section>
  ),
};

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {(['default', 'alternate', 'gradient', 'muted', 'dark', 'light'] as const).map((v) => (
        <Section key={v} {...args} variant={v} padding="md">
          <ContentBox>{v}</ContentBox>
        </Section>
      ))}
    </div>
  ),
};

// ============================================
// Sizes
// ============================================

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const).map((s) => (
        <div key={s}>
          <div style={{ fontSize: '12px', marginBottom: '8px', color: '#888' }}>{s}</div>
          <Section {...args} size={s}>
            <ContentBox>{s === 'full' ? 'Full Width (100%)' : `${s} (max-width)`}</ContentBox>
          </Section>
        </div>
      ))}
    </div>
  ),
};

// ============================================
// Padding
// ============================================

export const AllPaddingTypes: Story = {
  args: { padding: 'lg' },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['none', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((p) => (
        <Section key={p} {...args} variant="alternate" padding={p}>
          <ContentBox>padding-{p}</ContentBox>
        </Section>
      ))}
    </div>
  ),
};

// ============================================
// Vertical Rhythm
// ============================================

export const VerticalRhythm: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ContentBox>Previous section</ContentBox>
      <Section {...args} margin={{ top: 'xl', bottom: 'xl' }} variant="alternate">
        <ContentBox>Section with margin-top-xl & margin-bottom-xl</ContentBox>
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

    const defaultSection = canvas.getByTestId('section-default');
    expect(defaultSection).toBeInTheDocument();
    expect(defaultSection.tagName).toBe('SECTION');

    const alternateSection = canvas.getByTestId('section-alternate');
    expect(alternateSection).toBeInTheDocument();
    expect(alternateSection.className).toMatch(/alternate/);

    const darkSection = canvas.getByTestId('section-dark');
    expect(darkSection).toBeInTheDocument();
    expect(darkSection.className).toMatch(/dark/);
    expect(darkSection.querySelector('[class*="container"]')).toBeInTheDocument();
  },
};
