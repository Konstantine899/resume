// src/shared/ui/Label/ui/Label.stories.tsx

// ============================================
// Label Stories
// ============================================

import { Input } from '@/shared/ui/Input';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
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
Supports required indicator, error/success/warning states, descriptions,
skeleton loading mode, inline rendering, asChild polymorphism and floating variant.

**Key Features:**
- Proper accessibility with htmlFor (optional)
- Required indicator (asterisk)
- Error/Success/Warning states with priority (error > success > variant)
- Optional description text
- Three size variants
- Skeleton loading mode for form placeholders
- inline mode (no wrapper div) and asChild polymorphism
- Floating variant for floating-label patterns
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email Address')).toBeInTheDocument();
    await expect(canvas.getByPlaceholderText('Enter email')).toHaveAttribute('id', 'email');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Password');
    await expect(label).toBeInTheDocument();
    await expect(label).toHaveAttribute('data-required');
    await expect(canvas.getByPlaceholderText('Enter password')).toHaveAttribute('id', 'password');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Username')).toHaveAttribute('data-error');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Email')).toHaveAttribute('data-success');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Phone Number')).toHaveAttribute('data-variant', 'warning');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Password');
    await expect(label).toHaveAttribute('aria-describedby', 'password-desc-description');
    await expect(canvas.getByText('Must be at least 8 characters')).toBeInTheDocument();
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Small Label')).toBeInTheDocument();
    await expect(canvas.getByText('Medium Label')).toBeInTheDocument();
    await expect(canvas.getByText('Large Label')).toBeInTheDocument();
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Default')).toBeInTheDocument();
    await expect(canvas.getByText('Error')).toHaveAttribute('data-variant', 'error');
    await expect(canvas.getByText('Success')).toHaveAttribute('data-variant', 'success');
    await expect(canvas.getByText('Warning')).toHaveAttribute('data-variant', 'warning');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email');
    await expect(label).toHaveAttribute('data-error');
    await expect(label).toHaveAttribute('data-required');
  },
};

// Skeleton loading state
export const Skeleton: Story = {
  args: {
    children: 'Full Name',
    htmlFor: 'name',
    skeleton: true,
  },
  render: (args) => (
    <div style={{ width: '300px' }}>
      <Label {...args} />
      <Input id="name" disabled placeholder="Loading..." />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton loading state for forms. Use when the form data is being fetched.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Full Name')).not.toBeInTheDocument();
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

// Multiple skeleton labels in a form
export const SkeletonForm: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      <div>
        <Label htmlFor="name" skeleton>
          Full Name
        </Label>
        <Input id="name" disabled />
      </div>
      <div>
        <Label htmlFor="email" skeleton>
          Email Address
        </Label>
        <Input id="email" disabled />
      </div>
      <div>
        <Label htmlFor="phone" skeleton>
          Phone Number
        </Label>
        <Input id="phone" disabled />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple skeleton labels in a form layout for loading state demonstration.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('status').length).toBeGreaterThanOrEqual(3);
  },
};
