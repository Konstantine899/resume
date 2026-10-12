// ============================================
// JobsList tests (WorkHistory CRUD — plan §12 WU-5, §3, §6)
// ============================================
//
// RED-first contract: sorted rows (company, position[lang], period, the
// current/featured badges), the empty state, Edit/Add callbacks for the
// page-owned form, and Delete through a kit Modal confirm with persist
// BEFORE dispatch (§3) + Toast feedback (§10). The react-redux store is a
// mutable holder whose dispatched action REALLY removes the row, so "the
// row disappears" is a true assertion, not a mocked one.

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
// subtitle names the entity; Pagination aria-labels stay addressable).
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

/**
 * Body rows of the kit Table (the first `row` is the header). The vitrina
 * swap (WU-6) replaced `<li role="listitem">` rows with table rows — role
 * semantics move with the markup (Skills parity, design B).
 */
const dataRows = (): HTMLElement[] => screen.getAllByRole('row').slice(1);

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
    holder.state.adminJobs = [OLDER, NEWER];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders rows newest-first with company, position[lang] and period', () => {
    renderList();

    const rows = dataRows();
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('New Co');
    expect(rows[0]).toHaveTextContent('Lead Developer');
    expect(rows[0]).toHaveTextContent('2022 — Present');
    expect(rows[1]).toHaveTextContent('Old Co');
    expect(screen.getByRole('heading', { level: 2, name: 'adminJobs' })).toBeInTheDocument();
  });

  it('shows the current/featured badges only when the flag is true', () => {
    renderList();

    expect(screen.getByText('adminJobCurrent')).toBeInTheDocument();
    expect(screen.getByText('adminJobFeatured')).toBeInTheDocument();
    expect(screen.getAllByText('adminJobCurrent')).toHaveLength(1);
    expect(screen.getAllByText('adminJobFeatured')).toHaveLength(1);
  });

  it('renders the kit EmptyState instead of rows (R-4)', () => {
    holder.state.adminJobs = [];
    renderList();

    const title = screen.getByText('adminJobsEmpty');
    // EmptyState's title slot is a div (kit) — not the old bare <p> Paragraph.
    expect(title.tagName).toBe('DIV');
    // The slot renders as a tbody row — count DATA rows (testids), not rows.
    expect(screen.queryAllByTestId(/^job-row-/)).toHaveLength(0);
  });

  it('wires Add/Edit callbacks for the page-owned form', () => {
    const { onAddJob, onEditJob } = renderList();

    fireEvent.click(screen.getByRole('button', { name: 'adminAddJob' }));
    expect(onAddJob).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole('button', { name: 'adminEditJob' })[0] as HTMLElement);
    expect(onEditJob).toHaveBeenCalledWith(NEWER);
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

    // §6: kit Modal confirm, not window.confirm.
    const rows = dataRows();
    fireEvent.click(within(rows[0] as HTMLElement).getByRole('button', { name: 'adminJobDelete' }));
    const modal = await screen.findByRole('dialog');
    expect(within(modal).getByText('adminJobConfirmDelete')).toBeInTheDocument();

    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith([OLDER]);
    expect(deleteJobSpy).toHaveBeenCalledWith('newer');
    expect(holder.state.adminJobs.map((job) => job.id)).toEqual(['older']);
    expect(addToast).toHaveBeenCalledWith({ message: 'adminJobDeleted', type: 'success' });
    expect(onJobDeleted).toHaveBeenCalledWith('newer');
    expect(screen.queryByText('adminJobConfirmDelete')).not.toBeInTheDocument();
  });

  it('persists the deletion in selectAllJobs order, not the sorted render order (R-2)', async () => {
    // Insertion order [older, newer, middle] ≠ sorted render [newer, middle, older].
    holder.state.adminJobs = [OLDER, NEWER, MIDDLE];
    renderList();

    const rows = dataRows();
    expect(rows[0]).toHaveTextContent('New Co');
    expect(rows[1]).toHaveTextContent('Mid Co');
    expect(rows[2]).toHaveTextContent('Old Co');

    // Delete the middle row: a sorted snapshot and an insertion-order
    // snapshot agree on the COMPOSITION here but not on the ORDER.
    fireEvent.click(within(rows[1] as HTMLElement).getByRole('button', { name: 'adminJobDelete' }));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    // Insertion order minus the deleted record — NOT the sorted [newer, older].
    expect(persistSpy).toHaveBeenCalledWith([OLDER, NEWER]);
  });

  it('persist failure keeps the confirm modal open for retry (R-3)', async () => {
    persistSpy.mockReturnValue(false);
    renderList();

    const rows = dataRows();
    fireEvent.click(within(rows[0] as HTMLElement).getByRole('button', { name: 'adminJobDelete' }));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'adminJobPersistError', type: 'error' })
    );
    // SkillsEditorList OPEN-9 parity: the modal does NOT close on persist
    // failure — the user can retry the same delete.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(within(modal).getByRole('button', { name: 'adminJobDelete' })).toBeEnabled();
  });

  it('confirm modal names the company in its subtitle (R-3)', async () => {
    renderList();

    const rows = dataRows();
    fireEvent.click(within(rows[0] as HTMLElement).getByRole('button', { name: 'adminJobDelete' }));
    const modal = await screen.findByRole('dialog');

    expect(within(modal).getByText('adminJobConfirmDeleteName:New Co')).toBeInTheDocument();
  });

  it('confirm modal focuses the Cancel button on open (R-3)', async () => {
    renderList();

    const rows = dataRows();
    fireEvent.click(within(rows[0] as HTMLElement).getByRole('button', { name: 'adminJobDelete' }));
    const modal = await screen.findByRole('dialog');
    const cancel = within(modal).getByRole('button', { name: 'adminJobCancel' });

    await waitFor(() => expect(document.activeElement).toBe(cancel));
  });

  it('keeps the record and skips dispatch when persist fails (§3)', async () => {
    persistSpy.mockReturnValue(false);
    const { onJobDeleted } = renderList();

    const rows = dataRows();
    fireEvent.click(within(rows[0] as HTMLElement).getByRole('button', { name: 'adminJobDelete' }));
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'adminJobPersistError', type: 'error' })
    );
    expect(deleteJobSpy).not.toHaveBeenCalled();
    expect(holder.state.adminJobs).toHaveLength(2);
    expect(onJobDeleted).not.toHaveBeenCalled();
    expect(screen.getByText('New Co')).toBeInTheDocument();
  });

  // ---- kit DataTable vitrina (admin-jobs-refactor WU-6, SPEC R-6) ----

  it('header add control is the kit IconButton and fires onAddJob', () => {
    const { onAddJob } = renderList();

    const add = screen.getByRole('button', { name: 'adminAddJob' });
    // R-6: the text button is gone — the kit icon-only button carries the name.
    expect(add).toHaveAttribute('data-testid', 'icon-button');

    fireEvent.click(add);
    expect(onAddJob).toHaveBeenCalledTimes(1);
  });

  it('shows size group + navigation whenever rows exist, even on one page (A5)', () => {
    renderList(); // 2 rows ≤ default size 5

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    const sizes = screen.getByRole('group', { name: 'perPageLabel' });
    expect(within(sizes).getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('paginates: page 2 shows the remaining rows (kit Pagination)', () => {
    holder.state.adminJobs = makeJobs(7);
    renderList();

    // Sorted render (selectSortedJobs): p7..p1 — page 1 holds p7..p3.
    expect(dataRows()).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'paginationPage:2' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('2'));

    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(dataRows()).toHaveLength(2);
    expect(screen.queryByTestId('job-row-p7')).toBeNull();
    expect(screen.getByTestId('job-row-p2')).toBeInTheDocument();
    expect(screen.getByTestId('job-row-p1')).toBeInTheDocument();
  });

  it('sorting resets the page to 1 (Skills WU-5a pattern)', () => {
    holder.state.adminJobs = makeJobs(7);
    renderList();

    fireEvent.click(screen.getByText('2'));
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByTestId('job-row-p7')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'adminJobsTableCompany' }));

    // The user sees the TOP of the freshly sorted order, never a stale window.
    expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('aria-sort', 'ascending');
    expect(screen.getByTestId('job-row-p1')).toBeInTheDocument();
  });

  it('the deleted row actually disappears from the table', async () => {
    renderList();

    expect(screen.getByTestId('job-row-newer')).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId('job-actions-newer')).getByRole('button', {
        name: 'adminJobDelete',
      })
    );
    const modal = await screen.findByRole('dialog');
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobDelete' }));

    await waitFor(() => expect(screen.queryByTestId('job-row-newer')).not.toBeInTheDocument());
    expect(dataRows()).toHaveLength(1);
  });
});
