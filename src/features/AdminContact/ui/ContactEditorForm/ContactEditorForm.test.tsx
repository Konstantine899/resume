// ============================================
// ContactEditorForm tests (plan Contact CRUD §10 WU-3)
// ============================================
//
// RED-first contract, mirroring AboutEditorForm: render + prefill from
// the store, §7 validation mapped to i18n keys (R-4: no hardcoded
// messages), persist → dispatch order (R-7), Toast feedback and the
// destructive-Reset confirm — a kit Modal (admin-contact-refactor R-1,
// §6 «never window.confirm»), NOT a native dialog. Storage and action
// creators are spied at the module boundary; the reducer stays real
// (spread actual).

import type { ContactContent } from '@/entities/ContactContent';
import { CONTACT_EMAIL } from '@/entities/ContactContent';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_CONTENT_STORAGE_KEY } from '../../model/services/storage';
import { ContactEditorForm } from './ContactEditorForm';

const { persistSpy, removeSpy, updateSpy, resetSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_content: ContactContent) => true),
  removeSpy: vi.fn(),
  updateSpy: vi.fn((content: unknown) => ({ type: 'contactContent/update', payload: content })),
  resetSpy: vi.fn(() => ({ type: 'contactContent/reset' })),
  addToast: vi.fn(),
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistContactContent: persistSpy,
  removeContactContent: removeSpy,
}));

vi.mock('../../model/slices/contactContentSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/contactContentSlice')>()),
  updateContactContent: updateSpy,
  resetToDefaults: resetSpy,
}));

// Deterministic labels: t(key) => key (Nav.test pattern).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    isTransitioning: false,
  }),
}));

vi.mock('@/shared/lib/contexts/ToastContext', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/contexts/ToastContext')>()),
  useToast: () => ({ addToast, removeToast: vi.fn() }),
}));

// react-redux is mocked instead of StoreProvider: `features → app` is a
// banned FSD hop. The REAL selector runs against a seed-shaped state.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  const { createContactSeed } = await import('../../model/services/seed');
  const state = { contactContent: createContactSeed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const confirmSpy = vi.spyOn(window, 'confirm');

const renderForm = () => render(<ContactEditorForm />);

const emailInput = () => screen.getByLabelText('adminFieldEmail');

// The texts group renders `label · EN/RU` per key (About pattern).
const textInput = (key: string, locale: 'EN' | 'RU') => screen.getByLabelText(`${key} · ${locale}`);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
  confirmSpy.mockReturnValue(false);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContactEditorForm: render (WU-3)', () => {
  it('renders title, hint and all §7 fields prefilled from the store', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { level: 2, name: 'adminContactTitle' })
    ).toBeInTheDocument();
    expect(screen.getByText('adminContactHint')).toBeInTheDocument();

    // Prefill = seed (empty localStorage → lazy hydration).
    expect(emailInput()).toHaveValue(CONTACT_EMAIL);
    // contactDescription (2 locales) is the only textarea; the rest is
    // 1 email + 9 texts × 2 + 4 formTexts × 2 = 27 inputs.
    expect(document.querySelectorAll('textarea')).toHaveLength(2);
    expect(document.querySelectorAll('input')).toHaveLength(27);

    // Save is disabled until the form is dirty (§9 idle).
    expect(screen.getByRole('button', { name: 'contactSave' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'contactReset' })).toBeInTheDocument();
  });
});

