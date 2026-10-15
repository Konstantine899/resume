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
// `${key}:${value}` (confirm subtitle `name`, card expand/collapse
// `title`, rev.3 field-modal title `field` — needed to address ONE
// collapsed card by its caption and the field dialog by its name).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (
      key: string,
      options?: { name?: string; number?: number; title?: string; field?: string }
    ) => {
      const parts = [options?.name, options?.number, options?.title, options?.field].filter(
        (value) => value !== undefined
      );
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

/**
 * The FIRST card's record id — read from the card-root testid, which
 * exists in BOTH collapsed and expanded state. NEVER from the caption
 * (an expanded card unmounts it — the caption-based lookup silently
 * slid to the NEXT record and deleted the wrong one in the stale-guard).
 */
const firstCardId = (): string => {
  const roots = document.querySelectorAll('[data-testid^="project-card-"]');
  for (const el of Array.from(roots)) {
    const id = el.getAttribute('data-testid') ?? '';
    if (id.includes('caption') || id.includes('actions')) continue;
    return id.replace(/^project-card-/, '');
  }
  throw new Error('expected at least one project card');
};

/**
 * R-A1/R-A3 (issue #242): the collapsed caption NOW carries the
 * edit/delete actions — no expand-first dance is needed anymore. The
 * per-record `project-card-actions-${id}` testid exists in both states
 * (caption when collapsed, header when expanded), so a single lookup
 * covers every card regardless of expansion.
 */
const editFirstProject = async () => {
  const id = firstCardId();
  fireEvent.click(
    within(screen.getByTestId(`project-card-actions-${id}`)).getByRole('button', {
      name: 'projectEdit',
    })
  );
  return openDialog();
};

/** Remove the first card through the list's delete-confirm flow. */
const deleteFirstRow = async () => {
  const id = firstCardId();
  fireEvent.click(
    within(screen.getByTestId(`project-card-actions-${id}`)).getByRole('button', {
      name: 'projectDelete',
    })
  );
  // With the form modal open there are TWO dialogs; the confirm one is
  // identified by its entity-naming subtitle (R-2).
  const dialogs = await screen.findAllByRole('dialog');
  const confirm = dialogs.find((dialog) =>
    within(dialog).queryByText(/^projectConfirmDeleteName:/)
  );
  expect(confirm).toBeDefined();
  fireEvent.click(within(confirm as HTMLElement).getByRole('button', { name: 'projectDelete' }));
  // Confirm closes; the form closes too when the deleted record is the
  // one being edited (stale-guard) — wait for the CONFIRM specifically
  // so a surviving form dialog does not hang this helper.
  await waitFor(() =>
    expect(within(document.body).queryByText('projectDeleteConfirm')).not.toBeInTheDocument()
  );
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

    // R-2 (OPEN-4=A): create mode names the dialog adminAddProject.
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminAddProject' })
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

    // R-2 (OPEN-4=A): edit mode names the dialog adminEditProject.
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminEditProject' })
    ).toBeInTheDocument();
    expect(within(modal).getByLabelText('projectFieldTitle')).toHaveValue(first.title);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('R-A3: Pencil on a STILL-COLLAPSED row opens the prefilled modal (no expand)', async () => {
    const store = renderPage();
    const first = projectsOf(store)[0];
    if (!first) throw new Error('seed must contain at least one project');

    // The row is collapsed — no detail table in the document yet.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    const modal = await editFirstProject();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminEditProject' })
    ).toBeInTheDocument();
    expect(within(modal).getByLabelText('projectFieldTitle')).toHaveValue(first.title);
    // The action did NOT expand the card — it only opened the modal.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
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

  // ---- rev.3 (mywork-field-actions): field-scoped modal ----

  /** Expand the first card, then click the row Pencil for `rowKey`. */
  const openFieldEdit = async (rowKey: string) => {
    const id = firstCardId();
    // The strip's aria-label carries the project TITLE (not the id).
    const caption = document.querySelector(`[data-testid="project-card-caption-${id}"]`);
    const title = caption?.textContent?.trim();
    expect(title).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: `adminMyWorkExpand:${title}` }));
    // The caption unmounted; address the row actions by their stable testid.
    const cell = await screen.findByTestId(`project-field-actions-${id}-${rowKey}`);
    fireEvent.click(within(cell).getByRole('button', { name: /^adminMyWorkEditFieldTitle:/ }));
    return openDialog();
  };

  it('row Pencil opens the field-scoped modal (FieldEditForm, field-named title)', async () => {
    const store = renderPage();
    const first = projectsOf(store)[0];
    if (!first) throw new Error('seed must contain at least one project');

    const modal = await openFieldEdit('title');

    expect(
      within(modal).getByRole('heading', { level: 2, name: /^adminMyWorkEditFieldTitle:/ })
    ).toBeInTheDocument();
    // FieldEditForm — the ONE-field input, not the full ProjectForm.
    expect(within(modal).getByTestId('project-field-form')).toBeInTheDocument();
    expect(within(modal).getByLabelText('projectFieldTitle')).toHaveValue(first.title);
    expect(within(modal).queryByLabelText('projectFieldLink')).toBeNull();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('field Save persists a one-field partial and closes the modal', async () => {
    const store = renderPage();
    const first = projectsOf(store)[0];
    if (!first) throw new Error('seed must contain at least one project');

    const modal = await openFieldEdit('title');
    fireEvent.change(within(modal).getByLabelText('projectFieldTitle'), {
      target: { value: 'Renamed Shop' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'projectSave' }));

    await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0));
    const updated = projectsOf(store).find((p) => p.id === first.id);
    expect(updated?.title).toBe('Renamed Shop');
    // Siblings untouched — the patch touched ONLY the edited field.
    expect(updated?.year).toBe(first.year);
    expect(updated?.link).toBe(first.link);
    expect(persistSpy).toHaveBeenCalledTimes(1);
  });

  it('stale-guard: deleting the record being field-edited closes the modal', async () => {
    const store = renderPage();
    const first = projectsOf(store)[0];
    if (!first) throw new Error('seed must contain at least one project');

    await openFieldEdit('title');
    expect(screen.getByTestId('project-field-form')).toBeInTheDocument();

    // The record disappears "elsewhere" while the field modal is open.
    await deleteFirstRow();

    await waitFor(() => expect(projectsOf(store).some((p) => p.id === first.id)).toBe(false));
    expect(screen.queryAllByRole('dialog')).toHaveLength(0);
  });
});
