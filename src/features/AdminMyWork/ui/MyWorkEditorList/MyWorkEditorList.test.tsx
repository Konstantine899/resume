// ============================================
// MyWorkEditorList tests (admin-mywork-refactor WU-5, SPEC R-5)
// ============================================
//
// RED-first contract: the vitrina is the kit DataTable — columns title /
// category / status / featured / year / actions, controlled sort (sort →
// page=1), Page-size 5|10|20 + navigation whenever rows exist, the
// range counter under the table, and the header (h2+hint+IconButton add,
// the SkillsEditorList:232-238 pattern). Edit emits onEdit(id); Delete
// goes through a kit Modal confirm with persist BEFORE dispatch (§3) and
// Toast feedback (§6). The react-redux store is a mutable holder so the
// empty state can be rendered without a second mock.

import type { Project } from '@/entities/Project';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProjectsSeed } from '../../model/services/seed';
import { MyWorkEditorList } from './MyWorkEditorList';

const { persistSpy, deleteSpy, calls, addToast, holder } = vi.hoisted(() => {
  // Shared order log: the §3 contract is persist BEFORE dispatch.
  const calls: string[] = [];
  return {
    calls,
    persistSpy: vi.fn((_projects: unknown[]) => {
      calls.push('persist');
      return true;
    }),
    deleteSpy: vi.fn((id: string) => {
      calls.push('dispatch');
      return { type: 'myWork/deleteProject', payload: id };
    }),
    addToast: vi.fn(),
    holder: { state: { myWork: [] as Project[] } },
  };
});

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistProjects: persistSpy,
}));

vi.mock('../../model/slices/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/myWorkSlice')>()),
  deleteProject: deleteSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// Interpolation renders as `key:values` — confirm subtitles name the
// entity, Pagination aria-labels stay addressable, the range counter
// proves the from/to/total window.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (
      key: string,
      options?: { name?: string; number?: number; from?: number; to?: number; total?: number }
    ) => {
      const parts = [
        options?.name,
        options?.number,
        options?.from,
        options?.to,
        options?.total,
      ].filter((value) => value !== undefined);
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
// hop; the REAL selectors run against whatever state the test installs.
// Dispatch simulates the delete reducer so §6's "row disappears" is real:
// without it the holder never changes and rows would stay stale.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: { myWork: Project[] }) => unknown) => selector(holder.state),
    useDispatch: () => (action: { type?: string; payload?: string }) => {
      if (action?.type === 'myWork/deleteProject' && typeof action.payload === 'string') {
        holder.state = { myWork: holder.state.myWork.filter((p) => p.id !== action.payload) };
      }
      return action;
    },
  };
});

const seedProjects = createProjectsSeed();

const renderList = (props: Partial<React.ComponentProps<typeof MyWorkEditorList>> = {}) => {
  const defaults = {
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDeleted: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  render(<MyWorkEditorList {...merged} />);
  return merged;
};

/**
 * Body rows of the kit Table (the first `row` is the header). The vitrina
 * swap (WU-5) replaced `<li role="listitem">` rows with table rows — role
 * semantics move with the markup (Jobs/Skills parity).
 */
const dataRows = (): HTMLElement[] => screen.getAllByRole('row').slice(1);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  calls.length = 0;
  holder.state = { myWork: seedProjects };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('MyWorkEditorList: vitrina render (R-5)', () => {
  it('renders the first window of projects with title, status and Edit/Delete', () => {
    renderList();

    const rows = dataRows();
    // Default page size windows the seven seed records.
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent(seedProjects[0]?.title ?? '');
    // Status badge shows the enum value of the first row.
    expect(rows[0]).toHaveTextContent(seedProjects[0]?.status ?? '');
    // Every row offers both actions.
    for (const row of rows) {
      expect(within(row).getByRole('button', { name: 'projectEdit' })).toBeInTheDocument();
      expect(within(row).getByRole('button', { name: 'projectDelete' })).toBeInTheDocument();
    }
    // Featured badge count matches the flags within the VISIBLE window.
    expect(screen.getAllByText('projectFieldFeatured')).toHaveLength(
      seedProjects.slice(0, 5).filter((project) => project.featured).length
    );
  });

  it('shows the shared empty state when nothing is stored', () => {
    holder.state = { myWork: [] };
    renderList();

    expect(screen.getByText('noProjectsYet')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'projectEdit' })).not.toBeInTheDocument();
  });

  it('renders the kit EmptyState for an empty list (R-3)', () => {
    holder.state = { myWork: [] };
    renderList();

    const title = screen.getByText('noProjectsYet');
    // EmptyState's title slot is a div (kit) — not the old bare <p> Paragraph.
    expect(title.tagName).toBe('DIV');
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.queryAllByRole('button', { name: 'projectDelete' })).toHaveLength(0);
  });

  it('header add control is the kit IconButton and fires onAdd', () => {
    const { onAdd } = renderList();

    const add = screen.getByRole('button', { name: 'adminMyWorkAdd' });
    // R-4/R-5: the temporary text button is gone — the kit icon-only
    // button carries the name.
    expect(add).toHaveAttribute('data-testid', 'icon-button');

    fireEvent.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe('MyWorkEditorList: DataTable controls (R-5)', () => {
  it('shows size group + navigation whenever rows exist, even on one page (A5)', () => {
    renderList(); // 7 rows — page 1 of two

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    const sizes = screen.getByRole('group', { name: 'perPageLabel' });
    expect(within(sizes).getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('paginates: page 2 shows the remaining rows (kit Pagination)', () => {
    renderList();

    expect(dataRows()).toHaveLength(5);
    expect(screen.getByText('paginationRange:1:5:7')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'paginationPage:2' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('2'));

    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(dataRows()).toHaveLength(2);
    expect(screen.queryByTestId('mywork-row-1')).toBeNull();
    expect(screen.getByTestId('mywork-row-6')).toBeInTheDocument();
    expect(screen.getByTestId('mywork-row-7')).toBeInTheDocument();
    expect(screen.getByText('paginationRange:6:7:7')).toBeInTheDocument();
  });

  it('sorting resets the page to 1 (Skills WU-5a pattern)', () => {
    renderList();

    fireEvent.click(screen.getByText('2'));
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByTestId('mywork-row-1')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'adminMyWorkTableTitle' }));

    // The user sees the TOP of the freshly sorted order, never a stale window.
    expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'ascending');
    const sorted = [...seedProjects].sort((a, b) => a.title.localeCompare(b.title));
    expect(screen.getByTestId(`mywork-row-${sorted[0]?.id ?? ''}`)).toBeInTheDocument();
  });
});

describe('MyWorkEditorList: edit (§6 onEdit wiring)', () => {
  it('emits onEdit with the row project id', () => {
    const { onEdit, onDeleted } = renderList();

    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectEdit' })
    );

    expect(onEdit).toHaveBeenCalledWith(seedProjects[0]?.id);
    expect(onDeleted).not.toHaveBeenCalled();
    expect(persistSpy).not.toHaveBeenCalled();
  });
});

