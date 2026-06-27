// Input Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, Mail, Search } from 'lucide-react';
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
      options: ['default', 'outline', 'filled', 'floating'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// 1. Все варианты (Variants)
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input variant="default" label="Default" placeholder="Default variant" />
      <Input variant="outline" label="Outline" placeholder="Outline variant" />
      <Input variant="filled" label="Filled" placeholder="Filled variant" />
      <Input variant="floating" label="Floating" placeholder="Floating variant" />
    </div>
  ),
};

// 2. Все размеры (Sizes)
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input size="sm" placeholder="Small (0.875rem)" />
      <Input size="md" placeholder="Medium (1rem)" />
      <Input size="lg" placeholder="Large (1.125rem)" />
    </div>
  ),
};

// 3. Error state
export const Error: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email format',
    defaultValue: 'invalid@email',
  },
};

// 4. Disabled & ReadOnly states
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input label="Disabled" disabled defaultValue="Cannot edit this" />
      <Input label="ReadOnly" readOnly defaultValue="Read only value" />
    </div>
  ),
};

// 5. С иконкой
export const WithIcon: Story = {
  args: {
    label: 'Email',
    icon: <Mail size={18} />,
    placeholder: 'your@email.com',
  },
};

// 6. Success state
export const Success: Story = {
  args: {
    label: 'Username',
    success: true,
    iconAfter: <CheckCircle size={18} />,
    defaultValue: 'available',
  },
};

// 7. Password с toggle
export const PasswordToggle: Story = {
  args: {
    label: 'Password',
    type: 'password',
    showPasswordToggle: true,
    placeholder: 'Enter password',
  },
};

// 8. Clearable input
export const Clearable: Story = {
  args: {
    label: 'Search',
    clearable: true,
    icon: <Search size={18} />,
    defaultValue: 'Test search query',
  },
};

// 9. Character counter
export const CharacterCounter: Story = {
  args: {
    label: 'Bio',
    maxLength: 100,
    showCounter: true,
    defaultValue: 'Software developer with 5 years of experience',
  },
};

// 10. Helper text
export const HelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    helperText: 'Must be at least 8 characters',
  },
};

// 11. Full width layout
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
