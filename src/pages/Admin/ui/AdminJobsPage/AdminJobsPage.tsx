// ============================================
// Admin area — WorkHistory editor page (WorkHistory CRUD plan §9 WU-5)
// ============================================
//
// Child route `/admin/jobs` rendered through AdminLayout's <Outlet/>.
// Thin page: list + one open form with the selection state — all CRUD
// logic lives in features/AdminJobs (FSD pages compose).
//
// Design C key-remount: the form is keyed by its record
// (`key={record?.id ?? 'create'}`), so Edit ↔ create remounts it with
// fresh defaultValues instead of patching RHF state in place. Deleting
// the record being edited closes the form (AdminSkillsPage precedent).

import { JobForm, JobsList, selectAllJobs } from '@/features/AdminJobs';
import type { Job } from '@/entities/Job';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/** Null = closed; `{}` = create; `{ job }` = edit that record. */
type JobsFormState = { job?: Job } | null;

export const AdminJobsPage: React.FC = () => {
  const jobs = useSelector(selectAllJobs);
  const [form, setForm] = useState<JobsFormState>(null);

  const target = form?.job;
  const record = target ? jobs.find((entry) => entry.id === target.id) : undefined;
  // A record deleted elsewhere closes the form instead of rendering
  // stale values into the inputs.
  const open = form !== null && (target === undefined || record !== undefined);

  return (
    <Section size="md" data-testid="admin-jobs">
      <ErrorBoundary>
        <JobsList
          onAddJob={() => setForm({})}
          onEditJob={(job) => setForm({ job })}
          onJobDeleted={(id) => setForm((current) => (current?.job?.id === id ? null : current))}
        />
        {open && (
          <JobForm key={target?.id ?? 'create'} job={record} onExitEdit={() => setForm(null)} />
        )}
      </ErrorBoundary>
    </Section>
  );
};

AdminJobsPage.displayName = 'AdminJobsPage';
