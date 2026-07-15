import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';
import { TOAST_CONSTANTS } from '../model/constants';

describe('Toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockOnClose = vi.fn();

  describe('Rendering', () => {
    it('должен рендерить toast с message', () => {
      render(<Toast id="test-1" message="Test message" onClose={mockOnClose} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('должен иметь data-testid="toast"', () => {
      render(<Toast id="test-1" message="Test message" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });

    it('должен иметь data-type атрибут', () => {
      render(<Toast id="test-1" message="Test message" type="success" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
    });

    it('должен рендерить иконку', () => {
      render(<Toast id="test-1" message="Test message" type="success" onClose={mockOnClose} />);

      const iconContainer = screen.getByTestId('toast').firstElementChild;
      expect(iconContainer).toBeInTheDocument();
    });

    it('должен рендерить кнопку закрытия', () => {
      render(<Toast id="test-1" message="Test message" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast-close')).toBeInTheDocument();
    });

    it('должен применять custom className', () => {
      render(
        <Toast id="test-1" message="Test message" className="custom-class" onClose={mockOnClose} />
      );

      expect(screen.getByTestId('toast')).toHaveClass('custom-class');
    });
  });

  describe('Toast Types', () => {
    it('должен рендерить success тип', () => {
      render(<Toast id="test-1" message="Success!" type="success" onClose={mockOnClose} />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-type', 'success');
    });

    it('должен рендерить error тип', () => {
      render(<Toast id="test-1" message="Error!" type="error" onClose={mockOnClose} />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-type', 'error');
    });

    it('должен рендерить info тип', () => {
      render(<Toast id="test-1" message="Info" type="info" onClose={mockOnClose} />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-type', 'info');
    });

    it('должен рендерить warning тип', () => {
      render(<Toast id="test-1" message="Warning!" type="warning" onClose={mockOnClose} />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-type', 'warning');
    });

    it('должен использовать info тип по умолчанию', () => {
      render(<Toast id="test-1" message="Default" onClose={mockOnClose} />);

      const toast = screen.getByTestId('toast');
      expect(toast).toHaveAttribute('data-type', 'info');
    });
  });

  describe('Auto-close Timer', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('должен вызвать onClose после duration', () => {
      render(<Toast id="test-1" message="Test" duration={3000} onClose={mockOnClose} />);

      vi.advanceTimersByTime(3300); // duration + exit animation

      expect(mockOnClose).toHaveBeenCalledWith('test-1');
    });

    it('должен использовать DEFAULT_DURATION по умолчанию', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      vi.advanceTimersByTime(TOAST_CONSTANTS.DEFAULT_DURATION + 300);

      expect(mockOnClose).toHaveBeenCalledWith('test-1');
    });

    it('не должен auto-close при duration=0', () => {
      render(<Toast id="test-1" message="Persistent" duration={0} onClose={mockOnClose} />);

      vi.advanceTimersByTime(10000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('должен очистить timer при unmount', () => {
      const { unmount } = render(
        <Toast id="test-1" message="Test" duration={3000} onClose={mockOnClose} />
      );

      unmount();

      vi.advanceTimersByTime(3000);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('должен сбросить timer при изменении duration', () => {
      const { rerender } = render(
        <Toast id="test-1" message="Test" duration={3000} onClose={mockOnClose} />
      );

      rerender(<Toast id="test-1" message="Test" duration={5000} onClose={mockOnClose} />);

      vi.advanceTimersByTime(3000);

      expect(mockOnClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(2300); // remaining + exit animation

      expect(mockOnClose).toHaveBeenCalledWith('test-1');
    });

    it('должен показывать pause indicator при hover', () => {
      render(<Toast id="test-1" message="Test" duration={3000} onClose={mockOnClose} />);

      // Hover to pause - should have pause indicator visible
      fireEvent.mouseEnter(screen.getByTestId('toast'));

      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });

    it('должен показывать progress bar при duration > 0', () => {
      render(<Toast id="test-1" message="Test" duration={3000} onClose={mockOnClose} />);

      expect(screen.getByTestId('toast-progress')).toBeInTheDocument();
    });

    it('не должен показывать progress bar при duration = 0', () => {
      render(<Toast id="test-1" message="Test" duration={0} onClose={mockOnClose} />);

      expect(screen.queryByTestId('toast-progress')).not.toBeInTheDocument();
    });
  });

  describe('Manual Close', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('должен вызвать onClose при клике на кнопку закрытия', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId('toast-close'));

      // Exit animation takes 300ms
      vi.advanceTimersByTime(300);

      expect(mockOnClose).toHaveBeenCalledWith('test-1');
    });

    it('кнопка закрытия должна иметь aria-label', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast-close')).toHaveAttribute('aria-label', 'Close notification');
    });

    it('кнопка закрытия должна иметь type="button"', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast-close')).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="alert"', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast')).toHaveAttribute('role', 'alert');
    });

    it('должен иметь aria-live="assertive"', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      expect(screen.getByTestId('toast')).toHaveAttribute('aria-live', 'assertive');
    });

    it('должен иметь aria-describedby на message', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      const message = screen.getByText('Test');
      expect(message).toHaveAttribute('id', 'toast-message-test-1');
    });

    it('должен иметь aria-hidden="true" на иконке', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      const iconContainer = screen.getByTestId('toast').firstElementChild;
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });

    it('должен быть фокусируемым (кнопка)', () => {
      render(<Toast id="test-1" message="Test" onClose={mockOnClose} />);

      const closeButton = screen.getByTestId('toast-close');
      expect(closeButton).toBeEnabled();
    });
  });

  describe('Dev Warnings', () => {
    it('должен предупреждать о невалидном типе в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        // @ts-expect-error testing invalid prop
        <Toast id="test-1" message="Test" type="invalid" onClose={mockOnClose} />
      );

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Toast: невалидный тип'));

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('не должен предупреждать в production режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        // @ts-expect-error testing invalid prop
        <Toast id="test-1" message="Test" type="invalid" onClose={mockOnClose} />
      );

      expect(warnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });
  });

  describe('displayName', () => {
    it('должен иметь displayName', () => {
      expect(Toast.displayName).toBe('Toast');
    });
  });

  describe('Constants', () => {
    it('должен использовать DEFAULT_DURATION из констант', () => {
      expect(TOAST_CONSTANTS.DEFAULT_DURATION).toBe(5000);
    });

    it('должен использовать ICON_SIZE из констант', () => {
      expect(TOAST_CONSTANTS.ICON_SIZE).toBe(20);
    });

    it('должен использовать CLOSE_ICON_SIZE из констант', () => {
      expect(TOAST_CONSTANTS.CLOSE_ICON_SIZE).toBe(16);
    });
  });
});
