// ============================================
// Admin area — Skills editor page (Skills CRUD plan §9 WU-5)
// ============================================
//
// Child route `/admin/skills` rendered through AdminLayout's <Outlet/>.
// Thin page: list + ONE open modal form with the selection state — all
// CRUD logic lives in features/AdminSkills (FSD pages compose).
//
// WU-5 (OPEN-2): the create/edit forms render inside a kit Modal owned by
// this page — `isOpen`/`onClose` are the page's `form` state (A12: at
// most one modal, form XOR confirm — the overlay blocks the list). The
// modal header owns the title (forms dropped their own h2); the fixed
// categoryId of the technology form is the modal `subtitle` (SPEC).
// Cancel / ESC / overlay (A8) and a successful Save (A7) all close via
// `closeForm`.
//
// The open form is a discriminated union (category | technology): the two
// editors have different props, and only one renders at a time.
// Design C key-remount: each form instance is keyed by its record
// (`key={record ?? 'create'}`), so switching Edit ↔ create remounts it
// with fresh defaultValues instead of patching RHF state in place.
// Records are resolved through the feature's public selector; the delete
// callbacks clear a stale selection (list delete while the form is open).

import {
  SkillCategoryForm,
  SkillsEditorList,
  TechnologyForm,
  selectAllSkillsData,
} from '@/features/AdminSkills';
import type { SkillCategoryData } from '@/entities/Skill';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { Modal } from '@/shared/ui/Modal';
import { Section } from '@/shared/ui/Section';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

/** One open editor — category form and technology form are distinct. */
type SkillsFormState =
  | { kind: 'category'; category?: SkillCategoryData }
  | { kind: 'technology'; categoryId: string; techName?: string }
  | null;

export const AdminSkillsPage: React.FC = () => {
  const categories = useSelector(selectAllSkillsData);
  const { t } = useLanguage();
  const [form, setForm] = useState<SkillsFormState>(null);

  const closeForm = () => setForm(null);

  // Modal chrome derived from the open form (null = closed, title unused).
  let formTitle: string | undefined;
  let formSubtitle: string | undefined;
  if (form?.kind === 'category') {
    formTitle = t(form.category ? 'skillsEditCategory' : 'skillsAddCategory');
  } else if (form?.kind === 'technology') {
    formTitle = t(form.techName ? 'skillsEditTechnology' : 'skillsAddTechnology');
    // «как сейчас muted-строкой → subtitle модалки» (SPEC, verdict OPEN-2).
    formSubtitle = form.categoryId;
  }

  // Record deleted elsewhere → fall back to create (AdminMyWorkPage
  // precedent); a vanished CATEGORY closes the technology form entirely
  // (creating into a missing category would silently no-op §3).
  let formElement: React.ReactNode = null;
  if (form?.kind === 'category') {
    const record = form.category
      ? categories.find((entry) => entry.category === form.category?.category)
      : undefined;
    formElement = (
      <SkillCategoryForm
        key={record?.category ?? 'category-create'}
        category={record}
        onExitEdit={closeForm}
      />
    );
  } else if (form?.kind === 'technology') {
    const categoryRecord = categories.find((entry) => entry.category === form.categoryId);
    if (categoryRecord) {
      const technology = form.techName
        ? categoryRecord.technologies.find((tech) => tech.name === form.techName)
        : undefined;
      formElement = (
        <TechnologyForm
          key={`${form.categoryId}:${form.techName ?? 'create'}`}
          categoryId={form.categoryId}
          technology={technology}
          onExitEdit={closeForm}
        />
      );
    }
  }

  const handleCategoryDeleted = (categoryId: string) => {
    setForm((current) => {
      if (current?.kind === 'category' && current.category?.category === categoryId) return null;
      if (current?.kind === 'technology' && current.categoryId === categoryId) return null;
      return current;
    });
  };

  const handleTechnologyDeleted = (categoryId: string, techName: string) => {
    setForm((current) =>
      current?.kind === 'technology' &&
      current.categoryId === categoryId &&
      current.techName === techName
        ? null
        : current
    );
  };

  return (
    <Section size="md" data-testid="admin-skills">
      <ErrorBoundary>
        <SkillsEditorList
          onAddCategory={() => setForm({ kind: 'category' })}
          onEditCategory={(category) => setForm({ kind: 'category', category })}
          onAddTechnology={(categoryId) => setForm({ kind: 'technology', categoryId })}
          onEditTechnology={(categoryId, techName) =>
            setForm({ kind: 'technology', categoryId, techName })
          }
          onCategoryDeleted={handleCategoryDeleted}
          onTechnologyDeleted={handleTechnologyDeleted}
        />
        <Modal isOpen={form !== null} onClose={closeForm} title={formTitle} subtitle={formSubtitle}>
          {formElement}
        </Modal>
      </ErrorBoundary>
    </Section>
  );
};

AdminSkillsPage.displayName = 'AdminSkillsPage';
