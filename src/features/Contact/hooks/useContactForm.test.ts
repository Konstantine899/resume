import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useContactForm } from './useContactForm';

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));

vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

function createSubmitEvent(form: HTMLFormElement): FormEvent<HTMLFormElement> {
  return {
    preventDefault: vi.fn(),
    target: form,
  } as unknown as FormEvent<HTMLFormElement>;
}

describe('useContactForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets status to error and shows the required-fields toast when fields are empty', async () => {
    const send = vi.fn();
    const { result } = renderHook(() => useContactForm({ send }));

    const form = document.createElement('form');
    const event = createSubmitEvent(form);

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.status).toBe('error');
    expect(addToast).toHaveBeenCalledWith({
      message: 'contactFormRequired',
      type: 'error',
      duration: 5000,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('sets status to submitting and calls send with the form element before awaiting', async () => {
    let resolveSend: (value: unknown) => void = () => {};
    const send = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSend = resolve;
        })
    );
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({ name: 'John', email: 'john@example.com', message: 'Hello' });
    });

    const form = document.createElement('form');
    const event = createSubmitEvent(form);

    let submitPromise: Promise<void> = Promise.resolve();
    act(() => {
      submitPromise = result.current.handleSubmit(event);
    });

    expect(result.current.status).toBe('submitting');
    expect(send).toHaveBeenCalledWith(form);

    await act(async () => {
      resolveSend(undefined);
      await submitPromise;
    });

    expect(result.current.status).toBe('success');
  });

  it('sets status to success, resets the form, and shows the success toast when send resolves', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({ name: 'John', email: 'john@example.com', message: 'Hello' });
    });

    const form = document.createElement('form');
    const event = createSubmitEvent(form);

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(send).toHaveBeenCalledWith(form);
    expect(result.current.status).toBe('success');
    expect(result.current.formData).toEqual({ name: '', email: '', message: '' });
    expect(addToast).toHaveBeenCalledWith({
      message: 'contactFormSent',
      type: 'success',
      duration: 5000,
    });
  });

  it('sets status to error and shows the generic error toast when send rejects', async () => {
    const send = vi.fn().mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({ name: 'John', email: 'john@example.com', message: 'Hello' });
    });

    const form = document.createElement('form');
    const event = createSubmitEvent(form);

    await act(async () => {
      await result.current.handleSubmit(event);
    });

    expect(result.current.status).toBe('error');
    expect(addToast).toHaveBeenCalledWith({
      message: 'contactFormError',
      type: 'error',
      duration: 5000,
    });
  });
});
