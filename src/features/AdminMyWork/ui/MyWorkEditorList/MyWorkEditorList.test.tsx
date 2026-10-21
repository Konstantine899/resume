// ============================================
// MyWorkEditorList tests (mywork-detail-table WU-2, SPEC R-1/R-3/R-5)
// ============================================
//
// RED-first contract: the DataTable vitrina is replaced by one COLLAPSED
// ProjectCard per record (Jobs #225 parity) — no pagination, no range
// counter; the header carries the kit sort Select (storage/title/
// category/year) plus the unchanged reset + add IconButtons. Delete goes
// through the card Trash2 → kit Modal confirm with persist BEFORE
// dispatch (§3) from the INSERTION-ORDER snapshot — sorting never
// rewrites storage order. The react-redux store is a mutable holder.

import type { Project } from '@/entities/Project';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MyWorkEditorList } from './MyWorkEditorList';

const { persistSpy, removeSpy, deleteSpy, resetSpy, calls, addToast, holder } = vi.hoisted(() => {
  // Shared order log: the §3 contract is persist BEFORE dispatch; the
  // reset contract is remove → dispatch.
  const calls: string[] = [];
  return {
    calls,
    persistSpy: vi.fn((_projects: unknown[]) => {
      calls.push('persist');
      return true;
    }),
    removeSpy: vi.fn(() => {
      calls.push('remove');
    }),
    deleteSpy: vi.fn((id: string) => {
      calls.push('dispatch');
      return { type: 'myWork/deleteProject', payload: id };
    }),
    resetSpy: vi.fn(() => {
      calls.push('dispatch');
      return { type: 'myWork/resetToDefaults' };
    }),
    addToast: vi.fn(),
    holder: { state: { myWork: [] as Project[] } },
  };
});

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistProjects: persistSpy,
  removeProjects: removeSpy,
}));

vi.mock('../../model/slices/myWorkSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/myWorkSlice')>()),
  deleteProject: deleteSpy,
  resetToDefaults: resetSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// Interpolation renders as `key:values` — confirm subtitles name the
// entity, expand/collapse labels stay addressable.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { name?: string; title?: string }) => {
      const parts = [options?.name, options?.title].filter((value) => value !== undefined);
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
// Dispatch simulates the delete reducer so "the card disappears" is real.
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

/** Minimal valid record — sort fixtures override title/category/year. */
const makeProject = (id: string, title: string, patch: Partial<Project> = {}): Project => ({
  id,
  title,
  description: { en: '', ru: '' },
  techIcons: [],
  link: null,
  image: '',
  category: 'other',
  status: 'completed',
  featured: false,
  ...patch,
});

/** Sort fixture: insertion order Bravo, Charlie, Alpha (≠ title order). */
const SORT_PROJECTS: Project[] = [
  makeProject('2', 'Bravo', { category: 'saas', year: 2024 }),
  makeProject('3', 'Charlie', { category: 'other', year: 2022 }),
  makeProject('1', 'Alpha', { category: 'ecommerce', year: 2020 }),
];

const seedProjects = [
  makeProject('1', 'Shop'),
  makeProject('2', 'Blog'),
  makeProject('3', 'CRM'),
  makeProject('4', 'Landing'),
  makeProject('5', 'Chat'),
  makeProject('6', 'Todo'),
  makeProject('7', 'Wiki'),
];

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

/** Captions in DOM order — every project renders as a collapsed card. */
const captions = (): Array<string | null> =>
  screen.queryAllByTestId(/^project-card-caption-/).map((el) => el.textContent);

const changeSort = (value: string) =>
  fireEvent.change(screen.getByTestId('admin-mywork-sort'), { target: { value } });

/** Collapsed by default — expand the card so its header actions exist. */
const expandCard = (title: string) =>
  fireEvent.click(screen.getByRole('button', { name: `adminMyWorkExpand:${title}` }));

