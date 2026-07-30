// src/shared/ui/Button/ui/IconButton/IconButton.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ArrowRight, Mail, Menu, User } from 'lucide-react';
import { IconButton } from './IconButton';

const meta = {
  title: 'Shared/Button/IconButton',
  component: IconButton,
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
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Send email',
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Send email');
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = {
  args: {
    icon: <User size={20} />,
    ariaLabel: 'User profile',
    variant: 'secondary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'User profile');
  },
};

export const Ghost: Story = {
  args: {
    icon: <ArrowRight size={20} />,
    ariaLabel: 'Next',
    variant: 'ghost',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Next');
  },
};

export const Danger: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Delete',
    variant: 'danger',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Delete');
  },
};

export const Small: Story = {
  args: {
    icon: <Mail size={16} />,
    ariaLabel: 'Small button',
    size: 'sm',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Small button');
  },
};

export const Medium: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Medium button',
    size: 'md',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Medium button');
  },
};

export const Large: Story = {
  args: {
    icon: <Mail size={24} />,
    ariaLabel: 'Large button',
    size: 'lg',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Large button');
  },
};

export const Disabled: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Disabled',
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
    icon: <Mail size={20} />,
    ariaLabel: 'Loading',
    loading: true,
    loadingVariant: 'spinner',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-state', 'loading');
  },
};

export const LoadingWithSkeleton: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Loading',
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

export const SidebarLoading: Story = {
  args: {
    icon: <Menu size={20} />,
    ariaLabel: 'Loading menu',
    loading: true,
    loadingVariant: 'spinner',
    variant: 'sidebar',
    size: 'lg',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const SidebarToggle: Story = {
  args: {
    icon: <Menu size={20} />,
    ariaLabel: 'Toggle sidebar',
    variant: 'sidebar',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAttribute('aria-label', 'Toggle sidebar');
  },
};

export const IconButtonGallery: Story = {
  args: {
    icon: <User size={18} />,
    ariaLabel: 'User',
    variant: 'ghost',
    size: 'md',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <IconButton variant="ghost" size="md" icon={<User size={18} />} ariaLabel="User" />
      <IconButton variant="ghost" size="md" icon={<Mail size={18} />} ariaLabel="Email" />
      <IconButton variant="ghost" size="md" icon={<ArrowRight size={18} />} ariaLabel="Next" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(3);
    await expect(buttons[0]).toHaveAttribute('aria-label', 'User');
    await expect(buttons[1]).toHaveAttribute('aria-label', 'Email');
    await expect(buttons[2]).toHaveAttribute('aria-label', 'Next');
  },
};

export const AllSizes: Story = {
  args: {
    icon: <Mail />,
    ariaLabel: 'Icon button',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <IconButton {...args} size="xs" />
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
      <IconButton {...args} size="xl" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(5);
  },
};
