// ============================================
// Toast Stories (Shared Layer)
// ============================================

import { useState, type FormEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, screen, expect, waitFor } from 'storybook/test';
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
  // 'toast' tag enables the scoped test-runner gate:
  // `test-storybook --includeTags toast` (full-run is environment-fragile here).
  tags: ['autodocs', 'toast'],
  argTypes: {
    type: {
      control: 'select',
      options: ['success', 'error', 'info', 'warning', 'loading'],
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
    expect(toast).toHaveAttribute('role', 'alert');
    expect(toast).toHaveAttribute('aria-live', 'assertive');

    const message = canvas.getByText('Something went wrong. Please try again.');
    expect(message).toBeInTheDocument();

    const closeButton = canvas.getByTestId('toast-close');
    expect(closeButton).toBeInTheDocument();
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
    expect(toast).toHaveAttribute('role', 'alert');

    const message = canvas.getByText('Please review before continuing.');
    expect(message).toBeInTheDocument();

    const closeButton = canvas.getByTestId('toast-close');
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification');
    expect(closeButton).toHaveAttribute('type', 'button');

    // Icon container should be hidden from screen readers
    const iconContainer = toast.firstElementChild;
    expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
  },
};

export const SwipeToDismiss: Story = {
  args: {
    id: 'swipe',
    message: 'Swipe left to dismiss',
    type: 'info',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toast = canvas.getByTestId('toast');

    // Swipe left beyond the 80px threshold. Coordinates are viewport-based
    // (clientX/clientY), so anchor them to the toast's real bounding box.
    // NOTE: a pointer step WITHOUT `keys` is the move step; `[MouseLeft]` would
    // be a press+release, not a drag.
    const rect = toast.getBoundingClientRect();
    const y = rect.top + rect.height / 2;
    const startX = rect.left + rect.width / 2;

    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: toast, coords: { x: startX, y } },
      { target: toast, coords: { x: startX - 120, y } },
      { keys: '[/MouseLeft]', target: toast, coords: { x: startX - 120, y } },
    ]);

    // Exit animation started (toast still mounted)
    expect(toast.className).toContain(styles.closing ?? '');
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
    <div className={styles.toastContainer ?? ''}>
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
    await userEvent.click(closeButtons[3] as HTMLElement);

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

    await step('toast exposes alert semantics with close control', async () => {
      const toast = canvas.getByTestId('toast');
      expect(toast).toHaveAttribute('role', 'alert');
      expect(canvas.getByText('New update available')).toBeInTheDocument();
      expect(canvas.getByTestId('toast-close')).toBeInTheDocument();
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

    // Toasts render through ToastProvider → Portal into document.body, so
    // they are NOT inside canvasElement. Query them via screen instead.
    await step('all toasts visible', async () => {
      expect(screen.getAllByTestId('toast')).toHaveLength(3);
    });

    await step('clear all triggers exit animation', async () => {
      await userEvent.click(canvas.getByText('Clear All'));
      // Toasts still visible during animation
      expect(screen.getAllByTestId('toast')).toHaveLength(3);
    });
  },
};

function ClearAllContent() {
  const { addToast, clearAll } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => addToast({ message: 'Success!', type: 'success' })}>
          Add Success
        </button>
        <button onClick={() => addToast({ message: 'Error', type: 'error' })}>Add Error</button>
        <button onClick={() => addToast({ message: 'Info', type: 'info' })}>Add Info</button>
        <button onClick={() => addToast({ message: 'Warning', type: 'warning' })}>
          Add Warning
        </button>
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

