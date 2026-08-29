import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import React from 'react';
import { Card } from './Card';
import { Button } from '@/shared/ui/Button';
import { Heading } from '@/shared/ui/Heading';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const S = (props: Record<string, any>): React.ReactElement => <Card {...(props as any)} />;

const meta = {
  title: 'Shared/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'aria-required-attr', enabled: true },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'project', 'workHistory', 'skill', 'about', 'codeBlock', 'contact'],
    },
    size: {
      control: 'select',
      options: ['compact', 'default', 'large'],
    },
    radius: {
      control: 'select',
      options: ['rounded', 'roundedXl', 'rounded2xl'],
    },
    fullWidth: { control: 'boolean' },
    hoverable: { control: 'boolean' },
    component: {
      control: 'select',
      options: ['div', 'section', 'article', 'a', 'form'],
    },
    children: { control: 'text' },
    className: { control: 'text' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default card with basic content.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('group');
    expect(card).toBeInTheDocument();
    expect(card).toHaveTextContent('This is a default card with basic content.');
    expect(card).toHaveAttribute('data-variant', 'default');
    expect(card).toHaveAttribute('data-size', 'default');
    expect(card).toHaveAttribute('data-radius', 'rounded');
    expect(card).toHaveAttribute('data-state', 'hoverable');
  },
};

export const VariantsGrid: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
        maxWidth: 960,
      }}
    >
      <Card variant="default">
        <Heading level={3} size="m">
          Default
        </Heading>
        <p>Base card variant with neutral styling.</p>
      </Card>
      <Card variant="skill">
        <Heading level={3} size="m">
          Skill
        </Heading>
        <p>Card variant for displaying skills (auto-wrapped in Container size="xl").</p>
      </Card>
      <Card variant="about">
        <Heading level={3} size="m">
          About
        </Heading>
        <p>Card variant for about sections (auto-wrapped in Container size="lg").</p>
      </Card>
      <Card variant="codeBlock">
        <Heading level={3} size="m">
          Code Block
        </Heading>
        <p>Card variant for code snippets.</p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Default')).toBeInTheDocument();
    expect(canvas.getByText('Skill')).toBeInTheDocument();
    expect(canvas.getByText('About')).toBeInTheDocument();
    expect(canvas.getByText('Code Block')).toBeInTheDocument();
  },
};

export const AllSizes: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
      <Card size="compact">
        <Heading level={3} size="s">
          Compact Size
        </Heading>
        <p>Reduced padding for dense layouts.</p>
      </Card>
      <Card size="default">
        <Heading level={3} size="s">
          Default Size
        </Heading>
        <p>Standard padding for most use cases.</p>
      </Card>
      <Card size="large">
        <Heading level={3} size="s">
          Large Size
        </Heading>
        <p>Generous padding for featured content.</p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('[role="group"]');
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('data-size', 'compact');
    expect(cards[1]).toHaveAttribute('data-size', 'default');
    expect(cards[2]).toHaveAttribute('data-size', 'large');
  },
};

export const Hoverable: Story = {
  args: {
    children: 'Hover over this card to test interaction.',
    hoverable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('group');
    expect(card).toHaveAttribute('data-state', 'hoverable');
    await userEvent.hover(card);
    expect(card).toHaveAttribute('data-state', 'hoverable');
    await userEvent.unhover(card);
    expect(card).toHaveAttribute('data-state', 'hoverable');
  },
};

export const PolymorphicAsSection: Story = {
  render: () => (
    <Card component="section">
      This card renders as a <strong>&lt;section&gt;</strong> element.
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const section = canvasElement.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).not.toHaveAttribute('role');
    expect(section).toHaveAttribute('data-variant', 'default');
  },
};

export const PolymorphicAsArticle: Story = {
  render: () => (
    <Card component="article">
      This card renders as an <strong>&lt;article&gt;</strong> element.
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const article = canvasElement.querySelector('article');
    expect(article).toBeInTheDocument();
    expect(article).not.toHaveAttribute('role');
    expect(article).toHaveAttribute('data-variant', 'default');
  },
};

export const PolymorphicAsLink: Story = {
  render: () =>
    S({
      component: 'a',
      href: '/test',
      children: 'This card renders as an anchor (<a>) element.',
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).not.toHaveAttribute('role');
  },
};

export const CompoundWithHeaderBodyFooter: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ maxWidth: '480px', width: '100%' }}>
      <Card>
        <Card.Header withBorder>
          <Heading level={3} size="m">
            Card Title
          </Heading>
        </Card.Header>
        <Card.Body>
          <p>
            This is the main body content of the card. It can contain any React elements, text, or
            components.
          </p>
        </Card.Body>
        <Card.Footer withBorder>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #6b7280)' }}>
            Card footer with additional information.
          </span>
        </Card.Footer>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Card Title')).toBeInTheDocument();
    expect(canvas.getByText(/main body content/i)).toBeInTheDocument();
    expect(canvas.getByText('Card footer with additional information.')).toBeInTheDocument();
    expect(canvasElement.querySelectorAll('[class*="cardHeader"]')).toHaveLength(1);
    expect(canvasElement.querySelectorAll('[class*="cardBody"]')).toHaveLength(1);
    expect(canvasElement.querySelectorAll('[class*="cardFooter"]')).toHaveLength(1);
  },
};

