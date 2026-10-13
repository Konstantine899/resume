// ============================================
// JobCard tests (jobs-detail-table WU-1, SPEC R-1..R-3)
// ============================================
//
// RED-first contract: default collapsed (caption outside the Card, no
// table in the DOM), expand/collapse ARA roundtrip (stable contentId),
// the record detail table (scalar rows + URL row presence + bullet rows),
// header/row action callbacks, bullet disabled states, and inline-CRUD
// persist-THEN-dispatch order (§3) with the persist-fail toast guard.
// The react-redux store is a mutable holder; useDispatch REALLY applies
// the updateJob payload, so "the payload matches" is a true assertion.

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Job } from '@/entities/Job';
import { JobCard } from './JobCard';

const { persistSpy, addToast, holder, dispatched, calls } = vi.hoisted(() => ({
  persistSpy: vi.fn((_jobs: unknown[]) => true),
  addToast: vi.fn(),
  holder: {
    state: {
      adminJobs: [] as Job[],
    },
  },
  dispatched: [] as Array<{ type?: string; payload?: unknown }>,
  calls: [] as string[],
}));

vi.mock('../../model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../model/services/storage')>()),
  persistJobs: persistSpy,
}));

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// The `company`/`number` options render as `${key}:${values}` (expand/
// collapse aria-labels stay addressable).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { company?: string; number?: number; field?: string }) => {
      const parts = [options?.company, options?.number, options?.field].filter(
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
// hop. Dispatch records the action AND applies the description patch to
// the holder, so R-3's "payload matches" exercises a real transition.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (action: { type?: string; payload?: unknown }) => {
      dispatched.push(action);
      calls.push('dispatch');
      if (action?.type === 'adminJobs/updateJob') {
        const dto = action.payload as { id: string; description: { en: string[]; ru: string[] } };
        holder.state.adminJobs = holder.state.adminJobs.map((job) =>
          job.id === dto.id ? { ...job, description: dto.description } : job
        );
      }
      return action;
    },
  };
});

const makeJob = (patch: Partial<Job> = {}): Job => ({
  id: 'j1',
  company: 'Acme',
  position: { en: 'Developer', ru: 'Разработчик' },
  period: '2020 — 2022',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2022-01-01'),
  description: {
    en: ['Shipped the billing rewrite', 'Mentored two juniors', 'Cut p95 latency 30%'],
    ru: ['Переписал биллинг'],
  },
  technologies: ['React', 'TypeScript'],
  location: 'Remote',
  current: false,
  employmentType: 'full-time',
  level: 'middle',
  companyUrl: 'https://acme.example',
  featured: false,
  ...patch,
});

const JOB = makeJob();

const renderCard = (job: Job = JOB, props: Partial<React.ComponentProps<typeof JobCard>> = {}) => {
  const defaults = { onEditJob: vi.fn(), onEditField: vi.fn(), onDeleteJob: vi.fn() };
  const merged = { ...defaults, ...props };
  render(<JobCard job={job} {...merged} />);
  return merged;
};

const expandCard = (company = JOB.company) =>
  fireEvent.click(screen.getByRole('button', { name: `adminJobExpand:${company}` }));

