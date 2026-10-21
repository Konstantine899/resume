// ============================================
// ContactRowForm tests (contact-rows-crud R-5, plan rev.5 §10)
// ============================================
//
// The per-row modal form: add mode (key + EN + RU) and edit mode (key
// read-only, values prefilled). RED-first contract: pristine Save is
// disabled, zod errors surface as i18n keys, persist runs BEFORE the
// dispatch (golden standard) and a persist failure keeps the form open.
// Harness mirrors ContactEditorForm.test: mocked storage/slice/react-redux,
// identity `t`, real selector against a seed-shaped state.

import type { ContactContent } from '@/entities/ContactContent';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactRowForm } from './ContactRowForm';
import { createContactSeed } from '../../model/services/seed';

const { persistSpy, upsertSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_content: ContactContent) => true),
  upsertSpy: vi.fn((payload: unknown) => ({ type: 'contactContent/upsertRow', payload })),
  addToast: vi.fn(),
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistContactContent: persistSpy,
}));

vi.mock('../../model/slices/contactContentSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/contactContentSlice')>()),
  upsertContactTableRow: upsertSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// Rendered options as `${key}:${value}` (the value-max error interpolates
// { max } — ProjectCard.test parity).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: Record<string, string | number>) =>
      options && Object.keys(options).length > 0 ? `${key}:${Object.values(options)[0]}` : key,
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

// react-redux is mocked instead of StoreProvider (features → app is a
// banned FSD hop). The real selector runs against the seed document.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  const { createContactSeed: seed } = await import('../../model/services/seed');
  const state = { contactContent: seed() };
  return {
    ...actual,
    useSelector: (selector: (s: typeof state) => unknown) => selector(state),
    useDispatch: () => (_action: unknown) => undefined,
  };
});

const SEED = createContactSeed();

const renderForm = (
  props: Partial<Parameters<typeof ContactRowForm>[0]> = {},
  exitSpy: () => void = vi.fn()
) => {
  const merged = {
    content: SEED,
    table: 'texts' as const,
    existingKeys: Object.keys(SEED.texts),
    onExitEdit: exitSpy,
    ...props,
  };
  render(<ContactRowForm {...merged} />);
  return { exitSpy, merged };
};

