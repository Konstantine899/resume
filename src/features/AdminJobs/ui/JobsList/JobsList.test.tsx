// ============================================
// JobsList tests (jobs-detail-table WU-2, SPEC R-4/R-5)
// ============================================
//
// RED-first contract: one collapsed JobCard per record in the current sort
// order (recent default = selectSortedJobs date-desc; company/position via
// the header kit Select), the kit EmptyState on an empty list, Add/Edit
// callbacks for the page-owned form, and Delete through the card's header
// Trash2 → kit Modal confirm with persist BEFORE dispatch (§3) + Toast
// feedback. The react-redux store is a mutable holder whose dispatched
// action REALLY removes the record, so "the card disappears" is a true
// assertion, not a mocked one. Pagination/PageSizeGroup/sort-column tests
// are gone BY DESIGN — the DataTable left with WU-2.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Job } from '@/entities/Job';
import { JobsList } from './JobsList';

const { persistSpy, deleteJobSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_jobs: unknown[]) => true),
  deleteJobSpy: vi.fn((id: string) => ({ type: 'adminJobs/deleteJob', payload: id })),
  addToast: vi.fn(),
  holder: {
    state: {
      adminJobs: [] as Job[],
    },
  },
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistJobs: persistSpy,
}));

vi.mock('../../model/slices/jobsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/slices/jobsSlice')>()),
  deleteJob: deleteJobSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// The `company`/`number` options render as `${key}:${values}` (confirm
// subtitle names the entity; JobCard expand/collapse labels stay
// addressable).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { company?: string; number?: number }) => {
      const parts = [options?.company, options?.number].filter((value) => value !== undefined);
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
// hop. Dispatch simulates the delete reducer so §3's "record disappears"
// exercises a real state transition (SkillsEditorList precedent).
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (action: { type?: string; payload?: string }) => {
      if (action?.type === 'adminJobs/deleteJob' && typeof action.payload === 'string') {
        holder.state.adminJobs = holder.state.adminJobs.filter((job) => job.id !== action.payload);
      }
      return action;
    },
  };
});

const makeJob = (patch: Partial<Job>): Job => ({
  id: 'j1',
  company: 'Acme',
  position: { en: 'Developer', ru: 'Разработчик' },
  period: '2020 — 2022',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2022-01-01'),
  description: { en: ['Did things'], ru: ['Сделал вещи'] },
  technologies: ['React'],
  location: 'Remote',
  current: false,
  employmentType: 'full-time',
  level: 'middle',
  featured: false,
  ...patch,
});

const OLDER = makeJob({ id: 'older', company: 'Old Co', startDate: new Date('2018-01-01') });
const NEWER = makeJob({
  id: 'newer',
  company: 'New Co',
  position: { en: 'Lead Developer', ru: 'Тимлид' },
  period: '2022 — Present',
  startDate: new Date('2022-01-01'),
  endDate: null,
  current: true,
  featured: true,
});
const MIDDLE = makeJob({
  id: 'middle',
  company: 'Mid Co',
  position: { en: 'Architect', ru: 'Архитектор' },
  startDate: new Date('2020-06-01'),
  endDate: new Date('2020-12-01'),
});

