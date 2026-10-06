// ============================================
// TechnologyForm — admin create/edit form for one technology (WU-5)
// ============================================
//
// Stage-1 CRUD (plan_skills_crud §7): react-hook-form + zodResolver
// against `makeTechnologyFormSchema(existingNames, knownIcons)`.
// Uniqueness is scoped to the OWNING category (render key, R-9) and the
// current record's own name is excluded so edit mode can keep it.
//
// Field-error mapping (issue code → i18n key, i18n-first):
// - `name`: 'custom' issue = duplicate → skillsErrTechExists, otherwise
//   presence (min/max) → skillsErrTechName;
// - `iconSvg` / `iconFilter`: any issue → skillsErrIcon / skillsErrFilter.
//
// Invariants:
// - persist BEFORE dispatch (§3) with the nested collection rebuilt from
//   one `all` snapshot — store === storage.
// - ALL copy is i18n; Delete lives in SkillsEditorList (§9).

import { SKILL_ICON_KEYS } from '@/entities/Skill';
import type { SkillCategoryData, Technology } from '@/entities/Skill';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addTechnology, updateTechnology } from '../model/slices/skillsSlice';
import { selectAllSkillsData } from '../model/selectors/selectors';
import { persistSkills } from '../model/services/storage';
import {
  makeTechnologyFormSchema,
  emptyTechnologyFormValues,
  toTechnologyFormValues,
  type TechnologyFormOutput,
  type TechnologyFormValues,
} from './lib/technologyFormSchema';
import styles from './TechnologyForm.module.scss';

export interface TechnologyFormProps {
  className?: string;
  'data-testid'?: string;
  /** The category this technology belongs to (create + edit). */
  categoryId: string;
  /** Edit mode: record being edited. Absent = create mode. */
  technology?: Technology;
  /** Edit mode exit — the page clears its selection (key-remounts us). */
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

  // Editing must not fail on a legacy icon that is not a listed key:
  // widen the known set with the record's current value (§7 contract).
  const knownIcons =
    technology?.iconSvg && !SKILL_ICON_KEYS.includes(technology.iconSvg)
      ? [...SKILL_ICON_KEYS, technology.iconSvg]
      : SKILL_ICON_KEYS;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TechnologyFormValues, unknown, TechnologyFormOutput>({
    resolver: zodResolver(makeTechnologyFormSchema(existingNames, knownIcons)),
    defaultValues: technology ? toTechnologyFormValues(technology) : emptyTechnologyFormValues(),
  });

  // Kit inputs are React-controlled — feed `value` from useWatch() (the
  // ProjectForm pattern; watch() is React Compiler-incompatible).
  const values = useWatch({ control });

  /** §3 order: persist → dispatch → toast → pristine form / exit. */
  const handleSave = handleSubmit((data) => {
    if (technology) {
      const patch = {
        name: data.name,
        iconSvg: data.iconSvg,
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
    const record: Technology = {
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

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.intro}>
        <Heading level={2}>
          {t(technology ? 'skillsEditTechnology' : 'skillsAddTechnology')}
        </Heading>
        <Paragraph theme="muted">{categoryId}</Paragraph>
      </div>

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
        <label className={styles.selectLabel} htmlFor="skill-technology-form-icon">
          {t('skillsIcon')}
        </label>
        <select
          id="skill-technology-form-icon"
          className={styles.select}
          value={values.iconSvg ?? ''}
          onChange={(event) => setValue('iconSvg', event.target.value, { shouldDirty: true })}
        >
          {knownIcons.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
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
