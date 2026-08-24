// Input Component Stories
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircle, Mail, Search } from 'lucide-react';
import { expect, userEvent, within } from '@storybook/test';
import { Input } from './Input';
import { Button } from '@/shared/ui/Button';

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
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
      <Input label="Disabled" disabled defaultValue="Cannot edit this" />
      <Input label="ReadOnly" readOnly defaultValue="Read only value" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledInput = canvas.getByLabelText('Disabled');
    expect(disabledInput).toBeDisabled();
    const readonlyInput = canvas.getByLabelText('ReadOnly');
    expect(readonlyInput).toHaveAttribute('readonly');
  },
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Username');
    expect(input).toHaveValue('available');
    const wrapper = canvas.getByTestId('input-wrapper');
    expect(wrapper).toHaveAttribute('data-status', 'success');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Must be at least 8 characters')).toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Full Width Input');
    expect(input).toBeInTheDocument();
  },
};

// 12. Focus interaction
export const Focus: Story = {
  args: {
    label: 'Focus Target',
    placeholder: 'Click to focus',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Focus Target');
    await userEvent.click(input);
    expect(input).toHaveFocus();
  },
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

// 13. Polymorphic: As Textarea
export const AsTextarea: Story = {
  args: {
    component: 'textarea',
    label: 'Bio',
    placeholder: 'Tell us about yourself...',
    maxLength: 200,
    showCounter: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Bio');
    expect(textarea.tagName).toBe('TEXTAREA');
    await userEvent.type(textarea, 'Hello');
    expect(textarea).toHaveValue('Hello');
  },
};

// 14. Polymorphic: As Link
export const AsLink: Story = {
  args: {
    component: 'a',
    label: 'Profile',
    href: '/profile',
    variant: 'outline',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile');
    expect(canvas.getByText('Profile')).toBeInTheDocument();
  },
};

// 15. Real-world: Login Form
export const LoginForm: Story = {
  render: () => (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '320px' }}
      onSubmit={(e) => e.preventDefault()}
    >
      <Input label="Email" type="email" icon={<Mail />} placeholder="your@email.com" required />
      <Input
        label="Password"
        type="password"
        showPasswordToggle
        placeholder="Enter password"
        required
      />
      <Button type="submit" variant="primary">
        Sign In
      </Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByLabelText('Email');
    const passwordInput = canvas.getByLabelText('Password');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
    const submitButton = canvas.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
  },
};

// 16. Real-world: Search Input
export const SearchInput: Story = {
  args: {
    label: 'Search',
    icon: <Search />,
    clearable: true,
    placeholder: 'Search anything...',
    helperText: 'Press Enter to search',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Search');
    await userEvent.type(input, 'query');
    expect(input).toHaveValue('query');
    const clear = canvas.getByRole('button', { name: /clear/i });
    await userEvent.click(clear);
    expect(input).toHaveValue('');
  },
};

// 17. Edge case: Very long label
export const LongLabel: Story = {
  args: {
    label:
      'This is an extremely long label that should wrap to multiple lines and still maintain proper styling and accessibility attributes',
    placeholder: 'Type something...',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/This is an extremely long label/)).toBeInTheDocument();
  },
};

// 18. Edge case: No label, no placeholder
export const NoLabelNoPlaceholder: Story = {
  args: {
    'aria-label': 'Hidden input for accessibility',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Hidden input for accessibility');
    expect(input).toBeInTheDocument();
  },
};

// 19. Edge case: Disabled + Loading simultaneously
export const DisabledAndLoading: Story = {
  args: {
    label: 'Disabled + Loading',
    disabled: true,
    loading: true,
    defaultValue: 'Cannot edit',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Disabled + Loading');
    expect(input).toBeDisabled();
    expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

// 20. Edge case: All status states combined
export const AllStatesCombined: Story = {
  args: {
    label: 'All States',
    error: 'Multiple errors',
    success: true,
    loading: true,
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId('input-wrapper');
    expect(wrapper).toHaveAttribute('data-status', 'error');
    expect(wrapper).toHaveAttribute('data-state', 'loading error disabled');
  },
};

// 21. asChild: Custom textarea
export const AsChildTextarea: Story = {
  args: {
    asChild: true,
    label: 'Bio (asChild)',
    maxLength: 150,
    showCounter: true,
  },
  render: (args) => (
    <Input {...args}>
      <textarea rows={4} placeholder="Tell us about yourself..." />
    </Input>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Bio (asChild)');
    expect(textarea.tagName).toBe('TEXTAREA');
    await userEvent.type(textarea, 'Hello');
    expect(textarea).toHaveValue('Hello');
  },
};

// 22. asChild: Custom component with icon
export const AsChildWithIcon: Story = {
  args: {
    asChild: true,
    label: 'Custom Input',
    icon: <Mail />,
  },
  render: (args) => (
    <Input {...args}>
      <input type="text" placeholder="Custom element" />
    </Input>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Custom Input');
    expect(input).toBeInTheDocument();
    expect(canvas.getByTestId('icon')).toBeInTheDocument();
  },
};
