// ============================================
// SkillsEditorList tests (WU-5c pilot, plan_kit_datatable A6/OPEN-3/OPEN-5)
// ============================================
//
// RED-first contract for the DataTable pilot: FLAT rows (one per technology,
// plus a placeholder keeping an empty category reachable), category actions
// (Edit/Delete Category + Add Technology) on the FIRST visible row of each
// category in the current window (owner verdict 2026-10-10), controlled
// sorting, and Delete flows through a kit Modal confirm with persist BEFORE
// dispatch (§3) and Toast feedback. The react-redux store is a mutable
// holder whose dispatched actions REALLY mutate the rows, so "the row
// disappears" is a real assertion, not a mocked one.
//
// A6 (plan_kit_table): no heading elements inside cells — the first cell
// uses <strong>; category names are plain text now (this suite asserts the
// absence of level-3 headings).

import type { SkillCategory, SkillCategoryData } from '@/entities/Skill';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillsEditorList } from './SkillsEditorList';

const { persistSpy, deleteCategorySpy, deleteTechnologySpy, resetSpy, addToast, holder } =
  vi.hoisted(() => ({
    persistSpy: vi.fn((_data: unknown[]) => true),
    deleteCategorySpy: vi.fn((payload: unknown) => ({
      type: 'adminSkills/deleteSkillCategory',
      payload,
    })),
    deleteTechnologySpy: vi.fn((payload: unknown) => ({
      type: 'adminSkills/deleteTechnology',
      payload,
    })),
    resetSpy: vi.fn(() => ({ type: 'adminSkills/resetToDefaults' })),
    addToast: vi.fn(),
    holder: {
      state: {
        adminSkills: [
          {
            category: 'frontend',
            categoryName: 'Frontend',
            technologies: [
              { name: 'React', iconSvg: 'react' },
              { name: 'TypeScript', iconSvg: 'typescript' },
            ],
          },
          {
            category: 'backend',
            categoryName: 'Backend',
            technologies: [{ name: 'Node.js', iconSvg: 'nodejs' }],
          },
        ] as SkillCategoryData[],
      },
    },
  }));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistSkills: persistSpy,
  removeSkills: vi.fn(),
}));

vi.mock('../../model/slices/skillsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/skillsSlice')>()),
  deleteSkillCategory: deleteCategorySpy,
  deleteTechnology: deleteTechnologySpy,
  resetToDefaults: resetSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
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

// Store holder instead of StoreProvider: `features → app` is a banned FSD
// hop. Dispatch simulates the delete/reset reducers so §3's "record
// disappears" is exercised against real state transitions.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (action: { type?: string; payload?: string | { categoryId?: string } }) => {
      if (
        action?.type === 'adminSkills/deleteSkillCategory' &&
        typeof action.payload === 'string'
      ) {
        holder.state.adminSkills = holder.state.adminSkills.filter(
          (entry) => entry.category !== action.payload
        );
      }
      if (action?.type === 'adminSkills/deleteTechnology' && action.payload) {
        const payload = action.payload as { categoryId: string; techName: string };
        holder.state.adminSkills = holder.state.adminSkills.map((entry) =>
          entry.category === payload.categoryId
            ? {
                ...entry,
                technologies: entry.technologies.filter((tech) => tech.name !== payload.techName),
              }
            : entry
        );
      }
      if (action?.type === 'adminSkills/resetToDefaults') {
        holder.state.adminSkills = [];
      }
      return action;
    },
  };
});

const SEED: SkillCategoryData[] = [
  {
    category: 'frontend',
    categoryName: 'Frontend',
    technologies: [
      { name: 'React', iconSvg: 'react' },
      { name: 'TypeScript', iconSvg: 'typescript' },
    ],
  },
  {
    category: 'backend',
    categoryName: 'Backend',
    technologies: [{ name: 'Node.js', iconSvg: 'nodejs' }],
  },
];

