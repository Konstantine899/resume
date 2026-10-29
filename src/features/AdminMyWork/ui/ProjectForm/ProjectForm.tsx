// ============================================
// ProjectForm — admin create/edit form for one Project (admin-mywork-refactor WU-6)
// ============================================
//
// Stage-1 CRUD (plan_projects_crud §10): react-hook-form + zodResolver
// against `makeProjectFormSchema(techKeys)` — the DOM adapter over the
// SHARED `ProjectFormDataSchema` in entities (§7 single source of truth)
// plus catalog membership (technologies-crud D2: keys come from the store,
// the deleted TECH_ICONS enum no longer exists).
//
// Invariants:
// - persist BEFORE dispatch (§3): record/patch built ONCE by
//   makeProjectRecord/makeUpdatePatch, persisted array contains the SAME
//   object that is dispatched — store === storage byte-for-byte.
// - WU-6 (SPEC R-6): this form is DATA-ONLY — no reset/delete, no
//   confirms. Delete lives in the list rows, reset in the vitrina header
//   (the page owns the modals).
// - metrics: a bullet-row editor (add / remove / reorder) per the
//   JobForm convention (mywork-metrics-bullet-rows) — one input row per
//   metric; the schema still trims and drops blank rows.
// - ALL copy is i18n (i18n-first): labels, validation keys, toasts.
// - Edit vs create: the `project` prop switches the mode; the page owns
//   the key-remount (Design C — this component stays the only place that
//   touches the slice, selectors via react-redux).

