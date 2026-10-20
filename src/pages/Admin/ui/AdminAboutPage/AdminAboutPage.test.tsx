// ============================================
// AdminAboutPage — page-level real-store tests (admin-about-refactor WU-2, R-2;
// admin-about-table WU-3 — the vitrina replaces the inline form)
// ============================================
//
// The PAGE is a thin composition (Section + ErrorBoundary + the feature
// vitrina), so this file proves the wiring end-to-end: the REAL storeReducers
// hydrate the About document from storage on the first reducer call
// (resume-rtk-lazy-hydration) and the vitrina renders/saves through that
// store. Harness: shared renderAdminPage (src/shared/tests) — mock ONLY
// storage (persist control), i18n (identity) and toasts.
//
// No slice-internal imports (fsd-imports/tests-public-api-only): the seed
// comes from the barrel, the storage envelope key is written literally
// (the barrel deliberately does NOT export ABOUT_CONTENT_STORAGE_KEY —
// SPEC R-4), and `readAboutContent` stays REAL behind the mock spread so
// the hydration path is the production one.

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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

/**
 * WU-18/WU-19: the vitrina windows rows 5-at-a-time by default and the
 * table card is COLLAPSED by default — these legacy page tests assert the
 * FULL 8-row document (tail rows included), so the helper opens the card
 * and picks size 20 right after render (feature test parity).
 */
const showAllRows = () => {
  fireEvent.click(screen.getByTestId('admin-about-table-expand'));
  fireEvent.click(
    within(screen.getByRole('group', { name: 'perPageLabel' })).getByRole('button', {
      name: '20',
    })
  );
};

const renderPage = () => {
  const store = renderAdminPage(<AdminAboutPage />);
  showAllRows();
  return store;
};

/** The vitrina body rows (the header row is excluded). */
const dataRows = () => document.querySelectorAll<HTMLTableRowElement>('tbody tr');

describe('AdminAboutPage (R-2: real store wiring)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the About vitrina on the page (8 rows from the seed)', () => {
    renderPage();

    expect(screen.getByTestId('admin-about')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'adminAboutTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminAboutHint')).toBeInTheDocument();
    // Empty storage → lazy hydration falls back to the seed.
    expect(dataRows()).toHaveLength(8);
    expect(screen.getByText(createAboutSeed().ctaLabel?.en ?? '')).toBeInTheDocument();
  });

  it('prefills the vitrina from the stored document (lazy hydration, not module import)', () => {
    const stored: AboutContent = {
      ...createAboutSeed(),
      ctaLabel: { en: 'Stored CTA', ru: 'Stored CTA ru' },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, content: stored }));

    renderPage();

    expect(screen.getByText('Stored CTA')).toBeInTheDocument();
    expect(screen.getByText('Stored CTA ru')).toBeInTheDocument();
  });

  it('row Pencil save-smoke: modal Save persists BEFORE dispatch, store updated, toast aboutSaved', async () => {
    const store = renderPage();

    // admin-about-table WU-4: the Pencil opens the field modal — the seam
    // runs on the modal's Save button.
    fireEvent.click(screen.getByTestId('admin-about-edit-ctaLabel'));
    const modal = await screen.findByRole('dialog');
    fireEvent.change(within(modal).getByLabelText('aboutFieldCta · EN'), {
      target: { value: 'Hire me now' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'aboutSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    // The dispatched document is the FULL merged snapshot (WU-2 seam).
    expect(persistSpy.mock.calls[0]?.[0]).toMatchObject({
      ctaLabel: { en: 'Hire me now', ru: createAboutSeed().ctaLabel?.ru },
    });
    expect(store.getState().aboutContent.ctaLabel?.en).toBe('Hire me now');
    expect(addToast).toHaveBeenCalledWith({ message: 'aboutSaved', type: 'success' });
  });

  it('shows the destructive «Reset» button (its confirm Modal lives in the feature tests)', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'aboutReset' })).toBeInTheDocument();
  });

  it('opens the WU-20 portrait dialog from the header with a pristine-disabled Save (nothing staged)', () => {
    renderPage();

    // D20/R-12: no inline block on the page — the header trigger owns it
    // (available while the table card is collapsed, which renderPage leaves
    // open only for the row suites; the trigger is outside the card anyway).
    expect(screen.queryByTestId('admin-about-portrait')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('admin-about-portrait-button'));

    const modal = screen.getByRole('dialog', { name: 'adminAboutPortraitTitle' });
    // The kit upload control is wired with the feature copy… (the label names
    // BOTH the dropzone group and the file input — query the group role).
    expect(
      within(modal).getByRole('group', { name: 'adminAboutPortraitLabel' })
    ).toBeInTheDocument();
    expect(modal.querySelector('input[type="file"]')).toHaveAttribute('accept', '.jpg,.png');
    expect(
      within(modal).getByRole('button', { name: 'adminAboutPortraitButton' })
    ).toBeInTheDocument();
    // …and Save only arms once a file is staged (the file-write flow itself
    // is feature-tested — this store has no api middleware by design).
    expect(within(modal).getByRole('button', { name: 'adminAboutPortraitSave' })).toBeDisabled();
  });
});
