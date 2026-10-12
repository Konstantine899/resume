// ============================================
// Admin area — WorkHistory editor page (WorkHistory CRUD plan §9 WU-5)
// ============================================
//
// Child route `/admin/jobs` rendered through AdminLayout's <Outlet/>.
// Thin page: list + ONE open modal form with the selection state — all CRUD
// logic lives in features/AdminJobs (FSD pages compose).
//
// WU-5 (admin-jobs-refactor, SPEC R-5): the create/edit form renders inside
// a kit Modal owned by this page — `isOpen` follows the page's `form` state
// (A12: at most one dialog; the overlay blocks the list). The modal header
// owns the title (the form dropped its own h2 — `aria-dialog-name`). Cancel
// / ESC / overlay (A8) and a successful Save (A7) close via `closeForm`.
//
// Design C key-remount: the form is keyed by its record
// (`key={record?.id ?? 'create'}`), so Edit ↔ create remounts it with
// fresh defaultValues instead of patching RHF state in place. Stale-guard:
// a record deleted elsewhere closes the modal instead of rendering stale
// values into the inputs (AdminSkillsPage precedent).

import { JobForm, JobsList, selectAllJobs } from '@/features/AdminJobs';
import type { Job } from '@/entities/Job';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Modal } from '@/shared/ui/Modal';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/** Null = closed; `{}` = create; `{ job }` = edit that record. */
type JobsFormState = { job?: Job } | null;

export const AdminJobsPage: React.FC = () => {
  const jobs = useSelector(selectAllJobs);
  const { t } = useLanguage();
  const [form, setForm] = useState<JobsFormState>(null);

  const target = form?.job;
  const record = target ? jobs.find((entry) => entry.id === target.id) : undefined;
  // A record deleted elsewhere closes the modal instead of rendering
  // stale values into the inputs.
  const open = form !== null && (target === undefined || record !== undefined);

  const closeForm = () => setForm(null);

  const formElement = open ? (
    <JobForm key={target?.id ?? 'create'} job={record} onExitEdit={closeForm} />
  ) : null;

  return (
    <Section size="md" data-testid="admin-jobs">
      <ErrorBoundary>
        <JobsList
          onAddJob={() => setForm({})}
          onEditJob={(job) => setForm({ job })}
          onJobDeleted={(id) => setForm((current) => (current?.job?.id === id ? null : current))}
        />
        <Modal
          isOpen={open}
          onClose={closeForm}
          // Modal chrome derived from the open form (null = closed, title unused).
          title={t(target === undefined ? 'adminAddJob' : 'adminEditJob')}
        >
          {formElement}
        </Modal>
      </ErrorBoundary>
    </Section>
  );
};

AdminJobsPage.displayName = 'AdminJobsPage';
