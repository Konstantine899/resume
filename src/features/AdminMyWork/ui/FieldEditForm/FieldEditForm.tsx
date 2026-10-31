// ============================================
// FieldEditForm — one-field edit modal form (mywork-field-actions WU-5)
// ============================================
//
// SPEC R-B2/R-B6: the field-scoped counterpart of ProjectForm. Renders
// ONLY the inputs of the given `field` (scope honesty — the row Pencil's
// promise), validates through the SHARED per-field slices
// (./ProjectForm/lib/fieldSchemas, R-B5 — no second source of truth) and
// saves a ONE-field partial through the §3 pipeline: snapshot → merge →
// persistProjects → dispatch.
//
// Notes:
// - metric-N rows use the indexed `metricFieldSchema` slice; toUpdateDto
//   splices the entry against the record's existing metrics array.
// - Save is disabled while pristine (JobForm parity); persist failure
//   toasts projectSaveError and keeps the modal open.
// - The PAGE modal owns the title/aria-dialog-name (A12) — no h2 here.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { mediaUrl } from '@/shared/lib/media';
import { Button } from '@/shared/ui/Button';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  type Project,
  type ProjectCategory,
  type ProjectStatus,
} from '@/entities/Project';
import { selectAllTechnologies, selectTechnologyKeys } from '@/entities/Technology';
import { uploadImage } from '@/shared/lib/imageUpload';
import { updateProject } from '../../model/slices/myWorkSlice';
import { selectAllProjects } from '../../model/selectors/selectors';
import { persistProjects } from '../../model/services/storage';
import {
  defaultValuesFor,
  metricIndexOf,
  schemaFor,
  toUpdateDto,
  type EditProjectField,
  type FieldFormOutput,
  type FieldFormValues,
} from '../ProjectForm/lib/fieldSchemas';
import styles from './FieldEditForm.module.scss';

/** The two editable locales — the field order is en then ru everywhere. */
const LOCALES = ['en', 'ru'] as const;

