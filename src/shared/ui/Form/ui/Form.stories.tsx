// ============================================
// Form Component - Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Form } from './Form';

const meta = {
  title: 'Shared/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    gap: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Vertical spacing between fields (maps to --form-gap).',
    },
    noValidate: {
      control: 'boolean',
      description: 'Disable native browser validation. Default true.',
    },
  },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    noValidate: true,
    'aria-label': 'demo form',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form', { name: 'demo form' });
    await expect(form).toBeInTheDocument();
    await expect(form).toHaveAttribute('novalidate');
  },
};

export const WithFields: Story = {
  render: () => (
    <Form aria-label="contact">
      <Input label="Name" placeholder="Your name" />
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Textarea label="Message" placeholder="Your message" rows={4} />
      <Button type="submit">Send</Button>
    </Form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form', { name: 'contact' });
    await expect(form).toHaveAttribute('novalidate');
    await expect(canvas.getByLabelText('Name')).toBeInTheDocument();
    await expect(canvas.getByLabelText('Email')).toBeInTheDocument();
    await userEvent.type(canvas.getByLabelText('Email'), 'me@example.com');
    await expect(canvas.getByLabelText('Email')).toHaveValue('me@example.com');
  },
};

export const CustomGap: Story = {
  args: {
    gap: 'sm',
    'aria-label': 'demo form',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole('form', { name: 'demo form' });
    // CSS module key is `gap-sm`/`gapSm` depending on build — assert fragment.
    await expect(form.className).toMatch(/gap/);
  },
};
