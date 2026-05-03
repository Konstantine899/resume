// src/shared/ui/Toast/Toast.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ToastProps } from '../model/types';
import { Toast } from './Toast';

const meta = {
  title: 'Shared/UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning'],
    },
    duration: {
      control: 'number',
      min: 1000,
      max: 10000,
      step: 1000,
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    id: '1',
    message: 'Operation completed successfully!',
    type: 'success',
    onClose: () => {},
  },
};

export const Error: Story = {
  args: {
    id: '2',
    message: 'Something went wrong. Please try again.',
    type: 'error',
    onClose: () => {},
  },
};

export const Info: Story = {
  args: {
    id: '3',
    message: 'Here is some useful information.',
    type: 'info',
    onClose: () => {},
  },
};

export const Warning: Story = {
  args: {
    id: '4',
    message: 'Please review before continuing.',
    type: 'warning',
    onClose: () => {},
  },
};

export const AllTypes: Story = {
  args: {
    id: '1',
    message: 'Toast message',
    type: 'info',
    onClose: () => {},
  },
  render: (args: ToastProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Toast {...args} id="1" message="Success!" type="success" />
      <Toast {...args} id="2" message="Error occurred" type="error" />
      <Toast {...args} id="3" message="Info message" type="info" />
      <Toast {...args} id="4" message="Warning!" type="warning" />
    </div>
  ),
};
