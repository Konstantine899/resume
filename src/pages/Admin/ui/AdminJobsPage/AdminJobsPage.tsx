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
// job-field-edit (SPEC R-3 r4): a scalar-row Pencil opens the FIELD-scoped
// FieldEditForm (title names the field via adminJobEditFieldTitle); the
// header Pencil keeps the full JobForm. Design C key-remount: the form is
// keyed by record (+ field for the field modal), so Edit ↔ create ↔ another
// field remounts with fresh defaultValues instead of patching RHF state.
// Stale-guard: a record deleted elsewhere closes the modal instead of
// rendering stale values into the inputs (AdminSkillsPage precedent).

import {
  EDIT_FIELD_LABEL_KEYS,
  FieldEditForm,
  JobForm,
  JobsList,
  selectAllJobs,
  type EditField,
} from '@/features/AdminJobs';
import type { Job } from '@/entities/Job';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Modal } from '@/shared/ui/Modal';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Null = closed; `{}` = create; `{ job }` = full-record edit;
 * `{ job, field }` = field-scoped edit (job-field-edit).
 */
type JobsFormState = { job?: Job; field?: EditField } | null;

export const AdminJobsPage: React.FC = () => {
  const jobs = useSelector(selectAllJobs);
  const { t } = useLanguage();
  const [form, setForm] = useState<JobsFormState>(null);

  const target = form?.job;
  const field = form?.field;
  const record = target ? jobs.find((entry) => entry.id === target.id) : undefined;
  // A record deleted elsewhere closes the modal instead of rendering
  // stale values into the inputs.
  const open = form !== null && (target === undefined || record !== undefined);

  const closeForm = () => setForm(null);

  const formElement = open ? (
    field !== undefined && record !== undefined ? (
      <FieldEditForm
        key={`${record.id}-${field}`}
        job={record}
        field={field}
        onExitEdit={closeForm}
      />
    ) : (
      <JobForm key={target?.id ?? 'create'} job={record} onExitEdit={closeForm} />
    )
  ) : null;

  const title = field
    ? t('adminJobEditFieldTitle', { field: t(EDIT_FIELD_LABEL_KEYS[field]) })
    : t(target === undefined ? 'adminAddJob' : 'adminEditJob');

  return (
    <Section size="md" data-testid="admin-jobs">
      <ErrorBoundary>
        <JobsList
          onAddJob={() => setForm({})}
          onEditJob={(job) => setForm({ job })}
          onEditField={(job, editField) => setForm({ job, field: editField })}
          onJobDeleted={(id) => setForm((current) => (current?.job?.id === id ? null : current))}
        />
        <Modal
          isOpen={open}
          onClose={closeForm}
          // Modal chrome derived from the open form (null = closed, title unused).
          title={title}
        >
          {formElement}
        </Modal>
      </ErrorBoundary>
    </Section>
  );
};

AdminJobsPage.displayName = 'AdminJobsPage';
