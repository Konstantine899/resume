import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Badge } from './Badge';

const meta = {
  title: 'Shared/Badge/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
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
      options: ['default', 'success', 'warning', 'error', 'accent', 'outline'],
      description: 'Visual variant of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Basic stories
// ============================================

export const Default: Story = {
  args: {
    children: 'Default',
    variant: 'default',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Default');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('Default');
  },
};

export const Success: Story = {
  args: {
    children: 'Active',
    variant: 'success',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Active');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveAttribute('role', 'status');
  },
};

export const Warning: Story = {
  args: {
    children: 'Pending',
    variant: 'warning',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Pending');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveAttribute('role', 'status');
  },
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Error');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveAttribute('role', 'status');
  },
};

export const Accent: Story = {
  args: {
    children: 'New',
    variant: 'accent',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('New');
    await expect(badge).toBeInTheDocument();
  },
};

export const Outline: Story = {
  args: {
    children: 'v2.0',
    variant: 'outline',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('v2.0');
    await expect(badge).toBeInTheDocument();
  },
};

// ============================================
// Sizes
// ============================================

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Small');
    await expect(badge).toBeInTheDocument();
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Medium');
    await expect(badge).toBeInTheDocument();
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Large');
    await expect(badge).toBeInTheDocument();
  },
};

// ============================================
// States
// ============================================

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('Disabled');
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveAttribute('aria-disabled', 'true');
  },
};

// ============================================
// Edge Cases
// ============================================

export const VeryLongText: Story = {
  args: {
    children:
      'This is an extremely long badge text that should still render correctly without breaking the layout',
    variant: 'default',
    size: 'md',
  },
  parameters: {
    layout: 'padded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText(/extremely long badge text/);
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveStyle({ whiteSpace: 'nowrap' });
  },
};

export const EmptyChild: Story = {
  args: {
    children: '​',
    variant: 'default',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByText('​');
    await expect(badge).toBeInTheDocument();
  },
};

// ============================================
// Combined stories
// ============================================

export const AllVariants: Story = {
  args: {
    children: 'Badge',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badges = canvas.getAllByText(/Default|Success|Warning|Error|Accent|Outline/);
    await expect(badges).toHaveLength(6);
  },
};

export const AllSizes: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badges = canvas.getAllByText(/Small|Medium|Large/);
    await expect(badges).toHaveLength(3);
  },
};

// ============================================
// Context usage
// ============================================

export const InWorkHistoryCard: Story = {
  args: {
    children: 'Badge',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge variant="accent" size="sm">
        React
      </Badge>
      <Badge variant="accent" size="sm">
        TypeScript
      </Badge>
      <Badge variant="accent" size="sm">
        Node.js
      </Badge>
      <Badge variant="success" size="sm">
        Active
      </Badge>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badges = canvas.getAllByText(/React|TypeScript|Node\.js|Active/);
    await expect(badges).toHaveLength(4);
  },
};