const renderList = (props: Partial<React.ComponentProps<typeof JobsList>> = {}) => {
  const defaults = {
    onAddJob: vi.fn(),
    onEditJob: vi.fn(),
    onJobDeleted: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  render(<JobsList {...merged} />);
  return merged;
};

/** Company captions in DOM order — every job renders as a collapsed card. */
const captions = (): Array<string | null> =>
  screen.queryAllByTestId(/^job-card-caption-/).map((el) => el.textContent);

const changeSort = (value: string) =>
  fireEvent.change(screen.getByTestId('admin-jobs-sort'), { target: { value } });

/** Collapsed by default — expand the card so its header actions exist. */
const expandCard = (company: string) =>
  fireEvent.click(screen.getByRole('button', { name: `adminJobExpand:${company}` }));

/** Header Trash2 of an EXPANDED card → opens the list-level confirm modal. */
const openConfirmFromCard = (id: string) =>
  fireEvent.click(
    within(screen.getByTestId(`job-card-actions-${id}`)).getByRole('button', {
      name: 'adminJobDelete',
    })
  );

/** N distinct jobs: insertion order p1..pN, dates ascending. */
const makeJobs = (count: number): Job[] =>
  Array.from({ length: count }, (_, index) =>
    makeJob({
      id: `p${index + 1}`,
      company: `Co ${index + 1}`,
      startDate: new Date(2015 + index, 0, 1),
      endDate: new Date(2016 + index, 0, 1),
    })
  );

describe('JobsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminJobs = [OLDER, NEWER, MIDDLE];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---- R-5: cards + header ----

  it('renders one collapsed card per job in selectSortedJobs (date-desc) order', () => {
    renderList();

    // Recent default: NEWER (2022) → MIDDLE (2020-06) → OLDER (2018).
    expect(captions()).toEqual(['New Co', 'Mid Co', 'Old Co']);
    expect(screen.getByRole('heading', { level: 2, name: 'adminJobs' })).toBeInTheDocument();
    // Collapsed by default — no detail tables in the document.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders ALL cards — pagination is gone with the DataTable (R-4)', () => {
    holder.state.adminJobs = makeJobs(7);
    renderList();

    // 7 > the old DEFAULT_PAGE_SIZE (5): every record is visible, no window.
    expect(captions()).toHaveLength(7);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('header add control is the kit IconButton and fires onAddJob', () => {
    const { onAddJob } = renderList();

    const add = screen.getByRole('button', { name: 'adminAddJob' });
    // The text button is gone — the kit icon-only button carries the name.
    expect(add).toHaveAttribute('data-testid', 'icon-button');

    fireEvent.click(add);
    expect(onAddJob).toHaveBeenCalledTimes(1);
  });

  it('expanded card Pencil fires onEditJob with the record', () => {
    const { onEditJob } = renderList();

    expandCard('New Co');
    fireEvent.click(
      within(screen.getByTestId('job-card-actions-newer')).getByRole('button', {
        name: 'adminEditJob',
      })
    );
    expect(onEditJob).toHaveBeenCalledWith(NEWER);
  });

  // ---- R-4: sort Select ----

  it('sort Select defaults to recent; company/position reorder the cards', () => {
    renderList();

    const select = screen.getByTestId('admin-jobs-sort');
    expect(select).toHaveValue('recent');
    expect(captions()).toEqual(['New Co', 'Mid Co', 'Old Co']);

    // Alpha by company: Mid < New < Old.
    changeSort('company');
    expect(captions()).toEqual(['Mid Co', 'New Co', 'Old Co']);

    // Alpha by position[lang='en']: Architect (Mid) < Developer (Old) < Lead (New).
    changeSort('position');
    expect(captions()).toEqual(['Mid Co', 'Old Co', 'New Co']);

    // Back to the selector order.
    changeSort('recent');
    expect(captions()).toEqual(['New Co', 'Mid Co', 'Old Co']);
  });

  // ---- R-5: EmptyState ----

  it('renders the kit EmptyState instead of cards (R-5)', () => {
    holder.state.adminJobs = [];
    renderList();

    const title = screen.getByText('adminJobsEmpty');
    // EmptyState's title slot is a div (kit).
    expect(title.tagName).toBe('DIV');
    expect(captions()).toHaveLength(0);
  });

  // ---- R-5: confirm-modal delete parity (rev.2 tests, card Trash2) ----

  it('confirm modal names the company in its subtitle and focuses Cancel (R-3)', async () => {
    renderList();

    expandCard('New Co');
    openConfirmFromCard('newer');
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByText('adminJobConfirmDeleteName:New Co')).toBeInTheDocument();
    const cancel = within(modal).getByRole('button', { name: 'adminJobCancel' });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('deletes through the Modal confirm: persist → dispatch → toast → callback', async () => {
    const calls: string[] = [];
    persistSpy.mockImplementation(() => {
      calls.push('persist');
      return true;
    });
    deleteJobSpy.mockImplementation((id: string) => {
      calls.push('dispatch');
      return { type: 'adminJobs/deleteJob', payload: id };
    });
    const { onJobDeleted } = renderList();

    expandCard('New Co');
    openConfirmFromCard('newer');
    const modal = await screen.findByRole('dialog');

    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(calls).toEqual(['persist', 'dispatch']);
    // Insertion order [OLDER, NEWER, MIDDLE] minus the deleted record.
    expect(persistSpy).toHaveBeenCalledWith([OLDER, MIDDLE]);
    expect(deleteJobSpy).toHaveBeenCalledWith('newer');
    expect(holder.state.adminJobs.map((job) => job.id)).toEqual(['older', 'middle']);
    expect(addToast).toHaveBeenCalledWith({ message: 'adminJobDeleted', type: 'success' });
    expect(onJobDeleted).toHaveBeenCalledWith('newer');
    expect(screen.queryByText('adminJobConfirmDelete')).not.toBeInTheDocument();
  });

  it('persists the deletion in selectAllJobs order, not the sorted render order (R-2)', async () => {
    // Insertion order [older, newer, middle] ≠ recent render [newer, middle, older].
    renderList();

    expect(captions()).toEqual(['New Co', 'Mid Co', 'Old Co']);

    // Delete the visually-middle card: a sorted snapshot and an insertion-
    // snapshot agree on the COMPOSITION here but not on the ORDER.
    expandCard('Mid Co');
    openConfirmFromCard('middle');
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    // Insertion order minus the deleted record — NOT the sorted [newer, older].
    expect(persistSpy).toHaveBeenCalledWith([OLDER, NEWER]);
  });

  it('persist failure keeps the confirm modal open for retry (R-3)', async () => {
    persistSpy.mockReturnValue(false);
    const { onJobDeleted } = renderList();

    expandCard('New Co');
    openConfirmFromCard('newer');
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'adminJobPersistError', type: 'error' })
    );
    // SkillsEditorList OPEN-9 parity: the modal does NOT close on persist
    // failure — the user can retry the same delete.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: 'adminJobDelete' })).toBeEnabled();
    // §3: no dispatch, no callback, record untouched — the card is still
    // expanded (its caption is unmounted while expanded, so assert the
    // Card testid, not the caption).
    expect(deleteJobSpy).not.toHaveBeenCalled();
    expect(holder.state.adminJobs).toHaveLength(3);
    expect(onJobDeleted).not.toHaveBeenCalled();
    expect(screen.getByTestId('job-card-newer')).toBeInTheDocument();
  });

  it('the deleted card actually disappears from the list', async () => {
    renderList();

    expect(captions()).toContain('New Co');

    expandCard('New Co');
    openConfirmFromCard('newer');
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() => expect(captions()).not.toContain('New Co'));
    expect(captions()).toEqual(['Mid Co', 'Old Co']);
  });
});
