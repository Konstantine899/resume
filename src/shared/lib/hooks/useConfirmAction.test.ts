import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useConfirmAction } from './useConfirmAction';

describe('useConfirmAction', () => {
  it('request(item) opens the modal with that item as pending', () => {
    const { result } = renderHook(() => useConfirmAction<{ id: string }>({ onConfirm: vi.fn() }));

    expect(result.current.pending).toBeNull();

    act(() => result.current.request({ id: 'p1' }));

    expect(result.current.pending).toEqual({ id: 'p1' });
  });

  it('confirm() runs onConfirm with the pending item and CLOSES on success', () => {
    const onConfirm = vi.fn().mockReturnValue(true);
    const { result } = renderHook(() => useConfirmAction<string>({ onConfirm }));

    act(() => result.current.request('p1'));
    act(() => result.current.confirm());

    expect(onConfirm).toHaveBeenCalledWith('p1');
    expect(result.current.pending).toBeNull();
    expect(result.current.confirming).toBe(false);
  });

  it('confirm() KEEPS the modal open when onConfirm returns false (persist-fail parity)', () => {
    const onConfirm = vi.fn().mockReturnValue(false);
    const { result } = renderHook(() => useConfirmAction<string>({ onConfirm }));

    act(() => result.current.request('p1'));
    act(() => result.current.confirm());

    expect(onConfirm).toHaveBeenCalledWith('p1');
    expect(result.current.pending).toBe('p1'); // modal stays open for a retry
    expect(result.current.confirming).toBe(false);
  });

  it('confirm() is a no-op while the modal is closed', () => {
    const onConfirm = vi.fn();
    const { result } = renderHook(() => useConfirmAction<string>({ onConfirm }));

    act(() => result.current.confirm());

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.pending).toBeNull();
  });

  it('cancel() closes the modal and resets confirming', () => {
    const { result } = renderHook(() =>
      useConfirmAction<string>({ onConfirm: vi.fn(() => false) })
    );

    act(() => result.current.request('p1'));
    act(() => result.current.confirm()); // persist-fail → still open
    act(() => result.current.cancel());

    expect(result.current.pending).toBeNull();
    expect(result.current.confirming).toBe(false);
  });

  it('cancelRef is a mutable ref object for the «Отмена» button', () => {
    const { result } = renderHook(() => useConfirmAction<string>({ onConfirm: vi.fn() }));

    expect(result.current.cancelRef).toHaveProperty('current');
  });
});
