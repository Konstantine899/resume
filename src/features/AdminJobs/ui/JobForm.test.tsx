// ============================================
// JobForm tests (WorkHistory CRUD — plan §12 WU-5/§7/§3)
// ============================================
//
// RED-first contract: field labels are i18n keys, §7 errors surface inline
// as keys, current ⇄ endDate (disabled input while current), the bullet
// and chip editors, and the §3 save order (persist BEFORE dispatch) for
// both create and edit — edit recomputes `period` through applyJobUpdate
// (A5: the form never enters it by hand).

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Job } from '@/entities/Job';
import { JobForm } from './JobForm';

const { persistSpy, addJobSpy, updateJobSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_jobs: unknown[]) => true),
  addJobSpy: vi.fn((payload: unknown) => ({ type: 'adminJobs/addJob', payload })),
  updateJobSpy: vi.fn((payload: unknown) => ({ type: 'adminJobs/updateJob', payload })),
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

// Only the ACTIONS are spied — makeJobRecord/applyJobUpdate stay real so
// the persisted array carries the real period recomputation (A5).
vi.mock('../model/jobsSlice', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../model/jobsSlice')>()),
  addJob: addJobSpy,
  updateJob: updateJobSpy,
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
// hop. Dispatch simulates the add/update reducers for real state checks.
vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch:
      () => (action: { type?: string; payload?: Job | ({ id: string } & Partial<Job>) }) => {
        if (action?.type === 'adminJobs/addJob' && action.payload) {
          holder.state.adminJobs = [...holder.state.adminJobs, action.payload as Job];
        }
        if (action?.type === 'adminJobs/updateJob' && action.payload) {
          const payload = action.payload as { id: string } & Partial<Job>;
          holder.state.adminJobs = holder.state.adminJobs.map((job) =>
            job.id === payload.id ? { ...job, ...payload } : job
          );
        }
        return action;
      },
  };
});

const EXISTING: Job = {
  id: 'job-1',
  company: 'Acme Corp',
  position: { en: 'Developer', ru: 'Разработчик' },
  period: '2020 — 2022',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2022-01-01'),
  description: { en: ['Built things'], ru: ['Строил вещи'] },
  technologies: ['React'],
  location: 'Remote',
  current: false,
  employmentType: 'full-time',
  level: 'middle',
  companyUrl: 'https://acme.example',
  featured: false,
};

/** Fill the create form with a §7-valid record. */
const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText('adminJobPositionEn'), {
    target: { value: 'Senior Developer' },
  });
  fireEvent.change(screen.getByLabelText('adminJobPositionRu'), {
    target: { value: 'Старший разработчик' },
  });
  fireEvent.change(screen.getByLabelText('adminJobCompany'), { target: { value: 'New Co' } });
  fireEvent.change(screen.getByLabelText('adminJobStartDate'), {
    target: { value: '2023-05-01' },
  });
  fireEvent.change(screen.getByLabelText('adminJobEndDate'), {
    target: { value: '2024-05-01' },
  });
  fireEvent.change(screen.getByLabelText('adminJobLocation'), { target: { value: 'Berlin' } });
  // description defaults to one empty bullet per locale — §7-valid already.
};

