// ============================================
// Toast Stories (Shared Layer)
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from '@storybook/test';
import { Toast } from './Toast';
import styles from './Toast.module.scss';

const meta = {
  title: 'Shared/Toast',
  component: Toast,
  parameters: {
    layout: 'padded',
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
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('data-type', 'success');

    const message = canvas.getByText('Operation completed successfully!');
    expect(message).toBeInTheDocument();

    const closeButton = canvas.getByTestId('toast-close');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');

    await userEvent.click(closeButton);

    // Toast still visible during exit animation
    expect(canvas.getByTestId('toast')).toBeInTheDocument();
  },
};

export const Error: Story = {
  args: {
    id: '2',
    message: 'Something went wrong. Please try again.',
    type: 'error',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toHaveAttribute('data-type', 'error');

    const message = canvas.getByText('Something went wrong. Please try again.');
    expect(message).toBeInTheDocument();
  },
};

export const Info: Story = {
  args: {
    id: '3',
    message: 'Here is some useful information.',
    type: 'info',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toHaveAttribute('data-type', 'info');
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');

    const message = canvas.getByText('Here is some useful information.');
    expect(message).toBeInTheDocument();
  },
};

export const Warning: Story = {
  args: {
    id: '4',
    message: 'Please review before continuing.',
    type: 'warning',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toHaveAttribute('data-type', 'warning');

    const closeButton = canvas.getByTestId('toast-close');
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    expect(closeButton).toHaveAttribute('type', 'button');

    // Icon container should be hidden from screen readers
    const iconContainer = toast.firstElementChild;
    expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
  },
};

export const AllTypes: Story = {
  args: {
    id: 'all',
    message: 'placeholder',
    type: 'info' as const,
    onClose: () => {},
  },
  render: () => (
    <div className={styles.toastContainer}>
      <Toast id="1" message="Success!" type="success" onClose={() => {}} />
      <Toast id="2" message="Error occurred" type="error" onClose={() => {}} />
      <Toast id="3" message="Info message" type="info" onClose={() => {}} />
      <Toast id="4" message="Warning!" type="warning" onClose={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toasts = canvas.getAllByTestId('toast');
    expect(toasts).toHaveLength(4);

    const expectedTypes = ['success', 'error', 'info', 'warning'];
    toasts.forEach((toast, index) => {
      expect(toast).toHaveAttribute('data-type', expectedTypes[index]);
    });

    const messages = ['Success!', 'Error occurred', 'Info message', 'Warning!'];
    messages.forEach((message) => {
      expect(canvas.getByText(message)).toBeInTheDocument();
    });

    // Close the warning toast
    const closeButtons = canvas.getAllByTestId('toast-close');
    await userEvent.click(closeButtons[3]);

    // All 4 should still be visible (exit animation not complete)
    expect(canvas.getAllByTestId('toast')).toHaveLength(4);
  },
};
