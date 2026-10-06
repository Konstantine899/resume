// ============================================
// ProjectForm — admin create/edit form for one Project (WU-4)
// ============================================
//
// Stage-1 CRUD (plan_projects_crud §10): react-hook-form + zodResolver
// against `ProjectFormSchema`, which delegates every rule to the SHARED
// `ProjectFormDataSchema` in entities (§7 single source of truth).
//
// Invariants:
// - persist BEFORE dispatch (§3): record/patch built ONCE by
//   makeProjectRecord/makeUpdatePatch, persisted array contains the SAME
//   object that is dispatched — store === storage byte-for-byte.
// - Reset and Delete are destructive → kit Modal confirm (§6), never
//   window.confirm.
// - ALL copy is i18n (i18n-first): labels, validation keys, toasts.
// - Edit vs create: the `project` prop switches the mode; the page owns
//   the key-remount (Design C — this component stays the only place that
//   touches the slice, selectors via react-redux).

import { PROJECT_CATEGORIES, PROJECT_STATUSES, TECH_ICONS } from '@/entities/Project';
import type { Project, ProjectCategory, ProjectStatus } from '@/entities/Project';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  addProject,
  makeProjectRecord,
  makeUpdatePatch,
  updateProject,
} from '../model/slices/myWorkSlice';
import { deleteProject, resetToDefaults } from '../model/slices/myWorkSlice';
import { selectAllProjects } from '../model/selectors';
import { persistProjects, removeProjects } from '../model/services/storage';
import {
  ProjectFormSchema,
  emptyProjectFormValues,
  toProjectFormValues,
  type ProjectFormOutput,
  type ProjectFormValues,
} from './lib/projectFormSchema';
import styles from './ProjectForm.module.scss';

/** The two editable locales — the field order is en then ru everywhere. */
const LOCALES = ['en', 'ru'] as const;

