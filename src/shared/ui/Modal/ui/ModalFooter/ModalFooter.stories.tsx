import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { ModalFooter } from './ModalFooter';
import { Button } from '@/shared/ui/Button';

const meta = {
  title: 'Shared/Modal/Footer',
  component: ModalFooter,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof ModalFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /save/i })).toBeInTheDocument();
  },
};

export const WithCustomClass: Story = {
  args: {
    children: <Button variant="primary">Action</Button>,
    className: 'custom-class',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: /action/i })).toBeInTheDocument();
  },
};

export const SingleButton: Story = {
  args: { children: <Button variant="primary">OK</Button> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: /ok/i })).toBeInTheDocument();
  },
};

export const MultipleButtons: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="ghost">Help</Button>
        <Button variant="secondary">Back</Button>
        <Button variant="primary">Next</Button>
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('button', { name: /help/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /next/i })).toBeInTheDocument();
  },
};
