// ============================================
// TechnologyForm — admin create/edit form for one technology (WU-5)
// ============================================
//
// Stage-1 CRUD (plan_skills_crud §7): react-hook-form + zodResolver
// against `makeTechnologyFormSchema(existingNames, mode)`.
// Uniqueness is scoped to the OWNING category (render key, R-9) and the
// current record's own name is excluded so edit mode can keep it.
//
// Field-error mapping (issue code → i18n key, i18n-first):
// - `name`: 'custom' issue = duplicate → skillsErrTechExists, otherwise
//   presence (min/max) → skillsErrTechName;
// - `iconSvg` / `iconFilter`: any issue → skillsErrIcon / skillsErrFilter.
//
// rev.2 (skills-icon-upload, OPEN-1 = A): the icon Select is GONE —
// `iconSvg` only ever comes from FileUpload → save-to-directory (subdir
// `skills`, the ProjectForm pattern from PR #209). Create requires an
// upload; edit with '' KEEPS the stored record (legacy key or path).
// The kit never owns copy — unsupported/save errors surface as i18n
// keys through local state (plan A2).
//
// Invariants:
// - persist BEFORE dispatch (§3) with the nested collection rebuilt from
//   one `all` snapshot — store === storage.
// - ALL copy is i18n; Delete lives in SkillsEditorList (§9).
// - WU-5/A7: the form renders INSIDE the page's kit Modal — the modal
//   header owns the title and the fixed categoryId moved to the modal
//   `subtitle`; a SUCCESSFUL Save (create or edit) closes through
//   `onExitEdit`.

import { resolveIconSvg, type SkillCategoryData, type SkillTechnology } from '@/entities/Skill';
import { isAbortError, isDirectoryPickerSupported, saveUploadedImage } from '@/shared/lib/imageDir';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllSkillsData } from '../../model/selectors/selectors';
import { persistSkills } from '../../model/services/storage';
import { addTechnology, updateTechnology } from '../../model/slices/skillsSlice';
import {
  emptyTechnologyFormValues,
  makeTechnologyFormSchema,
  toTechnologyFormValues,
  type TechnologyFormOutput,
  type TechnologyFormValues,
} from '../lib/technologyFormSchema';
import styles from './TechnologyForm.module.scss';

/** SVG byte cap for the icon upload (~50 KB — plan D1). */
const ICON_MAX_BYTES = 50_000;
/** Fixed subdir under the remembered images root (plan D2). */
const ICON_SUBDIR = 'skills';

export interface TechnologyFormProps {
  className?: string;
  'data-testid'?: string;
  /** The category this technology belongs to (create + edit). */
  categoryId: string;
  /** Edit mode: record being edited. Absent = create mode. */
  technology?: SkillTechnology;
  /** Close signal: edit exit AND successful create-save (WU-5/A7) — the page clears its selection (key-remounts us). */
  onExitEdit?: () => void;
}

