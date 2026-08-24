// ============================================
// Toast A11y Tests (TOAST-09)
// Focus management (autofocus / restore) + Escape dismissal
// ============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toast } from './Toast';
import { TOAST_CONSTANTS } from '../model/constants';
import styles from './Toast.module.scss';

// ============================================
// Focus management
// ============================================

describe('Toast a11y: focus management', () => {
  it('autofocuses the close button on mount when nothing else is focused', () => {
    render(<Toast id="a11y-1" message="Focus me" type="info" duration={0} onClose={vi.fn()} />);

    expect(document.activeElement).toBe(screen.getByTestId('toast-close'));
  });

  it('does not steal focus when another element already has it', () => {
    render(<button type="button">Trigger</button>);
    const trigger = screen.getByRole('button', { name: 'Trigger' });
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    render(<Toast id="a11y-2" message="Do not steal" type="info" duration={0} onClose={vi.fn()} />);

    expect(document.activeElement).toBe(trigger);
  });

  it('restores focus to the previous element on unmount when focus is still in the toast', () => {
    const { unmount } = render(
      <Toast id="a11y-3" message="Restore" type="info" duration={0} onClose={vi.fn()} />
    );
    expect(document.activeElement).toBe(screen.getByTestId('toast-close'));

    unmount();

    expect(document.activeElement).toBe(document.body);
  });

  it('does not yank focus on unmount when the user already moved focus away', () => {
    const { unmount } = render(
      <Toast id="a11y-4" message="Leave me" type="info" duration={0} onClose={vi.fn()} />
    );
    // Close button was autofocused on mount
    expect(document.activeElement).toBe(screen.getByTestId('toast-close'));

    // User moves focus to an unrelated element while the toast is still visible
    render(<button type="button">Elsewhere</button>);
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    elsewhere.focus();

    unmount();

    expect(document.activeElement).toBe(elsewhere);
  });
});

// ============================================
// Escape-key dismissal
// ============================================

describe('Toast a11y: Escape dismissal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('closes the toast on document Escape keydown', () => {
    const onClose = vi.fn();
    render(<Toast id="esc-1" message="Dismiss me" type="info" duration={0} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.getByTestId('toast').className).toContain(styles.closing);

    act(() => {
      vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('esc-1');
  });

  it('is ignored for non-Escape keys', () => {
    const onClose = vi.fn();
    render(<Toast id="esc-2" message="Safe" type="info" duration={0} onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'a' });

    act(() => {
      vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('is ignored once closing has already started', () => {
    const onClose = vi.fn();
    render(<Toast id="esc-3" message="Once" type="info" duration={0} onClose={onClose} />);

    // Manual close starts the exit; the Escape listener re-registers with isClosing=true
    fireEvent.click(screen.getByTestId('toast-close'));
    fireEvent.keyDown(document, { key: 'Escape' });

    act(() => {
      vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not double-close when forceClose already started the exit', () => {
    const onClose = vi.fn();
    render(
      <Toast id="esc-4" message="Forced" type="info" duration={0} forceClose onClose={onClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    act(() => {
      vi.advanceTimersByTime(TOAST_CONSTANTS.EXIT_ANIMATION_DURATION);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
