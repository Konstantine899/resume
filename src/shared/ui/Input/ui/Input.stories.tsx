// src/shared/ui/Input/Input.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, Mail } from 'lucide-react';
import { Input } from './Input';

const meta = {
  title: 'Shared/Input',
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

export const Filled: Story = {
  args: {
    label: 'Search',
    variant: 'filled',
    placeholder: 'Type to search...',
  },
};

export const Outline: Story = {
  args: {
    label: 'Website',
    variant: 'outline',
    placeholder: 'https://example.com',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read Only',
    readOnly: true,
    defaultValue: 'Pre-filled value',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Must be at least 8 characters',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Takes full width',
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const FloatingLabel: Story = {
  args: {
    label: 'Email Address',
    variant: 'floating',
    type: 'email',
    placeholder: 'your@email.com',
  },
};

export const WithCharacterCounter: Story = {
  args: {
    label: 'Bio',
    maxLength: 100,
    showCounter: true,
    defaultValue: 'Software developer with 5 years of experience',
  },
};

export const Clearable: Story = {
  args: {
    label: 'Search',
    clearable: true,
    defaultValue: 'Test search query',
  },
};

export const WithClearAndIcon: Story = {
  args: {
    label: 'Search',
    icon: <Mail size={18} />,
    clearable: true,
    defaultValue: 'Search...',
  },
};
