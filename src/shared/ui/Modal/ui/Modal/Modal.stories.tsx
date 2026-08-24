// ============================================
// Modal Component Stories — Compound Pattern
// ============================================

import { useModal } from '@/shared/lib/hooks/useModal';
import { Button } from '@/shared/ui/Button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from '@storybook/test';
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
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
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
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Check title
    expect(within(dialog).getByText('Small')).toBeInTheDocument();

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /medium/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Medium')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /large/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Large')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /extra large/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Extra Large')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /full screen/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Full Screen')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const ExtraSmall: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Extra Small</Button>
        <Modal isOpen={isOpen} onClose={close} title="Extra Small" size="xs">
          <p>Max width: 360px</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /extra small/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Extra Small')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const DoubleExtraLarge: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>2XL</Button>
        <Modal isOpen={isOpen} onClose={close} title="Double Extra Large" size="2xl">
          <p>Max width: 960px</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /2xl/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Double Extra Large')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const TripleExtraLarge: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>3XL</Button>
        <Modal isOpen={isOpen} onClose={close} title="Triple Extra Large" size="3xl">
          <p>Max width: 1200px</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /3xl/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Triple Extra Large')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const SizeComparison: Story = {
  args: baseArgs,
  render: () => {
    const xs = useModal();
    const sm = useModal();
    const md = useModal();
    const lg = useModal();
    const xl = useModal();
    const xxl = useModal();
    const xxxl = useModal();
    const full = useModal();
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <Button onClick={xs.open} size="sm">
          XS (360px)
        </Button>
        <Button onClick={sm.open} size="sm">
          SM (400px)
        </Button>
        <Button onClick={md.open} size="sm">
          MD (500px)
        </Button>
        <Button onClick={lg.open} size="sm">
          LG (640px)
        </Button>
        <Button onClick={xl.open} size="sm">
          XL (800px)
        </Button>
        <Button onClick={xxl.open} size="sm">
          2XL (960px)
        </Button>
        <Button onClick={xxxl.open} size="sm">
          3XL (1200px)
        </Button>
        <Button onClick={full.open} size="sm">
          Full
        </Button>

        <Modal isOpen={xs.isOpen} onClose={xs.close} title="XS" size="xs">
          <p>Content</p>
        </Modal>
        <Modal isOpen={sm.isOpen} onClose={sm.close} title="SM" size="sm">
          <p>Content</p>
        </Modal>
        <Modal isOpen={md.isOpen} onClose={md.close} title="MD" size="md">
          <p>Content</p>
        </Modal>
        <Modal isOpen={lg.isOpen} onClose={lg.close} title="LG" size="lg">
          <p>Content</p>
        </Modal>
        <Modal isOpen={xl.isOpen} onClose={xl.close} title="XL" size="xl">
          <p>Content</p>
        </Modal>
        <Modal isOpen={xxl.isOpen} onClose={xxl.close} title="2XL" size="2xl">
          <p>Content</p>
        </Modal>
        <Modal isOpen={xxxl.isOpen} onClose={xxxl.close} title="3XL" size="3xl">
          <p>Content</p>
        </Modal>
        <Modal isOpen={full.isOpen} onClose={full.close} title="Full" size="full">
          <p>Content</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /xs \(360px\)/i }));
    expect(await screen.findByText(/^XS$/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('button', { name: /3xl \(1200px\)/i }));
    expect(await screen.findByText(/^3XL$/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
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
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" onClick={close}>
                Save
              </Button>
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
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Check all parts exist
    expect(within(dialog).getByText('With Footer')).toBeInTheDocument();
    expect(within(dialog).getByText('Subtitle here')).toBeInTheDocument();
    expect(within(dialog).getByText('Modal with header, content, and footer.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /close modal/i })).toBeInTheDocument();

    // Close by clicking footer button
    await userEvent.click(within(dialog).getByRole('button', { name: /save/i }));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /no animation/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('No Animation')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
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
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Verify no overlay element with aria-hidden
    const overlays = canvasElement.querySelectorAll('[data-dark]');
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
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Verify no close button
    expect(within(dialog).queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();

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
          showCloseButton={false}
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
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Try ESC - should NOT close
    await userEvent.keyboard('{Escape}');
    await expect(dialog).toBeInTheDocument();

    // Try close button - should NOT exist
    expect(within(dialog).queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();

    // Close by clicking footer button
    await userEvent.click(within(dialog).getByRole('button', { name: /i understand/i }));
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /loading/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Saving...')).toBeInTheDocument();
    expect(within(dialog).getByText('Please wait')).toBeInTheDocument();
    expect(within(dialog).getByText('Saving your changes...')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /error/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Error')).toBeInTheDocument();
    expect(within(dialog).getByText('Failed to save')).toBeInTheDocument();
    expect(within(dialog).getByText(/Server Error/)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /try again/i })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /close modal/i }));
    await expect(dialog).not.toBeInTheDocument();
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Open Modal 1
    await userEvent.click(canvas.getByRole('button', { name: /open modal 1/i }));
    const modal1 = await screen.findByRole('dialog');
    expect(modal1).toBeInTheDocument();
    expect(within(modal1).getByText('Modal 1')).toBeInTheDocument();
    expect(within(modal1).getByText('First modal')).toBeInTheDocument();

    // Open Modal 2 from inside Modal 1
    await userEvent.click(within(modal1).getByRole('button', { name: /open second/i }));
    const dialogs = await screen.findAllByRole('dialog');
    const modal2 = dialogs[dialogs.length - 1] as HTMLElement;
    expect(within(modal2).getByText('Modal 2')).toBeInTheDocument();

    // Close Modal 2
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText('Modal 2')).not.toBeInTheDocument();

    // Close Modal 1
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByText('Modal 1')).not.toBeInTheDocument();
  },
};

