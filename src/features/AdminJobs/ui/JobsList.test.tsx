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

vi.mock('../model/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/storage')>()),
  persistJobs: persistSpy,
}));

vi.mock('../model/jobsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/jobsSlice')>()),
  deleteJob: deleteJobSpy,
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

    const rows = screen.getAllByRole('listitem');
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

  it('renders the empty state instead of rows', () => {
    holder.state.adminJobs = [];
    renderList();

    expect(screen.getByText('adminJobsEmpty')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
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
    const rows = screen.getAllByRole('listitem');
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

  it('keeps the record and skips dispatch when persist fails (§3)', async () => {
    persistSpy.mockReturnValue(false);
    const { onJobDeleted } = renderList();

    const rows = screen.getAllByRole('listitem');
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
});
