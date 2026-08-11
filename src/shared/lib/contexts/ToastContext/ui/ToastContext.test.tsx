// ============================================
// ToastContext Tests
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useEffect } from 'react';
import { ToastProvider } from './ToastContext';
import { useToast } from '../lib/hooks/useToast';
import type { ToastType } from '@/shared/ui/Toast/model/types';
import { TOAST_CONSTANTS } from '@/shared/ui/Toast/model/constants';

// ============================================
// Test Helpers
// ============================================

/** Helper to capture addToast from context */
const createAddToastHelper = () => {
  let addToastFn!: (message: string, type?: ToastType, duration?: number) => void;

  const Helper = () => {
    const { addToast } = useToast();
    useEffect(() => {
      addToastFn = addToast;
    }, [addToast]);
    return null;
  };

  return { Helper, addToast: () => addToastFn };
};

/** Helper to capture both addToast and removeToast */
const createToastHelpers = () => {
  let addToastFn!: (message: string, type?: ToastType, duration?: number) => void;
  let removeToastFn!: (id: string) => void;

  const Helper = () => {
    const { addToast, removeToast } = useToast();
    useEffect(() => {
      addToastFn = addToast;
      removeToastFn = removeToast;
    }, [addToast, removeToast]);
    return null;
  };

  return { Helper, addToast: () => addToastFn, removeToast: () => removeToastFn };
};

/** Clean up stray toasts from Portal renders */
const cleanupToasts = () => {
  document.body.querySelectorAll('[data-testid="toast"]').forEach((el) => el.remove());
};

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
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Test message', 'success');
      });

      expect(screen.getByTestId('toast')).toBeInTheDocument();
    });

    it('должен отображать правильный message в toast', () => {
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Hello World', 'success');
      });

      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('должен отображать правильный data-type для success', () => {
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Test', 'success');
      });

      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
    });

    it('должен отображать правильный data-type для error', () => {
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Error occurred', 'error');
      });

      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
    });

    it('должен отображать toast с кастомным типом и duration', () => {
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Warning message', 'warning', 3000);
      });

      expect(screen.getByText('Warning message')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'warning');
      expect(screen.getByTestId('toast-progress')).toBeInTheDocument();
    });

    it('должен показывать progress bar по умолчанию', () => {
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('With progress', 'info', 5000);
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
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Auto-close test', 'info', 3000);
      });

      expect(screen.getByTestId('toast')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(3000 + TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
      });

      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });

    it('должен удалять toast при клике на close button', () => {
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Closable', 'success');
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
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Toast 1', 'success');
        addToast()('Toast 2', 'error');
        addToast()('Toast 3', 'info');
      });

      const toasts = document.querySelectorAll('[data-testid="toast"]');
      expect(toasts.length).toBe(3);
    });

    it('должен не удалять toast при вызове removeToast с несуществующим id', () => {
      const { Helper, addToast, removeToast } = createToastHelpers();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Persistent toast', 'info');
      });

      expect(screen.getByText('Persistent toast')).toBeInTheDocument();

      act(() => {
        removeToast()('non-existent-id');
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
      const { Helper, addToast } = createAddToastHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      act(() => {
        addToast()('Accessible toast', 'success');
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
        <button data-testid="outside-btn" onClick={() => addToast('test', 'info')}>
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
        <button data-testid={testId} onClick={() => addToast(`Toast from ${testId}`, 'info')}>
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
    const createClearAllHelper = () => {
      let clearAllFn!: () => void;

      const Helper = () => {
        const { clearAll } = useToast();
        useEffect(() => {
          clearAllFn = clearAll;
        }, [clearAll]);
        return null;
      };

      return { Helper, clearAll: () => clearAllFn };
    };

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('должен быть доступен через useToast хук', () => {
      const { Helper, clearAll } = createClearAllHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      expect(clearAll).toBeDefined();
      expect(typeof clearAll).toBe('function');
    });

    it('должен закрывать все toast', async () => {
      const { Helper, clearAll } = createClearAllHelper();
      const helpers = createAddToastHelper();

      render(
        <ToastProvider>
          <helpers.Helper />
          <Helper />
        </ToastProvider>
      );

      // Add 2 toasts
      act(() => {
        helpers.addToast()('Test', 'info');
        helpers.addToast()('Test 2', 'success');
      });

      expect(screen.getAllByTestId('toast')).toHaveLength(2);

      // Call clearAll
      act(() => {
        clearAll()();
      });

      // Toasts should start closing (exit animation)
      expect(screen.getAllByTestId('toast')).toHaveLength(2);
    });

    it('должен удалять все toast после exit animation', () => {
      const { Helper, clearAll } = createClearAllHelper();
      const helpers = createAddToastHelper();

      render(
        <ToastProvider>
          <helpers.Helper />
          <Helper />
        </ToastProvider>
      );

      act(() => {
        helpers.addToast()('Test', 'info');
        helpers.addToast()('Test 2', 'success');
      });

      expect(screen.getAllByTestId('toast')).toHaveLength(2);

      act(() => {
        clearAll()();
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
      const { Helper, clearAll } = createClearAllHelper();

      render(
        <ToastProvider>
          <Helper />
        </ToastProvider>
      );

      // Should not throw when no toasts
      expect(() => clearAll()()).not.toThrow();
    });
  });
});