export interface FieldEditFormProps {
  project: Project;
  field: EditProjectField;
  /** Edit-mode exit — the page clears its selection (key-remounts us). */
  onExitEdit?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const FieldEditForm: React.FC<FieldEditFormProps> = ({
  project,
  field,
  onExitEdit,
  className = '',
  'data-testid': testId = 'project-field-form',
}) => {
  const projects = useSelector(selectAllProjects);
  // Live catalog keys (technologies-crud D2/D4): the techIcons toggles and
  // the membership rule in `schemaFor` both read the store — seed fallback
  // when the slice is absent (bare tests / Storybook).
  const techKeys = useSelector(selectTechnologyKeys);
  const technologies = useSelector(selectAllTechnologies);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  // Issue #273: i18n key of the last save-to-directory failure (null = none).
  const [imageSaveErrorKey, setImageSaveErrorKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FieldFormValues, unknown, FieldFormOutput>({
    resolver: zodResolver(schemaFor(field, techKeys)) as unknown as Resolver<
      FieldFormValues,
      unknown,
      FieldFormOutput
    >,
    defaultValues: defaultValuesFor(field, project),
  });

  const values = useWatch({ control });

  /** §3 order: persist → dispatch → toast → exit. ONE-field partial. */
  const handleSave = handleSubmit((data) => {
    const partial = toUpdateDto(field, data, project);
    const stamped = { ...partial, updatedAt: new Date().toISOString() };
    const next = projects.map((entry) =>
      entry.id === project.id ? { ...entry, ...stamped } : entry
    );
    if (!persistProjects(next)) {
      addToast({ message: t('projectSaveError'), type: 'error' });
      return; // form keeps the values; store unchanged
    }
    dispatch(updateProject({ id: project.id, patch: stamped }));
    addToast({ message: t('projectSaved'), type: 'success' });
    onExitEdit?.();
  });

  const handleCancel = () => onExitEdit?.();

  const toggleTech = (key: string) => {
    const current = values.techIcons ?? [];
    const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
    setValue('techIcons', next, { shouldDirty: true });
  };

  // Issue #273 (ProjectForm parity): the image is picked via kit FileUpload
  // and WRITTEN into the fixed `projects` subdirectory of the shared images
  // root — the field value becomes the returned `/images/projects/<name>`
  // path (a one-field modal has no room for the imageSubdir Select).
  const handleImageFile = useCallback(
    async (file: FileUploadSelection) => {
      setImageSaveErrorKey(null);
      const outcome = await uploadImage({ blob: file.blob, name: file.name });
      if (!outcome.ok) {
        setImageSaveErrorKey('projectFileUploadSaveError');
        return;
      }
      setValue('image', outcome.file.key, { shouldDirty: true, shouldValidate: true });
    },
    [setValue]
  );

  const renderFields = () => {
    switch (field) {
      case 'title':
        return (
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
        );
      case 'category':
        return (
          <div className={styles.field}>
            <Select
              id="project-field-category"
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
        );
      case 'status':
        return (
          <div className={styles.field}>
            <Select
              id="project-field-status"
              label={t('projectFieldStatus')}
              options={PROJECT_STATUSES.map((status) => ({ value: status, label: status }))}
              value={values.status ?? 'completed'}
              onChange={(value) =>
                setValue('status', value as ProjectStatus, { shouldDirty: true })
              }
            />
            {errors.status && (
              <Paragraph asChild theme="error" size="s">
                <span role="alert">{t('projectEnumInvalid')}</span>
              </Paragraph>
            )}
          </div>
        );
      case 'featured':
        return (
          <div className={styles.field}>
            <Button
              type="button"
              variant={values.featured ? 'primary' : 'outline'}
              aria-pressed={values.featured ?? false}
              onClick={() => setValue('featured', !values.featured, { shouldDirty: true })}
            >
              {t('projectFieldFeatured')}
            </Button>
          </div>
        );
      case 'year':
        return (
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
        );
      case 'link':
        return (
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
        );
      case 'description':
        return (
          <>
            {LOCALES.map((locale) => (
              <div key={locale} className={styles.field}>
                <Textarea
                  label={`${t('projectFieldDescription')} · ${locale.toUpperCase()}`}
                  value={values.description?.[locale] ?? ''}
                  error={errors.description?.[locale] ? t('projectDescriptionEmpty') : undefined}
                  maxLength={600}
                  rows={4}
                  {...register(`description.${locale}`)}
                />
              </div>
            ))}
          </>
        );
      case 'role':
        return (
          <>
            {LOCALES.map((locale) => (
              <div key={locale} className={styles.field}>
                <Textarea
                  label={`${t('projectFieldRole')} · ${locale.toUpperCase()}`}
                  value={values.role?.[locale] ?? ''}
                  error={errors.role?.[locale] ? t('projectRoleLocaleRequired') : undefined}
                  rows={2}
                  {...register(`role.${locale}`)}
                />
              </div>
            ))}
          </>
        );
      case 'techIcons':
        return (
          <div className={styles.field}>
            <div className={styles.toggles} role="group" aria-label={t('projectFieldTech')}>
              {techKeys.map((key) => {
                const active = (values.techIcons ?? []).includes(key);
                const technology = technologies.find((candidate) => candidate.key === key);
                const label = technology?.name ?? technology?.key ?? key;
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={active ? 'primary' : 'outline'}
                    size="sm"
                    aria-pressed={active}
                    onClick={() => toggleTech(key)}
                  >
                    {technology?.url ? (
                      <img
                        src={mediaUrl(technology.url)}
                        alt=""
                        className={styles.techToggleIcon}
                      />
                    ) : null}
                    {technology?.url ? (
                      <img
                        src={mediaUrl(technology.url)}
                        alt=""
                        className={styles.techToggleIcon}
                      />
                    ) : null}
                    {label}
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
        );
      case 'image':
        return (
          <div className={styles.field}>
            {/* Issue #273 (ProjectForm parity): no manual URL/path field — the
                file is written into the fixed `projects` subdirectory of the
                shared images root and the field stores the returned
                /images/projects/<name> path. */}
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
                <img src={mediaUrl(values.image)} alt="" className={styles.imageCurrentPreview} />
                <span className={styles.imageCurrentPath}>{values.image}</span>
              </div>
            ) : null}
          </div>
        );
      default:
        return (
          <div className={styles.field}>
            <Input
              label={t('projectFieldMetrics')}
              error={errors.metric ? t('projectMetricInvalid') : undefined}
              value={values.metric ?? ''}
              maxLength={40}
              fullWidth
              data-metric-index={metricIndexOf(field)}
              {...register('metric')}
            />
          </div>
        );
    }
  };

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      {renderFields()}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('projectSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t('projectCancel')}
        </Button>
      </div>
    </Form>
  );
};

FieldEditForm.displayName = 'FieldEditForm';