export interface ProjectFormProps {
  className?: string;
  'data-testid'?: string;
  /** Edit mode: record being edited. Absent = create mode. */
  project?: Project;
  /** Edit mode exit — the page clears its editingId (key-remounts us). */
  onExitEdit?: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  className = '',
  project,
  onExitEdit,
  'data-testid': testId = 'project-form',
}) => {
  // Same-feature selector + dispatch — legal inside AdminMyWork (§8).
  const all = useSelector(selectAllProjects);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [confirmTarget, setConfirmTarget] = useState<'reset' | 'delete' | null>(null);

  // The schema transforms raw DOM strings into the persisted contract
  // (link null, metrics string[], year number) — three generics keep the
  // resolver's input/output types honest (zodResolver<Input, _, Output>).
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProjectFormValues, unknown, ProjectFormOutput>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: project ? toProjectFormValues(project) : emptyProjectFormValues(),
  });

  // The kit inputs are React-controlled — feed `value` from useWatch() so
  // every keystroke/validation/reset flows through RHF state into the DOM
  // (useWatch, NOT watch(): React Compiler incompatible-library rule).
  const values = useWatch({ control });

  const techKeys = Object.keys(TECH_ICONS);

  const toggleTech = (key: string) => {
    const current = values.techIcons ?? [];
    const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    setValue('techIcons', next, { shouldDirty: true });
  };

  const toggleFeatured = () => {
    setValue('featured', !values.featured, { shouldDirty: true });
  };

  /** §3 order: persist → dispatch → toast → pristine form. */
  const handleSave = handleSubmit((data) => {
    if (project) {
      const patch = makeUpdatePatch(data);
      const next = all.map((item) => (item.id === project.id ? { ...item, ...patch } : item));
      if (!persistProjects(next)) {
        addToast({ message: t('projectSaveError'), type: 'error' });
        return; // form keeps the values; store unchanged (§7)
      }
      dispatch(updateProject({ id: project.id, patch }));
      reset(toProjectFormValues({ ...project, ...data }));
    } else {
      const record = makeProjectRecord(data);
      if (!persistProjects([...all, record])) {
        addToast({ message: t('projectSaveError'), type: 'error' });
        return;
      }
      dispatch(addProject(record));
      reset(emptyProjectFormValues());
    }
    addToast({ message: t('projectSaved'), type: 'success' });
  });

  /** §7: destructive reset → Modal confirm → remove → dispatch → blank. */
  const handleConfirmReset = () => {
    removeProjects();
    dispatch(resetToDefaults());
    setConfirmTarget(null);
    reset(emptyProjectFormValues());
    onExitEdit?.();
  };

  /** §7: delete → Modal confirm → persist without id → dispatch → exit. */
  const handleConfirmDelete = () => {
    if (!project) return;
    const next = all.filter((item) => item.id !== project.id);
    if (!persistProjects(next)) {
      addToast({ message: t('projectSaveError'), type: 'error' });
      setConfirmTarget(null);
      return;
    }
    dispatch(deleteProject(project.id));
    addToast({ message: t('projectDeleted'), type: 'success' });
    setConfirmTarget(null);
    onExitEdit?.();
  };

  const handleCancel = () => {
    if (onExitEdit) onExitEdit();
    else reset(emptyProjectFormValues());
  };

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.intro}>
        <Heading level={2}>{t('adminMyWorkTitle')}</Heading>
        <Paragraph theme="muted">{t('adminMyWorkHint')}</Paragraph>
      </div>

      <div className={styles.field}>
        <Input
          label={t('projectFieldTitle')}
          error={errors.title ? t('projectTitleRequired') : undefined}
          value={values.title ?? ''}
          maxLength={100}
          fullWidth
          {...register('title')}
        />
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('projectFieldDescription')}</Heading>
        {LOCALES.map((locale) => (
          <Textarea
            key={locale}
            label={`${t('projectFieldDescription')} · ${locale.toUpperCase()}`}
            value={values.description?.[locale] ?? ''}
            error={errors.description?.[locale] ? t('projectDescriptionEmpty') : undefined}
            maxLength={600}
            rows={4}
            {...register(`description.${locale}`)}
          />
        ))}
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('projectFieldTech')}</Heading>
        <div className={styles.toggles} role="group" aria-label={t('projectFieldTech')}>
          {techKeys.map((key) => {
            const active = (values.techIcons ?? []).includes(key);
            return (
              <Button
                key={key}
                type="button"
                variant={active ? 'primary' : 'outline'}
                size="sm"
                aria-pressed={active}
                onClick={() => toggleTech(key)}
              >
                {key}
              </Button>
            );
          })}
        </div>
        {errors.techIcons && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t('projectTechRequired')}</span>
          </Paragraph>
        )}
      </div>

      <div className={styles.field}>
        <Input
          label={t('projectFieldLink')}
          error={errors.link ? t('projectLinkInvalid') : undefined}
          value={values.link ?? ''}
          placeholder="https://…  or  /…"
          fullWidth
          {...register('link')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('projectFieldImage')}
          error={errors.image ? t('projectImageInvalid') : undefined}
          value={values.image ?? ''}
          fullWidth
          {...register('image')}
        />
      </div>

      <div className={styles.localeRow}>
        <div className={styles.field}>
          <label className={styles.selectLabel} htmlFor="project-form-category">
            {t('projectFieldCategory')}
          </label>
          <select
            id="project-form-category"
            className={styles.select}
            value={values.category ?? 'other'}
            onChange={(event) =>
              setValue('category', event.target.value as ProjectCategory, { shouldDirty: true })
            }
          >
            {PROJECT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t('projectEnumInvalid')}</span>
            </Paragraph>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.selectLabel} htmlFor="project-form-status">
            {t('projectFieldStatus')}
          </label>
          <select
            id="project-form-status"
            className={styles.select}
            value={values.status ?? 'completed'}
            onChange={(event) =>
              setValue('status', event.target.value as ProjectStatus, { shouldDirty: true })
            }
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t('projectEnumInvalid')}</span>
            </Paragraph>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <Button
          type="button"
          variant={values.featured ? 'primary' : 'outline'}
          aria-pressed={values.featured ?? false}
          onClick={toggleFeatured}
        >
          {t('projectFieldFeatured')}
        </Button>
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('projectFieldRole')}</Heading>
        <div className={styles.localeRow}>
          {LOCALES.map((locale) => (
            <Textarea
              key={locale}
              label={`${t('projectFieldRole')} · ${locale.toUpperCase()}`}
              value={values.role?.[locale] ?? ''}
              error={errors.role?.[locale] ? t('projectRoleLocaleRequired') : undefined}
              rows={2}
              {...register(`role.${locale}`)}
            />
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <Textarea
          label={t('projectFieldMetrics')}
          error={errors.metrics ? t('projectMetricInvalid') : undefined}
          value={values.metrics ?? ''}
          rows={3}
          {...register('metrics')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('projectFieldYear')}
          error={errors.year ? t('projectYearInvalid') : undefined}
          value={values.year ?? ''}
          inputMode="numeric"
          maxLength={4}
          fullWidth
          {...register('year')}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('projectSave')}
        </Button>
        <Button type="button" variant="outline" onClick={() => setConfirmTarget('reset')}>
          {t('projectReset')}
        </Button>
        {project && (
          <>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('projectCancel')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setConfirmTarget('delete')}>
              {t('projectDelete')}
            </Button>
          </>
        )}
      </div>

      <Modal
        isOpen={confirmTarget === 'reset'}
        onClose={() => setConfirmTarget(null)}
        title={t('projectReset')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setConfirmTarget(null)}>
              {t('projectCancel')}
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirmReset}>
              {t('projectReset')}
            </Button>
          </>
        }
      >
        <Paragraph>{t('projectResetConfirm')}</Paragraph>
      </Modal>

      <Modal
        isOpen={confirmTarget === 'delete'}
        onClose={() => setConfirmTarget(null)}
        title={t('projectDelete')}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setConfirmTarget(null)}>
              {t('projectCancel')}
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirmDelete}>
              {t('projectDelete')}
            </Button>
          </>
        }
      >
        <Paragraph>{t('projectDeleteConfirm')}</Paragraph>
      </Modal>
    </Form>
  );
};

ProjectForm.displayName = 'ProjectForm';
