// ============================================
// FieldEditForm tests (job-field-edit WU-1 — SPEC R-2 r4)
// ============================================
//
// RED-first contract: one field at a time (no foreign inputs leak in),
// per-field zod from the SHARED lib slices, Save disabled while pristine,
// persist BEFORE dispatch of a ONE-field partial (period recompute rides
// applyJobUpdate — A5), persist failure keeps the form open with a toast,
// technologies chips parity, current ⇄ endDate (A6).

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Job } from '@/entities/Job';
import { FieldEditForm } from './FieldEditForm';

const { persistSpy, updateJobSpy, addToast, holder } = vi.hoisted(() => ({
  persistSpy: vi.fn((_jobs: unknown[]) => true),
  updateJobSpy: vi.fn((payload: unknown) => ({ type: 'adminJobs/updateJob', payload })),
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
  updateJob: updateJobSpy,
}));

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

vi.mock('react-redux', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-redux')>();
  return {
    ...actual,
    useSelector: (selector: (state: typeof holder.state) => unknown) => selector(holder.state),
    useDispatch: () => (action: { type?: string; payload?: { id: string } & Partial<Job> }) => {
      if (action?.type === 'adminJobs/updateJob' && action.payload) {
        const payload = action.payload;
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

describe('FieldEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    holder.state.adminJobs = [EXISTING];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ---- R-2 r4: scope honesty (one field at a time) ----------------------

  it('position renders ONLY the two locale inputs and no other field', () => {
    render(<FieldEditForm job={EXISTING} field="position" />);
    expect(screen.getByLabelText('adminJobPositionEn')).toBeInTheDocument();
    expect(screen.getByLabelText('adminJobPositionRu')).toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobLocation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobCompanyUrl')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobTechnologies')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobStartDate')).not.toBeInTheDocument();
  });

  it('period renders ONLY the date inputs + current checkbox', () => {
    render(<FieldEditForm job={EXISTING} field="period" />);
    expect(screen.getByLabelText('adminJobStartDate')).toBeInTheDocument();
    expect(screen.getByLabelText('adminJobEndDate')).toBeInTheDocument();
    expect(screen.getByLabelText('adminJobCurrent')).toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobLocation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobPositionEn')).not.toBeInTheDocument();
  });

  it('location renders ONLY the location input', () => {
    render(<FieldEditForm job={EXISTING} field="location" />);
    expect(screen.getByLabelText('adminJobLocation')).toHaveValue('Remote');
    expect(screen.queryByLabelText('adminJobCompany')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobPositionEn')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobStartDate')).not.toBeInTheDocument();
  });

  it('companyUrl renders ONLY the url input prefilled from the record', () => {
    render(<FieldEditForm job={EXISTING} field="companyUrl" />);
    expect(screen.getByLabelText('adminJobCompanyUrl')).toHaveValue('https://acme.example');
    expect(screen.queryByLabelText('adminJobLocation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobPositionEn')).not.toBeInTheDocument();
  });

  it('technologies renders ONLY the chip editor prefilled from the record', () => {
    render(<FieldEditForm job={EXISTING} field="technologies" />);
    const chips = screen.getByTestId('job-field-tech-chips');
    expect(within(chips).getByText('React')).toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobLocation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('adminJobPositionEn')).not.toBeInTheDocument();
  });

  // ---- pristine / validation (shared lib slices) ------------------------

  it('Save is disabled while pristine and after render', () => {
    render(<FieldEditForm job={EXISTING} field="location" />);
    expect(screen.getByRole('button', { name: 'adminJobSave' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'adminJobCancel' })).toBeInTheDocument();
  });

  it('location: a 1-char value surfaces adminJobErrLocation and skips persist', async () => {
    render(<FieldEditForm job={EXISTING} field="location" />);
    fireEvent.change(screen.getByLabelText('adminJobLocation'), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));
    await waitFor(() => expect(screen.getByText('adminJobErrLocation')).toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateJobSpy).not.toHaveBeenCalled();
  });

  it('position: a 2-char EN value surfaces adminJobErrPosition', async () => {
    render(<FieldEditForm job={EXISTING} field="position" />);
    fireEvent.change(screen.getByLabelText('adminJobPositionEn'), { target: { value: 'Ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));
    await waitFor(() => expect(screen.getByText('adminJobErrPosition')).toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
  });

  it('period: a non-current record with a cleared end date surfaces adminJobErrEndDate', async () => {
    render(<FieldEditForm job={EXISTING} field="period" />);
    fireEvent.change(screen.getByLabelText('adminJobEndDate'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));
    await waitFor(() => expect(screen.getByText('adminJobErrEndDate')).toBeInTheDocument());
    expect(persistSpy).not.toHaveBeenCalled();
  });

  // ---- A6: current ⇄ endDate -------------------------------------------

  it('period: checking current disables the endDate input', () => {
    render(<FieldEditForm job={EXISTING} field="period" />);
    const endDate = screen.getByLabelText('adminJobEndDate');
    expect(endDate).toBeEnabled();
    fireEvent.click(screen.getByLabelText('adminJobCurrent'));
    expect(endDate).toBeDisabled();
  });

  // ---- save pipeline (persist THEN dispatch, one-field partial) ---------

  it('location save: persist FIRST with only {id, location}, then dispatch + toast + exit', async () => {
    const onExitEdit = vi.fn();
    render(<FieldEditForm job={EXISTING} field="location" onExitEdit={onExitEdit} />);

    fireEvent.change(screen.getByLabelText('adminJobLocation'), { target: { value: 'Berlin' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Job[];
    expect(persisted).toHaveLength(1);
    expect(persisted[0]?.location).toBe('Berlin');
    // untouched fields survive
    expect(persisted[0]?.company).toBe('Acme Corp');
    expect(persisted[0]?.position.en).toBe('Developer');
    expect(updateJobSpy).toHaveBeenCalledWith({ id: 'job-1', location: 'Berlin' });
    expect(addToast).toHaveBeenCalledWith({ message: 'adminJobSaved', type: 'success' });
    expect(onExitEdit).toHaveBeenCalledTimes(1);
  });

  it('period save: applyJobUpdate recomputes period from the new dates (A5)', async () => {
    const onExitEdit = vi.fn();
    render(<FieldEditForm job={EXISTING} field="period" onExitEdit={onExitEdit} />);

    fireEvent.change(screen.getByLabelText('adminJobStartDate'), {
      target: { value: '2021-05-01' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Job[];
    expect(persisted[0]?.startDate.getFullYear()).toBe(2021);
    expect(persisted[0]?.period).toBe('2021 — 2022');
    expect(updateJobSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'job-1', startDate: expect.any(Date) })
    );
    expect(onExitEdit).toHaveBeenCalledTimes(1);
  });

  it('period save while current: endDate rides as null in the partial', async () => {
    render(<FieldEditForm job={EXISTING} field="period" />);
    fireEvent.click(screen.getByLabelText('adminJobCurrent'));
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    const persisted = persistSpy.mock.calls[0]?.[0] as Job[];
    expect(persisted[0]?.current).toBe(true);
    expect(persisted[0]?.endDate).toBeNull();
    expect(updateJobSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'job-1', current: true, endDate: null })
    );
  });

  it('companyUrl save: blank input dispatches companyUrl undefined (DTO parity)', async () => {
    render(<FieldEditForm job={EXISTING} field="companyUrl" />);
    fireEvent.change(screen.getByLabelText('adminJobCompanyUrl'), { target: { value: '  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(updateJobSpy).toHaveBeenCalledWith({ id: 'job-1', companyUrl: undefined });
    const persisted = persistSpy.mock.calls[0]?.[0] as Job[];
    expect(persisted[0]?.companyUrl).toBeUndefined();
  });

  it('technologies save: chips ride the partial in order', async () => {
    render(<FieldEditForm job={EXISTING} field="technologies" />);
    fireEvent.change(screen.getByLabelText('adminJobTechnologies'), {
      target: { value: 'TypeScript' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobAddTech' }));
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(persistSpy).toHaveBeenCalledTimes(1));
    expect(updateJobSpy).toHaveBeenCalledWith({
      id: 'job-1',
      technologies: ['React', 'TypeScript'],
    });
  });

  it('technologies: add + remove chips (JobForm parity)', () => {
    render(<FieldEditForm job={EXISTING} field="technologies" />);
    fireEvent.change(screen.getByLabelText('adminJobTechnologies'), {
      target: { value: 'TypeScript' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobAddTech' }));
    const chips = screen.getByTestId('job-field-tech-chips');
    expect(within(chips).getByText('TypeScript')).toBeInTheDocument();

    fireEvent.click(within(chips).getByRole('button', { name: 'adminJobRemoveTech-TypeScript' }));
    expect(within(chips).queryByText('TypeScript')).not.toBeInTheDocument();
    // removal back to the record value keeps Save disabled? No — isDirty
    // flips on any setValue, including a roundtrip; assert chips only.
  });

  it('persist failure: error toast, no dispatch, form stays open with values', async () => {
    persistSpy.mockReturnValue(false);
    const onExitEdit = vi.fn();
    render(<FieldEditForm job={EXISTING} field="location" onExitEdit={onExitEdit} />);

    fireEvent.change(screen.getByLabelText('adminJobLocation'), { target: { value: 'Berlin' } });
    fireEvent.click(screen.getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({ message: 'adminJobPersistError', type: 'error' })
    );
    expect(updateJobSpy).not.toHaveBeenCalled();
    expect(onExitEdit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('adminJobLocation')).toHaveValue('Berlin');
    expect(holder.state.adminJobs[0]?.location).toBe('Remote');
  });

  it('Cancel exits without touching storage or the store', () => {
    const onExitEdit = vi.fn();
    render(<FieldEditForm job={EXISTING} field="location" onExitEdit={onExitEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'adminJobCancel' }));
    expect(onExitEdit).toHaveBeenCalledTimes(1);
    expect(persistSpy).not.toHaveBeenCalled();
    expect(updateJobSpy).not.toHaveBeenCalled();
  });
});
