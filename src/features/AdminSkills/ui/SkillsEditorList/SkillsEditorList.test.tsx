// ============================================
// SkillsEditorList tests (plan_admin_panel_edit rev.3, WU-1)
// ============================================
//
// Contract of the per-category rewrite: ONE DataTable per category (block
// order = storage order, OPEN-6), block header = h3 (category name +
// plural count Badge via `skillsCategoryCount`, verdict OPEN-8) + the
// block-level actions (Edit/Add technology/Delete — verdict OPEN-3), no
// category column, EmptyState `skillsCategoryEmpty` instead of a
// placeholder row (verdict OPEN-7), section-level `skillsListEmpty` when
// the STORE is empty. Page and sort are PER TABLE keyed by category (A4):
// clicking a toggle only emits `onSortChange` for its own block (A9) and
// resets that block to page 1; the kit owns the clamp (A10).
//
// The react-redux store is a mutable holder whose dispatched actions
// REALLY mutate the rows, so "the row disappears" is a real assertion,
// not a mocked one. A6 (plan_kit_table): no heading elements inside
// cells — the first cell uses <strong>.
//
// The t() mock renders options as `${key}:${parts}` — `count` for badge
// assertions, `number` for pagination pages, and `name` (WU-6, OPEN-10)
// so the confirm subtitle can prove it NAMES the entity.

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
// Known options render as `${key}:${values}` (name, count, number), so a
// test can verify WHICH option was passed, not just the key.
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

/** Buttons of one technology row (row actions, unchanged ids). */
const techActions = (techName: string) =>
  within(screen.getByTestId(`skill-tech-actions-${techName}`));

/** Block-level category actions (Edit/Add technology/Delete) in the header. */
const categoryActions = (categoryId: string) =>
  within(screen.getByTestId(`skill-category-actions-${categoryId}`));

