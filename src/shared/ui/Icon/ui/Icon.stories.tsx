import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { Heart, Home, Mail, Moon } from 'lucide-react';
import { Icon } from './Icon';

const meta = {
  title: 'Shared/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: false },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'accent',
        'success',
        'danger',
        'warning',
        'foreground',
        'foreground-muted',
        'inherit',
      ],
    },
    strokeWidth: {
      control: 'number',
      min: 1,
      max: 3,
      step: 0.5,
    },
  },
  args: {
    name: Home,
    size: 'md',
    color: 'foreground',
    strokeWidth: 2,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: Home,
    size: 'md',
    color: 'foreground',
    ariaLabel: 'Home',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-size', 'md');
    expect(icon).toHaveAttribute('data-color', 'foreground');
    expect(icon).toHaveAttribute('aria-label', 'Home');
  },
};

export const Decorative: Story = {
  args: {
    name: Moon,
    size: 'md',
    decorative: true,
  },
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
    expect(icon).not.toHaveAttribute('aria-label');
  },
};

export const Interactive: Story = {
  args: {
    name: Mail,
    size: 'md',
    color: 'primary',
    onClick: () => {},
    ariaLabel: 'Send email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button');
    expect(icon).toHaveAttribute('tabindex', '0');
    expect(icon).toHaveAttribute('data-interactive', 'true');
    await userEvent.click(icon);
    expect(icon).toHaveFocus();
  },
};

export const ToggleState: Story = {
  args: {
    name: Moon,
    size: 'md',
    color: 'primary',
    isPressed: true,
    onClick: () => {},
    ariaLabel: 'Toggle theme',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button');
    expect(icon).toHaveAttribute('aria-pressed', 'true');
  },
};

export const CustomColor: Story = {
  args: {
    name: Heart,
    size: 'lg',
    color: '#ff5733',
    ariaLabel: 'Custom color icon',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-color', '#ff5733');
  },
};
