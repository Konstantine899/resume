// ============================================
// Modal Component Stories — Compound Pattern
// ============================================

import { useModal } from '@/shared/lib/hooks/useModal';
import { Button } from '@/shared/ui/Button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from '@storybook/test';
import { Modal } from './Modal';

const meta = {
  title: 'Shared/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    overlay: { control: 'boolean' },
    closeOnOverlayClick: { control: 'boolean' },
    closeOnEsc: { control: 'boolean' },
    blockScroll: { control: 'boolean' },
    showCloseButton: { control: 'boolean' },
    disableAnimation: { control: 'boolean' },
    canClose: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = { children: undefined, isOpen: false, onClose: () => {} };

// ============================================
// Sizes
// ============================================

export const Small: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Small</Button>
        <Modal isOpen={isOpen} onClose={close} title="Small" size="sm">
          <p>Max width: 400px</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /small/i });
    await userEvent.click(button);

    // Wait for modal to open
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Check title
    expect(canvas.getByText('Small')).toBeInTheDocument();

    // Close by ESC
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const Medium: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Medium</Button>
        <Modal isOpen={isOpen} onClose={close} title="Medium" size="md">
          <p>Max width: 500px</p>
        </Modal>
      </div>
    );
  },
};

export const Large: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Large</Button>
        <Modal isOpen={isOpen} onClose={close} title="Large" size="lg">
          <p>Max width: 640px</p>
        </Modal>
      </div>
    );
  },
};

export const ExtraLarge: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Extra Large</Button>
        <Modal isOpen={isOpen} onClose={close} title="Extra Large" size="xl">
          <p>Max width: 800px</p>
        </Modal>
      </div>
    );
  },
};

export const FullScreen: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Full Screen</Button>
        <Modal isOpen={isOpen} onClose={close} title="Full Screen" size="full">
          <p>Full screen with padding</p>
        </Modal>
      </div>
    );
  },
};

// ============================================
// With Footer
// ============================================

export const WithFooter: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>With Footer</Button>
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="With Footer"
          subtitle="Subtitle here"
          footer={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Save</Button>
            </div>
          }
        >
          <p>Modal with header, content, and footer.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open modal
    await userEvent.click(canvas.getByRole('button', { name: /with footer/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Check all parts exist
    expect(canvas.getByText('With Footer')).toBeInTheDocument();
    expect(canvas.getByText('Subtitle here')).toBeInTheDocument();
    expect(canvas.getByText('Modal with header, content, and footer.')).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(canvas.getByRole('button', { name: /закрыть/i })).toBeInTheDocument();

    // Close by clicking footer button
    await userEvent.click(canvas.getByRole('button', { name: /save/i }));
    await expect(dialog).not.toBeInTheDocument();
  },
};

// ============================================
// States
// ============================================

export const NoAnimation: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>No Animation</Button>
        <Modal isOpen={isOpen} onClose={close} title="No Animation" disableAnimation>
          <p>Appears instantly</p>
        </Modal>
      </div>
    );
  },
};

export const NoOverlay: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>No Overlay</Button>
        <Modal isOpen={isOpen} onClose={close} title="No Overlay" overlay={false}>
          <p>No background overlay</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open modal
    await userEvent.click(canvas.getByRole('button', { name: /no overlay/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Verify no overlay element with aria-hidden
    const overlays = canvasElement.querySelectorAll('[aria-hidden="true"]');
    expect(overlays.length).toBe(0);

    // Close by ESC
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const NoCloseButton: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>No Close Button</Button>
        <Modal isOpen={isOpen} onClose={close} title="No Close Button" showCloseButton={false}>
          <p>No X button in header</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open modal
    await userEvent.click(canvas.getByRole('button', { name: /no close button/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Verify no close button
    expect(canvas.queryByRole('button', { name: /закрыть/i })).not.toBeInTheDocument();

    // Close by ESC
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

// ============================================
// Blocking Modal
// ============================================

export const BlockingModal: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Blocking</Button>
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="Cannot Close"
          canClose={false}
          closeOnEsc={false}
          closeOnOverlayClick={false}
          footer={<Button onClick={close}>I Understand</Button>}
        >
          <p>Must click button to close</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open modal
    await userEvent.click(canvas.getByRole('button', { name: /blocking/i }));
    const dialog = await canvas.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Try ESC - should NOT close
    await userEvent.keyboard('{Escape}');
    await expect(dialog).toBeInTheDocument();

    // Try close button - should NOT exist
    expect(canvas.queryByRole('button', { name: /закрыть/i })).not.toBeInTheDocument();

    // Close by clicking footer button
    await userEvent.click(canvas.getByRole('button', { name: /i understand/i }));
    await expect(dialog).not.toBeInTheDocument();
  },
};

// ============================================
// Loading State
// ============================================

export const LoadingState: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Loading</Button>
        <Modal isOpen={isOpen} onClose={close} title="Saving..." subtitle="Please wait">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid var(--background-alt)',
                borderTop: '3px solid var(--primary-color)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p>Saving your changes...</p>
          </div>
        </Modal>
      </div>
    );
  },
};

// ============================================
// Error State
// ============================================

export const ErrorState: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Error</Button>
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="Error"
          subtitle="Failed to save"
          footer={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary">Close</Button>
              <Button variant="primary">Try Again</Button>
            </div>
          }
        >
          <div
            style={{
              padding: '16px',
              background: 'var(--error-background, #fee)',
              border: '1px solid var(--error-color, #c00)',
              borderRadius: '8px',
              color: 'var(--error-color, #c00)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>❌ Server Error</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              Failed to connect. Please try again.
            </p>
          </div>
        </Modal>
      </div>
    );
  },
};

// ============================================
// Multiple Modals
// ============================================

export const MultipleModals: Story = {
  args: baseArgs,
  render: () => {
    const modal1 = useModal();
    const modal2 = useModal();
    return (
      <div style={{ display: 'flex', gap: '16px' }}>
        <Button onClick={modal1.open}>Open Modal 1</Button>
        <Button onClick={modal2.open}>Open Modal 2</Button>
        <Modal isOpen={modal1.isOpen} onClose={modal1.close} title="Modal 1" size="sm">
          <p>First modal</p>
          <Button onClick={modal2.open} style={{ marginTop: '16px' }}>
            Open Second
          </Button>
        </Modal>
        <Modal isOpen={modal2.isOpen} onClose={modal2.close} title="Modal 2" size="sm">
          <p>Second modal</p>
        </Modal>
      </div>
    );
  },
};
