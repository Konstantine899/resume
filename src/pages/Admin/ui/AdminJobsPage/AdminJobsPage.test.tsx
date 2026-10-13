// ============================================
// AdminJobsPage — page-level modal criteria (admin-jobs-refactor WU-5, R-5)
// ============================================
//
// The PAGE owns the form modal (A7 Save closes, A8 ESC close, A12 one open
// dialog at a time); JobsList.test.tsx owns the confirm modal's internals
// (R-3). This file wires the REAL storeReducers — the jobs slice hydrates
// `readJobs() ?? createJobsSeed()` on its first reducer call — and mocks
// only storage (persist control), i18n (identity) and toasts. Harness:
// AdminSkillsPage.test.tsx:25-66.

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteJob } from '@/features/AdminJobs';
import type { Job } from '@/entities/Job';
import { storeReducers } from '@/storeReducers';
import { AdminJobsPage } from './AdminJobsPage';

const { persistSpy, addToast } = vi.hoisted(() => ({
  persistSpy: vi.fn((_data: unknown[]) => true),
  addToast: vi.fn(),
}));

vi.mock('@/features/AdminJobs/model/services/storage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/AdminJobs/model/services/storage')>()),
  persistJobs: persistSpy,
}));

// Identity t(): raw keys in assertions; known options render as
// `${key}:${value}` (confirm subtitle `company`, Pagination `number`,
// field-modal title `field` — job-field-edit R-3 r4).
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

const renderPage = () => {
  const store = configureStore({ reducer: storeReducers });
  render(
    <Provider store={store}>
      <AdminJobsPage />
    </Provider>
  );
  return store;
};

const jobsOf = (store: ReturnType<typeof renderPage>): Job[] => store.getState().adminJobs;

const openDialog = async () => screen.findByRole('dialog');

const openCreate = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'adminAddJob' }));
  return openDialog();
};

const editJob = async (id: string) => {
  // Cards are COLLAPSED by default (jobs-detail-table R-1): expand first,
  // then the header Pencil lives inside job-card-actions-<id>.
  const card = screen.getByTestId(`job-card-${id}`);
  fireEvent.click(within(card).getByRole('button', { name: /^adminJobExpand/ }));
  fireEvent.click(
    within(screen.getByTestId(`job-card-actions-${id}`)).getByRole('button', {
      name: 'adminEditJob',
    })
  );
  return openDialog();
};

/** Expand the card, then click a scalar-row Pencil → the FIELD modal. */
const editField = async (id: string, fieldKey: string, labelKey: string) => {
  const card = screen.getByTestId(`job-card-${id}`);
  fireEvent.click(within(card).getByRole('button', { name: /^adminJobExpand/ }));
  fireEvent.click(
    within(screen.getByTestId(`job-field-actions-${id}-${fieldKey}`)).getByRole('button', {
      name: `adminJobEditFieldTitle:${labelKey}`,
    })
  );
  return openDialog();
};

/** §7-valid create record — JobForm.test fillValidForm mirror. */
const fillValidForm = (modal: HTMLElement) => {
  fireEvent.change(within(modal).getByLabelText('adminJobPositionEn'), {
    target: { value: 'Senior Developer' },
  });
  fireEvent.change(within(modal).getByLabelText('adminJobPositionRu'), {
    target: { value: 'Старший разработчик' },
  });
  fireEvent.change(within(modal).getByLabelText('adminJobCompany'), {
    target: { value: 'New Co' },
  });
  fireEvent.change(within(modal).getByLabelText('adminJobStartDate'), {
    target: { value: '2023-05-01' },
  });
  fireEvent.change(within(modal).getByLabelText('adminJobEndDate'), {
    target: { value: '2024-05-01' },
  });
  fireEvent.change(within(modal).getByLabelText('adminJobLocation'), {
    target: { value: 'Berlin' },
  });
};

describe('AdminJobsPage (modal criteria, R-5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    persistSpy.mockReturnValue(true);
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('«Add position» opens ONE create modal with the job form (A12)', async () => {
    renderPage();

    const modal = await openCreate();

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminAddJob' })
    ).toBeInTheDocument();
    expect(within(modal).getByTestId('job-form')).toBeInTheDocument();
    // A12: the page renders a single dialog for its single `form` state.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('edit opens the modal prefilled with the record', async () => {
    renderPage();

    const modal = await editJob('1');

    expect(
      within(modal).getByRole('heading', { level: 2, name: 'adminEditJob' })
    ).toBeInTheDocument();
    expect(within(modal).getByTestId('job-form')).toBeInTheDocument();
    expect(within(modal).getByLabelText('adminJobCompany')).toHaveValue('Tech Corp International');
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  // ---- job-field-edit R-3 r4: field-scoped modals ------------------------

  it('period row Pencil opens ONLY the period field modal with the field title', async () => {
    renderPage();

    const modal = await editField('1', 'period', 'adminJobsTablePeriod');

    expect(
      within(modal).getByRole('heading', {
        level: 2,
        name: 'adminJobEditFieldTitle:adminJobsTablePeriod',
      })
    ).toBeInTheDocument();
    expect(within(modal).getByTestId('job-field-form')).toBeInTheDocument();
    expect(within(modal).getByLabelText('adminJobStartDate')).toBeInTheDocument();
    expect(within(modal).getByLabelText('adminJobEndDate')).toBeInTheDocument();
    // Scope honesty: the full form's fields do NOT leak in.
    expect(within(modal).queryByLabelText('adminJobCompany')).not.toBeInTheDocument();
    expect(within(modal).queryByLabelText('adminJobLocation')).not.toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('location field modal saves ONE field, recomputes nothing else, closes', async () => {
    const store = renderPage();
    const before = jobsOf(store).find((job) => job.id === '1');
    expect(before).toBeDefined();

    const modal = await editField('1', 'location', 'adminJobLocation');
    fireEvent.change(within(modal).getByLabelText('adminJobLocation'), {
      target: { value: 'Berlin' },
    });
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const updated = jobsOf(store).find((job) => job.id === '1');
    expect(updated?.location).toBe('Berlin');
    expect(updated?.company).toBe(before?.company); // untouched
    expect(updated?.position).toEqual(before?.position); // untouched
    expect(updated?.description).toEqual(before?.description); // untouched
    expect(persistSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ location: 'Berlin' })])
    );
  });

  it('stale-guard: deleting the record being edited closes the modal', async () => {
    const store = renderPage();

    const modal = await editJob('1');
    expect(within(modal).getByLabelText('adminJobCompany')).toHaveValue('Tech Corp International');

    store.dispatch(deleteJob('1'));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(jobsOf(store).some((job) => job.id === '1')).toBe(false);
  });

  it('ESC closes the modal (A8)', async () => {
    renderPage();
    await openCreate();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('create Save: persist → dispatch → toast → modal closes (A7)', async () => {
    const store = renderPage();

    const modal = await openCreate();
    fillValidForm(modal);
    fireEvent.click(within(modal).getByRole('button', { name: 'adminJobSave' }));

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ message: 'adminJobSaved' }))
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // persist BEFORE dispatch — the persisted array carries the new record.
    expect(persistSpy).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ company: 'New Co' })])
    );
    expect(jobsOf(store).some((job) => job.company === 'New Co')).toBe(true);
  });
});
