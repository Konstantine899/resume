// ============================================
// AdminMyWorkPage — page-level modal criteria (admin-mywork-refactor WU-4, R-4)
// ============================================
//
// The PAGE owns the form modal (ESC/overlay close, A12 one open dialog at
// a time); MyWorkEditorList.test.tsx owns the confirm modal's internals
// (R-2/R-3). This file wires the REAL storeReducers — the myWork slice
// hydrates `readProjects() ?? createProjectsSeed()` on its first reducer
// call — and mocks only storage (persist control), i18n (identity) and
// toasts. Harness: AdminSkillsPage.test.tsx:25-66.
//
// No slice-internal imports (fsd-imports/tests-public-api-only): the
// records are driven through the LIST's own confirm flow, so the stale
// guard and the empty state are exercised end-to-end. In a real browser
// the form-modal overlay would block those clicks — jsdom lets them
// through, which is exactly how the record disappears "elsewhere".

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { storeReducers } from '@/storeReducers';
import { AdminMyWorkPage } from './AdminMyWorkPage';

const { persistSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addToast: vi.fn(),
}));

vi.mock('@/features/AdminMyWork/model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/AdminMyWork/model/services/storage')>()),
  persistProjects: persistSpy,
}));

// Identity t(): raw keys in assertions; known options render as
// `${key}:${value}` (confirm subtitle `name`, Pagination `number`).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { name?: string; number?: number }) => {
      const parts = [options?.name, options?.number].filter((value) => value !== undefined);
      return parts.length > 0 ? `${key}:${parts.join(':')}` : key;
    },
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

const renderPage = () => {
  const store = configureStore({ reducer: storeReducers });
  render(
    <Provider store={store}>
      <AdminMyWorkPage />
    </Provider>
  );
  return store;
};

const projectsOf = (store: ReturnType<typeof renderPage>) => store.getState().myWork;

const openDialog = async () => screen.findByRole('dialog');

const openCreate = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'adminMyWorkAdd' }));
  return openDialog();
};

const editFirstProject = async () => {
  fireEvent.click(screen.getAllByRole('button', { name: 'projectEdit' })[0] as HTMLElement);
  return openDialog();
};

/** Remove the first row through the list's delete-confirm flow. */
const deleteFirstRow = async () => {
  const edit = screen.getAllByRole('button', { name: 'projectEdit' })[0] as HTMLElement;
  const row = edit.closest('li');
  expect(row).not.toBeNull();
  fireEvent.click(within(row as HTMLElement).getByRole('button', { name: 'projectDelete' }));
  // With the form modal open there are TWO dialogs; the confirm one is
  // identified by its entity-naming subtitle (R-2).
  const dialogs = await screen.findAllByRole('dialog');
  const confirm = dialogs.find((dialog) =>
    within(dialog).queryByText(/^projectConfirmDeleteName:/)
  );
  expect(confirm).toBeDefined();
  fireEvent.click(within(confirm as HTMLElement).getByRole('button', { name: 'projectDelete' }));
  await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0));
};

describe('AdminMyWorkPage (modal criteria, R-4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('«Add project» opens ONE create modal with the project form (A12)', async () => {
    renderPage();

    const modal = await openCreate();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminMyWorkTitle' })
    ).toBeInTheDocument();
    expect(within(modal).getByTestId('project-form')).toBeInTheDocument();
    // A12: the page renders a single dialog for its single `form` state.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('«Add project» stays reachable on an empty list (create mode is otherwise inaccessible)', async () => {
    const store = renderPage();
    // The seed ships seven records — remove each through the confirm flow.
    const total = projectsOf(store).length;
    for (let index = 0; index < total; index += 1) {
      await deleteFirstRow();
    }

    const modal = await openCreate();

    expect(within(modal).getByTestId('project-form')).toBeInTheDocument();
  });

  it('edit opens the modal prefilled with the record', async () => {
    const store = renderPage();
    const first = projectsOf(store)[0];
    if (!first) throw new Error('seed must contain at least one project');

    const modal = await editFirstProject();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminMyWorkTitle' })
    ).toBeInTheDocument();
    expect(within(modal).getByLabelText('projectFieldTitle')).toHaveValue(first.title);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('stale-guard: deleting the record being edited closes the modal', async () => {
    const store = renderPage();
    const first = projectsOf(store)[0];
    if (!first) throw new Error('seed must contain at least one project');

    const modal = await editFirstProject();
    expect(within(modal).getByLabelText('projectFieldTitle')).toHaveValue(first.title);

    // The record disappears "elsewhere" (list delete) while the form is open.
    await deleteFirstRow();

    await waitFor(() => expect(projectsOf(store).some((p) => p.id === first.id)).toBe(false));
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });

  it('ESC closes the modal (A8)', async () => {
    renderPage();
    await openCreate();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('overlay pointer-down closes the modal (A8)', async () => {
    renderPage();
    await openCreate();

    const overlay = document.querySelector('[data-dark]');
    // M14: assert existence instead of silently passing when null.
    expect(overlay).not.toBeNull();
    fireEvent.pointerDown(overlay as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
