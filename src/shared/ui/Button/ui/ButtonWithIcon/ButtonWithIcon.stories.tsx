// src/shared/ui/Button/ui/ButtonWithIcon/ButtonWithIcon.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from '@storybook/test';
import { ArrowRight, Download, Mail, User } from 'lucide-react';
import { ButtonWithIcon } from './ButtonWithIcon';

const meta = {
  title: 'Shared/Button/ButtonWithIcon',
  component: ButtonWithIcon,
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
} satisfies Meta<typeof ButtonWithIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryWithLeftIcon: Story = {
  args: {
    children: 'Save',
    leftIcon: <Mail size={18} />,
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

export const PrimaryWithRightIcon: Story = {
  args: {
    children: 'Next',
    rightIcon: <ArrowRight size={18} />,
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('data-state', 'loading');
  },
};

export const PrimaryWithBothIcons: Story = {
  args: {
    children: 'Download',
    leftIcon: <Download size={18} />,
    rightIcon: <ArrowRight size={18} />,
    variant: 'primary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Download');
  },
};

export const Secondary: Story = {
  args: {
    children: 'Cancel',
    leftIcon: <User size={18} />,
    variant: 'secondary',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Cancel');
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    leftIcon: <Mail size={18} />,
    variant: 'outline',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Outline');
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    leftIcon: <Mail size={18} />,
    variant: 'ghost',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveTextContent('Ghost');
  },
};

export const Small: Story = {
  args: {
    children: 'Small',
    leftIcon: <Mail size={16} />,
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
    leftIcon: <Mail size={20} />,
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
    leftIcon: <Mail size={24} />,
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

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    leftIcon: <Mail size={18} />,
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
    leftIcon: <Mail size={18} />,
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
    leftIcon: <Mail size={18} />,
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
    leftIcon: <Mail size={18} />,
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
    leftIcon: <Mail size={18} />,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <ButtonWithIcon {...args} variant="primary">
        Primary
      </ButtonWithIcon>
      <ButtonWithIcon {...args} variant="secondary">
        Secondary
      </ButtonWithIcon>
      <ButtonWithIcon {...args} variant="outline">
        Outline
      </ButtonWithIcon>
      <ButtonWithIcon {...args} variant="ghost">
        Ghost
      </ButtonWithIcon>
      <ButtonWithIcon {...args} variant="danger">
        Danger
      </ButtonWithIcon>
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
    leftIcon: <Mail size={18} />,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <ButtonWithIcon {...args} size="sm" leftIcon={<Mail size={16} />}>
        Small
      </ButtonWithIcon>
      <ButtonWithIcon {...args} size="md" leftIcon={<Mail size={20} />}>
        Medium
      </ButtonWithIcon>
      <ButtonWithIcon {...args} size="lg" leftIcon={<Mail size={24} />}>
        Large
      </ButtonWithIcon>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(3);
    await expect(buttons[0]).toHaveTextContent('Small');
    await expect(buttons[2]).toHaveTextContent('Large');
  },
};
