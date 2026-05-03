// src/shared/ui/Input/Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, Mail } from 'lucide-react';
import { Input } from './Input';

const meta = {
  title: 'Shared/UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'filled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    variant: 'default',
    size: 'md',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    type: 'email',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email format',
    defaultValue: 'invalid@email',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Email',
    icon: <Mail size={18} />,
    placeholder: 'your@email.com',
  },
};

export const Success: Story = {
  args: {
    label: 'Username',
    success: true,
    iconAfter: <CheckCircle size={18} />,
    defaultValue: 'available',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium" />
      <Input size="lg" placeholder="Large" />
    </div>
  ),
};
