// ============================================
// Toast Improvements Tests (PR1 — Object API)
// TOAST-01/14 — RED suite against positional addToast.
// Turns GREEN after the ToastOptions union + object-form
// addToast(options): string land in the context slice.
// ============================================

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useEffect } from 'react';
import { ToastProvider } from '@/shared/lib/contexts/ToastContext/ui/ToastContext';
import { useToast } from '@/shared/lib/contexts/ToastContext/lib/hooks/useToast';
import type { ToastContextType } from '@/shared/lib/contexts/ToastContext/model/types';
import { TOAST_CONSTANTS } from '../model/constants';
import type { ToastOptions } from '../model/types';
import { Toast } from './Toast';
import styles from './Toast.module.scss';

// ============================================
// Test Helpers
// ============================================

/** Capture object-form addToast from context */
const createAddToastOptionsHelper = () => {
  let addToastFn!: (options: ToastOptions) => string;

  const Helper = () => {
    const { addToast } = useToast();
    useEffect(() => {
      addToastFn = addToast;
    }, [addToast]);
    return null;
  };

  return { Helper, addToast: () => addToastFn };
};

/** Clean up stray toasts from Portal renders */
const cleanupToasts = () => {
  document.body.querySelectorAll('[data-testid="toast"]').forEach((el) => el.remove());
};

// ============================================
// Compile-time type-surface probes (TOAST-14)
// ============================================

describe('useToast type-surface probes (compile-time)', () => {
  type ProbeAddToast = ToastContextType['addToast'];

  it('rejects loading + action combination', () => {
    const invalid: ToastOptions = {
      message: 'Loading...',
      type: 'loading',
      // @ts-expect-error — the loading variant forbids action (only the promise API may pass duration)
      action: { label: 'Undo', onClick: () => undefined },
    };
    void invalid;
  });

  it('rejects positional addToast calls', () => {
    // @ts-expect-error — addToast accepts an options object (positional signature removed)
    const positional: Parameters<ProbeAddToast>[0] = 'message';
    void positional;
  });
});

// ============================================
// Object-form addToast — runtime scenarios (TOAST-01)
// ============================================

describe('object-form addToast (runtime)', () => {
  afterEach(() => {
    cleanupToasts();
  });

  const renderToast = () => {
    const { Helper, addToast } = createAddToastOptionsHelper();
    render(
      <ToastProvider>
        <Helper />
      </ToastProvider>
    );
    return { addToast };
  };

  it('accepts an options object and renders the toast with data-type', () => {
    const { addToast } = renderToast();

    let toastId = '';
    act(() => {
      toastId = addToast()({ message: 'Operation complete', type: 'success' });
    });

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveAttribute('data-type', 'success');
    expect(toast).toHaveTextContent('Operation complete');
    expect(toastId).toBeTypeOf('string');
    expect(toastId).not.toBe('');
  });

  it('defaults to info type and DEFAULT_DURATION when only message is given', () => {
    const { addToast } = renderToast();

    act(() => {
      addToast()({ message: 'Hello' });
    });

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveAttribute('data-type', 'info');
    expect(toast).toHaveTextContent('Hello');

    const progress = screen.getByTestId('toast-progress');
    expect(progress).toHaveStyle({ animationDuration: `${TOAST_CONSTANTS.DEFAULT_DURATION}ms` });
  });

  it('forwards action and explicit id', () => {
    const { addToast } = renderToast();
    const actionSpy = vi.fn();

    act(() => {
      addToast()({
        id: 'custom-1',
        message: 'With action',
        action: { label: 'Undo', onClick: actionSpy },
      });
    });

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveTextContent('With action');

    const actionBtn = screen.getByRole('button', { name: 'Undo' });
    fireEvent.click(actionBtn);
    expect(actionSpy).toHaveBeenCalledTimes(1);

    const messageEl = screen.getByText('With action');
    expect(messageEl.getAttribute('id')).toBe('toast-message-custom-1');
  });

  it('returns the id that is used in the rendered toast', () => {
    const { addToast } = renderToast();

    let toastId = '';
    act(() => {
      toastId = addToast()({ message: 'Sync check' });
    });

    const messageEl = screen.getByText('Sync check');
    expect(messageEl.getAttribute('id')).toBe(`toast-message-${toastId}`);
  });
});

// ============================================
// Swipe-to-dismiss gestures (point #7)
// Toast rendered directly (no context), duration=0 → only gesture-driven close
// ============================================

describe('Toast swipe-to-dismiss gestures', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderToast = (onClose: () => void) =>
    render(<Toast id="swipe-1" message="Swipe me" type="info" duration={0} onClose={onClose} />);

  it('closes when swiped left past the threshold', () => {
    const onClose = vi.fn();
    const { container } = renderToast(onClose);
    const toast = container.querySelector('[data-testid="toast"]') as HTMLElement;

    fireEvent.pointerDown(toast, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(toast, { clientX: 100, clientY: 100 });
    fireEvent.pointerUp(toast);

    // Exceeds SWIPE_THRESHOLD (80) → closing animation starts
    expect(toast.className).toContain(styles.closing);

    act(() => {
      vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('swipe-1');
  });

  it('springs back when the swipe stays under the threshold', () => {
    const onClose = vi.fn();
    const { container } = renderToast(onClose);
    const toast = container.querySelector('[data-testid="toast"]') as HTMLElement;

    fireEvent.pointerDown(toast, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(toast, { clientX: 150, clientY: 100 });
    fireEvent.pointerUp(toast);

    expect(toast.className).not.toContain(styles.closing);
    // Offset reset to 0 → no inline transform remains
    expect(toast.style.transform).toBe('');

    act(() => {
      vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('does not intercept vertical drags (scroll passes through)', () => {
    const onClose = vi.fn();
    const { container } = renderToast(onClose);
    const toast = container.querySelector('[data-testid="toast"]') as HTMLElement;

    fireEvent.pointerDown(toast, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(toast, { clientX: 200, clientY: 160 });
    fireEvent.pointerUp(toast);

    expect(toast.className).not.toContain(styles.dragging);
    expect(toast.style.transform).toBe('');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('is a noop for down/up without movement', () => {
    const onClose = vi.fn();
    const { container } = renderToast(onClose);
    const toast = container.querySelector('[data-testid="toast"]') as HTMLElement;

    fireEvent.pointerDown(toast, { clientX: 200, clientY: 100 });
    fireEvent.pointerUp(toast);

    expect(toast.className).not.toContain(styles.closing);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies the dragging class and inline transform while dragging', () => {
    const onClose = vi.fn();
    const { container } = renderToast(onClose);
    const toast = container.querySelector('[data-testid="toast"]') as HTMLElement;

    fireEvent.pointerDown(toast, { clientX: 200, clientY: 100 });
    fireEvent.pointerMove(toast, { clientX: 140, clientY: 100 });

    expect(toast.className).toContain(styles.dragging);
    expect(toast).toHaveStyle({ transform: 'translateX(-60px)' });

    fireEvent.pointerUp(toast);
    expect(toast.className).not.toContain(styles.dragging);
    expect(toast.style.transform).toBe('');
  });
});
