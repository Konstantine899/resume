// ============================================
// AdminContactPage — page-level real-store tests (admin-contact-refactor WU-2, R-2)
// ============================================
//
// The PAGE is a thin composition (Section + ErrorBoundary + the feature
// form), so this file proves the wiring end-to-end: the REAL storeReducers
// hydrate the Contact document from storage on the first reducer call
// (resume-rtk-lazy-hydration) and the form renders through that store.
// Harness: AdminAboutPage.test.tsx — mock ONLY storage (persist control),
// i18n (identity) and toasts.
//
// OPEN-2=B (owner verdict): the form stays INLINE on the page, so this is
// a smoke of the inline component — the form's own Modal-confirm asserts
// live in ContactEditorForm.test.tsx and are NOT repeated here.
//
// No slice-internal imports (fsd-imports/tests-public-api-only): the
// storage envelope key is written literally (the barrel deliberately does
// NOT export CONTACT_CONTENT_STORAGE_KEY — SPEC R-3), and `readContactContent`
// stays REAL behind the mock spread so the hydration path is the
// production one.

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CONTACT_EMAIL } from '@/entities/ContactContent';
import type { ContactContent } from '@/entities/ContactContent';
import { createContactSeed } from '@/features/AdminContact';
import { storeReducers } from '@/storeReducers';
import { AdminContactPage } from './AdminContactPage';

const { persistSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_content: ContactContent) => true),
  addToast: vi.fn(),
}));

vi.mock('@/features/AdminContact/model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/AdminContact/model/services/storage')>()),
  persistContactContent: persistSpy,
}));

// Identity t(): raw keys in assertions.
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

/** The storage.ts envelope key — literal on purpose (see header). */
const STORAGE_KEY = 'resume.contact.content';

const renderPage = () => {
  const store = configureStore({ reducer: storeReducers });
  render(
    <Provider store={store}>
      <AdminContactPage />
    </Provider>
  );
  return store;
};

const emailInput = () => screen.getByLabelText('adminFieldEmail');

describe('AdminContactPage (R-2: real store wiring)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Contact editor form on the page (seed prefill, Save idle)', () => {
    renderPage();

    expect(screen.getByTestId('admin-contact')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'adminContactTitle' })
    ).toBeInTheDocument();
    expect(screen.getByText('adminContactHint')).toBeInTheDocument();
    // Empty storage → lazy hydration falls back to the seed.
    expect(emailInput()).toHaveValue(CONTACT_EMAIL);
    expect(screen.getByRole('button', { name: 'contactSave' })).toBeDisabled();
  });

  it('prefills the form from the stored document (lazy hydration, not module import)', () => {
    const stored: ContactContent = { ...createContactSeed(), email: 'stored@example.com' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, content: stored }));

    renderPage();

    expect(emailInput()).toHaveValue('stored@example.com');
  });

  it('shows the destructive «Reset» button (its confirm Modal lives in the form tests)', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'contactReset' })).toBeInTheDocument();
  });

  it('save-smoke: persist BEFORE dispatch, store updated, toast contactSaved', async () => {
    const store = renderPage();

    fireEvent.change(emailInput(), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'contactSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({ email: 'new@example.com' });
    expect(store.getState().contactContent.email).toBe('new@example.com');
    expect(addToast).toHaveBeenCalledWith({ message: 'contactSaved', type: 'success' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'contactSave' })).toBeDisabled());
  });
});