const renderList = (props: Partial<React.ComponentProps<typeof SkillsEditorList>> = {}) => {
  const defaults = {
    onAddCategory: vi.fn(),
    onEditCategory: vi.fn(),
    onAddTechnology: vi.fn(),
    onEditTechnology: vi.fn(),
    onCategoryDeleted: vi.fn(),
    onTechnologyDeleted: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  return { ...render(<SkillsEditorList {...merged} />), ...merged };
};

/** Buttons of one technology row. */
const techActions = (techName: string) =>
  within(screen.getByTestId(`skill-tech-actions-${techName}`));

/** Buttons of one category (they live on that category's first visible row). */
const categoryActions = (categoryId: string) =>
  within(screen.getByTestId(`skill-category-actions-${categoryId}`));

describe('SkillsEditorList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminSkills = SEED.map((entry) => ({
      ...entry,
      technologies: [...entry.technologies],
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section intro and one flat row per technology (A6: no headings in cells)', () => {
    renderList();

    expect(screen.getByRole('heading', { level: 2, name: 'adminSkillsTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminSkillsHint')).toBeInTheDocument();

    // OPEN-5: flat rows — header row + one row per technology (3).
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4);

    // A6: the first cell is <strong>, never a heading — level 3 is gone.
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
    expect(screen.getByTestId('skill-tech-row-React')).toBeInTheDocument();
    expect(screen.getByTestId('skill-tech-row-TypeScript')).toBeInTheDocument();
    expect(screen.getByTestId('skill-tech-row-Node.js')).toBeInTheDocument();

    // Category identity lives in the Category cell of the category's first
    // row, with its count rendered as a plain number (§9).
    expect(screen.getByTestId('skill-category-row-frontend')).toHaveTextContent('Frontend');
    expect(screen.getByTestId('skill-category-row-frontend')).toHaveTextContent('2');
    expect(screen.getByTestId('skill-category-row-backend')).toHaveTextContent('Backend');
    expect(screen.getByTestId('skill-category-row-backend')).toHaveTextContent('1');
    // Exactly one category marker per category — later rows stay plain.
    expect(screen.getAllByTestId('skill-category-row-frontend')).toHaveLength(1);
    expect(screen.getAllByTestId('skill-category-row-backend')).toHaveLength(1);
  });

  it('renders each technology with Edit/Delete and the empty state when store is empty', () => {
    const { unmount } = renderList();

    expect(screen.getAllByRole('button', { name: 'skillsEditTechnology' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'skillsDelete' }).length).toBeGreaterThanOrEqual(
      4 // 3 tech deletes + 2 category deletes
    );
    unmount();

    // Empty store → skillsListEmpty, no rows, no controls (A5: rows.length>0 gate).
    holder.state.adminSkills = [];
    render(<SkillsEditorList onAddCategory={vi.fn()} onEditCategory={vi.fn()} />);
    expect(screen.getByText('skillsListEmpty')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByTestId('skills-pagination-footer')).toBeNull();
  });

  it('wires category add/edit callbacks', () => {
    const { onAddCategory, onEditCategory } = renderList();

    fireEvent.click(screen.getByRole('button', { name: 'skillsAddCategory' }));
    expect(onAddCategory).toHaveBeenCalledTimes(1);

    // Category actions sit on each category's first visible row.
    fireEvent.click(
      categoryActions('frontend').getByRole('button', { name: 'skillsEditCategory' })
    );
    expect(onEditCategory).toHaveBeenCalledWith(expect.objectContaining({ category: 'frontend' }));
  });

  it('wires technology add/edit callbacks with the owning category', () => {
    const { onAddTechnology, onEditTechnology } = renderList();

    fireEvent.click(
      categoryActions('frontend').getByRole('button', { name: 'skillsAddTechnology' })
    );
    expect(onAddTechnology).toHaveBeenCalledWith('frontend');

    fireEvent.click(techActions('React').getByRole('button', { name: 'skillsEditTechnology' }));
    expect(onEditTechnology).toHaveBeenCalledWith('frontend', 'React');
  });

  it('deletes a technology through Modal confirm: persist BEFORE dispatch + toast', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    deleteTechnologySpy.mockImplementation((payload: unknown) => {
      calls.push('dispatch');
      return { type: 'adminSkills/deleteTechnology', payload };
    });
    const { onTechnologyDeleted } = renderList();

    // §6: kit Modal confirm, not window.confirm.
    fireEvent.click(techActions('React').getByRole('button', { name: 'skillsDelete' }));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsDeleted' }))
    );
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        category: 'frontend',
        technologies: [expect.objectContaining({ name: 'TypeScript' })],
      }),
      expect.objectContaining({ category: 'backend' }),
    ]);
    await waitFor(() => expect(screen.queryByText('React')).not.toBeInTheDocument());
    expect(onTechnologyDeleted).toHaveBeenCalledWith('frontend', 'React');
  });

  it('technology delete: persist failure keeps the row and shows skillsPersistError', async () => {
    persistSpy.mockReturnValue(false);
    renderList();

    fireEvent.click(techActions('React').getByRole('button', { name: 'skillsDelete' }));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'skillsPersistError', type: 'error' })
      )
    );
    expect(deleteTechnologySpy).not.toHaveBeenCalled();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('deletes a whole category through Modal confirm and notifies the page', async () => {
    const { onCategoryDeleted } = renderList();

    fireEvent.click(categoryActions('backend').getByRole('button', { name: 'skillsDelete' }));

    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsDeleted' }))
    );
    expect(persistSpy).toHaveBeenCalledWith([expect.objectContaining({ category: 'frontend' })]);
    expect(deleteCategorySpy).toHaveBeenCalledWith('backend');
    expect(onCategoryDeleted).toHaveBeenCalledWith('backend');
    await waitFor(() => expect(screen.queryByText('Backend')).not.toBeInTheDocument());
  });

  it('reset restores defaults through Modal confirm (remove + dispatch)', async () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: 'skillsReset' }));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsReset' }));

    await waitFor(() => expect(resetSpy).toHaveBeenCalled());
    expect(persistSpy).not.toHaveBeenCalled(); // reset removes the key, it does not persist data
    await waitFor(() => expect(screen.getByText('skillsListEmpty')).toBeInTheDocument());
  });

  // ---- Pagination via kit DataTable (plan A5: controls never vanish) ----

  // Shared by the Pagination and Sorting pilots: seed N tech rows per category.
  const makeTechs = (prefix: string, count: number) =>
    Array.from({ length: count }, (_, index) => ({
      name: `${prefix}${index + 1}`,
      iconSvg: 'react',
    }));

  const CATEGORIES: SkillCategory[] = ['frontend', 'backend'];

  const setRows = (techsPerCategory: number[]) => {
    holder.state.adminSkills = techsPerCategory.map((count, index) => ({
      category: CATEGORIES[index] as SkillCategory,
      categoryName: `Category ${index + 1}`,
      technologies: makeTechs(`C${index + 1}T`, count),
    }));
  };

  describe('Pagination pilot', () => {
    it('shows controls (nav + range) even when everything fits on one page', () => {
      renderList(); // 3 rows ≤ 12

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('skills-pagination-footer')).toBeInTheDocument();
      expect(screen.getByText('paginationRange')).toBeInTheDocument();
    });

    it('drops back to a single page when the page-2 category is deleted', async () => {
      setRows([10, 3]); // 13 rows → 2 pages
      renderList();

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      // Items for page 1 of 13 (siblings=1): `1 2 … 13` — page 1 is the
      // current span, so the only `2` on screen is the page-2 button.
      fireEvent.click(screen.getByText('2'));
      expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByTestId('skill-tech-row-C1T1')).toBeNull();

      // Delete the backend category (the only record on page 2) through the Modal.
      fireEvent.click(categoryActions('backend').getByRole('button', { name: 'skillsDelete' }));
      const modal = await screen.findByRole('dialog');
      fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

      await waitFor(() => expect(screen.queryByText('Category 2')).not.toBeInTheDocument());
      // 10 rows ≤ PAGE_SIZE → the container's clamp resolves page 2 → 1;
      // controls stay visible (A5) and every technology is reachable again.
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      for (let index = 1; index <= 10; index += 1) {
        expect(screen.getByTestId(`skill-tech-row-C1T${index}`)).toBeInTheDocument();
      }
    });

    it('keeps the current page when a record on that page is edited', () => {
      setRows([10, 4]); // 14 rows → 2 pages
      const { onEditTechnology } = renderList();

      fireEvent.click(screen.getByText('2'));
      expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByTestId('skill-tech-row-C1T1')).toBeNull();

      fireEvent.click(techActions('C2T3').getByRole('button', { name: 'skillsEditTechnology' }));

      expect(onEditTechnology).toHaveBeenCalledWith('backend', 'C2T3');
      // No router coupling in this component: leaving for the edit form and
      // coming Back cannot reset `page` (manual check in the real router).
      expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByTestId('skill-tech-row-C1T1')).toBeNull();
    });
  });

  // ---- Controlled sorting (plan_kit_datatable WU-5, OPEN-1) ----
  describe('Sorting (WU-5)', () => {
    it('offers sort toggles on name/category columns only', () => {
      renderList();

      expect(screen.getByRole('button', { name: 'technologies' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'projectFieldCategory' })).toBeInTheDocument();
      // The actions column is not sortable — its header is plain text.
      expect(screen.queryByRole('button', { name: 'skillsTableActions' })).toBeNull();
      // Unsorted → no aria-sort anywhere.
      for (const header of screen.getAllByRole('columnheader')) {
        expect(header).not.toHaveAttribute('aria-sort');
      }
    });

    it('sorts technologies asc → desc by click (controlled: re-render echoes state)', () => {
      renderList();

      const order = () =>
        screen
          .getAllByRole('row')
          .slice(1) // header row
          .map((row) => row.querySelector('td')?.textContent ?? '');

      fireEvent.click(screen.getByRole('button', { name: 'technologies' }));
      expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'ascending');
      expect(order()).toEqual(['Node.js', 'React', 'TypeScript']);

      fireEvent.click(screen.getByRole('button', { name: 'technologies' }));
      expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'descending');
      expect(order()).toEqual(['TypeScript', 'React', 'Node.js']);
    });

    it('sorts by category and moves category actions with the first visible row', () => {
      renderList();

      // asc by category name: Backend < Frontend → Node.js row leads.
      fireEvent.click(screen.getByRole('button', { name: 'projectFieldCategory' }));
      expect(screen.getAllByRole('columnheader')[1]).toHaveAttribute('aria-sort', 'ascending');
      expect(screen.getByTestId('skill-tech-row-Node.js')).toBeInTheDocument();

      // Category actions follow the FIRST visible row of their category:
      // after sorting by technology, React is the first frontend row and
      // TypeScript carries no category buttons.
      fireEvent.click(screen.getByRole('button', { name: 'technologies' }));
      const frontendMarkers = screen.getAllByTestId('skill-category-actions-frontend');
      expect(frontendMarkers).toHaveLength(1);
      expect(frontendMarkers[0]?.closest('tr')?.querySelector('td')?.textContent).toBe('React');
      expect(
        screen
          .getByTestId('skill-tech-row-TypeScript')
          .closest('tr')
          ?.querySelector('[data-testid^="skill-category-actions-"]')
      ).toBeNull();
    });

    it('resets to the first page on sort — the top of the new order must be visible', () => {
      setRows([10, 4]); // 14 rows → 2 pages
      renderList();

      fireEvent.click(screen.getByText('2'));
      expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(screen.queryByTestId('skill-tech-row-C1T1')).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: 'technologies' }));

      // Page returns to 1, so the beginning of the freshly sorted order is
      // what the user actually sees (staying on page 2 would look like a
      // no-op sort).
      expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
      expect(screen.getByTestId('skill-tech-row-C1T1')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'ascending');
    });

    it('keeps every row reachable: placeholder row for an empty category', () => {
      holder.state.adminSkills = [
        ...SEED.map((entry) => ({ ...entry, technologies: [...entry.technologies] })),
        {
          category: 'devops',
          categoryName: 'DevOps',
          technologies: [],
        },
      ];
      renderList();

      // The placeholder keeps the empty category actionable (its first cell
      // says so, its actions cell carries the category buttons).
      expect(screen.getByTestId('skill-category-actions-devops')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(5); // header + 3 techs + placeholder
    });
  });
});