describe('MyWorkEditorList: delete (Modal confirm → persist → dispatch)', () => {
  it('does nothing when the confirm is declined', async () => {
    renderList();

    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('projectDeleteConfirm')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'projectCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(calls).toEqual([]);
    expect(addToast).not.toHaveBeenCalled();
    expect(dataRows()).toHaveLength(5);
  });

  it('persists the collection WITHOUT the record BEFORE dispatching deleteProject', async () => {
    const target = seedProjects[0] as Project;
    const { onDeleted } = renderList();

    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(calls).toEqual(['persist', 'dispatch']));

    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted).toHaveLength(seedProjects.length - 1);
    expect(persisted.some((project) => project.id === target.id)).toBe(false);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectDeleted', type: 'success' });
    expect(onDeleted).toHaveBeenCalledWith(target.id);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('the deleted row actually disappears from the table', async () => {
    renderList();

    expect(screen.getByTestId('mywork-row-1')).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId('mywork-actions-1')).getByRole('button', { name: 'projectDelete' })
    );
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(screen.queryByTestId('mywork-row-1')).not.toBeInTheDocument());
    // The window backfills from page 2 — no empty hole in the table.
    expect(dataRows()).toHaveLength(5);
  });

  it('keeps the row and toasts projectSaveError when persist fails', async () => {
    const target = seedProjects[0] as Project;
    renderList();

    // mockImplementationOnce (not mockReturnValueOnce): the failed persist
    // still logs the attempt into `calls` — only its RESULT flips.
    persistSpy.mockImplementationOnce(() => {
      calls.push('persist');
      return false;
    });
    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    expect(calls).toEqual(['persist']); // no dispatch after the failed persist
    expect(dataRows()).toHaveLength(5);
    expect(screen.getByTestId(`mywork-row-${target.id}`)).toBeInTheDocument();
  });

  // ---- admin-mywork-refactor WU-2 (SPEC R-2, confirm parity) ----

  it('confirm modal names the project in its subtitle and a title ≠ button label (R-2)', async () => {
    renderList();

    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const modal = await screen.findByRole('dialog');

    // R-2: the subtitle NAMES the entity — `projectConfirmDeleteName` + {{name}}.
    expect(
      within(modal).getByText(`projectConfirmDeleteName:${seedProjects[0]?.title ?? ''}`)
    ).toBeInTheDocument();
    // R-2: the modal title ≠ the confirm button label (projectDelete stays the label).
    expect(within(modal).getByRole('heading', { level: 2 })).toHaveTextContent(
      'projectDeleteConfirm'
    );
  });

  it('confirm modal focuses the Cancel button on open (R-2)', async () => {
    renderList();

    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const modal = await screen.findByRole('dialog');
    const cancel = within(modal).getByRole('button', { name: 'projectCancel' });

    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('persist failure keeps the confirm modal open for retry (R-2)', async () => {
    persistSpy.mockImplementationOnce(() => {
      calls.push('persist');
      return false;
    });
    renderList();

    fireEvent.click(
      within(dataRows()[0] as HTMLElement).getByRole('button', { name: 'projectDelete' })
    );
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    // Skills OPEN-9 parity: the modal does NOT close on persist failure —
    // the user can retry the same delete.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: 'projectDelete' })).toBeEnabled();
  });
});