export const FormSubmit: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ maxWidth: '400px', width: '100%' }}>
      <Card
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
        }}
      >
        <Card.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              Name
              <input type="text" name="name" placeholder="Enter your name" className="input" />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              Email
              <input type="email" name="email" placeholder="Enter your email" className="input" />
            </label>
          </div>
        </Card.Body>
        <Card.Footer withBorder>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Card.Footer>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvasElement.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(form).not.toHaveAttribute('role');
    expect(canvas.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    expect(canvas.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    const submitButton = canvas.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeInTheDocument();
    await userEvent.type(canvas.getByPlaceholderText('Enter your name'), 'John Doe');
    await userEvent.type(canvas.getByPlaceholderText('Enter your email'), 'john@example.com');
    await userEvent.click(submitButton);
    expect(canvas.getByPlaceholderText('Enter your name')).toHaveValue('John Doe');
    expect(canvas.getByPlaceholderText('Enter your email')).toHaveValue('john@example.com');
  },
};

export const CompleteCompoundCard: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ maxWidth: '560px', width: '100%' }}>
      <Card>
        <Card.Image
          src="/images/avatar/avatar003.jpg"
          alt="Abstract gradient background"
          objectFit="cover"
        />
        <Card.Meta>
          <span>March 2026</span>
          <span> · </span>
          <span>5 min read</span>
        </Card.Meta>
        <Card.Title as="h2">Complete Card Example</Card.Title>
        <Card.Description>
          This card demonstrates the full composition API with image, meta, title, description, and
          actions working together.
        </Card.Description>
        <Card.Actions>
          <Button variant="primary">Primary Action</Button>
          <Button variant="outline">Secondary</Button>
        </Card.Actions>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByAltText('Abstract gradient background')).toBeInTheDocument();
    expect(canvas.getByText('March 2026')).toBeInTheDocument();
    expect(canvas.getByText('5 min read')).toBeInTheDocument();
    expect(canvas.getByText('Complete Card Example')).toBeInTheDocument();
    expect(canvas.getByText(/full composition API/)).toBeInTheDocument();
    expect(canvas.getByText('Primary Action')).toBeInTheDocument();
    expect(canvas.getByText('Secondary')).toBeInTheDocument();
  },
};

// ============================================
// Container Integration Stories
// ============================================

export const ContainerIntegrationComparison: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ marginBottom: '0.5rem' }}>
          <Heading level={4} size="s">
            Skill Variant (Container size="xl")
          </Heading>
        </div>
        <Card variant="skill">
          <p>Skill card content — automatically centered with 1280px max-width.</p>
        </Card>
      </div>

      <div>
        <div style={{ marginBottom: '0.5rem' }}>
          <Heading level={4} size="s">
            About Variant (Container size="lg")
          </Heading>
        </div>
        <Card variant="about">
          <div className="centeredContent">
            <p>About card content — automatically centered with 1024px max-width.</p>
          </div>
        </Card>
      </div>

      <div>
        <div style={{ marginBottom: '0.5rem' }}>
          <Heading level={4} size="s">
            Default Variant (NO Container)
          </Heading>
        </div>
        <Card variant="default">
          <p>Default card — no automatic Container wrapper. Manual layout control.</p>
        </Card>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Skill Variant (Container size="xl")')).toBeInTheDocument();
    expect(canvas.getByText('About Variant (Container size="lg")')).toBeInTheDocument();
    expect(canvas.getByText('Default Variant (NO Container)')).toBeInTheDocument();

    // Verify skill has Container wrapper
    const skillCard = screen.getByText(/Skill card content/).closest('[data-size="xl"]');
    expect(skillCard).toBeInTheDocument();

    // Verify about has Container wrapper
    const aboutCard = screen.getByText(/About card content/).closest('[data-size="lg"]');
    expect(aboutCard).toBeInTheDocument();
  },
};

// ============================================
// CARD-P0-3 / CARD-P0-4 — interaction tests (Playwright via test:storybook)
// ============================================

let capturedDivRef: { current: HTMLDivElement | null } = { current: null };
let capturedSectionRef: { current: HTMLElement | null } = { current: null };

export const ForwardRefDefault: Story = {
  render: () => {
    const ref = React.useRef<HTMLDivElement>(null);
    capturedDivRef = ref;
    return (
      <Card ref={ref} data-testid="ref-default">
        Ref card
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('ref-default');
    expect(card.tagName).toBe('DIV');
    expect(capturedDivRef.current).toBe(card);
  },
};

export const ForwardRefSection: Story = {
  render: () => {
    const ref = React.useRef<HTMLElement>(null);
    capturedSectionRef = ref;
    return (
      <Card component="section" ref={ref} data-testid="ref-section">
        Ref section
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const section = canvas.getByTestId('ref-section');
    expect(section.tagName).toBe('SECTION');
    expect(capturedSectionRef.current).toBe(section);
  },
};

export const InteractiveKeyboard: Story = {
  render: () => {
    const [count, setCount] = React.useState(0);
    return (
      <Card onClick={() => setCount((c) => c + 1)} data-testid="kbd-card">
        <p>Clicks: {count}</p>
      </Card>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('button');
    expect(card).toHaveAttribute('tabindex', '0');

    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(canvas.getByText('Clicks: 1')).toBeInTheDocument();

    await userEvent.keyboard(' ');
    expect(canvas.getByText('Clicks: 2')).toBeInTheDocument();
  },
};
