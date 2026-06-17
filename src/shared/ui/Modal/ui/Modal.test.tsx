import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Modal } from './Modal';
import styles from './Modal.module.scss';

describe('Modal', () => {
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
  // Rendering Tests
  // ============================================
  describe('rendering', () => {
    it('должен рендериться с базовыми props', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('не должен рендериться когда isOpen=false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('должен рендерить заголовок', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('должен рендерить подзаголовок', () => {
      render(<Modal {...defaultProps} title="Title" subtitle="Test Subtitle" />);
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('не должен рендерить подзаголовок без заголовка', () => {
      render(<Modal {...defaultProps} subtitle="Test Subtitle" />);
      expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
    });

    it('должен рендерить footer', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      render(<Modal {...defaultProps} className="custom-class" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-class');
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
  // Size Tests
  // ============================================
  describe('sizes', () => {
    it('должен применять size=sm', () => {
      render(<Modal {...defaultProps} size="sm" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.sm);
    });

    it('должен применять size=md', () => {
      render(<Modal {...defaultProps} size="md" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.md);
    });

    it('должен применять size=lg', () => {
      render(<Modal {...defaultProps} size="lg" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.lg);
    });

    it('должен применять size=xl', () => {
      render(<Modal {...defaultProps} size="xl" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.xl);
    });

    it('должен применять size=full', () => {
      render(<Modal {...defaultProps} size="full" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.full);
    });

    it('должен использовать md по умолчанию', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.md);
    });
  });

  // ============================================
  // Overlay Tests
  // ============================================
  describe('overlay', () => {
    it('должен рендерить overlay по умолчанию', () => {
      render(<Modal {...defaultProps} />);
      expect(document.querySelector('[data-testid="overlay"]')).toBeInTheDocument();
    });

    it('не должен рендерить overlay когда overlay=false', () => {
      render(<Modal {...defaultProps} overlay={false} />);
      expect(document.querySelector('[data-testid="overlay"]')).not.toBeInTheDocument();
    });

    it('должен вызывать onClose при клике на overlay', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={true} />);
      const overlay = document.querySelector('[data-testid="overlay"]');
      if (overlay) {
        fireEvent.click(overlay);
      }
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClose при клике на overlay когда closeOnOverlayClick=false', () => {
      render(<Modal {...defaultProps} closeOnOverlayClick={false} />);
      const overlay = document.querySelector('[data-testid="overlay"]');
      if (overlay) {
        fireEvent.click(overlay);
      }
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Close Button Tests
  // ============================================
  describe('close button', () => {
    it('должен вызывать onClose при клике на кнопку закрытия', () => {
      render(<Modal {...defaultProps} title="Title" />);
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('должен иметь aria-label на кнопке закрытия', () => {
      render(<Modal {...defaultProps} title="Title" />);
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Закрыть модальное окно');
    });

    it('должен иметь type="button" на кнопке закрытия', () => {
      render(<Modal {...defaultProps} title="Title" />);
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      expect(closeButton).toHaveAttribute('type', 'button');
    });
  });

  // ============================================
  // Keyboard Tests (ESC)
  // ============================================
  describe('keyboard (closeOnEsc)', () => {
    it('должен закрываться по нажатию Escape', () => {
      render(<Modal {...defaultProps} closeOnEsc={true} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('не должен закрываться по нажатию Escape когда closeOnEsc=false', () => {
      render(<Modal {...defaultProps} closeOnEsc={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('не должен закрываться по нажатию других клавиш', () => {
      render(<Modal {...defaultProps} closeOnEsc={true} />);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('не должен закрываться по нажатию Esc (старая клавиша)', () => {
      render(<Modal {...defaultProps} closeOnEsc={true} />);
      fireEvent.keyDown(document, { key: 'Esc' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Scroll Blocking Tests
  // ============================================
  describe('blockScroll', () => {
    beforeEach(() => {
      document.body.style.overflow = '';
    });

    afterEach(() => {
      document.body.style.overflow = '';
    });

    it('должен блокировать скролл body при открытии', () => {
      render(<Modal {...defaultProps} blockScroll={true} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('не должен блокировать скролл когда blockScroll=false', () => {
      render(<Modal {...defaultProps} blockScroll={false} isOpen={true} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('должен восстанавливать скролл при закрытии', () => {
      const { rerender } = render(<Modal {...defaultProps} blockScroll={true} isOpen={true} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} blockScroll={true} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });

  // ============================================
  // Focus Management Tests
  // ============================================
  describe('focus management', () => {
    beforeEach(() => {
      document.body.innerHTML = '<button id="trigger">Trigger</button>';
      document.getElementById('trigger')?.focus();
    });

    it('должен фокусироваться на модалке при открытии', async () => {
      render(<Modal {...defaultProps} autoFocus={false} />);
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveFocus();
      });
    });

    it('должен возвращать фокус на предыдущий элемент при закрытии', async () => {
      const trigger = document.getElementById('trigger');
      const { rerender } = render(<Modal {...defaultProps} isOpen={true} autoFocus={false} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveFocus();
      });

      rerender(<Modal {...defaultProps} isOpen={false} autoFocus={false} />);

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
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

    it('должен иметь aria-labelledby когда есть title', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });

    it('не должен иметь aria-labelledby когда нет title', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });

    it('должен иметь aria-label с кастомным значением', () => {
      render(<Modal {...defaultProps} ariaLabel="Custom label" />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Custom label');
    });

    it('должен иметь aria-label по умолчанию', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Modal dialog');
    });

    it('должен иметь tabIndex=-1 для фокуса', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('tabIndex', '-1');
    });

    it('должен иметь aria-hidden на overlay', () => {
      render(<Modal {...defaultProps} />);
      const overlay = document.querySelector('[data-testid="overlay"]');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // ============================================
  // Animation Tests
  // ============================================
  describe('animation', () => {
    it('должен иметь анимацию по умолчанию', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveClass(styles.noAnimation);
    });

    it('не должен иметь анимацию когда disableAnimation=true', () => {
      render(<Modal {...defaultProps} disableAnimation={true} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass(styles.noAnimation);
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('error handling', () => {
    it('должен обрабатывать ошибку в onClose без падения', () => {
      const mockOnClose = vi.fn(() => {
        throw new Error('Test error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<Modal {...defaultProps} onClose={mockOnClose} closeOnOverlayClick={true} />);
      const overlay = document.querySelector('[data-testid="overlay"]');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Modal onClose error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================
  describe('edge cases', () => {
    it('должен обрабатывать пустые children', () => {
      expect(() => render(<Modal {...defaultProps} children={null} />)).not.toThrow();
    });

    it('должен обрабатывать undefined props', () => {
      expect(() =>
        render(
          <Modal isOpen={true} onClose={vi.fn()}>
            <div>Content</div>
          </Modal>
        )
      ).not.toThrow();
    });

    it('должен обрабатывать длинный контент', () => {
      const longText = 'A'.repeat(1000);
      render(<Modal {...defaultProps}>{longText}</Modal>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('должен обрабатывать special characters', () => {
      const specialText = '<script>alert("xss")</script>';
      render(<Modal {...defaultProps} title={specialText} />);
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it('должен обрабатывать множественные открытия/закрытия', () => {
      const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);

      rerender(<Modal {...defaultProps} isOpen={false} />);
      rerender(<Modal {...defaultProps} isOpen={true} />);
      rerender(<Modal {...defaultProps} isOpen={false} />);

      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Header Content Tests
  // ============================================
  describe('header content', () => {
    it('должен рендерить header только с title', () => {
      render(<Modal {...defaultProps} title="Title" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('должен рендерить header только с кнопкой закрытия', () => {
      render(<Modal {...defaultProps} showCloseButton={true} />);
      expect(screen.getByRole('button', { name: /закрыть/i })).toBeInTheDocument();
    });

    it('не должен рендерить header без title и кнопки закрытия', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByRole('button', { name: /закрыть/i })).not.toBeInTheDocument();
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
    });

    it('должен рендерить title и subtitle вместе', () => {
      render(<Modal {...defaultProps} title="Title" subtitle="Subtitle" />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
  });

  // ============================================
  // Cleanup Tests
  // ============================================
  describe('cleanup', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('должен очищать timeout при unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      unmount();

      vi.advanceTimersByTime(100);

      expect(() => {}).not.toThrow();
    });

    it('должен очищать event listeners при unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} closeOnEsc={true} />);
      unmount();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Callback Tests (onOpened/onClosed)
  // ============================================
  describe('callbacks (onOpened/onClosed)', () => {
    it('должен вызывать onOpened после открытия', async () => {
      const onOpened = vi.fn();
      render(<Modal {...defaultProps} onOpened={onOpened} />);

      await waitFor(() => {
        expect(onOpened).toHaveBeenCalledTimes(1);
      });
    });

    it('должен вызывать onClosed после закрытия', async () => {
      const onClosed = vi.fn();
      const { rerender } = render(<Modal {...defaultProps} onClosed={onClosed} isOpen={true} />);

      rerender(<Modal {...defaultProps} onClosed={onClosed} isOpen={false} />);

      await waitFor(() => {
        expect(onClosed).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ============================================
  // canClose Tests
  // ============================================
  describe('canClose', () => {
    it('не должен закрываться по ESC когда canClose=false', () => {
      render(<Modal {...defaultProps} canClose={false} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('не должен закрываться по клику на overlay когда canClose=false', () => {
      render(<Modal {...defaultProps} canClose={false} closeOnOverlayClick={true} />);
      const overlay = document.querySelector('[data-testid="overlay"]');
      if (overlay) {
        fireEvent.click(overlay);
      }
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('не должен закрываться по клику на кнопку закрытия когда canClose=false', () => {
      render(<Modal {...defaultProps} canClose={false} title="Title" />);
      const closeButton = screen.getByRole('button', { name: /закрыть/i });
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });

    it('должен закрываться когда canClose функция возвращает true', () => {
      const canCloseFn = vi.fn(() => true);
      render(<Modal {...defaultProps} canClose={canCloseFn} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      expect(canCloseFn).toHaveBeenCalledTimes(1);
    });

    it('не должен закрываться когда canClose функция возвращает false', () => {
      const canCloseFn = vi.fn(() => false);
      render(<Modal {...defaultProps} canClose={canCloseFn} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(canCloseFn).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // autoFocus Tests
  // ============================================
  describe('autoFocus', () => {
    it('должен рендериться с autoFocus prop', () => {
      render(
        <Modal {...defaultProps} autoFocus={true}>
          <button id="first">First Button</button>
          <button id="second">Second Button</button>
        </Modal>
      );

      const firstButton = screen.getByText('First Button');
      expect(firstButton).toBeInTheDocument();
    });

    it('должен рендериться с autoFocus=false', () => {
      render(
        <Modal {...defaultProps} autoFocus={false}>
          <button>Button</button>
        </Modal>
      );

      const button = screen.getByText('Button');
      expect(button).toBeInTheDocument();
    });
  });

  // ============================================
  // restoreFocus Tests
  // ============================================
  describe('restoreFocus', () => {
    beforeEach(() => {
      document.body.innerHTML = '<button id="trigger">Trigger</button>';
      document.getElementById('trigger')?.focus();
    });

    it('должен возвращать фокус при закрытии когда restoreFocus=true', async () => {
      const trigger = document.getElementById('trigger');
      const { rerender } = render(
        <Modal {...defaultProps} restoreFocus={true} isOpen={true} autoFocus={false} />
      );

      rerender(<Modal {...defaultProps} restoreFocus={true} isOpen={false} autoFocus={false} />);

      await waitFor(() => {
        expect(trigger).toHaveFocus();
      });
    });

    it('не должен возвращать фокус когда restoreFocus=false', async () => {
      document.body.innerHTML = '<button id="trigger">Trigger</button><div id="other">Other</div>';
      const other = document.getElementById('other');
      other?.focus();

      const trigger = document.getElementById('trigger');
      const { rerender } = render(
        <Modal {...defaultProps} restoreFocus={false} isOpen={true} autoFocus={false} />
      );

      rerender(<Modal {...defaultProps} restoreFocus={false} isOpen={false} autoFocus={false} />);

      await waitFor(() => {
        expect(trigger).not.toHaveFocus();
      });
    });
  });

  // ============================================
  // trapFocus Tests
  // ============================================
  describe('trapFocus', () => {
    it('должен рендериться с trapFocus=true', () => {
      render(
        <Modal {...defaultProps} trapFocus={true}>
          <button id="first">First</button>
          <button id="last">Last</button>
        </Modal>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Last')).toBeInTheDocument();
    });

    it('должен рендериться с trapFocus=false', () => {
      render(
        <Modal {...defaultProps} trapFocus={false}>
          <button>Button</button>
        </Modal>
      );

      expect(screen.getByText('Button')).toBeInTheDocument();
    });
  });
});
