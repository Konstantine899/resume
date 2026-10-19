// ============================================
// AdminAboutPage — page-level real-store tests (admin-about-refactor WU-2, R-2)
// ============================================
//
// The PAGE is a thin composition (Section + ErrorBoundary + the feature
// form), so this file proves the wiring end-to-end: the REAL storeReducers
// hydrate the About document from storage on the first reducer call
// (resume-rtk-lazy-hydration) and the form renders/saves through that
// store. Harness: shared renderAdminPage (src/shared/tests) — mock ONLY
// storage (persist control), i18n (identity) and toasts.
//
// No slice-internal imports (fsd-imports/tests-public-api-only): the seed
// comes from the barrel, the storage envelope key is written literally
// (the barrel deliberately does NOT export ABOUT_CONTENT_STORAGE_KEY —
// SPEC R-4), and `readAboutContent` stays REAL behind the mock spread so
// the hydration path is the production one.

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AboutContent } from '@/entities/AboutContent';
import { createAboutSeed } from '@/features/AdminAbout';
import { renderAdminPage } from '@/shared/tests';
import { AdminAboutPage } from './AdminAboutPage';

const { persistSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_content: AboutContent) => true),
  addToast: vi.fn(),
}));

vi.mock('@/features/AdminAbout/model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/AdminAbout/model/services/storage')>()),
  persistAboutContent: persistSpy,
}));

// Identity t(): raw keys in assertions; known options render as
// `${key}:${value}` (the R-1 confirm subtitle names the entity).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { name?: string }) =>
      options?.name !== undefined ? `${key}:${options.name}` : key,
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
const STORAGE_KEY = 'resume.about.content';

const renderPage = () => renderAdminPage(<AdminAboutPage />);

const fullNameInput = () => screen.getByLabelText('aboutFieldFullName');

describe('AdminAboutPage (R-2: real store wiring)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the About editor form on the page (seed prefill, Save idle)', () => {
    renderPage();

    expect(screen.getByTestId('admin-about')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminAboutHint')).toBeInTheDocument();
    // Empty storage → lazy hydration falls back to the seed.
    expect(fullNameInput()).toHaveValue(createAboutSeed().fullName);
    expect(screen.getByRole('button', { name: 'aboutSave' })).toBeDisabled();
  });

  it('prefills the form from the stored document (lazy hydration, not module import)', () => {
    const stored: AboutContent = { ...createAboutSeed(), fullName: 'Stored Person' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, content: stored }));

    renderPage();

    expect(fullNameInput()).toHaveValue('Stored Person');
  });

  it('save-smoke: persist BEFORE dispatch, store updated, toast aboutSaved', async () => {
    const store = renderPage();

    fireEvent.change(fullNameInput(), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({ fullName: 'New Name' });
    expect(store.getState().aboutContent.fullName).toBe('New Name');
    expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaved', type: 'success' });
    // Pristine again after a successful save (§9 saved → idle).
    await waitFor(() => expect(screen.getByRole('button', { name: 'aboutSave' })).toBeDisabled());
  });

  it('shows the destructive «Reset» button (its confirm Modal lives in the form tests)', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'aboutReset' })).toBeInTheDocument();
  });
});