export const TechnologyForm: React.FC<TechnologyFormProps> = ({
  className = '',
  categoryId,
  technology,
  onExitEdit,
  'data-testid': testId = 'technology-form',
}) => {
  // Same-feature selector + dispatch — legal inside AdminSkills (§8).
  const all = useSelector(selectAllSkillsData);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // Uniqueness inside the owning category, excluding the record's own
  // name (edit may keep it). Recomputed every render — a technology
  // added in parallel is immediately part of the check.
  const categoryRecord: SkillCategoryData | undefined = all.find(
    (entry) => entry.category === categoryId
  );
  const existingNames = (categoryRecord?.technologies ?? [])
    .map((tech) => tech.name)
    .filter((name) => name !== technology?.name);

  // rev.2: create requires an upload; edit allows '' (keep the record).
  const mode = technology ? 'edit' : 'create';

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TechnologyFormValues, unknown, TechnologyFormOutput>({
    resolver: zodResolver(makeTechnologyFormSchema(existingNames, mode)),
    defaultValues: technology ? toTechnologyFormValues(technology) : emptyTechnologyFormValues(),
  });

  // Kit inputs are React-controlled — feed `value` from useWatch() (the
  // ProjectForm pattern; watch() is React Compiler-incompatible).
  const values = useWatch({ control });

  // File-upload save errors (unsupported / write failure) — i18n keys,
  // rendered as role=alert below the control (plan A2, no kit copy).
  const [iconSaveErrorKey, setIconSaveErrorKey] = useState<
    'skillsIconUploadUnsupported' | 'skillsIconUploadSaveError' | null
  >(null);

  // rev.2 / D2: the ProjectForm pattern (PR #209) — root handle in
  // IndexedDB, fixed `skills` subdir, the form stores the PATH.
  const handleImageFile = useCallback(
    async (file: FileUploadSelection) => {
      setIconSaveErrorKey(null);
      if (!isDirectoryPickerSupported()) {
        setIconSaveErrorKey('skillsIconUploadUnsupported');
        return;
      }
      try {
        const path = await saveUploadedImage({
          blob: file.blob,
          name: file.name,
          subdir: ICON_SUBDIR,
        });
        setValue('iconSvg', path, { shouldDirty: true, shouldValidate: true });
      } catch (error) {
        // The user dismissed the picker — no alarm, no value change.
        if (isAbortError(error)) return;
        setIconSaveErrorKey('skillsIconUploadSaveError');
      }
    },
    [setValue]
  );

  /** §3 order: persist → dispatch → toast → pristine form / exit. */
  const handleSave = handleSubmit((data) => {
    if (technology) {
      // rev.2: '' means «keep the stored record» (legacy key or path).
      const patch = {
        name: data.name,
        iconSvg: data.iconSvg || technology.iconSvg,
        iconFilter: data.iconFilter,
        invertInDark: data.invertInDark,
      };
      const next = all.map((entry) =>
        entry.category === categoryId
          ? {
              ...entry,
              technologies: entry.technologies.map((tech) =>
                tech.name === technology.name ? { ...tech, ...patch } : tech
              ),
            }
          : entry
      );
      if (!persistSkills(next)) {
        addToast({ message: t('skillsPersistError'), type: 'error' });
        return; // form keeps the values; store unchanged (§7)
      }
      dispatch(updateTechnology({ categoryId, techName: technology.name, patch }));
      addToast({ message: t('skillsSaved'), type: 'success' });
      reset(toTechnologyFormValues({ ...technology, ...patch }));
      onExitEdit?.();
      return;
    }
    const record: SkillTechnology = {
      name: data.name,
      iconSvg: data.iconSvg,
      iconFilter: data.iconFilter,
      invertInDark: data.invertInDark,
    };
    const next = all.map((entry) =>
      entry.category === categoryId
        ? { ...entry, technologies: [...entry.technologies, record] }
        : entry
    );
    if (!persistSkills(next)) {
      addToast({ message: t('skillsPersistError'), type: 'error' });
      return;
    }
    dispatch(addTechnology({ categoryId, technology: record }));
    addToast({ message: t('skillsSaved'), type: 'success' });
    reset(emptyTechnologyFormValues());
    // A7: successful create closes the modal too (was: inline form stayed open).
    onExitEdit?.();
  });

  const handleCancel = () => {
    if (onExitEdit) onExitEdit();
    else reset(emptyTechnologyFormValues());
  };

  const nameError = errors.name
    ? errors.name.type === 'custom'
      ? t('skillsErrTechExists')
      : t('skillsErrTechName')
    : undefined;

  // rev.2: edit-mode preview of the CURRENT stored icon (key or path) —
  // the FileUpload preview shows only the just-picked file.
  const currentIconUrl = technology ? resolveIconSvg(technology.iconSvg) : undefined;

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.field}>
        <Input
          label={t('skillsTechnologyName')}
          error={nameError}
          value={values.name ?? ''}
          maxLength={30}
          fullWidth
          {...register('name')}
        />
      </div>

      <div className={styles.field}>
        {currentIconUrl && (
          <div className={styles.iconPreviewRow}>
            <img className={styles.iconPreview} src={currentIconUrl} alt="" />
            <Paragraph asChild theme="muted" size="s">
              <span>{t('skillsIconCurrent')}</span>
            </Paragraph>
          </div>
        )}
        <FileUpload
          label={t('skillsIconUploadLabel')}
          texts={{
            button: t('skillsIconUploadButton'),
            hint: t('skillsIconUploadHint'),
            notImage: t('skillsIconUploadNotImage'),
            tooLarge: t('skillsIconUploadTooLarge'),
            undecodable: t('skillsIconUploadUndecodable'),
            selected: t('skillsIconUploadSelected'),
          }}
          onFileSelect={handleImageFile}
          maxBlobBytes={ICON_MAX_BYTES}
        />
        {iconSaveErrorKey && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t(iconSaveErrorKey)}</span>
          </Paragraph>
        )}
        {errors.iconSvg && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t('skillsErrIcon')}</span>
          </Paragraph>
        )}
      </div>

      <div className={styles.field}>
        <Textarea
          label={t('skillsIconFilter')}
          error={errors.iconFilter ? t('skillsErrFilter') : undefined}
          value={values.iconFilter ?? ''}
          maxLength={200}
          rows={2}
          {...register('iconFilter')}
        />
      </div>

      <div className={styles.checkRow}>
        <input
          id="skill-technology-form-invert"
          type="checkbox"
          checked={values.invertInDark ?? false}
          {...register('invertInDark')}
        />
        <label htmlFor="skill-technology-form-invert">{t('skillsInvertInDark')}</label>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('skillsSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t('skillsCancel')}
        </Button>
      </div>
    </Form>
  );
};

TechnologyForm.displayName = 'TechnologyForm';
