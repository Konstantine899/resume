import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useContactForm } from './useContactForm';

const { addToast } = vi.hoisted(() => ({ addToast: vi.fn() }));

vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast }),
}));

vi.mock('@/shared/lib/i18n/hooks', () => ({
  // `language` is only read when the texts option is present (R-11 test);
  // the fallback cases never touch it.
  useLanguage: () => ({ t: (key: string) => key, language: 'en' as const }),
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
      result.current.setFormData({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello there, this is a test message',
      });
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
      result.current.setFormData({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello there, this is a test message',
      });
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
      result.current.setFormData({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello there, this is a test message',
      });
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

  // --- WU-2: zod ContactFormDataSchema replaces the manual check (§7) ---

  it('rejects an invalid email before send (zod format, §7)', async () => {
    const send = vi.fn();
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({
        name: 'John',
        email: 'not-an-email',
        message: 'Hello there, this is a test message',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent(document.createElement('form')));
    });

    expect(result.current.status).toBe('error');
    expect(addToast).toHaveBeenCalledWith({
      message: 'contactFormRequired',
      type: 'error',
      duration: 5000,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a message shorter than 10 chars (owner-approved spam floor, §7)', async () => {
    const send = vi.fn();
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({ name: 'John', email: 'john@example.com', message: 'hi' });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent(document.createElement('form')));
    });

    expect(result.current.status).toBe('error');
    expect(addToast).toHaveBeenCalledWith({
      message: 'contactFormRequired',
      type: 'error',
      duration: 5000,
    });
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects a name shorter than 2 chars after trim (§7)', async () => {
    const send = vi.fn();
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({
        name: ' J ',
        email: 'john@example.com',
        message: 'Hello there, this is a test message',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent(document.createElement('form')));
    });

    expect(result.current.status).toBe('error');
    expect(send).not.toHaveBeenCalled();
  });

  // --- R-11: resolved formTexts from the store override t() ---

  it('uses the texts option for toasts instead of t() (R-11)', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useContactForm({
        send,
        texts: {
          contactFormRequired: { en: 'STORE_REQUIRED', ru: 'STORE_REQUIRED_RU' },
          contactFormSent: { en: 'STORE_SENT', ru: 'STORE_SENT_RU' },
          contactFormError: { en: 'STORE_ERROR', ru: 'STORE_ERROR_RU' },
          contactFormConfigError: { en: 'STORE_CONFIG', ru: 'STORE_CONFIG_RU' },
        },
      })
    );

    act(() => {
      result.current.setFormData({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello there, this is a test message',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent(document.createElement('form')));
    });

    expect(addToast).toHaveBeenCalledWith({
      message: 'STORE_SENT',
      type: 'success',
      duration: 5000,
    });
  });

  it('falls back to t() when no texts option is given (hook stays store-free)', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useContactForm({ send }));

    act(() => {
      result.current.setFormData({
        name: 'John',
        email: 'john@example.com',
        message: 'Hello there, this is a test message',
      });
    });

    await act(async () => {
      await result.current.handleSubmit(createSubmitEvent(document.createElement('form')));
    });

    expect(addToast).toHaveBeenCalledWith({
      message: 'contactFormSent',
      type: 'success',
      duration: 5000,
    });
  });
});
