// ============================================
// ToastContext Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { ToastProvider } from './ToastContext';
import { useToast } from '../lib/hooks/useToast';
import { TOAST_CONSTANTS } from '@/shared/ui/Toast/model/constants';

// ============================================
// Test Helpers
// ============================================

/** Clean up stray toasts from Portal renders */
const cleanupToasts = () => {
  document.body.querySelectorAll('[data-testid="toast"]').forEach((el) => el.remove());
};

/** Render hook with ToastProvider wrapper */
const renderToastHook = () => renderHook(() => useToast(), { wrapper: ToastProvider });

// ============================================
// ToastProvider Tests
// ============================================

describe('ToastProvider', () => {
  afterEach(() => {
    cleanupToasts();
  });

  // ---------- Provider Rendering ----------

  describe('Provider rendering', () => {
    it('должен рендерить дочерние элементы', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child Content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('должен рендерить детей с несколькими компонентами', () => {
      render(
        <ToastProvider>
          <span data-testid="child-1">First</span>
          <span data-testid="child-2">Second</span>
        </ToastProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
  });

  // ---------- Toast Addition ----------

  describe('Toast addition', () => {
    it('должен показывать toast при вызове addToast', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Test message', type: 'success' });
      });

      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });

    it('должен отображать правильный message в toast', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Hello World', type: 'success' });
      });

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('должен отображать правильный data-type для success', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Test', type: 'success' });
      });

      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
    });

    it('должен отображать правильный data-type для error', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Error occurred', type: 'error' });
      });

      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
    });

    it('должен отображать toast с кастомным типом и duration', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Warning message', type: 'warning', duration: 3000 });
      });

      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'warning');
      expect(screen.getByTestId('toast-progress')).toBeInTheDocument();
    });

    it('должен показывать progress bar по умолчанию', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'With progress', type: 'info', duration: 5000 });
      });

      expect(screen.getByTestId('toast-progress')).toBeInTheDocument();
    });
  });

  // ---------- Toast Removal ----------

  describe('Toast removal', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('должен удалять toast после auto-close', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Auto-close test', type: 'info', duration: 3000 });
      });

      expect(screen.getByTestId('toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000 + TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
      });

      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });

    it('должен удалять toast при клике на close button', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Closable', type: 'success' });
      });

      expect(screen.getByTestId('toast')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('toast-close'));

      // Toast should still be visible during exit animation
      expect(screen.getByTestId('toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
      });

      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });

    it('должен поддерживать множественные toast уведомления', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Toast 1', type: 'success' });
        result.current.addToast({ message: 'Toast 2', type: 'error' });
        result.current.addToast({ message: 'Toast 3', type: 'info' });
      });

      const toasts = document.querySelectorAll('[data-testid="toast"]');
      expect(toasts.length).toBe(3);
    });

    it('должен не удалять toast при вызове removeToast с несуществующим id', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Persistent toast', type: 'info' });
      });

      expect(screen.getByText('Persistent toast')).toBeInTheDocument();

      act(() => {
        result.current.removeToast('non-existent-id');
      });

      // Toast should still be present
      expect(screen.getByText('Persistent toast')).toBeInTheDocument();
    });
  });

  // ---------- Accessibility ----------

  describe('Accessibility', () => {
    it('должен иметь container с aria-label="Notifications"', () => {
      render(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );

      const notificationContainer = document.querySelector('[aria-label="Notifications"]');
      expect(notificationContainer).toBeInTheDocument();
    });

    it('должен рендерить toast с role="alert"', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Accessible toast', type: 'success' });
      });

      expect(screen.getByTestId('toast')).toHaveAttribute('role', 'alert');
    });
  });
});

// ============================================
// useToast Hook Tests
// ============================================

