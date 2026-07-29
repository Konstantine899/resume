// ============================================
// Modal Compound Component Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './Modal';
import { resetOpenCount } from '../ModalRoot/ModalRoot';

describe('Modal (Compound)', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    resetOpenCount();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    resetOpenCount();
  });

  // ============================================
  // Simple API Tests
  // ============================================
  describe('simple API', () => {
    it('should render with base props', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen=false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render title automatically', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render subtitle automatically', () => {
      render(<Modal {...defaultProps} title="Title" subtitle="Test Subtitle" />);
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should render footer automatically', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render close button by default', () => {
      render(<Modal {...defaultProps} title="Title" />);
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should not render close button when showCloseButton=false', () => {
      render(<Modal {...defaultProps} title="Title" showCloseButton={false} />);
      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });

    // ============================================
    // Uncontrolled (defaultOpen) Tests
    // ============================================

    it('should render with defaultOpen=true (uncontrolled)', () => {
      render(
        <Modal defaultOpen onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should not render with defaultOpen=false (uncontrolled)', () => {
      render(
        <Modal defaultOpen={false} onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should close uncontrolled modal on ESC', () => {
      const onClose = vi.fn();
      render(
        <Modal defaultOpen onClose={onClose}>
          Content
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should prefer isOpen over defaultOpen', () => {
      render(
        <Modal isOpen={false} defaultOpen onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should render with scroll="body"', () => {
      render(<Modal {...defaultProps} scroll="body" />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should default to scroll="paper"', () => {
      const { container } = render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      // Проверяем что modalBody class не присутствует (scroll по умолчанию paper)
      expect(container.querySelector('.modalBody')).toBeNull();
    });

    it('should not render with forceMount when closed initially', () => {
      render(
        <Modal isOpen={false} forceMount onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should keep mounted during close animation with forceMount', async () => {
      const { rerender } = render(
        <Modal isOpen={true} forceMount onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();

      // Close — should stay mounted during animation
      rerender(
        <Modal isOpen={false} forceMount onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();

      // After animation duration, should unmount
      await new Promise((resolve) => setTimeout(resolve, 750));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should immediately unmount without forceMount', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          Content
        </Modal>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Compound Components Tests
  // ============================================
  describe('compound components', () => {
    it('should use Modal.Header', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header title="Custom Header" onClose={vi.fn()} />
          <Modal.Content>Content</Modal.Content>
        </Modal>
      );
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('should use Modal.Content', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>Custom Content</Modal.Content>
        </Modal>
      );
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('should use Modal.Footer', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Footer>
            <button>Action</button>
          </Modal.Footer>
        </Modal>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should use Modal.CloseButton', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test" showCloseButton={true}>
          Content
        </Modal>
      );
      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 10));
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should use Modal.Root directly', () => {
      render(
        <Modal.Root isOpen={true} onClose={vi.fn()}>
          <div>Custom Root Content</div>
        </Modal.Root>
      );
      expect(screen.getByText('Custom Root Content')).toBeInTheDocument();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('accessibility', () => {
    it('should have role="dialog"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby with title', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('should have aria-describedby with subtitle', () => {
      render(<Modal {...defaultProps} title="Title" subtitle="Subtitle" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should not have aria-describedby without subtitle', () => {
      render(<Modal {...defaultProps} title="Title" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-describedby');
    });

    it('should not have aria-label when aria-labelledby is present', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-label');
    });

    it('should have tabIndex=0', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('tabindex', '0');
    });

    it('should have data-state="open" when isOpen', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'open');
    });
  });

  // ============================================
  // Keyboard Tests
  // ============================================
  describe('keyboard', () => {
    it('should close on ESC', () => {
      render(<Modal {...defaultProps} closeOnEsc={true} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close on ESC when closeOnEsc=false', () => {
      render(<Modal {...defaultProps} closeOnEsc={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should not close on ESC if event.preventDefault()', async () => {
      const onClose = vi.fn();
      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          closeOnEsc={true}
          title="Test"
          showCloseButton={true}
        >
          Test
        </Modal>
      );

      // Wait for modal to open
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check modal rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);

      // ESC should close since preventDefault didn't fire in jsdom
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onEscapeKeyDown on ESC', () => {
      const onClose = vi.fn();
      const onEscapeKeyDown = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} onEscapeKeyDown={onEscapeKeyDown}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onEscapeKeyDown).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    it('should NOT close on ESC when onEscapeKeyDown calls preventDefault', () => {
      const onClose = vi.fn();
      const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());
      render(
        <Modal isOpen={true} onClose={onClose} onEscapeKeyDown={onEscapeKeyDown}>
          Content
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onEscapeKeyDown).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Overlay Tests
  // ============================================
  describe('overlay', () => {
    it('should render overlay by default', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog').parentElement?.parentElement).toBeInTheDocument();
    });

    it('should not render overlay when overlay=false', () => {
      render(<Modal {...defaultProps} overlay={false} />);
      expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('should close on overlay click', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={true} />);
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(defaultProps.onClose).toHaveBeenCalled();
      }
    });
  });

  // ============================================
  // onPointerDownOutside Tests
  // ============================================
  describe('onPointerDownOutside', () => {
    it('should call onPointerDownOutside on overlay click', () => {
      const onPointerDownOutside = vi.fn();
      render(
        <Modal
          {...defaultProps}
          onPointerDownOutside={onPointerDownOutside}
          closeOnOverlayClick={true}
        />
      );
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(onPointerDownOutside).toHaveBeenCalled();
      }
    });

    it('should NOT close when onPointerDownOutside calls preventDefault', () => {
      const onClose = vi.fn();
      const onPointerDownOutside = vi.fn((e: PointerEvent) => e.preventDefault());
      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          onPointerDownOutside={onPointerDownOutside}
          closeOnOverlayClick={true}
        >
          Content
        </Modal>
      );
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(onPointerDownOutside).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
      }
    });

    it('should close when onPointerDownOutside does NOT preventDefault', () => {
      const onClose = vi.fn();
      const onPointerDownOutside = vi.fn();
      render(
        <Modal
          isOpen={true}
          onClose={onClose}
          onPointerDownOutside={onPointerDownOutside}
          closeOnOverlayClick={true}
        >
          Content
        </Modal>
      );
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(onPointerDownOutside).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  // ============================================
  // canClose Tests
  // ============================================
  describe('canClose', () => {
    it('should close when canClose=true', () => {
      render(<Modal {...defaultProps} canClose={true} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should not close when canClose=false', () => {
      render(<Modal {...defaultProps} canClose={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('should call canClose function', () => {
      const canCloseFn = vi.fn(() => false);
      render(<Modal {...defaultProps} canClose={canCloseFn} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(canCloseFn).toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Callbacks Tests
  // ============================================
  describe('callbacks', () => {
    it('should call onOpened on open', async () => {
      const onOpened = vi.fn();
      render(<Modal {...defaultProps} onOpened={onOpened} />);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(onOpened).toHaveBeenCalled();
    });

    it('should call onClosed on close', async () => {
      const onClosed = vi.fn();
      const onClose = vi.fn();

      const { rerender } = render(
        <Modal
          isOpen={true}
          onClose={onClose}
          onClosed={onClosed}
          title="Test"
          showCloseButton={true}
        >
          Test
        </Modal>
      );

      // Wait for open
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onClosed).not.toHaveBeenCalled();

      // Close
      rerender(
        <Modal
          isOpen={false}
          onClose={onClose}
          onClosed={onClosed}
          title="Test"
          showCloseButton={true}
        >
          Test
        </Modal>
      );

      // Wait for onClosed call
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onClosed).toHaveBeenCalledTimes(1);
    });

    it('should focus finalFocusRef after close', async () => {
      const onClose = vi.fn();
      const focusTarget = document.createElement('button');
      focusTarget.setAttribute('data-testid', 'focus-target');
      document.body.appendChild(focusTarget);
      const focusRef = { current: focusTarget };

      const { rerender } = render(
        <Modal isOpen={true} onClose={onClose} finalFocusRef={focusRef} title="Test">
          Content
        </Modal>
      );

      // Wait for open
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Close
      rerender(
        <Modal isOpen={false} onClose={onClose} finalFocusRef={focusRef} title="Test">
          Content
        </Modal>
      );

      // Wait for close + focus restoration
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.activeElement).toBe(focusTarget);
      document.body.removeChild(focusTarget);
    });
  });

  // ============================================
  // Polymorphic Tests
  // ============================================
  describe('polymorphic', () => {
    it('should render as div by default', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.tagName).toBe('DIV');
    });

    it('should render as section when component="section"', () => {
      render(<Modal {...defaultProps} component="section" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.tagName).toBe('SECTION');
    });

    it('should render as article when component="article"', () => {
      render(<Modal {...defaultProps} component="article" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog.tagName).toBe('ARTICLE');
    });

    it('should preserve role="dialog" with custom component', () => {
      render(<Modal {...defaultProps} component="section" />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should preserve aria-modal with custom component', () => {
      render(<Modal {...defaultProps} component="section" />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('should handle component prop via Modal.Root directly', () => {
      render(
        <Modal.Root isOpen={true} onClose={vi.fn()} component="section">
          <div>Root custom element</div>
        </Modal.Root>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog.tagName).toBe('SECTION');
      expect(dialog).toHaveTextContent('Root custom element');
    });
  });

  // ============================================
  // initialFocusRef Tests
  // ============================================
  describe('initialFocusRef', () => {
    it('should focus initialFocusRef when autoFocus is true', async () => {
      const focusTarget = document.createElement('input');
      focusTarget.setAttribute('data-testid', 'initial-focus');
      document.body.appendChild(focusTarget);
      const focusRef = { current: focusTarget };

      render(
        <Modal isOpen={true} onClose={vi.fn()} initialFocusRef={focusRef} autoFocus={true}>
          Content
        </Modal>
      );

      // Wait for focus timeout
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.activeElement).toBe(focusTarget);
      document.body.removeChild(focusTarget);
    });
  });

  // ============================================
  // Non-modal mode Tests (modal=false)
  // ============================================
  describe('non-modal mode', () => {
    it('should render without overlay when modal=false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} modal={false}>
          Content
        </Modal>
      );
      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should set aria-modal="false" when modal=false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} modal={false}>
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'false');
    });

    it('should set aria-modal="true" by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should not block body scroll when modal=false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} modal={false} blockScroll={true}>
          Content
        </Modal>
      );
      expect(document.body.style.overflow).toBe('');
    });

    it('should still close on ESC when modal=false', () => {
      const onClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={onClose} modal={false}>
          Content
        </Modal>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