describe('JobCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminJobs = [JOB];
    dispatched.length = 0;
    calls.length = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---- R-1: collapse chrome ----

  it('is collapsed by default: caption outside the Card, no table in the document', () => {
    renderCard();

    expect(screen.getByTestId('job-card-caption-j1')).toHaveTextContent('Acme');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('row')).toHaveLength(0);

    // The strip IS the whole Card body (Skills rev.4 parity quirk included).
    expect(screen.getByTestId('job-card-j1')).toBeInTheDocument();
    const strip = screen.getByRole('button', { name: 'adminJobExpand:Acme' });
    expect(strip).toHaveAttribute('aria-expanded', 'true');
  });

  it('expanding shows the detail table with every scalar row and resolves aria-controls', () => {
    renderCard();
    expandCard();

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByTestId('job-card-caption-j1')).not.toBeInTheDocument();

    // Columns [Данные | Значение | Действия] (R-2).
    expect(screen.getByRole('columnheader', { name: 'adminJobsTableField' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'adminJobsTableValue' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'adminJobsTableActions' })).toBeInTheDocument();

    // Scalar labels + values (language 'en').
    expect(screen.getByText('adminJobsTablePosition')).toBeInTheDocument();
    expect(screen.getByText('adminJobsTablePeriod')).toBeInTheDocument();
    expect(screen.getByText('adminJobLocation')).toBeInTheDocument();
    expect(screen.getByText('adminJobTechnologies')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
    expect(screen.getByText('2020 — 2022')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('React, TypeScript')).toBeInTheDocument();

    // Bullet rows: one per description[lang] item; the description label
    // rides the FIRST bullet row only (cleaner than repeating it).
    expect(screen.getByText('Shipped the billing rewrite')).toBeInTheDocument();
    expect(screen.getByText('Mentored two juniors')).toBeInTheDocument();
    expect(screen.getByText('Cut p95 latency 30%')).toBeInTheDocument();
    expect(screen.getAllByText('adminJobDescription')).toHaveLength(1);

    // ARA: the Minus control points at a REAL id (roundtrip test below).
    const collapseBtn = screen.getByRole('button', { name: 'adminJobCollapse:Acme' });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'false');
    const contentId = collapseBtn.getAttribute('aria-controls');
    expect(contentId).toBe('job-card-content-j1');
    expect(document.getElementById(contentId ?? '')).not.toBeNull();
  });

  it('collapse roundtrip: expand → collapse → caption back → re-expand restores contentId (ARA)', () => {
    renderCard();
    expandCard();

    fireEvent.click(screen.getByRole('button', { name: 'adminJobCollapse:Acme' }));
    expect(screen.getByTestId('job-card-caption-j1')).toHaveTextContent('Acme');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    expandCard();
    expect(screen.getByRole('table')).toBeInTheDocument();
    const collapseBtn = screen.getByRole('button', { name: 'adminJobCollapse:Acme' });
    expect(collapseBtn).toHaveAttribute('aria-controls', 'job-card-content-j1');
    expect(document.getElementById('job-card-content-j1')).not.toBeNull();
  });

  // ---- R-2: honest-data rows ----

  it('omits the URL row when the record has no companyUrl', () => {
    renderCard(makeJob({ companyUrl: undefined }));
    expandCard();

    expect(screen.queryByText('adminJobCompanyUrl')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the kit Link in the URL row when companyUrl exists', () => {
    renderCard();
    expandCard();

    expect(screen.getByText('adminJobCompanyUrl')).toBeInTheDocument();
    // The kit appends an sr-only "Opens in new tab" to the accessible name.
    const link = screen.getByRole('link', { name: /https:\/\/acme\.example/ });
    expect(link).toHaveAttribute('href', 'https://acme.example');
  });

  // ---- R-1/R-2: action callbacks ----

  it('fires onEditJob from the header, onEditField from scalar rows, onDeleteJob from Trash2', () => {
    const { onEditJob, onEditField, onDeleteJob } = renderCard();
    expandCard();

    const headerActions = screen.getByTestId('job-card-actions-j1');
    fireEvent.click(within(headerActions).getByRole('button', { name: 'adminEditJob' }));
    expect(onEditJob).toHaveBeenCalledWith(JOB);
    // Scope honesty (job-field-edit R-3 r4): the header Pencil is the ONLY
    // trigger of the full-record form.
    expect(onEditField).not.toHaveBeenCalled();

    // Scalar-row Pencil (position row) → field-scoped callback with its key.
    const positionRow = screen.getByText('Developer').closest('tr') as HTMLElement;
    fireEvent.click(
      within(positionRow).getByRole('button', {
        name: 'adminJobEditFieldTitle:adminJobsTablePosition',
      })
    );
    expect(onEditField).toHaveBeenCalledWith(JOB, 'position');
    expect(onEditJob).toHaveBeenCalledTimes(1);

    fireEvent.click(within(headerActions).getByRole('button', { name: 'adminJobDelete' }));
    expect(onDeleteJob).toHaveBeenCalledWith('j1');
  });

  // ---- R-2: bullet disabled states ----

  it('disables ↑ on the first bullet and ↓ on the last bullet', () => {
    renderCard(); // 3 bullets
    expandCard();

    const first = screen.getByTestId('job-bullet-actions-j1-0');
    expect(within(first).getByRole('button', { name: 'adminJobBulletUp' })).toBeDisabled();
    expect(within(first).getByRole('button', { name: 'adminJobBulletDown' })).toBeEnabled();

    const last = screen.getByTestId('job-bullet-actions-j1-2');
    expect(within(last).getByRole('button', { name: 'adminJobBulletDown' })).toBeDisabled();
    expect(within(last).getByRole('button', { name: 'adminJobBulletUp' })).toBeEnabled();
  });

  it('disables Trash2 when the record has a single bullet', () => {
    renderCard(makeJob({ description: { en: ['Only one'], ru: ['Один'] } }));
    expandCard();

    expect(screen.getByTestId('job-bullet-actions-j1-0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminJobRemoveBullet' })).toBeDisabled();
  });

  // ---- R-3: inline-CRUD persist-THEN-dispatch ----

  it('moveBullet persists BEFORE dispatch with the reordered array', () => {
    persistSpy.mockImplementation((_jobs: unknown[]) => {
      calls.push('persist');
      return true;
    });
    renderCard();
    expandCard();

    fireEvent.click(
      within(screen.getByTestId('job-bullet-actions-j1-0')).getByRole('button', {
        name: 'adminJobBulletDown',
      })
    );

    expect(persistSpy).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['persist', 'dispatch']);
    // Insertion-order snapshot with the moved text at its new index.
    expect(persistSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'j1',
        description: {
          en: ['Mentored two juniors', 'Shipped the billing rewrite', 'Cut p95 latency 30%'],
          ru: ['Переписал биллинг'],
        },
      }),
    ]);
    // The dispatched payload carries the SAME description (R-3).
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]).toMatchObject({
      type: 'adminJobs/updateJob',
      payload: {
        id: 'j1',
        description: {
          en: ['Mentored two juniors', 'Shipped the billing rewrite', 'Cut p95 latency 30%'],
          ru: ['Переписал биллинг'],
        },
      },
    });
    // The holder really applied the patch (true state transition).
    expect(holder.state.adminJobs[0]?.description.en).toEqual([
      'Mentored two juniors',
      'Shipped the billing rewrite',
      'Cut p95 latency 30%',
    ]);
  });

  it('removeBullet removes the paragraph from storage and the dispatched payload', () => {
    persistSpy.mockImplementation((_jobs: unknown[]) => {
      calls.push('persist');
      return true;
    });
    renderCard();
    expandCard();

    fireEvent.click(
      within(screen.getByTestId('job-bullet-actions-j1-1')).getByRole('button', {
        name: 'adminJobRemoveBullet',
      })
    );

    expect(persistSpy).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['persist', 'dispatch']);
    expect(persistSpy).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'j1',
        description: {
          en: ['Shipped the billing rewrite', 'Cut p95 latency 30%'],
          ru: ['Переписал биллинг'],
        },
      }),
    ]);
    expect(dispatched[0]).toMatchObject({
      type: 'adminJobs/updateJob',
      payload: {
        id: 'j1',
        description: {
          en: ['Shipped the billing rewrite', 'Cut p95 latency 30%'],
          ru: ['Переписал биллинг'],
        },
      },
    });
    expect(holder.state.adminJobs[0]?.description.en).toEqual([
      'Shipped the billing rewrite',
      'Cut p95 latency 30%',
    ]);
  });

  it('persist failure toasts adminJobPersistError and never dispatches', () => {
    persistSpy.mockImplementation((_jobs: unknown[]) => {
      calls.push('persist');
      return false;
    });
    renderCard();
    expandCard();

    fireEvent.click(
      within(screen.getByTestId('job-bullet-actions-j1-1')).getByRole('button', {
        name: 'adminJobRemoveBullet',
      })
    );

    expect(addToast).toHaveBeenCalledWith({ message: 'adminJobPersistError', type: 'error' });
    expect(calls).toEqual(['persist']);
    expect(dispatched).toHaveLength(0);
    // Store untouched: the snapshot job still has all three bullets.
    expect(holder.state.adminJobs[0]?.description.en).toHaveLength(3);
  });
});
