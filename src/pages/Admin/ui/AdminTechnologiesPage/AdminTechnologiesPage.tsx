// ============================================
// Admin area — Technologies editor page (technologies-crud WU-4)
// ============================================
//
// Child route `/admin/technologies` rendered through AdminLayout's <Outlet/>.
// Thin page: list + ONE open modal form with the selection state — all
// CRUD logic lives in features/AdminTechnologies (FSD pages compose).
//
// The create/edit form renders inside a kit Modal owned by this page —
// `isOpen` follows the page's `form` state (A12: at most one dialog; the
// overlay blocks the list). The modal header owns the title (the form has
// no h2 — `aria-dialog-name`); edit mode adds the record key as the
// modal subtitle (AdminSkillsPage categoryId parity). Cancel/ESC/overlay
// (A8) and a successful Save (A7 — TechnologyForm calls `onExitEdit`)
// close via `closeForm`.
//
// D6 wiring: `usedKeys` (keys referenced by ANY project's techIcons) is
// built here — pages may import features legally — and passed to the
// list, which refuses to delete those records (error inside the modal).
//
// Design C key-remount: the form is keyed by its record
// (`key={record key ?? 'create'}`), so Edit ↔ create remounts it with
// fresh defaultValues instead of patching RHF state in place.

import { TechnologyForm, TechnologiesList } from '@/features/AdminTechnologies';
import { selectAllProjects } from '@/features/AdminMyWork';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Modal } from '@/shared/ui/Modal';
import { Section } from '@/shared/ui/Section';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAllTechnologies, type Technology } from '@/entities/Technology';

/** Null = closed; `{}` = create; `{ key }` = edit that record. */
type TechnologyFormState = { mode: 'create' } | { mode: 'edit'; key: string } | null;

export const AdminTechnologiesPage: React.FC = () => {
  const catalog = useSelector(selectAllTechnologies);
  const projects = useSelector(selectAllProjects);
  const { t } = useLanguage();
  const [form, setForm] = useState<TechnologyFormState>(null);

  // D6: keys referenced by ANY project — the list blocks deleting them.
  const usedKeys = useMemo(
    () => new Set(projects.flatMap((project) => project.techIcons)),
    [projects]
  );

  const closeForm = () => setForm(null);

  // Record resolved through the entity selector; a record deleted
  // elsewhere falls back to nothing (stale-guard: never render stale
  // values into the inputs — AdminMyWorkPage parity).
  let record: Technology | undefined;
  if (form?.mode === 'edit') {
    record = catalog.find((tech) => tech.key === form.key);
  }

  let formTitle: string | undefined;
  let formSubtitle: string | undefined;
  if (form?.mode === 'edit') {
    formTitle = t('adminTechnologiesEdit');
    formSubtitle = record ? t('adminTechFormSubtitle', { name: record.key }) : undefined;
  } else if (form?.mode === 'create') {
    formTitle = t('adminTechnologiesAdd');
  }

  // A vanished record closes the form instead of rendering a stale editor.
  const formOpen = form !== null && (form.mode === 'create' || record !== undefined);

  const formElement = formOpen && form !== null ? (
    <TechnologyForm
      key={form.mode === 'edit' ? form.key : 'create'}
      technology={form.mode === 'edit' ? record : undefined}
      onExitEdit={closeForm}
    />
  ) : null;

  return (
    <Section size="md" data-testid="admin-technologies">
      <ErrorBoundary>
        <TechnologiesList
          usedKeys={usedKeys}
          onAddTechnology={() => setForm({ mode: 'create' })}
          onEditTechnology={(key) => setForm({ mode: 'edit', key })}
          onTechnologyDeleted={(key) =>
            setForm((current) =>
              current?.mode === 'edit' && current.key === key ? null : current
            )
          }
        />
        <Modal isOpen={formOpen} onClose={closeForm} title={formTitle} subtitle={formSubtitle}>
          {formElement}
        </Modal>
      </ErrorBoundary>
    </Section>
  );
};

AdminTechnologiesPage.displayName = 'AdminTechnologiesPage';