import type { Project, ProjectCategory, ProjectStatus } from '@/entities/Project';
import { PROJECT_CATEGORIES, PROJECT_STATUSES } from '@/entities/Project';
import { selectTechnologyKeys } from '@/entities/Technology';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { Button, IconButton } from '@/shared/ui/Button';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Tooltip } from '@/shared/ui/Tooltip';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllProjects } from '../../model/selectors/selectors';
import { uploadImage } from '@/shared/lib/imageUpload';
import { ensureRootWithinGesture } from '@/shared/lib/imageDir';
import { persistProjects } from '../../model/services/storage';
import {
  addProject,
  makeProjectRecord,
  makeUpdatePatch,
  updateProject,
} from '../../model/slices/myWorkSlice';
import {
  emptyProjectFormValues,
  makeProjectFormSchema,
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
  // Live catalog keys (technologies-crud D2/D4): the toggles AND the
  // schema's membership rule both read the store; a missing slice falls
  // back to the seed instead of throwing (bare tests / Storybook).
  const techKeys = useSelector(selectTechnologyKeys);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
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
    resolver: zodResolver(makeProjectFormSchema(techKeys)),
    defaultValues: project ? toProjectFormValues(project) : emptyProjectFormValues(),
  });

  // The kit inputs are React-controlled — feed `value` from useWatch() so
  // every keystroke/validation/reset flows through RHF state into the DOM
  // (useWatch, NOT watch(): React Compiler incompatible-library rule).
  const values = useWatch({ control });

  const toggleTech = (key: string) => {
    const current = values.techIcons ?? [];
    const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    setValue('techIcons', next, { shouldDirty: true });
  };

  const toggleFeatured = () => {
    setValue('featured', !values.featured, { shouldDirty: true });
  };

  // mywork-metrics-bullet-rows (SPEC R-2): JobForm bullet-editor parity —
  // add/remove/reorder all go through the RHF array value and mark the
  // form dirty so the pristine Save stays disabled until a row changes.
  const metricRows = values.metrics ?? [''];
  const setMetricRows = (next: string[]) => setValue('metrics', next, { shouldDirty: true });

  const addMetric = () => setMetricRows([...metricRows, '']);
  const removeMetric = (index: number) => setMetricRows(metricRows.filter((_, i) => i !== index));
  const moveMetric = (index: number, delta: -1 | 1) => {
    const list = [...metricRows];
    const target = index + delta;
    const [moved] = list.splice(index, 1);
    if (moved !== undefined && target >= 0 && target < list.length + 1) {
      list.splice(target, 0, moved);
      setMetricRows(list);
    }
  };

  // rev.4 + amend 2026-10-10 (owner directive): the ROOT images directory
  // is picked once and remembered in IndexedDB (`imagesRoot`); the chosen
  // subdirectory (default `projects`, or a newly created one from the
  // select below) is created under it and the file is WRITTEN there —
  // the form stores the resulting `/images/<dir>/<name>` PATH.
  const handleImageFile = useCallback(
    async (file: FileUploadSelection) => {
      setImageSaveErrorKey(null);
      // directory picker no longer required for backend upload
      try {
        const outcome = await uploadImage({ blob: file.blob, name: file.name });
        if (!outcome.ok) {
          setImageSaveErrorKey('projectFileUploadSaveError');
          return;
        }
        setValue('image', outcome.file.key, { shouldDirty: true, shouldValidate: true });
      } catch {
        setImageSaveErrorKey('projectFileUploadSaveError');
      }
    },
    [setValue]
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
    // A7 parity (JobForm.tsx): a successful Save closes the page-owned
    // modal (the page key-remounts us with fresh defaults on the next
    // open). The standalone form keeps no callback → no-op.
    onExitEdit?.();
  });

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
          onBeforeSelect={() => ensureRootWithinGesture()}
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

      {/* mywork-metrics-bullet-rows (SPEC R-1): the Textarea is replaced
          by the JobForm bullet-row editor — one input row per metric with
          ↑/↓/X IconButtons and an Add button; blank rows never reach the
          record (schema transform → metrics: undefined when all blank). */}
      <div className={styles.metricBlock} data-testid="project-metrics">
        <Heading level={3}>{t('projectFieldMetrics')}</Heading>
        {metricRows.map((text, index) => (
          <div className={styles.metricRow} key={`metric-${index}`}>
            <Paragraph asChild size="xs" theme="primary" align="left">
              <input
                type="text"
                className={styles.metricInput}
                maxLength={40}
                aria-label={`${t('projectFieldMetrics')}-${index + 1}`}
                value={text}
                {...register(`metrics.${index}`)}
              />
            </Paragraph>
            <Tooltip content={t('projectMetricUp')} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="sm"
                ariaLabel={t('projectMetricUp')}
                disabled={index === 0}
                icon={<Icon name={ArrowUp} size={20} color="inherit" decorative />}
                onClick={() => moveMetric(index, -1)}
              />
            </Tooltip>
            <Tooltip content={t('projectMetricDown')} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="sm"
                ariaLabel={t('projectMetricDown')}
                disabled={index === metricRows.length - 1}
                icon={<Icon name={ArrowDown} size={20} color="inherit" decorative />}
                onClick={() => moveMetric(index, 1)}
              />
            </Tooltip>
            <Tooltip content={t('projectMetricRemove')} position="top" showDelay={0}>
              <IconButton
                type="button"
                variant="outline"
                size="sm"
                ariaLabel={t('projectMetricRemove')}
                disabled={metricRows.length <= 1}
                icon={<Icon name={X} size={20} color="inherit" decorative />}
                onClick={() => removeMetric(index)}
              />
            </Tooltip>
          </div>
        ))}
        {errors.metrics && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t('projectMetricInvalid')}</span>
          </Paragraph>
        )}
        <Button type="button" variant="outline" size="sm" onClick={addMetric}>
          {t('projectMetricAdd')}
        </Button>
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
        {/* WU-6 (R-6): reset/delete moved out — reset lives in the vitrina
            header, delete in the list rows; the form keeps Save/Cancel. */}
        {project && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            {t('projectCancel')}
          </Button>
        )}
      </div>
    </Form>
  );
};

ProjectForm.displayName = 'ProjectForm';
