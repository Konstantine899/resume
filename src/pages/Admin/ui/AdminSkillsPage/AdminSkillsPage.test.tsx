// ============================================
// AdminSkillsPage — page-level modal criteria (WU-8, plan rev.3)
// ============================================
//
// The PAGE owns the form modal (A7 Save closes, A8 Cancel/ESC/overlay,
// A12 one open modal at a time); SkillsEditorList.test.tsx owns the
// confirm modal's internals (OPEN-4/9/10). This file wires the REAL
// storeReducers — the skills slice hydrates the seed on its first
// reducer call (state ?? readSkills() ?? skillsSeed()) — and mocks only
// storage (persist control), i18n (identity) and toasts.
//
// A12 note: jsdom ignores the modal overlay, so «one modal at a time» is
// structural here — a single `form` state renders ONE dialog, and in a
// real browser the overlay blocks the list behind an open form.

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SkillCategoryData } from '@/entities/Skill';
import { storeReducers } from '@/storeReducers';
import { AdminSkillsPage } from './AdminSkillsPage';

const { persistSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addToast: vi.fn(),
}));

vi.mock('@/features/AdminSkills/model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/AdminSkills/model/services/storage')>()),
  persistSkills: persistSpy,
  removeSkills: vi.fn(),
}));

// Identity t(): raw keys in assertions; known options render as
// `${key}:${values}` (confirm copy proves it names the entity).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { name?: string; count?: number; number?: number }) => {
      const parts = [options?.name, options?.count, options?.number].filter(
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
      <AdminSkillsPage />
    </Provider>
  );
  return store;
};

const categoriesOf = (store: ReturnType<typeof renderPage>): SkillCategoryData[] =>
  store.getState().adminSkills;

const openDialog = async () => screen.findByRole('dialog');

const openCategoryCreate = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'skillsAddCategory' }));
  return openDialog();
};

const fillCategoryName = (name: string) => {
  fireEvent.change(within(screen.getByRole('dialog')).getByLabelText('skillsCategoryName'), {
    target: { value: name },
  });
};

describe('AdminSkillsPage (modal criteria)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('«Добавить категорию» opens ONE create modal with the category form', async () => {
    renderPage();

    const modal = await openCategoryCreate();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'skillsAddCategory' })
    ).toBeInTheDocument();
    expect(within(modal).getByTestId('skill-category-form')).toBeInTheDocument();
    // A12: the page renders a single dialog for its single `form` state.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('«Добавить технологию» opens a modal pinned to its category (title + subtitle)', async () => {
    renderPage();

    const firstAddTech = screen.getAllByRole('button', {
      name: 'skillsAddTechnology',
    })[0] as HTMLElement;
    fireEvent.click(firstAddTech);
    const modal = await openDialog();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'skillsAddTechnology' })
    ).toBeInTheDocument();
    // Fixed category, «как сейчас muted-строкой» → modal subtitle (SPEC).
    expect(within(modal).getByText('frontend')).toBeInTheDocument();
    expect(within(modal).getByTestId('technology-form')).toBeInTheDocument();
  });

  it('edit technology: prefilled modal; Save renames the row in the store', async () => {
    const store = renderPage();

    fireEvent.click(
      within(screen.getByTestId('skill-tech-actions-React')).getByRole('button', {
        name: 'skillsEditTechnology',
      })
    );
    const modal = await openDialog();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'skillsEditTechnology' })
    ).toBeInTheDocument();
    const nameInput = within(modal).getByLabelText('skillsTechnologyName');
    expect(nameInput).toHaveValue('React');

    fireEvent.change(nameInput, { target: { value: 'Preact' } });
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsSaved' }))
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const frontend = categoriesOf(store).find((entry) => entry.category === 'frontend');
    const names = frontend?.technologies.map((tech) => tech.name) ?? [];
    expect(names).toContain('Preact');
    expect(names).not.toContain('React');
    // The renamed row occupies the same window slot on page 1.
    expect(screen.getByTestId('skill-tech-row-Preact')).toBeInTheDocument();
    expect(screen.queryByTestId('skill-tech-row-React')).not.toBeInTheDocument();
  });

  it('valid create Save: persist → dispatch → toast skillsSaved → modal closes (A7)', async () => {
    const store = renderPage();

    const modal = await openCategoryCreate();
    // 'methodologies' is the one category free of the six seeded ones.
    fireEvent.change(within(modal).getByLabelText('skillsCategoryType'), {
      target: { value: 'methodologies' },
    });
    fillCategoryName('Method Library');
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsSaved' }))
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // persist BEFORE dispatch — the persisted array carries the new record.
    expect(persistSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ category: 'methodologies' })])
    );
    expect(categoriesOf(store).some((entry) => entry.category === 'methodologies')).toBe(true);
  });

  it('invalid Save: error visible, nothing persisted, modal stays open', async () => {
    const store = renderPage();
    const before = categoriesOf(store).length;

    const modal = await openCategoryCreate();
    // Free category key → the ONLY error is the short display name.
    fireEvent.change(within(modal).getByLabelText('skillsCategoryType'), {
      target: { value: 'methodologies' },
    });
    fillCategoryName('ab'); // < min(3)
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsSave' }));

    expect(await within(modal).findByRole('alert')).toHaveTextContent('skillsErrCategoryName');
    expect(persistSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(categoriesOf(store)).toHaveLength(before);
  });

  it('storage error on Save: toast skillsPersistError, modal open, store unchanged', async () => {
    persistSpy.mockReturnValue(false);
    const store = renderPage();
    const before = categoriesOf(store).length;

    const modal = await openCategoryCreate();
    fireEvent.change(within(modal).getByLabelText('skillsCategoryType'), {
      target: { value: 'methodologies' },
    });
    fillCategoryName('Method Library');
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'skillsPersistError', type: 'error' })
      )
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(categoriesOf(store)).toHaveLength(before);
  });

  it('Cancel closes the modal without saving (A8)', async () => {
    const store = renderPage();
    const before = categoriesOf(store).length;

    const modal = await openCategoryCreate();
    fillCategoryName('Method Library'); // dirty, but Cancel must discard
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalled();
    expect(categoriesOf(store)).toHaveLength(before);
  });

  it('ESC closes the modal (A8)', async () => {
    renderPage();
    await openCategoryCreate();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('overlay pointer-down closes the modal (A8)', async () => {
    renderPage();
    await openCategoryCreate();

    const overlay = document.querySelector('[data-dark]');
    // M14: assert existence instead of silently passing when null.
    expect(overlay).not.toBeNull();
    fireEvent.pointerDown(overlay as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('confirm names the entity, then deletes through the real store', async () => {
    const store = renderPage();

    fireEvent.click(
      within(screen.getByTestId('skill-tech-actions-React')).getByRole('button', {
        name: 'skillsDelete',
      })
    );
    const modal = await openDialog();

    // OPEN-10 «Вариант А»: the confirm subtitle names the technology.
    expect(within(modal).getByText('skillsConfirmDelete:React')).toBeInTheDocument();
    expect(
      within(modal).getByRole('heading', { level: 2, name: 'skillsDelete' })
    ).toBeInTheDocument();
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsDeleted' }))
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    const frontend = categoriesOf(store).find((entry) => entry.category === 'frontend');
    expect(frontend?.technologies.map((tech) => tech.name)).not.toContain('React');
    expect(screen.queryByTestId('skill-tech-row-React')).not.toBeInTheDocument();
  });
});
