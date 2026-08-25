import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Heading } from './Heading';
import { Section } from '@/shared/ui/Section';
import { Container } from '@/shared/ui/Container';

const meta = {
  title: 'shared/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl', '5xl'],
    },
    theme: {
      control: { type: 'select' },
      options: ['primary', 'muted', 'inverted', 'error', 'gradient'],
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

// ──────────────────────────────
// Default
// ──────────────────────────────

export const Default: Story = {
  args: {
    children: 'Default heading',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute('data-level', '2');
    expect(heading).toHaveAttribute('data-size', 'm');
    expect(heading).toHaveAttribute('data-theme', 'primary');
    expect(heading).toHaveAttribute('data-align', 'left');
    expect(heading.className).toContain('heading');
  },
};

// ──────────────────────────────
// Headings
// ──────────────────────────────

export const Level: Story = {
  args: { children: '' },
  render: () => (
    <div>
      <Heading level={1} size="5xl">
        Heading level 1
      </Heading>
      <Heading level={2} size="4xl">
        Heading level 2
      </Heading>
      <Heading level={3} size="3xl">
        Heading level 3
      </Heading>
      <Heading level={4} size="xxl">
        Heading level 4
      </Heading>
      <Heading level={5} size="xl">
        Heading level 5
      </Heading>
      <Heading level={6} size="l">
        Heading level 6
      </Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (let i = 1; i <= 6; i++) {
      const el = canvas.getByRole('heading', { level: i as 1 | 2 | 3 | 4 | 5 | 6 });
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-level', String(i));
    }
  },
};

// ──────────────────────────────
// Sizes
// ──────────────────────────────

export const Sizes: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Heading size="xs">Extra Small (xs)</Heading>
      <Heading size="s">Small (s)</Heading>
      <Heading size="m">Medium (m)</Heading>
      <Heading size="l">Large (l)</Heading>
      <Heading size="xl">Extra Large (xl)</Heading>
      <Heading size="xxl">2X Large (xxl)</Heading>
      <Heading size="3xl">3X Large (3xl)</Heading>
      <Heading size="4xl">4X Large (4xl)</Heading>
      <Heading size="5xl">5X Large (5xl)</Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', '3xl', '4xl', '5xl'] as const;
    for (const size of sizes) {
      const el = canvas.getByText(new RegExp(`\\(${size}\\)`, 'i'));
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute('data-size', size);
    }
  },
};

// ──────────────────────────────
// Themes
// ──────────────────────────────

export const Themes: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Heading theme="primary">Primary theme</Heading>
      <Heading theme="muted">Muted theme</Heading>
      <div style={{ background: 'var(--foreground)', padding: '16px', borderRadius: '8px' }}>
        <Heading theme="inverted">Inverted theme (on dark)</Heading>
      </div>
      <Heading theme="error">Error theme</Heading>
      <Heading theme="gradient">Gradient theme</Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Primary theme')).toHaveAttribute('data-theme', 'primary');
    expect(canvas.getByText('Muted theme')).toHaveAttribute('data-theme', 'muted');
    expect(canvas.getByText('Inverted theme (on dark)')).toHaveAttribute('data-theme', 'inverted');
    expect(canvas.getByText('Error theme')).toHaveAttribute('data-theme', 'error');
    expect(canvas.getByText('Gradient theme')).toHaveAttribute('data-theme', 'gradient');
  },
};

// ──────────────────────────────
// Gradient Theme
// ──────────────────────────────

export const GradientTheme: Story = {
  args: {
    theme: 'gradient',
    size: '4xl',
    children: 'Gradient Heading',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByText('Gradient Heading');
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute('data-theme', 'gradient');
    expect(el).toHaveAttribute('data-gradient', 'true');
  },
};

// ──────────────────────────────
// Align
// ──────────────────────────────

export const Align: Story = {
  args: { children: '' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '400px' }}>
      <Heading align="left" size="xl">
        Left aligned
      </Heading>
      <Heading align="center" size="xl">
        Center aligned
      </Heading>
      <Heading align="right" size="xl">
        Right aligned
      </Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Left aligned')).toHaveAttribute('data-align', 'left');
    expect(canvas.getByText('Center aligned')).toHaveAttribute('data-align', 'center');
    expect(canvas.getByText('Right aligned')).toHaveAttribute('data-align', 'right');
  },
};

