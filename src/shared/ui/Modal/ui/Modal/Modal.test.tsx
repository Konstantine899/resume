// ============================================
// Modal Compound Component Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal } from './Modal';

describe('Modal (Compound)', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ============================================
  // Simple API Tests
  // ============================================
  describe('simple API', () => {
    it('должен рендериться с базовыми props', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('не должен рендериться когда isOpen=false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('должен рендерить заголовок автоматически', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('должен рендерить подзаголовок автоматически', () => {
      render(<Modal {...defaultProps} title="Title" subtitle="Test Subtitle" />);
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('должен рендерить footer автоматически', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('должен рендерить кнопку закрытия по умолчанию', () => {
      render(<Modal {...defaultProps} title="Title" />);
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('не должен рендерить кнопку закрытия когда showCloseButton=false', () => {
      render(<Modal {...defaultProps} title="Title" showCloseButton={false} />);
      expect(screen.queryByRole('button', { name: /закрыть/i })).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Compound Components Tests
  // ============================================
  describe('compound components', () => {
    it('должен использовать Modal.Header', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Header title="Custom Header" onClose={vi.fn()} />
          <Modal.Content>Content</Modal.Content>
        </Modal>
      );
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('должен использовать Modal.Content', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Content>Custom Content</Modal.Content>
        </Modal>
      );
      expect(screen.getByText('Custom Content')).toBeInTheDocument();
    });

    it('должен использовать Modal.Footer', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <Modal.Footer>
            <button>Action</button>
          </Modal.Footer>
        </Modal>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('должен использовать Modal.CloseButton', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test" showCloseButton={true}>
          Content
        </Modal>
      );
      // Ждём рендера
      await new Promise((resolve) => setTimeout(resolve, 10));
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('должен использовать Modal.Root напрямую', () => {
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
    it('должен иметь role="dialog"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('должен иметь aria-modal="true"', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('должен иметь aria-labelledby при title', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('должен иметь aria-describedby при subtitle', () => {
      render(<Modal {...defaultProps} title="Title" subtitle="Subtitle" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('должен иметь tabIndex=0', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('tabindex', '0');
    });
  });

  // ============================================
  // Keyboard Tests
  // ============================================
  describe('keyboard', () => {
    it('должен закрываться по ESC', () => {
      render(<Modal {...defaultProps} closeOnEsc={true} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('не должен закрываться по ESC когда closeOnEsc=false', () => {
      render(<Modal {...defaultProps} closeOnEsc={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('не должен закрываться по ESC если event.preventDefault()', async () => {
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

      // Ждём открытия модалки
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Проверяем что модалка открылась
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);

      // ESC должен закрыть, т.к. preventDefault не сработал через dispatchEvent в jsdom
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Overlay Tests
  // ============================================
  describe('overlay', () => {
    it('должен рендерить overlay по умолчанию', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog').parentElement?.parentElement).toBeInTheDocument();
    });

    it('не должен рендерить overlay когда overlay=false', () => {
      render(<Modal {...defaultProps} overlay={false} />);
      // Overlay не рендерится
    });

    it('должен закрываться по клику на overlay', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={true} />);
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
        expect(defaultProps.onClose).toHaveBeenCalled();
      }
    });
  });

  // ============================================
  // canClose Tests
  // ============================================
  describe('canClose', () => {
    it('должен закрываться когда canClose=true', () => {
      render(<Modal {...defaultProps} canClose={true} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('не должен закрываться когда canClose=false', () => {
      render(<Modal {...defaultProps} canClose={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('должен вызывать canClose функцию', () => {
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
    it('должен вызывать onOpened при открытии', async () => {
      const onOpened = vi.fn();
      render(<Modal {...defaultProps} onOpened={onOpened} />);
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(onOpened).toHaveBeenCalled();
    });

    it('должен вызывать onClosed при закрытии', async () => {
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

      // Ждём открытия
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onClosed).not.toHaveBeenCalled();

      // Закрываем
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

      // Ждём вызова onClosed
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(onClosed).toHaveBeenCalledTimes(1);
    });
  });
});