// ============================================
// Edge Case Stories
// ============================================

export const LongTitle: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Long Title</Button>
        <Modal
          isOpen={isOpen}
          onClose={close}
          title="This is a very long modal title that should wrap gracefully across multiple lines without breaking the layout or causing overflow issues"
          size="md"
        >
          <p>Modal with an extremely long title to test text wrapping behavior.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /long title/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/very long modal title/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const LongContent: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Long Content</Button>
        <Modal isOpen={isOpen} onClose={close} title="Scrollable Content" size="md">
          <div>
            {Array.from({ length: 30 }).map((_, i) => (
              <p key={i} style={{ marginBottom: '12px' }}>
                Content paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /long content/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/Content paragraph 30\./)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const RapidToggle: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Rapid Toggle</Button>
        <Modal isOpen={isOpen} onClose={close} title="Rapid Toggle" size="sm">
          <p>Try rapidly opening and closing this modal.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /rapid toggle/i });

    // Rapid open/close sequence
    await userEvent.click(button);
    const dialog1 = await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await expect(dialog1).not.toBeInTheDocument();

    // Open again immediately
    await userEvent.click(button);
    const dialog2 = await screen.findByRole('dialog');
    expect(dialog2).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog2).not.toBeInTheDocument();
  },
};

// ============================================
// Polymorphic Stories
// ============================================

export const AsSection: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>As Section</Button>
        <Modal isOpen={isOpen} onClose={close} title="Polymorphic Section" component="section">
          <p>Modal root is a &lt;section&gt; element</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /as section/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.tagName).toBe('SECTION');
    expect(within(dialog).getByText('Polymorphic Section')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const AsArticle: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>As Article</Button>
        <Modal isOpen={isOpen} onClose={close} title="Polymorphic Article" component="article">
          <p>Modal root is an &lt;article&gt; element</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /as article/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog.tagName).toBe('ARTICLE');
    expect(within(dialog).getByText('Polymorphic Article')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

// ============================================
// Real-world Stories
// ============================================

export const FormModal: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      close();
    };
    return (
      <div>
        <Button onClick={open}>Form</Button>
        <Modal isOpen={isOpen} onClose={close} title="Contact Form" size="md">
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /form/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const nameInput = within(dialog).getByLabelText('Name');
    const emailInput = within(dialog).getByLabelText('Email');
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');

    await userEvent.click(within(dialog).getByRole('button', { name: /submit/i }));
    await expect(dialog).not.toBeInTheDocument();
  },
};

// ============================================
// Non-modal Stories
// ============================================

export const NonModal: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Non-Modal Panel</Button>
        <Modal isOpen={isOpen} onClose={close} title="Panel" modal={false} size="sm">
          <p>Non-modal panel without overlay, focus trap, or scroll lock.</p>
          <p>Click outside to close.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /non-modal panel/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'false');
    expect(
      within(dialog).getByText('Non-modal panel without overlay, focus trap, or scroll lock.')
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};

export const NonModalLarge: Story = {
  args: baseArgs,
  render: () => {
    const { isOpen, open, close } = useModal();
    return (
      <div>
        <Button onClick={open}>Large Panel</Button>
        <Modal isOpen={isOpen} onClose={close} title="Large Panel" modal={false} size="xl">
          <p>Non-modal panel with extra large size.</p>
          <p>No overlay, no scroll lock, accessible background.</p>
        </Modal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /large panel/i }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'false');
    await userEvent.keyboard('{Escape}');
    await expect(dialog).not.toBeInTheDocument();
  },
};