export const PromiseFlowDemo = {
  render: () => (
    <ToastProvider>
      <PromiseFlowContent />
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

    await step('start promise flow', async () => {
      await userEvent.click(canvas.getByText('Start Promise'));
      // Loading toast rendered through the provider portal
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    await step('promise resolves', async () => {
      // Toasts render through ToastProvider → Portal into document.body, so
      // they are NOT inside canvasElement. Query them via screen instead.
      await waitFor(() => {
        expect(screen.getByText('Loaded successfully')).toBeInTheDocument();
      });
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  },
};

function PromiseFlowContent() {
  const { promise } = useToast();
  const run = () => {
    promise(new Promise<string>((resolve) => setTimeout(() => resolve('data'), 500)), {
      loading: 'Loading...',
      success: 'Loaded successfully',
      error: 'Failed to load',
    });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button onClick={run}>Start Promise</button>
    </div>
  );
}

// ============================================
// Toast Stories — TOAST-10: edge cases & compositions
// ============================================

const LONG_MESSAGE =
  'This is a deliberately long toast message that exercises text wrapping inside the toast ' +
  'layout. It should wrap gracefully across multiple lines without stretching the toast beyond ' +
  'its natural width and without breaking the layout of the close button or the progress bar.';

export const WithLongMessage: Story = {
  args: {
    id: 'long-message',
    message: LONG_MESSAGE,
    type: 'info',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toHaveAttribute('data-type', 'info');

    expect(canvas.getByText(LONG_MESSAGE)).toBeInTheDocument();

    // Message renders as a wrapping Paragraph span (multiline-capable)
    const messageEl = toast.querySelector('[id^="toast-message-"]');
    expect(messageEl).not.toBeNull();
    expect(messageEl?.tagName).toBe('SPAN');

    // Close control still reachable on a long-message toast
    expect(canvas.getByTestId('toast-close')).toBeInTheDocument();
  },
};

export const Persistent: Story = {
  args: {
    id: 'persistent',
    message: 'This notification stays until dismissed',
    type: 'warning',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('role', 'alert');

    // duration 0 → no auto-close timer and no progress bar
    expect(canvas.queryByTestId('toast-progress')).not.toBeInTheDocument();

    // Still mounted after a short real wait (no timer is running)
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(canvas.getByTestId('toast')).toBeInTheDocument();
    expect(toast.className).not.toContain(styles.closing ?? '');

    // Manual close still starts the exit animation
    await userEvent.click(canvas.getByTestId('toast-close'));
    expect(toast.className).toContain(styles.closing ?? '');
  },
};

export const Loading: Story = {
  args: {
    id: 'loading-1',
    message: 'Uploading file...',
    type: 'loading',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveAttribute('data-type', 'loading');

    expect(canvas.getByText('Uploading file...')).toBeInTheDocument();

    // Current behavior: loading toasts render with the info icon (Spinner branch
    // is a TOAST-11 follow-up) and no progress bar while duration is 0.
    expect(canvas.queryByTestId('toast-progress')).not.toBeInTheDocument();
  },
};

export const ExitAnimation: Story = {
  args: {
    id: 'exit-1',
    message: 'Closing with a slide-out animation',
    type: 'success',
    duration: 0,
    onClose: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toast = canvas.getByTestId('toast');
    expect(toast).toBeInTheDocument();
    expect(toast.className).not.toContain(styles.closing ?? '');

    await userEvent.click(canvas.getByTestId('toast-close'));

    // Exit animation started: closing class applied, toast still mounted
    expect(toast.className).toContain(styles.closing ?? '');
    expect(canvas.getByTestId('toast')).toBeInTheDocument();
  },
};

export const EmptyMessage: Story = {
  args: {
    id: 'empty-1',
    message: '',
    type: 'info',
    duration: 0,
    onClose: () => {},
  },
  render: () => (
    <div className={styles.toastContainer ?? ''}>
      <Toast id="empty-1" message="" type="info" duration={0} onClose={() => {}} />
      <Toast id="empty-2" message="   " type="warning" duration={0} onClose={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Edge case: empty and whitespace-only messages render without crashing
    const toasts = canvas.getAllByTestId('toast');
    expect(toasts).toHaveLength(2);
    expect(toasts[0]).toHaveAttribute('data-type', 'info');
    expect(toasts[1]).toHaveAttribute('data-type', 'warning');

    toasts.forEach((toast) => {
      expect(toast.querySelector('[id^="toast-message-"]')).not.toBeNull();
    });

    // Close controls remain available
    expect(canvas.getAllByTestId('toast-close')).toHaveLength(2);
  },
};

export const Stacked = {
  render: () => (
    <ToastProvider>
      <StackedContent />
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

    await step('add three toasts', async () => {
      await userEvent.click(canvas.getByText('Add Info'));
      await userEvent.click(canvas.getByText('Add Success'));
      await userEvent.click(canvas.getByText('Add Warning'));
    });

    await step('toasts stack in the portal container', async () => {
      await waitFor(() => expect(screen.getAllByTestId('toast')).toHaveLength(3));
      const toasts = screen.getAllByTestId('toast');
      const types = toasts.map((toast) => toast.getAttribute('data-type'));
      expect(types).toEqual(['info', 'success', 'warning']);
      // Every toast renders inside a Notifications region (the global decorator's
      // provider + this story's own provider both qualify — assert per-toast via closest).
      toasts.forEach((toast) => {
        expect(toast.closest('[role="region"][aria-label="Notifications"]')).not.toBeNull();
      });
    });
  },
};

function StackedContent() {
  const { addToast } = useToast();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => addToast({ message: 'First info toast', type: 'info' })}>
          Add Info
        </button>
        <button onClick={() => addToast({ message: 'Second success toast', type: 'success' })}>
          Add Success
        </button>
        <button onClick={() => addToast({ message: 'Third warning toast', type: 'warning' })}>
          Add Warning
        </button>
      </div>
    </div>
  );
}

export const RapidFire = {
  render: () => (
    <ToastProvider>
      <RapidFireContent />
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

    await step('fire 6 toasts in a row', async () => {
      await userEvent.click(canvas.getByText('Fire 6'));
      await waitFor(() => expect(screen.getAllByTestId('toast')).toHaveLength(6));
      for (let i = 1; i <= 6; i += 1) {
        expect(screen.getByText(`Toast ${i}`)).toBeInTheDocument();
      }
    });

    await step('explicit id upserts instead of duplicating', async () => {
      await userEvent.click(canvas.getByText('Update Same'));
      await userEvent.click(canvas.getByText('Update Same'));
      expect(screen.getAllByTestId('toast')).toHaveLength(7);
      expect(screen.getAllByText('Updated message')).toHaveLength(1);
    });
  },
};

function RapidFireContent() {
  const { addToast } = useToast();
  const fireSix = () => {
    for (let i = 1; i <= 6; i += 1) {
      addToast({ message: `Toast ${i}`, type: 'info', duration: 10000 });
    }
  };
  const updateSame = () => {
    addToast({ id: 'same-id', message: 'Updated message', type: 'success' });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <button onClick={fireSix}>Fire 6</button>
      <button onClick={updateSame}>Update Same</button>
    </div>
  );
}

export const InContactForm = {
  render: () => (
    <ToastProvider>
      <InContactFormContent />
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

    await step('fill the contact form', async () => {
      await userEvent.type(canvas.getByLabelText('Name'), 'Konstantin');
      await userEvent.type(canvas.getByLabelText('Email'), 'dev@example.com');
      await userEvent.type(canvas.getByLabelText('Message'), 'Hello from the toast story');
    });

    await step('submit shows loading then success toast', async () => {
      await userEvent.click(canvas.getByText('Send Message'));
      expect(screen.getByText('Sending...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Message sent successfully')).toBeInTheDocument();
      });
      expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
    });
  },
};

function InContactFormContent() {
  const { promise } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    promise(new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 400)), {
      loading: 'Sending...',
      success: 'Message sent successfully',
      error: 'Failed to send',
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}
    >
      <label>
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label>
        Message
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
      </label>
      <button type="submit">Send Message</button>
    </form>
  );
}