describe('ContactEditorForm: validation (§7, R-4)', () => {
  it('blocks submit on an invalid email and maps the error to contactEmailInvalid', async () => {
    renderForm();

    fireEvent.change(emailInput(), { target: { value: 'not-an-email' } });
    fireEvent.click(screen.getByRole('button', { name: 'contactSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('contactEmailInvalid');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('maps an emptied text to contactTextEmpty', async () => {
    renderForm();

    fireEvent.change(textInput('responseTimeHint', 'EN'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'contactSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('contactTextEmpty');
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('maps an emptied formText to contactFormTextEmpty', async () => {
    renderForm();

    fireEvent.change(textInput('contactFormSent', 'RU'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'contactSave' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('contactFormTextEmpty');
    expect(persistSpy).not.toHaveBeenCalled();
  });
});

describe('ContactEditorForm: save (R-7 persist → dispatch)', () => {
  it('persists BEFORE dispatching, toasts contactSaved and returns to idle', async () => {
    renderForm();

    fireEvent.change(emailInput(), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'contactSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(persistSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      updateSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({ email: 'new@example.com' });
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });

    await waitFor(() => expect(screen.getByRole('button', { name: 'contactSave' })).toBeDisabled());
  });

  it('keeps the form filled, skips dispatch and toasts contactSaveError when persist fails', async () => {
    renderForm();

    persistSpy.mockReturnValueOnce(false);
    fireEvent.change(emailInput(), { target: { value: 'unsaved@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'contactSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        message: 'contactSaveError',
        type: 'error',
      })
    );
    expect(updateSpy).not.toHaveBeenCalled();
    // Data survives in the form (§7 quota/SecurityError row).
    expect(emailInput()).toHaveValue('unsaved@example.com');
    expect(screen.getByRole('button', { name: 'contactSave' })).toBeEnabled();
  });
});

describe('ContactEditorForm: reset confirm (R-1, kit Modal)', () => {
  /** Open the destructive confirm; returns the dialog element. */
  const openConfirm = async () => {
    fireEvent.click(screen.getByRole('button', { name: 'contactReset' }));
    return screen.findByRole('dialog');
  };

  it('«contactReset» opens a confirm Modal and never calls window.confirm', async () => {
    renderForm();

    fireEvent.change(emailInput(), { target: { value: 'dirty@example.com' } });
    const modal = await openConfirm();

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'contactReset' })
    ).toBeInTheDocument();
    // Generic subtitle (single document — no {{name}} needed, SPEC R-1).
    expect(within(modal).getByText('contactResetConfirm')).toBeInTheDocument();
    // Opening is not acting: nothing removed or dispatched yet.
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    expect(emailInput()).toHaveValue('dirty@example.com');
  });

  it('«contactCancel» closes the confirm and never touches storage or the form', async () => {
    renderForm();

    localStorage.setItem(CONTACT_CONTENT_STORAGE_KEY, '{"v":1,"content":{}}');
    fireEvent.change(emailInput(), { target: { value: 'dirty@example.com' } });
    const modal = await openConfirm();
    fireEvent.click(within(modal).getByRole('button', { name: 'contactCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(removeSpy).not.toHaveBeenCalled();
    expect(resetSpy).not.toHaveBeenCalled();
    // The stored document is still there («Cancel не трогает storage»).
    expect(localStorage.getItem(CONTACT_CONTENT_STORAGE_KEY)).toBe('{"v":1,"content":{}}');
    expect(emailInput()).toHaveValue('dirty@example.com');
  });

  it('moves focus to «Отмена» when the confirm opens (initialFocusRef)', async () => {
    renderForm();

    const modal = await openConfirm();
    const cancel = within(modal).getByRole('button', { name: 'contactCancel' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('confirm removes storage, dispatches reset and returns the fields to the seed', async () => {
    renderForm();

    fireEvent.change(emailInput(), { target: { value: 'dirty@example.com' } });
    const modal = await openConfirm();
    fireEvent.click(within(modal).getByRole('button', { name: 'contactReset' }));

    await waitFor(() => expect(removeSpy).toHaveBeenCalledTimes(1));
    expect(resetSpy).toHaveBeenCalledTimes(1);
    // Hard order: storage removal must run before the store changes.
    // `?? NaN`: an impossible undefined would FAIL the comparison, not pass it.
    expect(removeSpy.mock.invocationCallOrder[0] ?? Number.NaN).toBeLessThan(
      resetSpy.mock.invocationCallOrder[0] ?? Number.NaN
    );
    // Fields show the seed again, not the dirty values.
    await waitFor(() => expect(emailInput()).toHaveValue(CONTACT_EMAIL));
    expect(screen.getByRole('button', { name: 'contactSave' })).toBeDisabled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