const keyInput = () => screen.getByLabelText('adminContactRowKey') as HTMLInputElement;
const enInput = () => screen.getByLabelText('adminContactRowEn') as HTMLTextAreaElement;
const ruInput = () => screen.getByLabelText('adminContactRowRu') as HTMLTextAreaElement;
const saveButton = () => screen.getByRole('button', { name: 'contactSave' });

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContactRowForm: add mode (R-5)', () => {
  it('renders key as Input and EN/RU as Textareas (R-1/R-2), Save disabled while pristine', () => {
    renderForm();

    // R-2: the short slug key stays a kit Input.
    expect(keyInput().tagName).toBe('INPUT');
    expect(keyInput()).toHaveValue('');
    // R-1: long values are Textareas with the table's cap (texts = 600).
    expect(enInput().tagName).toBe('TEXTAREA');
    expect(ruInput().tagName).toBe('TEXTAREA');
    expect(enInput()).toHaveAttribute('maxlength', '600');
    expect(ruInput()).toHaveAttribute('maxlength', '600');
    expect(enInput()).toHaveValue('');
    expect(ruInput()).toHaveValue('');
    expect(saveButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'contactCancel' })).toBeInTheDocument();
  });

  it('rejects a duplicate key with the i18n key and never persists', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'sending' } });
    fireEvent.change(enInput(), { target: { value: 'Hello' } });
    fireEvent.change(ruInput(), { target: { value: 'Привет' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(screen.getByText('adminContactRowKeyExists')).toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-slug key with adminContactRowKeyInvalid', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'Bad key!' } });
    fireEvent.change(enInput(), { target: { value: 'Hello' } });
    fireEvent.change(ruInput(), { target: { value: 'Привет' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(screen.getByText('adminContactRowKeyInvalid')).toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects an empty locale value with adminContactRowValueRequired', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'customRow' } });
    fireEvent.change(enInput(), { target: { value: 'Hello' } });
    fireEvent.click(saveButton());

    // The component passes { max } to t() unconditionally (ContactSocialForm
    // parity — i18next ignores unused params in prod), so the composite mock
    // may suffix the key; match by the bare required-key substring.
    await waitFor(() =>
      expect(screen.getByText(/adminContactRowValueRequired/)).toBeInTheDocument()
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('interpolates the table cap into the value-max error (no raw {{max}})', async () => {
    renderForm();

    // texts cap = 600 (MAX_CHARS); over-cap EN + valid RU → the EN Textarea
    // surfaces adminContactRowValueMax. The mock renders options as
    // `${key}:${value}`, so the error must carry the REAL cap (600) —
    // without the { max } param t() gets no options and renders the bare
    // key, which is exactly the user-facing `{{max}}` bug.
    fireEvent.change(keyInput(), { target: { value: 'customRow' } });
    fireEvent.change(enInput(), { target: { value: 'a'.repeat(601) } });
    fireEvent.change(ruInput(), { target: { value: 'Привет' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByText('adminContactRowValueMax:600')).toBeInTheDocument()
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('persists BEFORE dispatch, toasts and exits on a valid row', async () => {
    const exit = vi.fn();
    renderForm({}, exit);

    fireEvent.change(keyInput(), { target: { value: 'customRow' } });
    fireEvent.change(enInput(), { target: { value: 'Hello' } });
    fireEvent.change(ruInput(), { target: { value: 'Привет' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(exit).toHaveBeenCalledTimes(1));
    expect(persistSpy).toHaveBeenCalledTimes(1);
    const persisted = persistSpy.mock.calls[0]?.[0] as ContactContent;
    expect(persisted.texts['customRow']).toEqual({ en: 'Hello', ru: 'Привет' });
    // Other table + email survive.
    expect(persisted.formTexts).toEqual(SEED.formTexts);
    expect(persisted.email).toBe(SEED.email);
    expect(upsertSpy).toHaveBeenCalledWith({
      table: 'texts',
      key: 'customRow',
      value: { en: 'Hello', ru: 'Привет' },
    });
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });
    // Golden standard: persist resolves BEFORE the dispatch is emitted.
    expect(persistSpy.mock.invocationCallOrder[0]).toBeLessThan(
      upsertSpy.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER
    );
  });

  it('keeps the form open and toasts the error when persist fails', async () => {
    persistSpy.mockReturnValue(false);
    const { exitSpy } = renderForm();

    fireEvent.change(keyInput(), { target: { value: 'customRow' } });
    fireEvent.change(enInput(), { target: { value: 'Hello' } });
    fireEvent.change(ruInput(), { target: { value: 'Привет' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'contactSaveError', type: 'error' })
    );
    expect(upsertSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
    // The form is still on screen (modal content stays mounted).
    expect(keyInput()).toBeInTheDocument();
  });
});

describe('ContactRowForm: edit mode (R-5)', () => {
  it('renders the key read-only with both locales prefilled, Save disabled while pristine', () => {
    renderForm({
      row: { key: 'sending', value: SEED.texts['sending'] ?? { en: 'x', ru: 'y' } },
    });

    expect(keyInput()).toHaveValue('sending');
    expect(keyInput()).toHaveAttribute('readonly');
    expect(enInput()).toHaveValue(SEED.texts['sending']?.en);
    expect(ruInput()).toHaveValue(SEED.texts['sending']?.ru);
    expect(saveButton()).toBeDisabled();
  });

  it('replaces only the edited row on save', async () => {
    const exit = vi.fn();
    renderForm(
      {
        row: { key: 'sending', value: SEED.texts['sending'] ?? { en: 'x', ru: 'y' } },
      },
      exit
    );

    fireEvent.change(enInput(), { target: { value: 'Updated EN' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(exit).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as ContactContent;
    expect(persisted.texts['sending']).toEqual({ en: 'Updated EN', ru: SEED.texts['sending']?.ru });
    expect(Object.keys(persisted.texts)).toEqual(Object.keys(SEED.texts));
    expect(upsertSpy).toHaveBeenCalledWith({
      table: 'texts',
      key: 'sending',
      value: { en: 'Updated EN', ru: SEED.texts['sending']?.ru },
    });
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });
  });
});