describe('JobForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminJobs = [EXISTING];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders every field group with its i18n label', () => {
    render(<JobForm />);

    for (const label of [
      'adminJobPositionEn',
      'adminJobPositionRu',
      'adminJobCompany',
      'adminJobCompanyUrl',
      'adminJobStartDate',
      'adminJobEndDate',
      'adminJobCurrent',
      'adminJobLocation',
      'adminJobEmploymentType',
      'adminJobLevel',
      'adminJobFeatured',
      'adminJobTechnologies',
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'adminJobSave' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'adminJobCancel' })).toBeInTheDocument();
  });

  it('surfaces §7 inline errors as i18n keys and blocks the submit', async () => {
    render(<JobForm />);
    const submit = screen.getByRole('button', { name: 'adminJobSave' });
    expect(submit).toBeDisabled(); // pristine

    // Dirty the company with one character → below the 2-char minimum.
    fireEvent.change(screen.getByLabelText('adminJobCompany'), { target: { value: 'A' } });
    fireEvent.click(submit);

    // zodResolver validates asynchronously — wait for the inline error.
    await waitFor(() => expect(screen.getByText('adminJobErrCompany')).toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('disables endDate while current is checked (A6)', () => {
    render(<JobForm />);
    const endDate = screen.getByLabelText('adminJobEndDate');
    expect(endDate).toBeEnabled();

    fireEvent.click(screen.getByLabelText('adminJobCurrent'));
    expect(endDate).toBeDisabled();
  });

  it('creates: persist FIRST, then dispatch, toast, reset', async () => {
    render(<JobForm />);
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Job[];
    expect(persisted).toHaveLength(2); // seed + created
    const created = persisted[1];
    expect(created?.company).toBe('New Co');
    expect(created?.period).toBe('2023 — 2024'); // A5: recomputed, never entered
    expect(created?.current).toBe(false);
    expect(created?.endDate).toBeInstanceOf(Date);
    expect(addJobSpy).toHaveBeenCalledTimes(1);
    expect(addToast).toHaveBeenCalledWith({ message: 'adminJobSaved', type: 'success' });
    expect(holder.state.adminJobs).toHaveLength(2);
  });

  it('keeps the form and skips dispatch when persist fails (§3)', async () => {
    persistSpy.mockReturnValue(false);
    render(<JobForm />);
    fillValidForm();

    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'adminJobPersistError', type: 'error' })
    );
    expect(addJobSpy).not.toHaveBeenCalled();
    expect(holder.state.adminJobs).toHaveLength(1);
    expect(screen.getByLabelText('adminJobCompany')).toHaveValue('New Co');
  });

  it('edits: applyJobUpdate recomputes period, dispatch + exit', async () => {
    const onExitEdit = vi.fn();
    render(<JobForm job={EXISTING} onExitEdit={onExitEdit} />);

    // Start moves a year later → period must follow (never hand-entered).
    fireEvent.change(screen.getByLabelText('adminJobStartDate'), {
      target: { value: '2021-05-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Job[];
    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.startDate.getFullYear()).toBe(2021);
    expect(persisted[0]?.period).toBe('2021 — 2022');
    expect(updateJobSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'job-1', startDate: expect.any(Date) })
    );
    expect(onExitEdit).toHaveBeenCalledTimes(1);
  });

  it('supports add/remove/reorder of description bullets', () => {
    render(<JobForm />);
    const addButtons = screen.getAllByRole('button', { name: 'adminJobAddBullet' });
    expect(addButtons).toHaveLength(2); // en + ru blocks

    const enBlock = screen.getByTestId('job-bullets-en');
    expect(within(enBlock).getAllByRole('textbox')).toHaveLength(1);

    fireEvent.click(addButtons[0] as HTMLElement);
    expect(within(enBlock).getAllByRole('textbox')).toHaveLength(2);

    const remove = within(enBlock).getAllByRole('button', {
      name: 'adminJobRemoveBullet',
    })[1] as HTMLElement;
    fireEvent.click(remove);
    expect(within(enBlock).getAllByRole('textbox')).toHaveLength(1);
  });

  it('supports the technologies chip editor (add + remove)', () => {
    render(<JobForm />);

    fireEvent.change(screen.getByLabelText('adminJobTechnologies'), {
      target: { value: 'TypeScript' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobAddTech' }));

    const chips = screen.getByTestId('job-tech-chips');
    expect(within(chips).getByText('TypeScript')).toBeInTheDocument();

    fireEvent.click(within(chips).getByRole('button', { name: 'adminJobRemoveTech-TypeScript' }));
    expect(within(chips).queryByText('TypeScript')).not.toBeInTheDocument();
  });
});
