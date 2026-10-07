// ============================================
// SkillsEditorList tests (WU-5, plan_skills_crud §9, §6, §3)
// ============================================
//
// RED-first contract: category rows (name, count, Edit/Delete) + nested
// technology rows, the empty state, callback wiring for the page-owned
// forms, and Delete flows through a kit Modal confirm with persist
// BEFORE dispatch (§3) and Toast feedback (§10). The react-redux store is
// a mutable holder whose dispatched actions REALLY mutate the rows, so
// "the row disappears" is a real assertion, not a mocked one.

import type { SkillCategoryData } from '@/entities/Skill';
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

  it('renders the section intro and one row per category with its count', () => {
    renderList();

    expect(screen.getByRole('heading', { level: 2, name: 'adminSkillsTitle' })).toBeInTheDocument();
    expect(screen.getByText('adminSkillsHint')).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 3, name: 'Frontend' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Backend' })).toBeInTheDocument();
    // §9: name + count per category — counts rendered as plain numbers.
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('2');
    expect(rows[1]).toHaveTextContent('1');
  });

  it('renders each technology with Edit/Delete and the empty state when store is empty', () => {
    renderList();

    expect(screen.getAllByRole('button', { name: 'skillsEditTechnology' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'skillsDelete' }).length).toBeGreaterThanOrEqual(
      3
    );

    // Empty store → skillsListEmpty, no rows.
    holder.state.adminSkills = [];
    render(<SkillsEditorList onAddCategory={vi.fn()} onEditCategory={vi.fn()} />);
    expect(screen.getByText('skillsListEmpty')).toBeInTheDocument();
  });

  it('wires category add/edit callbacks', () => {
    const { onAddCategory, onEditCategory } = renderList();

    fireEvent.click(screen.getByRole('button', { name: 'skillsAddCategory' }));
    expect(onAddCategory).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getAllByRole('button', { name: 'skillsEditCategory' })[0] as HTMLElement
    );
    expect(onEditCategory).toHaveBeenCalledWith(expect.objectContaining({ category: 'frontend' }));
  });

  it('wires technology add/edit callbacks with the owning category', () => {
    const { onAddTechnology, onEditTechnology } = renderList();

    fireEvent.click(
      screen.getAllByRole('button', { name: 'skillsAddTechnology' })[0] as HTMLElement
    );
    expect(onAddTechnology).toHaveBeenCalledWith('frontend');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'skillsEditTechnology' })[0] as HTMLElement
    );
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
    const techRow = screen.getByTestId('skill-tech-row-React');
    fireEvent.click(within(techRow).getByRole('button', { name: 'skillsDelete' }));
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

    const techRow = screen.getByTestId('skill-tech-row-React');
    fireEvent.click(within(techRow).getByRole('button', { name: 'skillsDelete' }));
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

    // Category actions live in their own container (tech rows are divs
    // with their own delete buttons — getAllByRole('listitem') = categories).
    const actions = screen.getByTestId('skill-category-actions-backend');
    fireEvent.click(within(actions).getByRole('button', { name: 'skillsDelete' }));

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
});
