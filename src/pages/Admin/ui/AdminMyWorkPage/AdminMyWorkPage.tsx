// ============================================
// Admin area — Projects editor page (admin-mywork-refactor WU-4, R-4)
// ============================================
//
// Child route `/admin/mywork` rendered through AdminLayout's <Outlet/>.
// Thin page: list + ONE open modal form with the selection state — all
// CRUD logic lives in features/AdminMyWork (FSD pages compose).
//
// WU-4 (SPEC R-4): the create/edit form renders inside a kit Modal owned
// by this page — `isOpen` follows the page's `form` state (A12: at most
// one dialog; the overlay blocks the list). The modal header owns the
// title (the form dropped its own h2 — `aria-dialog-name`). ESC/overlay
// (A8) and a successful Save (A7 — ProjectForm calls `onExitEdit`) close
// via `closeForm`.
//
// Design C key-remount: the form is keyed by its record
// (`key={projectId ?? 'create'}`), so Edit ↔ create remounts it with
// fresh defaultValues instead of patching RHF state in place. Stale-guard:
// a record deleted elsewhere closes the modal instead of rendering stale
// values into the inputs (AdminJobsPage parity).

import { MyWorkEditorList, ProjectForm, selectAllProjects } from '@/features/AdminMyWork';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Modal } from '@/shared/ui/Modal';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/** Null = closed; `{}` = create; `{ projectId }` = edit that record. */
type MyWorkFormState = { projectId?: string } | null;

export const AdminMyWorkPage: React.FC = () => {
  const projects = useSelector(selectAllProjects);
  const { t } = useLanguage();
  const [form, setForm] = useState<MyWorkFormState>(null);

  const projectId = form?.projectId;
  const record = projectId ? projects.find((entry) => entry.id === projectId) : undefined;
  // A record deleted elsewhere closes the modal instead of rendering
  // stale values into the inputs — never fall back to create mode.
  const open = form !== null && (projectId === undefined || record !== undefined);

  const closeForm = () => setForm(null);

  const formElement = open ? (
    <ProjectForm key={projectId ?? 'create'} project={record} onExitEdit={closeForm} />
  ) : null;

  return (
    <Section size="md" data-testid="admin-mywork">
      <ErrorBoundary>
        <MyWorkEditorList
          onAdd={() => setForm({})}
          onEdit={(id) => setForm({ projectId: id })}
          onDeleted={(id) => setForm((current) => (current?.projectId === id ? null : current))}
        />
        <Modal isOpen={open} onClose={closeForm} title={t('adminMyWorkTitle')}>
          {formElement}
        </Modal>
      </ErrorBoundary>
    </Section>
  );
};

AdminMyWorkPage.displayName = 'AdminMyWorkPage';
