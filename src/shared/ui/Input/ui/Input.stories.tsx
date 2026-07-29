// Input Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, Mail, Search } from 'lucide-react';
import { expect, userEvent, within } from '@storybook/test';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(canvas.getByText('Invalid email format')).toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    await userEvent.type(input, 'Hello');
    expect(input).toHaveValue('Hello');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    const toggleButton = canvas.getByRole('button', { name: /show password/i });
    await userEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search');
    expect(input).toHaveValue('Test search query');
    const clearButton = canvas.getByRole('button', { name: /clear/i });
    await userEvent.click(clearButton);
    expect(input).toHaveValue('');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Bio');
    const initialText = 'Software developer with 5 years of experience';
    expect(input).toHaveValue(initialText);
    const counter = canvas.getByTestId('counter');
    expect(counter).toHaveTextContent(String(initialText.length));
    await userEvent.type(input, '!');
    expect(counter).toHaveTextContent(String(initialText.length + 1));
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

/** Input в состоянии загрузки (skeleton). */
export const Skeleton: Story = {
  args: {
    ...WithIcon.args,
    skeleton: true,
    placeholder: 'Loading...',
    clearable: false,
    icon: undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Input в состоянии загрузки. Вместо input рендерится Skeleton. ' +
          'Используйте для индикации загрузки данных формы.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    const wrapper = canvas.getByTestId('input-wrapper');
    expect(wrapper).toHaveAttribute('data-skeleton');
    expect(wrapper).toHaveAttribute('aria-busy', 'true');
  },
};
