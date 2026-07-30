// src/shared/ui/Button/ui/Button/Button.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Shared/Button/Button',
  component: Button,
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
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'sidebar'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    loadingVariant: {
      control: 'select',
      options: ['spinner', 'skeleton'],
    },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Secondary Button');
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Outline Button');
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Ghost Button');
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Danger Button');
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Small');
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    size: 'md',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Medium');
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Large');
  },
};

export const XSmall: Story = {
  args: {
    children: 'XSmall',
    size: 'xs',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('XSmall');
  },
};

export const XLarge: Story = {
  args: {
    children: 'XLarge',
    size: 'xl',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('XLarge');
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

export const LoadingWithSpinner: Story = {
  args: {
    children: 'Loading',
    loading: true,
    loadingVariant: 'spinner',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const LoadingWithSkeleton: Story = {
  args: {
    children: 'Loading',
    loading: true,
    loadingVariant: 'skeleton',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    variant: 'primary',
  },
  parameters: {
    layout: 'padded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Full Width Button');
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Button',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="ghost">
        Ghost
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(5);
    await expect(buttons[0]).toHaveTextContent('Primary');
    await expect(buttons[4]).toHaveTextContent('Danger');
  },
};

export const AllSizes: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button {...args} size="xs">
        XSmall
      </Button>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
      <Button {...args} size="xl">
        XLarge
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(5);
    await expect(buttons[0]).toHaveTextContent('XSmall');
    await expect(buttons[4]).toHaveTextContent('XLarge');
  },
};

export const AsLink: Story = {
  args: {
    component: 'a',
    href: 'https://example.com',
    children: 'Visit Example',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByTestId('button');
    await expect(link).toBeInTheDocument();
    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveTextContent('Visit Example');
  },
};

export const FormSubmit: Story = {
  args: {
    children: 'Submit',
    type: 'submit',
    variant: 'primary',
    size: 'md',
  },
  decorators: [
    (Story) => (
      <form onSubmit={(e) => e.preventDefault()}>
        <Story />
      </form>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('type', 'submit');
    await expect(button).toHaveTextContent('Submit');
  },
};

export const AsChildWithLink: Story = {
  args: {
    asChild: true,
    variant: 'primary',
    size: 'md',
    children: (
      <a href="https://example.com" target="_blank" rel="noopener">
        Open Link
      </a>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByTestId('button');
    await expect(link).toBeInTheDocument();
    await expect(link.tagName).toBe('A');
    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveTextContent('Open Link');
  },
};

export const VeryLongText: Story = {
  args: {
    children:
      'This is an extremely long button text that should still render correctly without breaking the layout or overflowing its container in any way shape or form',
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    layout: 'padded',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent(/extremely long button text/);
  },
};

export const EmptyChild: Story = {
  args: {
    children: '',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('');
  },
};

export const AllColorSchemes: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button {...args} colorScheme="brand">
        Brand
      </Button>
      <Button {...args} colorScheme="neutral">
        Neutral
      </Button>
      <Button {...args} colorScheme="success">
        Success
      </Button>
      <Button {...args} colorScheme="warning">
        Warning
      </Button>
      <Button {...args} colorScheme="danger">
        Danger
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(5);
    await expect(buttons[0]).toHaveTextContent('Brand');
    await expect(buttons[4]).toHaveTextContent('Danger');
  },
};
