import { act, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useToast } from '../lib/hooks/useToast';
import { ToastProvider } from './ToastContext';

const renderToastHook = () => renderHook(() => useToast(), { wrapper: ToastProvider });

describe('ToastContext.promise', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Toast renders into a portal — remove stray nodes between tests (defense-in-depth)
    document.body.querySelectorAll('[data-testid="toast"]').forEach((node) => node.remove());
    vi.useRealTimers();
  });

  it('shows a persistent loading toast while the promise is pending', () => {
    const { result } = renderToastHook();
    const pending = new Promise<{ name: string }>(() => undefined);

    act(() => {
      result.current.promise(pending, {
        loading: 'Uploading file…',
        success: 'File uploaded',
        error: 'Upload failed',
      });
    });

    expect(screen.getByText('Uploading file…')).toBeInTheDocument();
    // duration: 0 → no auto-close timer, no progress bar
    expect(screen.queryByTestId('toast-progress')).not.toBeInTheDocument();

    // Survives the DEFAULT_DURATION window: the promise is still pending
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(screen.getByText('Uploading file…')).toBeInTheDocument();
  });

  it('settles the pending promise into a success toast under the same id', async () => {
    const { result } = renderToastHook();
    const deferred = Promise.resolve({ name: 'report.pdf' });

    let resolved: { name: string } | undefined;
    act(() => {
      void result.current
        .promise(deferred, {
          loading: 'Exporting…',
          success: (data) => `Exported ${data.name}`,
          error: 'Export failed',
        })
        .then((data) => {
          resolved = data;
        });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(resolved).toEqual({ name: 'report.pdf' });
    expect(screen.queryByText('Exporting…')).not.toBeInTheDocument();
    expect(screen.getByText('Exported report.pdf')).toBeInTheDocument();
    // upsert: loading + success share one id → exactly one toast node
    expect(screen.getAllByTestId('toast')).toHaveLength(1);
  });

  it('settles a rejection into an error toast and rethrows the original error', async () => {
    const { result } = renderToastHook();
    const failure = new Error('Network down');
    const deferred = Promise.reject(failure);

    const outcome = result.current
      .promise(deferred, {
        loading: 'Connecting…',
        success: 'Connected',
        error: (error) => `Failed: ${error.message}`,
      })
      .then(
        () => 'resolved',
        (error: Error) => `rejected:${error.message}`
      );

    await act(async () => {
      await Promise.resolve();
    });

    await expect(outcome).resolves.toBe('rejected:Network down');
    expect(screen.getByText('Failed: Network down')).toBeInTheDocument();
  });

  it('supports an explicit id (single toast slot, no stack)', async () => {
    const { result } = renderToastHook();
    const deferred = Promise.resolve('ok');

    act(() => {
      result.current.promise(
        deferred,
        {
          loading: 'Saving…',
          success: 'Saved',
          error: 'Save failed',
        },
        { id: 'toast-message-p1' }
      );
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getAllByTestId('toast')).toHaveLength(1);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('removes the loading toast when success resolves to an empty string', async () => {
    const { result } = renderToastHook();
    const deferred = Promise.resolve(null);

    act(() => {
      result.current.promise(deferred, {
        loading: 'Cleaning up…',
        success: '',
        error: 'Cleanup failed',
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByText('Cleaning up…')).not.toBeInTheDocument();
    expect(screen.queryAllByTestId('toast')).toHaveLength(0);
  });
});
