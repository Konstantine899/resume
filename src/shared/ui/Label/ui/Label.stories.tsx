// src/shared/ui/Label/ui/Label.stories.tsx

// ============================================
// Label Stories
// ============================================

import { Input } from '@/shared/ui/Input';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Shared/UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Accessible label component with proper htmlFor association.
Supports required indicator, error/success/warning states, and descriptions.

**Key Features:**
- Proper accessibility with htmlFor
- Required indicator (asterisk)
- Error/Success/Warning states with priority (error > success > variant)
- Optional description text
- Three size variants
- Keyboard navigation support
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'warning'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

// Default story
export const Default: Story = {
  args: {
    children: 'Email Address',
    htmlFor: 'email',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="email" type="email" placeholder="Enter email" />
    </div>
  ),
};

// Required label
export const Required: Story = {
  args: {
    children: 'Password',
    htmlFor: 'password',
    required: true,
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="password" type="password" placeholder="Enter password" />
    </div>
  ),
};

// Error state
export const Error: Story = {
  args: {
    children: 'Username',
    htmlFor: 'username',
    error: true,
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="username" error="Username is required" />
    </div>
  ),
};

// Success state
export const Success: Story = {
  args: {
    children: 'Email',
    htmlFor: 'email-success',
    success: true,
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="email-success" />
    </div>
  ),
};

// Warning state
export const Warning: Story = {
  args: {
    children: 'Phone Number',
    htmlFor: 'phone-warning',
    variant: 'warning',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="phone-warning" />
    </div>
  ),
};

// With description
export const WithDescription: Story = {
  args: {
    children: 'Password',
    htmlFor: 'password-desc',
    required: true,
    description: 'Must be at least 8 characters',
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="password-desc" type="password" />
    </div>
  ),
};

// Size variants
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <div>
        <Label htmlFor="small" size="sm">
          Small Label
        </Label>
        <Input id="small" />
      </div>
      <div>
        <Label htmlFor="medium" size="md">
          Medium Label
        </Label>
        <Input id="medium" />
      </div>
      <div>
        <Label htmlFor="large" size="lg">
          Large Label
        </Label>
        <Input id="large" />
      </div>
    </div>
  ),
};

// All variants
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <div>
        <Label htmlFor="default" variant="default">
          Default
        </Label>
        <Input id="default" />
      </div>
      <div>
        <Label htmlFor="error" variant="error">
          Error
        </Label>
        <Input id="error" error="This field has an error" />
      </div>
      <div>
        <Label htmlFor="success" variant="success">
          Success
        </Label>
        <Input id="success" />
      </div>
      <div>
        <Label htmlFor="warning" variant="warning">
          Warning
        </Label>
        <Input id="warning" />
      </div>
    </div>
  ),
};

// Error + Required (priority test)
export const ErrorWithRequired: Story = {
  args: {
    children: 'Email',
    htmlFor: 'email-error-required',
    error: true,
    required: true,
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="email-error-required" error="Email is required" />
    </div>
  ),
};
