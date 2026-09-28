// ============================================
// useModalRoot — close scheduling tests (M6 reopen race / stuck-closing)
// ============================================
//
// The hook keeps a `forceMount` dialog mounted during the exit delay and marks
// it with `isClosing` (→ `.closing` class + pointer-events: none). These tests
// pin down the scheduling contract with fake timers:
//   - close arms exactly one timer (MODAL_CLOSE_DURATION_MS)
//   - reopening during the exit delay CANCELS it (no stuck `.closing`)
//   - disableAnimation / prefers-reduced-motion skip the delay entirely
//   - StrictMode double-invoke does not break scheduling

import { StrictMode, type ReactNode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MODAL_CLOSE_DURATION_MS } from '../../model/constants';
import type { ModalRootProps } from '../../model/types';
import styles from '../../ui/ModalRoot/ModalRoot.module.scss';
import { resetLayerManager } from '../layerManager';
import { resetOpenCount, useModalRoot } from './useModalRoot';

type HookProps = ModalRootProps;

const renderModalRoot = (initialProps: HookProps) =>
  renderHook((props: HookProps) => useModalRoot(props), { initialProps });

const strictWrapper = ({ children }: { children: ReactNode }) => (
  <StrictMode>{children}</StrictMode>
);

// Same module object the hook uses → assertions are self-consistent with however
// the CSS-module proxy resolves the `closing` key under test.
const closingClass = styles.closing;

describe('useModalRoot close scheduling (M6)', () => {
  // Typed mock: assignable to ModalRootProps['onClose'] (bare vi.fn() infers
  // Mock<Procedure | Constructable>, which tsc rejects).
  const onClose = vi.fn<() => void>();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    resetOpenCount();
    resetLayerManager();
  });

  afterEach(() => {
    cleanup();
    resetOpenCount();
    resetLayerManager();
    document.body.style.overflow = '';
    vi.useRealTimers();
  });

  it('arms the exit delay on close and completes it after MODAL_CLOSE_DURATION_MS', () => {
    const { result, rerender } = renderModalRoot({
      children: null,
      isOpen: true,
      onClose,
      forceMount: true,
    });
    expect(result.current.isClosing).toBe(false);

    // Close → exit delay starts, `.closing` applies
    rerender({ children: null, isOpen: false, onClose, forceMount: true });
    expect(result.current.isClosing).toBe(true);
    expect(result.current.modalClassName).toContain(closingClass);
    expect(vi.getTimerCount()).toBe(1);

    // Timer completes the close
    act(() => {
      vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS);
    });
    expect(result.current.isClosing).toBe(false);
    expect(result.current.modalClassName).not.toContain(closingClass);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cancels the pending close when the modal reopens during the exit delay', () => {
    const { result, rerender } = renderModalRoot({
      children: null,
      isOpen: true,
      onClose,
      forceMount: true,
    });

    // Close → exit delay starts
    rerender({ children: null, isOpen: false, onClose, forceMount: true });
    expect(result.current.isClosing).toBe(true);

    // Reopen mid-delay (reopen race M6)
    act(() => {
      vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS / 2);
    });
    rerender({ children: null, isOpen: true, onClose, forceMount: true });

    expect(result.current.isClosing).toBe(false);
    expect(result.current.modalClassName).not.toContain(closingClass);
    expect(vi.getTimerCount()).toBe(0); // pending timer cleared

    // A stale callback must not resurrect the closing state
    act(() => {
      vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS * 2);
    });
    expect(result.current.isClosing).toBe(false);
    expect(result.current.modalClassName).not.toContain(closingClass);
  });

  it('closes without delay when disableAnimation is true', () => {
    const { result, rerender } = renderModalRoot({
      children: null,
      isOpen: true,
      onClose,
      forceMount: true,
      disableAnimation: true,
    });

    rerender({
      children: null,
      isOpen: false,
      onClose,
      forceMount: true,
      disableAnimation: true,
    });

    expect(result.current.isClosing).toBe(false);
    expect(result.current.modalClassName).not.toContain(closingClass);
    expect(vi.getTimerCount()).toBe(0); // no exit timer armed

    act(() => {
      vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS * 2);
    });
    expect(result.current.isClosing).toBe(false);
  });

  it('closes without delay when prefers-reduced-motion matches', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    try {
      const { result, rerender } = renderModalRoot({
        children: null,
        isOpen: true,
        onClose,
        forceMount: true,
      });

      rerender({ children: null, isOpen: false, onClose, forceMount: true });

      expect(result.current.isClosing).toBe(false);
      expect(result.current.modalClassName).not.toContain(closingClass);
      expect(vi.getTimerCount()).toBe(0);

      act(() => {
        vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS * 2);
      });
      expect(result.current.isClosing).toBe(false);
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it('survives StrictMode double-invoke: reopen during exit delay cancels cleanly', () => {
    const initialProps: HookProps = {
      children: null,
      isOpen: true,
      onClose,
      forceMount: true,
    };
    const { result, rerender } = renderHook((props: HookProps) => useModalRoot(props), {
      initialProps,
      wrapper: strictWrapper,
    });

    // Close → exactly one pending timer (no double-arming from re-invoked effects)
    rerender({ children: null, isOpen: false, onClose, forceMount: true });
    expect(result.current.isClosing).toBe(true);
    expect(vi.getTimerCount()).toBe(1);

    // Reopen during exit delay → cancelled, no stale timer left behind
    rerender({ children: null, isOpen: true, onClose, forceMount: true });
    expect(result.current.isClosing).toBe(false);
    expect(result.current.modalClassName).not.toContain(closingClass);
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      vi.advanceTimersByTime(MODAL_CLOSE_DURATION_MS * 2);
    });
    expect(result.current.isClosing).toBe(false);
  });

  // SLICE-TODO (later slice — out of M6 scope): currently FAILS. The
  // focus/onClosed effect lists `onOpened`/`onClosed` (and focus refs) in its
  // dependency array, so a callback identity change while open runs the effect
  // cleanup and spuriously fires onClosed. Fixing it requires reworking that
  // effect's deps (latest-callback refs) — deferred to the follow-up slice.
  it('does not fire onClosed when callback identity changes while open', () => {
    const firstOnClosed = vi.fn<() => void>();
    const { rerender } = renderModalRoot({
      children: null,
      isOpen: true,
      onClose,
      onClosed: firstOnClosed,
    });

    const secondOnClosed = vi.fn<() => void>();
    rerender({
      children: null,
      isOpen: true,
      onClose,
      onClosed: secondOnClosed,
    });

    expect(firstOnClosed).not.toHaveBeenCalled();
    expect(secondOnClosed).not.toHaveBeenCalled();
  });
});
