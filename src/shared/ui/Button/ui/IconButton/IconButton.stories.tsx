// src/shared/ui/Button/ui/IconButton/IconButton.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { Mail, User, ArrowRight, Menu } from 'lucide-react';
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
      options: ['sm', 'md', 'lg'],
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
    const onClick = fn(args.onClick);
    button.onclick = onClick;
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = {
  args: {
    icon: <User size={20} />,
    ariaLabel: 'User profile',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    icon: <ArrowRight size={20} />,
    ariaLabel: 'Next',
    variant: 'ghost',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Delete',
    variant: 'danger',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    icon: <Mail size={16} />,
    ariaLabel: 'Small button',
    size: 'sm',
    variant: 'primary',
  },
};

export const Medium: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Medium button',
    size: 'md',
    variant: 'primary',
  },
};

export const Large: Story = {
  args: {
    icon: <Mail size={24} />,
    ariaLabel: 'Large button',
    size: 'lg',
    variant: 'primary',
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

export const SidebarToggle: Story = {
  args: {
    icon: <Menu size={20} />,
    ariaLabel: 'Toggle sidebar',
    variant: 'sidebar',
    size: 'md',
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
};

export const AllSizes: Story = {
  args: {
    icon: <Mail size={20} />,
    ariaLabel: 'Icon button',
    variant: 'primary',
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <IconButton {...args} size="sm" icon={<Mail size={16} />} />
      <IconButton {...args} size="md" icon={<Mail size={20} />} />
      <IconButton {...args} size="lg" icon={<Mail size={24} />} />
    </div>
  ),
};
