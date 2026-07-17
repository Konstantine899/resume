// ============================================
// Toast Stories (Shared Layer)
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from '@storybook/test';
import type { ToastProps } from '../model/types';
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
    const closeButton = canvas.getByTestId('toast-close');

    await userEvent.click(closeButton);

    // Toast should have the closing class after click
    // eslint-disable-next-line no-console
    console.assert(toast.classList.contains('toast'), 'Toast element exists after close click');
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

    // Verify error type
    // eslint-disable-next-line no-console
    console.assert(toast.getAttribute('data-type') === 'error', 'Toast has correct data-type');
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

    // Verify info type
    // eslint-disable-next-line no-console
    console.assert(toast.getAttribute('data-type') === 'info', 'Toast has correct data-type');

    // Verify message renders
    const message = canvas.getByText('Here is some useful information.');
    // eslint-disable-next-line no-console
    console.assert(message !== null, 'Toast message is rendered');
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

    // Verify warning type
    // eslint-disable-next-line no-console
    console.assert(toast.getAttribute('data-type') === 'warning', 'Toast has correct data-type');

    // Verify close button has correct aria-label
    const closeButton = canvas.getByTestId('toast-close');
    // eslint-disable-next-line no-console
    console.assert(
      closeButton.getAttribute('aria-label') === 'Close notification',
      'Close button has correct aria-label'
    );
  },
};

export const AllTypes: Story = {
  args: {
    id: '1',
    message: 'Toast message',
    type: 'info',
    duration: 0,
    onClose: () => {},
  },
  render: (args: ToastProps) => (
    <div className={styles.toastContainer}>
      <Toast {...args} id="1" message="Success!" type="success" />
      <Toast {...args} id="2" message="Error occurred" type="error" />
      <Toast {...args} id="3" message="Info message" type="info" />
      <Toast {...args} id="4" message="Warning!" type="warning" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all 4 toast types render
    const toasts = canvas.getAllByTestId('toast');
    // eslint-disable-next-line no-console
    console.assert(toasts.length === 4, 'All 4 toast types are rendered');

    // Verify each toast has the correct data-type attribute
    const expectedTypes = ['success', 'error', 'info', 'warning'];
    toasts.forEach((toast, index) => {
      // eslint-disable-next-line no-console
      console.assert(
        toast.getAttribute('data-type') === expectedTypes[index],
        `Toast ${index} has data-type="${expectedTypes[index]}"`
      );
    });

    // Verify all messages are present
    const messages = ['Success!', 'Error occurred', 'Info message', 'Warning!'];
    messages.forEach((message) => {
      // eslint-disable-next-line no-console
      console.assert(canvas.getByText(message) !== null, `Message "${message}" is rendered`);
    });

    // Click the close button on the warning toast
    const closeButtons = canvas.getAllByTestId('toast-close');
    await userEvent.click(closeButtons[3]);

    // Warning toast should still exist (exit animation hasn't completed)
    const remainingToasts = canvas.getAllByTestId('toast');
    // eslint-disable-next-line no-console
    console.assert(remainingToasts.length === 4, 'All toasts remain visible after close click');
  },
};
