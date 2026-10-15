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
// Rev.3 (mywork-field-actions WU-6): the SAME modal hosts the
// field-scoped FieldEditForm when `form.field` is set (row Pencil) —
// title = adminMyWorkEditFieldTitle with the field's label. The form is
// keyed by `projectId-field` so switching fields remounts it with fresh
// defaults (Design C key-remount).
//
// Design C key-remount: the form is keyed by its record
// (`key={projectId ?? 'create'}`), so Edit ↔ create remounts it with
// fresh defaultValues instead of patching RHF state in place. Stale-guard:
// a record deleted elsewhere closes the modal instead of rendering stale
// values into the inputs (AdminJobsPage parity).

import {
  FieldEditForm,
  MyWorkEditorList,
  ProjectForm,
  selectAllProjects,
  type EditProjectField,
} from '@/features/AdminMyWork';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Modal } from '@/shared/ui/Modal';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Null = closed; `{}` = create; `{ projectId }` = full-form edit;
 * `{ projectId, field }` = rev.3 field-scoped edit (row Pencil).
 */
type MyWorkFormState = { projectId?: string; field?: EditProjectField } | null;

/** Row key → the projectField* label key (modal title rides the i18n map). */
const FIELD_LABEL_KEYS: Record<string, string> = {
  title: 'projectFieldTitle',
  category: 'projectFieldCategory',
  status: 'projectFieldStatus',
  featured: 'projectFieldFeatured',
  year: 'projectFieldYear',
  link: 'projectFieldLink',
  description: 'projectFieldDescription',
  role: 'projectFieldRole',
  techIcons: 'projectFieldTechIcons',
};

const fieldLabelKey = (field: EditProjectField): string =>
  field.startsWith('metric-') ? 'projectFieldMetrics' : (FIELD_LABEL_KEYS[field] ?? field);

export const AdminMyWorkPage: React.FC = () => {
  const projects = useSelector(selectAllProjects);
  const { t } = useLanguage();
  const [form, setForm] = useState<MyWorkFormState>(null);

  const projectId = form?.projectId;
  const field = form?.field;
  const record = projectId ? projects.find((entry) => entry.id === projectId) : undefined;
  // A record deleted elsewhere closes the modal instead of rendering
  // stale values into the inputs — never fall back to create mode.
  const open = form !== null && (projectId === undefined || record !== undefined);

  const closeForm = () => setForm(null);

  const formElement = open ? (
    field !== undefined && record !== undefined ? (
      <FieldEditForm
        key={`${projectId}-${field}`}
        project={record}
        field={field}
        onExitEdit={closeForm}
      />
    ) : (
      <ProjectForm key={projectId ?? 'create'} project={record} onExitEdit={closeForm} />
    )
  ) : null;

  return (
    <Section size="md" data-testid="admin-mywork">
      <ErrorBoundary>
        <MyWorkEditorList
          onAdd={() => setForm({})}
          onEdit={(id) => setForm({ projectId: id })}
          onEditField={(project, editField) => setForm({ projectId: project.id, field: editField })}
          onDeleted={(id) => setForm((current) => (current?.projectId === id ? null : current))}
        />
        <Modal
          isOpen={open}
          onClose={closeForm}
          // mywork-detail-table R-2 (OPEN-4=A, Jobs parity): the dialog
          // NAME tells the mode — create ≠ edit ≠ the list h2. Rev.3:
          // field edit names the field (adminMyWorkEditFieldTitle).
          title={
            field !== undefined
              ? t('adminMyWorkEditFieldTitle', { field: t(fieldLabelKey(field)) })
              : t(projectId !== undefined ? 'adminEditProject' : 'adminAddProject')
          }
          // mywork-parity-polish WU-6 (issue #252, Skills parity): the
          // subtitle NAMES the edited project (raw string like
          // AdminSkillsPage formSubtitle). Create mode → record is
          // undefined → no subtitle.
          subtitle={record?.title}
        >
          {formElement}
        </Modal>
      </ErrorBoundary>
    </Section>
  );
};

AdminMyWorkPage.displayName = 'AdminMyWorkPage';
