// ============================================
// ModalFooter Stories
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
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
};

export const WithCustomClass: Story = {
  args: {
    children: <Button variant="primary">Action</Button>,
    className: 'custom-class',
  },
};

export const SingleButton: Story = {
  args: { children: <Button variant="primary">OK</Button> },
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
};
