import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import React from 'react';
import { Card } from './Card';
import { Mail } from 'lucide-react';
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
        <p>Card variant for displaying skills.</p>
      </Card>
      <Card variant="about">
        <Heading level={3} size="m">
          About
        </Heading>
        <p>Card variant for about sections.</p>
      </Card>
      <Card variant="codeBlock">
        <Heading level={3} size="m">
          Code Block
        </Heading>
        <p>Card variant for code snippets.</p>
      </Card>
      {S({
        variant: 'project',
        title: 'Project Card',
        description: 'Specialized card for project portfolio items.',
        techIcons: [],
      })}
      {S({
        variant: 'workHistory',
        title: 'Work History Card',
        company: 'Sample Company',
        period: '2024 — Present',
        achievements: ['Sample achievement one.', 'Sample achievement two.'],
        techStack: ['React', 'TypeScript'],
      })}
      {S({
        variant: 'contact',
        title: 'Contact Card',
        icon: <Mail size={32} />,
        children: <p>Specialized card for contact information.</p>,
      })}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Default')).toBeInTheDocument();
    expect(canvas.getByText('Skill')).toBeInTheDocument();
    expect(canvas.getByText('About')).toBeInTheDocument();
    expect(canvas.getByText('Code Block')).toBeInTheDocument();
    expect(canvas.getByText('Project Card')).toBeInTheDocument();
    expect(canvas.getByText('Work History Card')).toBeInTheDocument();
    expect(canvas.getByText('Contact Card')).toBeInTheDocument();
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
    const cards = canvasElement.querySelectorAll('[data-size]');
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

export const SpecializedProject: Story = {
  render: () =>
    S({
      variant: 'project',
      title: 'Dragonfly',
      description:
        'A fully vertically integrated cannabis production company with a focus on quality and sustainability.',
      techIcons: [
        {
          name: 'React',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        },
        {
          name: 'Next.js',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
        },
        {
          name: 'TypeScript',
          url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        },
      ],
      link: 'https://dragonflyprocessing.com',
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Dragonfly')).toBeInTheDocument();
    expect(canvas.getByText(/vertically integrated/i)).toBeInTheDocument();
    const link = canvas.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://dragonflyprocessing.com');
    expect(canvas.getByAltText('React')).toBeInTheDocument();
  },
};

export const SpecializedWorkHistory: Story = {
  render: () =>
    S({
      variant: 'workHistory',
      title: 'Senior Full-Stack Developer',
      company: 'Tech Corp International',
      period: '2022 — Present',
      periodBadge: 'Current',
      location: 'Remote',
      achievements: [
        'Led development of microservice architecture for 1M+ users',
        'Mentored a team of 5 junior developers',
        'Implemented CI/CD pipelines reducing deployment time by 60%',
      ],
      techStack: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Senior Full-Stack Developer')).toBeInTheDocument();
    expect(canvas.getByText('Tech Corp International')).toBeInTheDocument();
    expect(canvas.getByText('Current')).toBeInTheDocument();
    expect(canvas.getByText('Remote')).toBeInTheDocument();
    expect(canvas.getByText(/microservice architecture/i)).toBeInTheDocument();
    expect(canvas.getByText('React')).toBeInTheDocument();
    expect(canvas.getByText('PostgreSQL')).toBeInTheDocument();
  },
};

export const SpecializedContact: Story = {
  render: () =>
    S({
      variant: 'contact',
      title: 'Contact Me',
      icon: <Mail size={40} />,
      children: (
        <p>I&apos;m always open to discussing new projects, creative ideas, or opportunities.</p>
      ),
    }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Contact Me')).toBeInTheDocument();
    expect(canvas.getByText(/always open/i)).toBeInTheDocument();
  },
};

export const CompoundWithHeaderBodyFooter: Story = {
  render: () => (
    <Card style={{ maxWidth: '480px' }}>
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

export const CompoundWithImage: Story = {
  render: () => (
    <Card style={{ maxWidth: '480px' }}>
      <Card.Image
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=300&fit=crop"
        alt="Abstract gradient background"
        objectFit="cover"
      />
      <Card.Body>
        <Heading level={3} size="m">
          Image Card
        </Heading>
        <p>This card has an image at the top followed by body content.</p>
      </Card.Body>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const img = canvas.getByAltText('Abstract gradient background');
    expect(img).toBeInTheDocument();
    expect(canvas.getByText('Image Card')).toBeInTheDocument();
    expect(canvas.getByText(/image at the top/i)).toBeInTheDocument();
  },
};

export const FormSubmit: Story = {
  render: () => (
    <Card
      component="form"
      style={{ maxWidth: '400px' }}
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

export const CompoundWithTitleDescriptionActions: Story = {
  render: () => (
    <Card style={{ maxWidth: '480px' }}>
      <Card.Meta>Posted on January 15, 2026</Card.Meta>
      <Card.Title>Getting Started with React 19</Card.Title>
      <Card.Description>
        React 19 introduces several new features including the new compiler, actions, and improved
        server components. This guide covers everything you need to get started.
      </Card.Description>
      <Card.Actions align="end">
        <Button variant="primary">Read More</Button>
        <Button variant="outline">Share</Button>
      </Card.Actions>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Posted on January 15, 2026')).toBeInTheDocument();
    const title = canvas.getByText('Getting Started with React 19');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
    const desc = canvas.getByText(/React 19 introduces/);
    expect(desc).toBeInTheDocument();
    expect(desc.tagName).toBe('P');
    expect(canvas.getByText('Read More')).toBeInTheDocument();
    expect(canvas.getByText('Share')).toBeInTheDocument();
  },
};

export const CardGridStory: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Card.Grid columns={3} gap="md">
      <Card>
        <Card.Title as="h4">Card 1</Card.Title>
        <Card.Description>Content for the first card.</Card.Description>
      </Card>
      <Card>
        <Card.Title as="h4">Card 2</Card.Title>
        <Card.Description>Content for the second card.</Card.Description>
      </Card>
      <Card>
        <Card.Title as="h4">Card 3</Card.Title>
        <Card.Description>Content for the third card.</Card.Description>
      </Card>
    </Card.Grid>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Card 1')).toBeInTheDocument();
    expect(canvas.getByText('Card 2')).toBeInTheDocument();
    expect(canvas.getByText('Card 3')).toBeInTheDocument();
    const grid = canvasElement.querySelector('[class*="cardGrid"]');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass(/cols3/);
  },
};

export const CompleteCompoundCard: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <Card style={{ maxWidth: '560px' }}>
      <Card.Image
        src="https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=200&fit=crop"
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
