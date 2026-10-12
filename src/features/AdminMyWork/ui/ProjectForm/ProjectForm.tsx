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

import type { Project, ProjectCategory, ProjectStatus } from '@/entities/Project';
import { PROJECT_CATEGORIES, PROJECT_STATUSES, TECH_ICONS } from '@/entities/Project';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllProjects } from '../../model/selectors';
import {
  getOrCreateSubdir,
  isDirectoryPickerSupported,
  pickImagesRoot,
  readImagesRootHandle,
  saveImageToDir,
  writeImagesRootHandle,
} from '@/shared/lib/imageDir';
import { persistProjects, removeProjects } from '../../model/services/storage';
import {
  addProject,
  deleteProject,
  makeProjectRecord,
  makeUpdatePatch,
  resetToDefaults,
  updateProject,
} from '../../model/slices/myWorkSlice';
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

/** Amend 2026-10-10: subdirectory options for the image picker (default + create-new). */
const IMAGE_SUBDIR_OPTIONS = [
  { value: 'projects', label: 'projects' },
  { value: 'new', label: 'new' },
];

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
  // admin-mywork-refactor WU-2 (R-2): gates the delete-confirm button and
  // lets a persist failure keep the modal open for a retry (Skills parity).
  const [deleting, setDeleting] = useState(false);
  // Destructive-confirm pattern (SkillsEditorList §6): focus lands on «Отмена».
  const cancelRef = useRef<HTMLButtonElement>(null);
  // rev.4: i18n key of the last save-to-directory failure (null = none).
  const [imageSaveErrorKey, setImageSaveErrorKey] = useState<string | null>(null);

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

  // rev.4 + amend 2026-10-10 (owner directive): the ROOT images directory
  // is picked once and remembered in IndexedDB (`imagesRoot`); the chosen
  // subdirectory (default `projects`, or a newly created one from the
  // select below) is created under it and the file is WRITTEN there —
  // the form stores the resulting `/images/<dir>/<name>` PATH.
  const handleImageFile = useCallback(
    async (file: FileUploadSelection) => {
      setImageSaveErrorKey(null);
      if (!isDirectoryPickerSupported()) {
        setImageSaveErrorKey('projectFileUploadUnsupported');
        return;
      }
      try {
        const root = (await readImagesRootHandle()) ?? (await pickImagesRoot());
        await writeImagesRootHandle(root); // best-effort remember
        const subdir = values.imageSubdir || 'projects';
        await getOrCreateSubdir(root, subdir); // create-or-select under root
        const path = await saveImageToDir(root, file.blob, file.name, subdir);
        setValue('image', path, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        // The user dismissed the picker — no alarm, no value change.
        if ((error as { name?: string } | null)?.name === 'AbortError') return;
        setImageSaveErrorKey('projectFileUploadSaveError');
      }
    },
    [setValue, values.imageSubdir]
  );

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
    setDeleting(true);
    const next = all.filter((item) => item.id !== project.id);
    if (!persistProjects(next)) {
      // R-2 / Skills OPEN-9 parity: keep the modal OPEN for a retry.
      addToast({ message: t('projectSaveError'), type: 'error' });
      setDeleting(false);
      return;
    }
    dispatch(deleteProject(project.id));
    addToast({ message: t('projectDeleted'), type: 'success' });
    setDeleting(false);
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

      {/* rev.4 + amend 2026-10-10: no manual URL/path field — the file is
          written into a subdirectory of the shared images root (default
          `projects`, or a new one from the select) and the form stores
          the returned /images/<dir>/<name> path. */}
      <div className={styles.field}>
        <Select
          id="project-form-image-subdir"
          label={t('projectImageSubdirLabel')}
          options={IMAGE_SUBDIR_OPTIONS}
          value={values.imageSubdir ?? 'projects'}
          onChange={(value) => setValue('imageSubdir', value, { shouldDirty: true })}
        />
        <FileUpload
          label={t('projectFileUploadLabel')}
          texts={{
            button: t('projectFileUploadButton'),
            hint: t('projectFileUploadHint'),
            notImage: t('projectFileUploadNotImage'),
            tooLarge: t('projectFileUploadTooLarge'),
            undecodable: t('projectFileUploadUndecodable'),
            selected: t('projectFileUploadSelected'),
          }}
          onFileSelect={handleImageFile}
        />
        {imageSaveErrorKey ? (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t(imageSaveErrorKey)}</span>
          </Paragraph>
        ) : null}
        {errors.image ? (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t('projectImageInvalid')}</span>
          </Paragraph>
        ) : null}
        {values.image ? (
          <div className={styles.imageCurrent}>
            <img src={values.image} alt="" className={styles.imageCurrentPreview} />
            <span className={styles.imageCurrentPath}>{values.image}</span>
          </div>
        ) : null}
      </div>

      <div className={styles.localeRow}>
        <div className={styles.field}>
          <Select
            id="project-form-category"
            label={t('projectFieldCategory')}
            options={PROJECT_CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
            value={values.category ?? 'other'}
            onChange={(value) =>
              setValue('category', value as ProjectCategory, { shouldDirty: true })
            }
          />
          {errors.category && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t('projectEnumInvalid')}</span>
            </Paragraph>
          )}
        </div>
        <div className={styles.field}>
          <Select
            id="project-form-status"
            label={t('projectFieldStatus')}
            options={PROJECT_STATUSES.map((status) => ({ value: status, label: status }))}
            value={values.status ?? 'completed'}
            onChange={(value) => setValue('status', value as ProjectStatus, { shouldDirty: true })}
          />
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
        // R-2: title ≠ button label (the button stays projectDelete); the
        // subtitle NAMES the project (projectConfirmDeleteName, OPEN-10
        // parity with skillsConfirmDelete={{name}} / adminJobConfirmDeleteName).
        title={t('projectDeleteConfirm')}
        subtitle={project ? t('projectConfirmDeleteName', { name: project.title }) : undefined}
        size="sm"
        initialFocusRef={cancelRef}
        footer={
          <>
            <Button
              ref={cancelRef}
              type="button"
              variant="outline"
              onClick={() => setConfirmTarget(null)}
            >
              {t('projectCancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={deleting}
              onClick={handleConfirmDelete}
            >
              {t('projectDelete')}
            </Button>
          </>
        }
      >
        {null}
      </Modal>
    </Form>
  );
};

ProjectForm.displayName = 'ProjectForm';
