import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { InputPhone } from './InputPhone';

const meta = {
  title: 'Shared/InputPhone',
  component: InputPhone,
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
} satisfies Meta<typeof InputPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Phone Number',
    placeholder: '+1 (555) 000-0000',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Phone Number');
    expect(input).toHaveAttribute('type', 'tel');
    await userEvent.type(input, '+1234567890');
    expect(input).toHaveValue('+1234567890');
  },
};

export const WithError: Story = {
  args: {
    label: 'Phone',
    error: 'Invalid phone number format',
    defaultValue: '+123',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Phone');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(canvas.getByText('Invalid phone number format')).toBeInTheDocument();
  },
};

export const Required: Story = {
  args: {
    label: 'Phone',
    required: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Phone');
    expect(input).toHaveAttribute('required');
  },
};

export const Disabled: Story = {
  args: {
    label: 'Phone',
    disabled: true,
    defaultValue: '+1 (555) 000-0000',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Phone');
    expect(input).toBeDisabled();
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <InputPhone size="xs" placeholder="XS" />
      <InputPhone size="sm" placeholder="SM" />
      <InputPhone size="md" placeholder="MD" />
      <InputPhone size="lg" placeholder="LG" />
      <InputPhone size="xl" placeholder="XL" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('tel');
    expect(inputs).toHaveLength(5);
  },
};