const block = (categoryId: string) =>
  within(screen.getByTestId(`skills-category-block-${categoryId}`));

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

  it('renders one block per category: h3 + plural badge + its own table (A6 cells)', () => {
    renderList();

    expect(screen.getByRole('heading', { level: 2, name: 'adminSkillsTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminSkillsHint')).toBeInTheDocument();

    // OPEN-6: block order = storage order (frontend first).
    const blocks = screen.getAllByTestId(/^skills-category-block-/);
    expect(blocks).toHaveLength(2);
    expect(within(blocks[0] as HTMLElement).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Frontend'
    );

    // Verdict OPEN-8: the h3 carries name + plural count badge, with the
    // count OPTION passed to the plural key (`${key}:${count}` mock).
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent('skillsCategoryCount:2');
    expect(headings[1]).toHaveTextContent('Backend');
    expect(headings[1]).toHaveTextContent('skillsCategoryCount:1');

    // One table per category, named by its caption — no shared flat table.
    expect(screen.getAllByRole('table')).toHaveLength(2);
    expect(screen.getByRole('table', { name: 'Frontend' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Backend' })).toBeInTheDocument();
    expect(block('frontend').getAllByRole('row')).toHaveLength(3); // header + 2 techs
    expect(block('backend').getAllByRole('row')).toHaveLength(2); // header + 1 tech

    expect(screen.getByTestId('skill-tech-row-React')).toBeInTheDocument();
    expect(screen.getByTestId('skill-tech-row-TypeScript')).toBeInTheDocument();
    expect(screen.getByTestId('skill-tech-row-Node.js')).toBeInTheDocument();

    // A6: the tech cell is <strong>, never a heading (level 3 lives only
    // in the block header, outside the table).
    const techCell = screen.getByTestId('skill-tech-row-React');
    expect(techCell.querySelector('strong')?.textContent).toBe('React');
    expect(techCell.closest('tr')?.querySelector('h1,h2,h3,h4,h5,h6')).toBeNull();
  });

  it('renders tech edit/delete buttons; empty store shows the section empty state', () => {
    const { unmount } = renderList();

    expect(screen.getAllByRole('button', { name: 'skillsEditTechnology' })).toHaveLength(3);
    // 3 tech-row deletes + 2 block-level category deletes.
    expect(screen.getAllByRole('button', { name: 'skillsDelete' })).toHaveLength(5);
    unmount();

    // Empty store → skillsListEmpty, no blocks, no controls (A5 gate).
    holder.state.adminSkills = [];
    render(<SkillsEditorList onAddCategory={vi.fn()} onEditCategory={vi.fn()} />);
    expect(screen.getByText('skillsListEmpty')).toBeInTheDocument();
    expect(screen.queryByTestId(/^skills-category-block-/)).toBeNull();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryAllByTestId(/^skills-pagination-footer/)).toHaveLength(0);
  });

  it('wires category add/edit callbacks', () => {
    const { onAddCategory, onEditCategory } = renderList();

    fireEvent.click(screen.getByRole('button', { name: 'skillsAddCategory' }));
    expect(onAddCategory).toHaveBeenCalledTimes(1);

    // Block-level actions live in the category block's header.
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

  // WU-4: pin the placement map after WU-5 — section header / block header / row column.
  it('places every action per the placement map (section / block header / row column)', () => {
    renderList();

    // Section header: «Добавить категорию» + reset live next to the list h2 —
    // NOT inside a category block (OPEN-3 keeps «Добавить технологию» out of here).
    const section = screen.getByTestId('skills-editor-list');
    expect(within(section).getAllByRole('button', { name: 'skillsAddCategory' })).toHaveLength(1);
    expect(within(section).getByRole('button', { name: 'skillsReset' })).toBeInTheDocument();

    // Block header (OPEN-3): exactly Edit category / Add technology / Delete category.
    const blockButtons = categoryActions('frontend')
      .getAllByRole('button')
      .map((button) => button.textContent);
    expect(blockButtons).toEqual(['skillsEditCategory', 'skillsAddTechnology', 'skillsDelete']);

    // Row actions column: ONLY that technology's Edit + Delete (SPEC) — no add.
    const rowButtons = techActions('React')
      .getAllByRole('button')
      .map((button) => button.textContent);
    expect(rowButtons).toEqual(['skillsEditTechnology', 'skillsDelete']);
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
    // OPEN-10 «Вариант А»: the confirm text (subtitle → aria-describedby) NAMES the entity.
    expect(within(modal).getByText('skillsConfirmDelete:React')).toBeInTheDocument();
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
    // OPEN-9: the confirm modal stays OPEN for a retry (unified with the forms).
    const openDialog = screen.getByRole('dialog');
    expect(openDialog).toBeInTheDocument();
    expect(within(openDialog).getByRole('button', { name: 'skillsDelete' })).toBeEnabled();
  });

  it('deletes a whole category through Modal confirm and notifies the page', async () => {
    const { onCategoryDeleted } = renderList();

    fireEvent.click(categoryActions('backend').getByRole('button', { name: 'skillsDelete' }));

    const modal = await screen.findByRole('dialog');
    // OPEN-4 + OPEN-10: category confirm names it and shows scale — count when N > 0.
    expect(within(modal).getByText('skillsConfirmDeleteCategory:Backend:1')).toBeInTheDocument();
    fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'skillsDeleted' }))
    );
    expect(persistSpy).toHaveBeenCalledWith([expect.objectContaining({ category: 'frontend' })]);
    expect(deleteCategorySpy).toHaveBeenCalledWith('backend');
    expect(onCategoryDeleted).toHaveBeenCalledWith('backend');
    // The whole BLOCK disappears with its record.
    await waitFor(() => expect(screen.queryByTestId('skills-category-block-backend')).toBeNull());
    expect(screen.queryByText('Backend')).not.toBeInTheDocument();
  });

  it('moves focus to «Отмена» after the destructive confirm opens (SPEC §6)', async () => {
    renderList();

    fireEvent.click(techActions('React').getByRole('button', { name: 'skillsDelete' }));
    const modal = await screen.findByRole('dialog');
    const cancel = within(modal).getByRole('button', { name: 'skillsCancel' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('category confirm with N=0: names the category and shows NO count (OPEN-4)', async () => {
    holder.state.adminSkills = [
      { category: 'frontend', categoryName: 'Frontend', technologies: [] },
    ];
    renderList();

    fireEvent.click(categoryActions('frontend').getByRole('button', { name: 'skillsDelete' }));
    const modal = await screen.findByRole('dialog');
    // No `count` option → the base key (без количества), but the name is there.
    expect(within(modal).getByText('skillsConfirmDeleteCategory:Frontend')).toBeInTheDocument();
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
    it('shows controls (size group + nav + range) per block even when everything fits', () => {
      renderList(); // 2 + 1 rows, both blocks ≤ 5

      // A5: every non-empty block renders its own controls.
      expect(screen.getAllByRole('navigation')).toHaveLength(2);
      expect(screen.getAllByTestId(/^skills-pagination-footer/)).toHaveLength(2);
      expect(screen.getAllByText('paginationRange')).toHaveLength(2);
      // Verdict OPEN-1: kit PageSizeGroup (5/10/20, default 5) per block.
      expect(screen.getAllByRole('group', { name: 'perPageLabel' })).toHaveLength(2);
      expect(block('frontend').getByRole('button', { name: '5' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('keeps page state independent per block (A4)', async () => {
      setRows([15, 3]); // block1: 15 rows / 5 = 3 pages; block2: 3 → 1 page
      renderList();

      // 3 pages prove the default size is 5, not 12 (kit aria-label
      // `paginationPage` carries the number option).
      expect(
        block('frontend').getByRole('button', { name: 'paginationPage:3' })
      ).toBeInTheDocument();

      fireEvent.click(block('frontend').getByText('2'));
      expect(block('frontend').getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').queryByTestId('skill-tech-row-C1T1')).toBeNull();
      expect(block('frontend').getByTestId('skill-tech-row-C1T6')).toBeInTheDocument();

      // The other block is untouched: still its own page 1.
      expect(block('backend').getByText('1')).toHaveAttribute('aria-current', 'page');
      expect(block('backend').getByTestId('skill-tech-row-C2T1')).toBeInTheDocument();

      // Deleting the OTHER block does not disturb this block's page (A4).
      fireEvent.click(categoryActions('backend').getByRole('button', { name: 'skillsDelete' }));
      const modal = await screen.findByRole('dialog');
      fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

      await waitFor(() => expect(screen.queryByTestId('skills-category-block-backend')).toBeNull());
      expect(block('frontend').getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').queryByTestId('skill-tech-row-C1T1')).toBeNull();
      expect(block('frontend').getByTestId('skill-tech-row-C1T6')).toBeInTheDocument();
    });

    it('changes the page size per block: reset to page 1, other block untouched', () => {
      setRows([15, 3]);
      renderList();

      fireEvent.click(block('frontend').getByText('2'));
      expect(block('frontend').queryByTestId('skill-tech-row-C1T1')).toBeNull();

      // Verdict OPEN-1: pick 10 in the FRONTEND block only.
      fireEvent.click(
        within(block('frontend').getByRole('group', { name: 'perPageLabel' })).getByRole('button', {
          name: '10',
        })
      );

      // New size → back to page 1 (no hidden top of the re-windowed order).
      expect(block('frontend').getByTestId('skill-tech-row-C1T1')).toBeInTheDocument();
      expect(block('frontend').getByTestId('skill-tech-row-C1T10')).toBeInTheDocument();
      expect(block('frontend').queryByTestId('skill-tech-row-C1T11')).toBeNull();
      expect(
        within(block('frontend').getByRole('group', { name: 'perPageLabel' })).getByRole('button', {
          name: '10',
        })
      ).toHaveAttribute('aria-pressed', 'true');

      // A4: the backend block keeps its own size of 5.
      const backendGroup = within(block('backend').getByRole('group', { name: 'perPageLabel' }));
      expect(backendGroup.getByRole('button', { name: '5' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('clamps page to the new totalPages when the last row of the last page is deleted (A10)', async () => {
      setRows([11, 3]); // block1: 11 rows / 5 = 3 pages, page 3 holds C1T11 only
      renderList();

      fireEvent.click(block('frontend').getByText('3'));
      expect(block('frontend').getByTestId('skill-tech-row-C1T11')).toBeInTheDocument();

      fireEvent.click(techActions('C1T11').getByRole('button', { name: 'skillsDelete' }));
      const modal = await screen.findByRole('dialog');
      fireEvent.click(within(modal).getByRole('button', { name: 'skillsDelete' }));

      // 10 rows → 2 pages: the stale page 3 is clamped to page 2 — no empty page.
      await waitFor(() =>
        expect(block('frontend').queryByTestId('skill-tech-row-C1T11')).toBeNull()
      );
      expect(block('frontend').getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').getByTestId('skill-tech-row-C1T6')).toBeInTheDocument();
      expect(block('frontend').queryByRole('button', { name: 'paginationPage:3' })).toBeNull();
    });

    it('keeps the current page when a record on that page is edited', () => {
      setRows([15, 3]); // block1: 15 rows / 5 = 3 pages
      const { onEditTechnology } = renderList();

      fireEvent.click(block('frontend').getByText('2'));
      expect(block('frontend').getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').queryByTestId('skill-tech-row-C1T1')).toBeNull();

      fireEvent.click(techActions('C1T7').getByRole('button', { name: 'skillsEditTechnology' }));

      expect(onEditTechnology).toHaveBeenCalledWith('frontend', 'C1T7');
      // No router coupling in this component: leaving for the edit form and
      // coming Back cannot reset `page` (manual check in the real router).
      expect(block('frontend').getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').queryByTestId('skill-tech-row-C1T1')).toBeNull();
    });
  });

  // ---- Controlled sorting (plan_admin_panel_edit WU-1, kit WU-5 contract) ----
  describe('Sorting (per-block, A4/A9)', () => {
    it('offers a sort toggle on the tech column only (category column is gone)', () => {
      renderList();

      // One toggle per table — no shared flat table, no category column.
      expect(screen.getAllByRole('button', { name: 'technologies' })).toHaveLength(2);
      expect(screen.queryByRole('button', { name: 'projectFieldCategory' })).toBeNull();
      // The actions column is not sortable — its header is plain text.
      expect(screen.queryByRole('button', { name: 'skillsTableActions' })).toBeNull();
      // Unsorted → no aria-sort anywhere (2 tables × 2 columns).
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      for (const header of screen.getAllByRole('columnheader')) {
        expect(header).not.toHaveAttribute('aria-sort');
      }
    });

    it('sorts asc → desc → исходный within its block, without touching the other', () => {
      setRows([3, 3]);
      renderList();

      const order = (scope: ReturnType<typeof within>) =>
        scope
          .getAllByRole('row')
          .slice(1) // header row
          .map((row: HTMLElement) => row.querySelector('td')?.textContent ?? '');

      const frontend = block('frontend');
      const backend = block('backend');
      const backendOrderBefore = order(backend);

      fireEvent.click(frontend.getByRole('button', { name: 'technologies' }));
      expect(frontend.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'ascending');
      expect(order(frontend)).toEqual(['C1T1', 'C1T2', 'C1T3']);
      // A4: sorting one block leaves the other block's sort untouched.
      expect(backend.getAllByRole('columnheader')[0]).not.toHaveAttribute('aria-sort');
      expect(order(backend)).toEqual(backendOrderBefore);

      fireEvent.click(frontend.getByRole('button', { name: 'technologies' }));
      expect(frontend.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'descending');
      expect(order(frontend)).toEqual(['C1T3', 'C1T2', 'C1T1']);

      // Third click of the same key → back to the исходный порядок.
      fireEvent.click(frontend.getByRole('button', { name: 'technologies' }));
      expect(frontend.getAllByRole('columnheader')[0]).not.toHaveAttribute('aria-sort');
      expect(order(frontend)).toEqual(['C1T1', 'C1T2', 'C1T3']);
    });

    it('resets only its own block to page 1 on sort', () => {
      setRows([15, 3]);
      renderList();

      fireEvent.click(block('frontend').getByText('2'));
      expect(block('frontend').getByText('2')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').queryByTestId('skill-tech-row-C1T1')).toBeNull();

      fireEvent.click(block('frontend').getByRole('button', { name: 'technologies' }));

      // Page returns to 1, so the beginning of the freshly sorted order is
      // what the user actually sees (staying on page 2 would look like a
      // no-op sort) — and only THIS block resets.
      expect(block('frontend').getByText('1')).toHaveAttribute('aria-current', 'page');
      expect(block('frontend').getByTestId('skill-tech-row-C1T1')).toBeInTheDocument();
      expect(block('frontend').getAllByRole('columnheader')[0]).toHaveAttribute(
        'aria-sort',
        'ascending'
      );
      expect(block('backend').getAllByRole('columnheader')[0]).not.toHaveAttribute('aria-sort');
    });

    it('renders skillsCategoryEmpty in an empty block (no placeholder row)', () => {
      holder.state.adminSkills = [
        ...SEED.map((entry) => ({ ...entry, technologies: [...entry.technologies] })),
        {
          category: 'devops',
          categoryName: 'DevOps',
          technologies: [],
        },
      ];
      renderList();

      // OPEN-7: the block stays reachable (header actions intact) but its
      // table renders the EmptyState instead of a placeholder row.
      expect(block('devops').getByText('skillsCategoryEmpty')).toBeInTheDocument();
      expect(
        categoryActions('devops').getByRole('button', { name: 'skillsEditCategory' })
      ).toBeInTheDocument();
      expect(block('devops').queryAllByTestId(/^skills-pagination-footer/)).toHaveLength(0);
      expect(block('devops').queryByRole('navigation')).toBeNull();
      // 3 real tech rows total — no placeholder row anywhere.
      expect(screen.getAllByTestId(/^skill-tech-row-/)).toHaveLength(3);
    });
  });
});