/** Header Trash2 of an EXPANDED card → opens the list-level confirm modal. */
const openConfirmFromCard = (id: string) =>
  fireEvent.click(
    within(screen.getByTestId(`project-card-actions-${id}`)).getByRole('button', {
      name: 'projectDelete',
    })
  );

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  // NOTE: no persistSpy.mockReturnValue here — the hoisted spy's own
  // implementation already returns true AND logs 'persist' into `calls`;
  // mockReturnValue would REPLACE that implementation and hide the order.
  calls.length = 0;
  holder.state = { myWork: seedProjects };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('MyWorkEditorList: cards + header (R-1/R-5)', () => {
  it('renders one collapsed card per project in insertion order; no tables', () => {
    renderList();

    expect(captions()).toEqual(['Shop', 'Blog', 'CRM', 'Landing', 'Chat', 'Todo', 'Wiki']);
    expect(screen.getByRole('heading', { level: 2, name: 'adminMyWorkTitle' })).toBeInTheDocument();
    // Collapsed by default — no detail tables in the document.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders ALL cards — pagination is gone with the DataTable (R-1)', () => {
    renderList();

    // 7 > the old DEFAULT_PAGE_SIZE (5): every record is visible, no window.
    expect(captions()).toHaveLength(7);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByText(/^paginationRange/)).not.toBeInTheDocument();
  });

  it('renders the kit EmptyState instead of cards (R-5)', () => {
    holder.state = { myWork: [] };
    renderList();

    const title = screen.getByText('noProjectsYet');
    expect(title.tagName).toBe('DIV');
    expect(captions()).toHaveLength(0);
  });

  it('header add control is the kit IconButton and fires onAdd', () => {
    const { onAdd } = renderList();

    const add = screen.getByRole('button', { name: 'adminMyWorkAdd' });
    expect(add).toHaveAttribute('data-testid', 'icon-button');

    fireEvent.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('expanded card Pencil fires onEdit with the record id', () => {
    const { onEdit } = renderList();

    expandCard('Shop');
    fireEvent.click(
      within(screen.getByTestId('project-card-actions-1')).getByRole('button', {
        name: 'projectEdit',
      })
    );
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('collapsed card Pencil fires onEdit with the record id (R-A1)', () => {
    const { onEdit } = renderList();

    fireEvent.click(
      within(screen.getByTestId('project-card-actions-1')).getByRole('button', {
        name: 'projectEdit',
      })
    );
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('header reset + add buttons reveal their tooltip on hover (R-A2)', async () => {
    renderList();

    const expectHoverTooltip = async (button: HTMLElement, key: string) => {
      fireEvent.mouseEnter(button);
      expect(await screen.findByRole('tooltip')).toHaveTextContent(key);
      fireEvent.mouseLeave(button);
      await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    };

    await expectHoverTooltip(screen.getByRole('button', { name: 'projectReset' }), 'projectReset');
    await expectHoverTooltip(
      screen.getByRole('button', { name: 'adminMyWorkAdd' }),
      'adminMyWorkAdd'
    );
  });
});

describe('MyWorkEditorList: sort Select (R-1 D3)', () => {
  beforeEach(() => {
    holder.state = { myWork: SORT_PROJECTS };
  });

  it('sort Select defaults to storage; title/category/year reorder the cards', () => {
    renderList();

    const select = screen.getByTestId('admin-mywork-sort');
    expect(select).toHaveValue('storage');
    // Storage = insertion order (Bravo, Charlie, Alpha) — NOT title order.
    expect(captions()).toEqual(['Bravo', 'Charlie', 'Alpha']);

    changeSort('title');
    expect(captions()).toEqual(['Alpha', 'Bravo', 'Charlie']);

    changeSort('category');
    // ecommerce (Alpha) < other (Charlie) < saas (Bravo).
    expect(captions()).toEqual(['Alpha', 'Charlie', 'Bravo']);

    changeSort('year');
    // Year DESC: Bravo 2024 → Charlie 2022 → Alpha 2020.
    expect(captions()).toEqual(['Bravo', 'Charlie', 'Alpha']);

    changeSort('storage');
    expect(captions()).toEqual(['Bravo', 'Charlie', 'Alpha']);
  });
});

describe('MyWorkEditorList: delete (Modal confirm → persist → dispatch)', () => {
  it('does nothing when the confirm is declined', async () => {
    renderList();

    expandCard('Shop');
    openConfirmFromCard('1');
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('projectDeleteConfirm')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'projectCancel' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(calls).toEqual([]);
    expect(addToast).not.toHaveBeenCalled();
    // The card survives the declined confirm. (captions() would miss it —
    // the expand in this test unmounts the collapsed caption.)
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
  });

  it('persists the collection WITHOUT the record BEFORE dispatching deleteProject', async () => {
    const { onDeleted } = renderList();

    expandCard('Shop');
    openConfirmFromCard('1');
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(calls).toEqual(['persist', 'dispatch']));

    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted).toHaveLength(seedProjects.length - 1);
    expect(persisted.some((project) => project.id === '1')).toBe(false);
    expect(addToast).toHaveBeenCalledWith({ message: 'projectDeleted', type: 'success' });
    expect(onDeleted).toHaveBeenCalledWith('1');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('persists in INSERTION order, not the sorted render order (R-3)', async () => {
    holder.state = { myWork: SORT_PROJECTS }; // insertion: Bravo, Charlie, Alpha
    renderList();

    changeSort('title'); // render: Alpha, Bravo, Charlie
    expandCard('Bravo');
    openConfirmFromCard('2');
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(calls).toEqual(['persist', 'dispatch']));

    // Insertion order minus Bravo = Charlie, Alpha — NOT the sorted residue.
    const persisted = persistSpy.mock.calls[0]?.[0] as Project[];
    expect(persisted.map((project) => project.title)).toEqual(['Charlie', 'Alpha']);
  });

  it('the deleted card actually disappears from the list', async () => {
    renderList();

    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();

    expandCard('Shop');
    openConfirmFromCard('1');
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() => expect(screen.queryByTestId('project-card-1')).not.toBeInTheDocument());
    expect(screen.queryByTestId('project-card-caption-1')).not.toBeInTheDocument();
  });

  it('keeps the card and toasts projectSaveError when persist fails', async () => {
    // mockImplementationOnce (not mockReturnValueOnce): the failed persist
    // still logs the attempt into `calls` — only its RESULT flips.
    persistSpy.mockImplementationOnce(() => {
      calls.push('persist');
      return false;
    });
    renderList();

    expandCard('Shop');
    openConfirmFromCard('1');
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'projectSaveError', type: 'error' })
    );
    expect(calls).toEqual(['persist']); // no dispatch after the failed persist
    expect(screen.getByTestId('project-card-1')).toBeInTheDocument();
  });

  it('confirm modal names the project in its subtitle and a title ≠ button label (R-2)', async () => {
    renderList();

    expandCard('Shop');
    openConfirmFromCard('1');
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByText(`projectConfirmDeleteName:${'Shop'}`)).toBeInTheDocument();
    expect(within(modal).getByRole('heading', { level: 2 })).toHaveTextContent(
      'projectDeleteConfirm'
    );
  });

  it('confirm modal focuses the Cancel button on open (R-2)', async () => {
    renderList();

    expandCard('Shop');
    openConfirmFromCard('1');
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

    expandCard('Shop');
    openConfirmFromCard('1');
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

describe('MyWorkEditorList: reset (header button → remove → dispatch)', () => {
  it('header reset control is the kit IconButton and opens the confirm', async () => {
    renderList();

    const reset = screen.getByRole('button', { name: 'projectReset' });
    expect(reset).toHaveAttribute('data-testid', 'icon-button');
    fireEvent.click(reset);

    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('projectResetConfirm')).toBeInTheDocument();
    // One shared Modal — the reset confirm reuses the delete chrome.
    expect(within(modal).getByRole('heading', { level: 2 })).toHaveTextContent('projectReset');
  });

  it('does nothing when the reset confirm is declined', async () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: 'projectReset' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectCancel' }));

    expect(calls).toEqual([]);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('removes storage BEFORE dispatching resetToDefaults (order contract)', async () => {
    renderList();

    fireEvent.click(screen.getByRole('button', { name: 'projectReset' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'projectReset' }));

    await waitFor(() => expect(calls).toEqual(['remove', 'dispatch']));
    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(resetSpy).toHaveBeenCalledTimes(1);
    // No toast on reset — the relocated form behaviour stays silent.
    expect(addToast).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
