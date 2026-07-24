import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Heading } from './Heading';

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
      options: ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'],
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
  },
};

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
      <Heading level={4} size="2xl">
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
      expect(canvas.getByRole('heading', { level: i })).toBeInTheDocument();
    }
  },
};

export const Theme: Story = {
  args: { children: '' },
  render: () => (
    <div>
      <Heading theme="primary">Primary theme</Heading>
      <Heading theme="muted">Muted theme</Heading>
      <div style={{ background: 'var(--foreground)', padding: '16px', marginTop: '8px' }}>
        <Heading theme="inverted">Inverted theme</Heading>
      </div>
      <Heading theme="error">Error theme</Heading>
      <Heading theme="gradient">Gradient theme</Heading>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Primary theme')).toBeInTheDocument();
    expect(canvas.getByText('Muted theme')).toBeInTheDocument();
    expect(canvas.getByText('Inverted theme')).toBeInTheDocument();
    expect(canvas.getByText('Error theme')).toBeInTheDocument();
    expect(canvas.getByText('Gradient theme')).toBeInTheDocument();
  },
};

export const Align: Story = {
  args: { children: '' },
  render: () => (
    <div>
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
    expect(canvas.getByText('Left aligned')).toBeInTheDocument();
    expect(canvas.getByText('Center aligned')).toBeInTheDocument();
    expect(canvas.getByText('Right aligned')).toBeInTheDocument();
  },
};

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
