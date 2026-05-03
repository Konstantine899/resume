// src/shared/ui/Textarea/Textarea.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './Textarea';

const meta = {
  title: 'Shared/UI/Textarea',
  component: Textarea,
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
    rows: {
      control: 'number',
      min: 2,
      max: 10,
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
    variant: 'default',
    size: 'md',
    rows: 4,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Message',
    placeholder: 'Write your message here...',
    rows: 5,
  },
};

export const WithError: Story = {
  args: {
    label: 'Message',
    error: 'Message is required',
    rows: 4,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Textarea size="sm" placeholder="Small" rows={2} />
      <Textarea size="md" placeholder="Medium" rows={3} />
      <Textarea size="lg" placeholder="Large" rows={4} />
    </div>
  ),
};
