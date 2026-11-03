// ============================================
// ContactSocialForm tests (contact-social-crud R-4, plan rev.7 §10.2)
// ============================================
//
// The social-row modal form: add mode (key + name + href) and edit mode
// (key read-only, values prefilled). All THREE fields are kit Inputs —
// they are short scalars, the Textarea convention (rev.6 §10.1) applies
// only to long text. RED-first contract: pristine Save is disabled,
// zod errors surface as i18n keys, persist runs BEFORE the dispatch
// (golden standard) and a persist failure keeps the form open.
// Harness mirrors ContactRowForm.test.

import type { ContactContent, ContactSocialLink } from '@/entities/ContactContent';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContactSocialForm } from './ContactSocialForm';
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
  props: Partial<Parameters<typeof ContactSocialForm>[0]> = {},
  exitSpy: () => void = vi.fn()
) => {
  const merged = {
    content: SEED,
    existingKeys: Object.keys(SEED.socialLinks),
    onExitEdit: exitSpy,
    ...props,
  };
  render(<ContactSocialForm {...merged} />);
  return { exitSpy, merged };
};

const keyInput = () => screen.getByLabelText('adminContactRowKey') as HTMLInputElement;
const nameInput = () => screen.getByLabelText('adminContactSocialName') as HTMLInputElement;
const hrefInput = () => screen.getByLabelText('adminContactSocialUrl') as HTMLInputElement;
const saveButton = () => screen.getByRole('button', { name: 'contactSave' });

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  persistSpy.mockReturnValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('ContactSocialForm: add mode (R-4)', () => {
  it('renders key/name/href as Inputs with caps, Save disabled while pristine', () => {
    renderForm();

    // Short scalars stay Inputs — the Textarea convention is for long text.
    expect(keyInput().tagName).toBe('INPUT');
    expect(nameInput().tagName).toBe('INPUT');
    expect(hrefInput().tagName).toBe('INPUT');
    expect(keyInput()).toHaveAttribute('maxlength', '64');
    expect(nameInput()).toHaveAttribute('maxlength', '48');
    expect(keyInput()).toHaveValue('');
    expect(nameInput()).toHaveValue('');
    expect(hrefInput()).toHaveValue('');
    expect(saveButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'contactCancel' })).toBeInTheDocument();
  });

  it('saves a new row: persist BEFORE dispatch, success toast, exit', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(nameInput(), { target: { value: 'Site' } });
    fireEvent.change(hrefInput(), { target: { value: 'https://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as ContactContent;
    expect(persisted.socialLinks['website']).toEqual({
      name: 'Site',
      href: 'https://example.com',
    });
    expect(upsertSpy).toHaveBeenCalledWith({
      table: 'socials',
      key: 'website',
      value: { name: 'Site', href: 'https://example.com' },
    });
    // Golden standard: persist runs BEFORE the dispatch.
    expect(persistSpy.mock.invocationCallOrder[0] as number).toBeLessThan(
      upsertSpy.mock.invocationCallOrder[0] as number
    );
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });
  });

  it('a successful add closes the modal (exit called)', async () => {
    const { exitSpy } = renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(nameInput(), { target: { value: 'Site' } });
    fireEvent.change(hrefInput(), { target: { value: 'https://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(exitSpy).toHaveBeenCalled());
  });

  it('rejects a duplicate key with the i18n key and never persists', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'github' } });
    fireEvent.change(nameInput(), { target: { value: 'GH' } });
    fireEvent.change(hrefInput(), { target: { value: 'https://gh.io' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('adminContactRowKeyExists')
    );
    expect(persistSpy).not.toHaveBeenCalled();
    expect(upsertSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-slug key with adminContactRowKeyInvalid', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'Bad key!' } });
    fireEvent.change(nameInput(), { target: { value: 'Site' } });
    fireEvent.change(hrefInput(), { target: { value: 'https://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('adminContactRowKeyInvalid')
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects an empty name with adminContactSocialNameRequired', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(hrefInput(), { target: { value: 'https://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('adminContactSocialNameRequired')
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects a name over 48 chars with adminContactSocialNameMax', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(nameInput(), { target: { value: 'x'.repeat(49) } });
    fireEvent.change(hrefInput(), { target: { value: 'https://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('adminContactSocialNameMax')
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects an empty href with adminContactSocialUrlRequired', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(nameInput(), { target: { value: 'Site' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('adminContactSocialUrlRequired')
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-https href with adminContactSocialUrlInvalid', async () => {
    renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(nameInput(), { target: { value: 'Site' } });
    fireEvent.change(hrefInput(), { target: { value: 'http://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('adminContactSocialUrlInvalid')
    );
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('keeps the form open and toasts on a persist failure (gold standard)', async () => {
    persistSpy.mockReturnValue(false);
    const { exitSpy } = renderForm();

    fireEvent.change(keyInput(), { target: { value: 'website' } });
    fireEvent.change(nameInput(), { target: { value: 'Site' } });
    fireEvent.change(hrefInput(), { target: { value: 'https://example.com' } });
    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'contactSaveError', type: 'error' })
    );
    expect(upsertSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});

describe('ContactSocialForm: edit mode (R-4)', () => {
  const GITHUB = SEED.socialLinks['github'] as ContactSocialLink;

  it('prefills values and keeps the key read-only', () => {
    renderForm({
      row: { key: 'github', value: GITHUB },
      existingKeys: Object.keys(SEED.socialLinks),
    });

    expect(keyInput()).toHaveAttribute('readonly');
    expect(keyInput()).toHaveValue('github');
    expect(nameInput()).toHaveValue(GITHUB.name);
    expect(hrefInput()).toHaveValue(GITHUB.href);
    expect(saveButton()).toBeDisabled(); // pristine
  });

  it('edits the row in place: same key, key order kept, persist before dispatch', async () => {
    renderForm({ row: { key: 'github', value: GITHUB } });

    fireEvent.change(nameInput(), { target: { value: 'GH' } });
    fireEvent.click(saveButton());

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as ContactContent;
    expect(Object.keys(persisted.socialLinks)).toEqual(Object.keys(SEED.socialLinks));
    expect(persisted.socialLinks['github']).toEqual({ ...GITHUB, name: 'GH' });
    expect(upsertSpy).toHaveBeenCalledWith({
      table: 'socials',
      key: 'github',
      value: { ...GITHUB, name: 'GH' },
    });
    expect(persistSpy.mock.invocationCallOrder[0] as number).toBeLessThan(
      upsertSpy.mock.invocationCallOrder[0] as number
    );
  });
});