// ──────────────────────────────
// Accessibility
// ──────────────────────────────

export const Accessibility: Story = {
  args: {
    id: 'section-title',
    'aria-label': 'Section Title',
    children: 'Accessible heading',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByRole('heading');
    expect(heading).toHaveAttribute('id', 'section-title');
    expect(heading).toHaveAttribute('aria-label', 'Section Title');
  },
};

// ──────────────────────────────
// Polymorphic
// ──────────────────────────────

export const AsDiv: Story = {
  args: {
    as: 'div',
    level: 3,
    size: 'xl',
    children: 'Heading as div element',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByText('Heading as div element');
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('DIV');
    expect(element).toHaveAttribute('data-level', '3');
    expect(element).toHaveAttribute('data-size', 'xl');
  },
};

// ──────────────────────────────
// Full Page Typography
// ──────────────────────────────

export const FullPageTypography: Story = {
  args: { children: '' },
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <Heading level={1} size="5xl" theme="gradient" align="center" style={{ marginBottom: '8px' }}>
        Page Title
      </Heading>
      <Heading level={2} size="4xl" theme="primary" align="center" style={{ marginBottom: '32px' }}>
        Section: Introduction
      </Heading>
      <p style={{ fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: '24px' }}>
        This is a body paragraph demonstrating how headings work together in a real page layout. The
        typographic hierarchy helps users scan content and understand the page structure.
      </p>
      <Heading level={3} size="xxl" theme="primary" style={{ marginBottom: '4px' }}>
        Feature Overview
      </Heading>
      <p style={{ fontFamily: 'sans-serif', lineHeight: 1.6, marginBottom: '24px' }}>
        A detailed explanation of features follows the section heading. Consistent typography
        creates a professional, polished look.
      </p>
      <Heading level={4} size="xl" theme="muted" style={{ marginBottom: '4px' }}>
        Technical Details
      </Heading>
      <p style={{ fontFamily: 'sans-serif', lineHeight: 1.6 }}>
        Technical documentation benefits from clear heading hierarchy. Each level provides context
        about the content relationship.
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(canvas.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(canvas.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(canvas.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(canvas.getByText('Page Title')).toHaveAttribute('data-theme', 'gradient');
    expect(canvas.getByText('Section: Introduction')).toHaveAttribute('data-theme', 'primary');
  },
};

// ──────────────────────────────
// Edge Cases
// ──────────────────────────────

export const LongText: Story = {
  args: {
    size: 'm',
    children:
      'This is an exceptionally long heading text that demonstrates how the Heading component handles content overflow and wrapping across multiple lines in a real-world scenario with very verbose titles',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByRole('heading');
    expect(el).toBeInTheDocument();
    const text = el.textContent ?? '';
    expect(text.length).toBeGreaterThan(100);
  },
};

export const EmptyChildren: Story = {
  args: {
    children: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.queryByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe('');
  },
};

// ──────────────────────────────
// Composition Patterns
// ──────────────────────────────

export const WithContainer: Story = {
  args: { children: '' },
  render: () => (
    <Container size="md" centered>
      <Heading level={1} size="4xl" theme="gradient" align="center">
        Page Title
      </Heading>
      <Heading level={2} size="xl" theme="primary" align="center">
        Section Subtitle
      </Heading>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Page Title');
    expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent('Section Subtitle');
    const container = canvas.getByText('Page Title').closest('div');
    expect(container).not.toBeNull();
  },
};

export const WithSection: Story = {
  args: { children: '' },
  parameters: {
    layout: 'fullscreen',
  },
  render: () => (
    <Section size="lg">
      <Heading level={2} size="3xl" theme="gradient">
        Section Heading
      </Heading>
      <Heading level={3} size="xl" theme="muted">
        Supporting description
      </Heading>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent('Section Heading');
    expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent('Supporting description');
  },
};

export const WithCard: Story = {
  args: { children: '' },
  render: () => (
    <div
      style={{
        maxWidth: '320px',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <Heading level={3} size="l" theme="primary">
        Card Title
      </Heading>
      <Heading level={4} size="m" theme="muted">
        Card Meta Information
      </Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent('Card Title');
    expect(canvas.getByRole('heading', { level: 4 })).toHaveTextContent('Card Meta Information');
  },
};
