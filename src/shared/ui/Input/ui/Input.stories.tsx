// Input Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Mail, Search } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'Shared/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'label', enabled: true },
        ],
      },
    },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(4);
  },
};

// 2. Все размеры (Sizes)
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Input size="xs" placeholder="XSmall (0.75rem)" />
      <Input size="sm" placeholder="Small (0.875rem)" />
      <Input size="md" placeholder="Medium (1rem)" />
      <Input size="lg" placeholder="Large (1.125rem)" />
      <Input size="xl" placeholder="XLarge (1.25rem)" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(5);
  },
};

// 3. Error state
export const Error: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email format',
    defaultValue: 'invalid@email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(canvas.getByText('Invalid email format')).toBeInTheDocument();
  },
};

// 4. Disabled & ReadOnly states
export const Disabled: Story = {
  args: {
    label: 'Disabled input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Disabled input');
    expect(input).toBeDisabled();
  },
};

export const ReadOnly: Story = {
  args: {
    label: 'Read-only input',
    defaultValue: 'Pre-filled value',
    readOnly: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Read-only input');
    expect(input).toHaveAttribute('readOnly', '');
  },
};

// 5. Loading & Skeleton states
export const Loading: Story = {
  args: { label: 'Loading input', loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByRole('textbox').closest('[data-loading="true"]');
    expect(wrapper).toBeInTheDocument();
  },
};

export const Skeleton: Story = {
  args: { label: 'Skeleton input', skeleton: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

// 5. With icons
export const WithIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    icon: <Mail size={18} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    expect(canvas.getByTestId('icon')).toBeInTheDocument();
  },
};

export const WithIconAfter: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    iconAfter: <Search size={18} />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByLabelText('Search')).toBeInTheDocument();
    expect(canvas.getByTestId('iconAfter')).toBeInTheDocument();
  },
};

// 6. Password toggle
export const PasswordToggle: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    showPasswordToggle: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password');
    const toggle = canvas.getByRole('button', { name: /show password/i });
    expect(input).toHaveAttribute('type', 'password');
    expect(toggle).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(canvas.getByRole('button', { name: /hide password/i })).toBeInTheDocument();
  },
};

// 7. Clearable
export const Clearable: Story = {
  args: {
    label: 'Search',
    placeholder: 'Type to search...',
    clearable: true,
    defaultValue: 'initial value',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search');
    expect(input).toHaveValue('initial value');

    const clearBtn = canvas.getByRole('button', { name: /clear input/i });
    await userEvent.click(clearBtn);
    expect(input).toHaveValue('');
  },
};

// 8. Counter
export const Counter: Story = {
  args: {
    label: 'Limited input',
    placeholder: 'Max 20 chars',
    showCounter: true,
    maxLength: 20,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('counter')).toHaveTextContent('0/20');
  },
};

// 9. Floating label
export const FloatingLabel: Story = {
  args: {
    variant: 'floating',
    label: 'Email',
    placeholder: 'your@email.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    const label = canvas.getByText('Email');
    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  },
};

// 10. Required field
export const Required: Story = {
  args: {
    label: 'Email',
    placeholder: 'Required field',
    required: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email');
    expect(label).toHaveAttribute('data-required', 'true');
  },
};

// 11. Helper text
export const HelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Min 8 characters',
    helperText: 'Must contain at least 8 characters',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Must contain at least 8 characters')).toBeInTheDocument();
  },
};

// 12. Polymorphic as link
export const AsLink: Story = {
  render: () => <Input as="a" href="/test" label="Link input" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /link input/i });
    expect(link).toHaveAttribute('href', '/test');
  },
};

// 13. asChild pattern
export const AsChild: Story = {
  render: () => (
    <Input asChild>
      <input type="text" data-testid="asChild-input" placeholder="As child" />
    </Input>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByTestId('asChild-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'As child');
  },
};
