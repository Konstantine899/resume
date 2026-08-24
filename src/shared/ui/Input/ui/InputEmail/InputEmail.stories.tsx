import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { InputEmail } from './InputEmail';

const meta = {
  title: 'Shared/InputEmail',
  component: InputEmail,
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
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
} satisfies Meta<typeof InputEmail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'your@email.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email Address');
    expect(input).toHaveAttribute('type', 'email');
    await userEvent.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email format',
    defaultValue: 'invalid-email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(canvas.getByText('Invalid email format')).toBeInTheDocument();
  },
};

export const Required: Story = {
  args: {
    label: 'Email',
    required: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    expect(input).toHaveAttribute('required');
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    disabled: true,
    defaultValue: 'disabled@email.com',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');
    expect(input).toBeDisabled();
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <InputEmail size="xs" placeholder="XS" />
      <InputEmail size="sm" placeholder="SM" />
      <InputEmail size="md" placeholder="MD" />
      <InputEmail size="lg" placeholder="LG" />
      <InputEmail size="xl" placeholder="XL" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('textbox');
    expect(inputs).toHaveLength(5);
  },
};
