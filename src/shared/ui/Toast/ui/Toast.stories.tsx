// ============================================
// Toast Stories (Shared Layer)
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from '@storybook/test';
import { Toast } from './Toast';
import { ToastProvider } from '@/shared/lib/contexts/ToastContext/ui/ToastContext';
import { useToast } from '@/shared/lib/contexts/ToastContext/lib/hooks/useToast';
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

export const WithAction: Story = {
  args: {
    id: 'action-1',
    message: 'File deleted',
    type: 'warning',
    duration: 8000,
    action: { label: 'Undo', onClick: () => undefined },
    onClose: () => {},
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('action button visible', async () => {
      const actionBtn = canvas.getByText('Undo');
      expect(actionBtn).toBeInTheDocument();
      expect(actionBtn.tagName).toBe('BUTTON');
    });

    await step('click action does not close toast', async () => {
      await userEvent.click(canvas.getByText('Undo'));
      expect(canvas.getByTestId('toast')).toBeInTheDocument();
    });

    await step('progress bar visible', async () => {
      expect(canvas.getByTestId('toast-progress')).toBeInTheDocument();
    });
  },
};

export const WithPrimaryAction: Story = {
  args: {
    id: 'primary-action-1',
    message: 'New update available',
    type: 'info',
    duration: 0,
    action: {
      label: 'Update',
      onClick: () => undefined,
      variant: 'primary',
    },
    onClose: () => {},
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('primary action button has correct variant', async () => {
      const actionBtn = canvas.getByText('Update');
      expect(actionBtn).toBeInTheDocument();
      expect(actionBtn.className).toContain('primary');
    });
  },
};

export const ClearAllDemo = {
  render: () => (
    <ToastProvider>
      <ClearAllContent />
    </ToastProvider>
  ),
  play: async ({
    canvasElement,
    step,
  }: {
    canvasElement: HTMLElement;
    step: (name: string, fn: () => Promise<void>) => Promise<void>;
  }) => {
    const canvas = within(canvasElement);

    await step('add multiple toasts', async () => {
      await userEvent.click(canvas.getByText('Add Success'));
      await userEvent.click(canvas.getByText('Add Error'));
      await userEvent.click(canvas.getByText('Add Info'));
    });

    await step('all toasts visible', async () => {
      expect(canvas.getAllByTestId('toast')).toHaveLength(3);
    });

    await step('clear all triggers exit animation', async () => {
      await userEvent.click(canvas.getByText('Clear All'));
      // Toasts still visible during animation
      expect(canvas.getAllByTestId('toast')).toHaveLength(3);
    });
  },
};

function ClearAllContent() {
  const { addToast, clearAll } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => addToast('Success!', 'success')}>Add Success</button>
        <button onClick={() => addToast('Error', 'error')}>Add Error</button>
        <button onClick={() => addToast('Info', 'info')}>Add Info</button>
        <button onClick={() => addToast('Warning', 'warning')}>Add Warning</button>
      </div>
      <button
        onClick={clearAll}
        style={{
          background: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Clear All
      </button>
    </div>
  );
}