describe('useToast Hook', () => {
  it('должен возвращать addToast и removeToast внутри ToastProvider', () => {
    const TestComponent = () => {
      const ctx = useToast();
      expect(typeof ctx.addToast).toBe('function');
      expect(typeof ctx.removeToast).toBe('function');
      return <div>Test</div>;
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );
  });

  it('должен выбрасывать ошибку вне ToastProvider', () => {
    const TestOutsideProvider = () => {
      const { addToast } = useToast();
      return (
        <button
          data-testid="outside-btn"
          onClick={() => addToast({ message: 'test', type: 'info' })}
        >
          Click
        </button>
      );
    };

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestOutsideProvider />);
    }).toThrow('useToast must be used within ToastProvider');

    errorSpy.mockRestore();
  });

  it('должен корректно работать с несколькими дочерними компонентами', () => {
    const ContextReader = ({ testId }: { testId: string }) => {
      const { addToast } = useToast();
      return (
        <button
          data-testid={testId}
          onClick={() => addToast({ message: `Toast from ${testId}`, type: 'info' })}
        >
          Add
        </button>
      );
    };

    render(
      <ToastProvider>
        <ContextReader testId="consumer-1" />
        <ContextReader testId="consumer-2" />
      </ToastProvider>
    );

    expect(screen.getByTestId('consumer-1')).toBeInTheDocument();
    expect(screen.getByTestId('consumer-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('consumer-1'));
    expect(screen.getByText('Toast from consumer-1')).toBeInTheDocument();
  });

  describe('clearAll', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('должен быть доступен через useToast хук', () => {
      const { result } = renderToastHook();

      expect(result.current.clearAll).toBeDefined();
      expect(typeof result.current.clearAll).toBe('function');
    });

    it('должен закрывать все toast', async () => {
      const { result } = renderToastHook();

      // Add 2 toasts
      act(() => {
        result.current.addToast({ message: 'Test', type: 'info' });
        result.current.addToast({ message: 'Test 2', type: 'success' });
      });

      expect(screen.getAllByTestId('toast')).toHaveLength(2);

      // Call clearAll
      act(() => {
        result.current.clearAll();
      });

      // Toasts should start closing (exit animation)
      expect(screen.getAllByTestId('toast')).toHaveLength(2);
    });

    it('должен удалять все toast после exit animation', () => {
      const { result } = renderToastHook();

      act(() => {
        result.current.addToast({ message: 'Test', type: 'info' });
        result.current.addToast({ message: 'Test 2', type: 'success' });
      });

      expect(screen.getAllByTestId('toast')).toHaveLength(2);

      act(() => {
        result.current.clearAll();
      });

      // During exit animation toasts remain in the DOM with closing state
      expect(screen.getAllByTestId('toast')).toHaveLength(2);

      // After the exit animation the state is cleared
      act(() => {
        vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
      });

      expect(screen.queryAllByTestId('toast')).toHaveLength(0);
    });

    it('должен работать когда toast пуст', () => {
      const { result } = renderToastHook();

      // Should not throw when no toasts
      expect(() => result.current.clearAll()).not.toThrow();
    });
  });
});

// ============================================
// Type-surface probes (@ts-expect-error)
// ============================================

// Type probes — these tests verify that invalid types are rejected at compile time.
// Each test contains a @ts-expect-error directive that MUST be consumed by a type error.
// If the directive is unused, type-check:strict will fail.

describe('useToast Hook Type Probes', () => {
  // Helper to force type inference
  const asNumber = (n: number) => n;
  const asInvalidType = () => 'not-a-valid-type' as string;

  it('@ts-expect-error: message must be a string', () => {
    const { result } = renderToastHook();
    // @ts-expect-error — message property requires a string (or ToastMessage), not number
    result.current.addToast({ message: asNumber(42), type: 'success' });
  });

  it('@ts-expect-error: invalid ToastType rejected', () => {
    const { result } = renderToastHook();
    // @ts-expect-error — type must be a valid ToastType literal, not arbitrary string
    result.current.addToast({ message: 'x', type: asInvalidType() });
  });

  it('@ts-expect-error: removeToast id must be string', () => {
    const { result } = renderToastHook();
    // @ts-expect-error — id parameter requires a string, not number
    result.current.removeToast(asNumber(123));
  });
});
