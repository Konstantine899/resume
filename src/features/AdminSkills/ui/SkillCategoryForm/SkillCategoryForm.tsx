// ============================================
// SkillCategoryForm — admin create/edit form for one category (WU-5)
// ============================================
//
// Stage-1 CRUD (plan_skills_crud §7): react-hook-form + zodResolver
// against `makeCategoryFormSchema(existing, current)` — uniqueness is
// evaluated against the LIVE store so a record created after mount is
// still caught.
//
// Invariants:
// - persist BEFORE dispatch (§3): the persisted array and the dispatched
//   payload derive from the same `all` snapshot — store === storage.
// - Delete/Reset for the collection live in SkillsEditorList (§9); this
//   form owns Save/Cancel only.
// - ALL copy is i18n (i18n-first): labels, validation keys, toasts.
// - Edit vs create: the `category` prop switches the mode; the page owns
//   the key-remount (Design C).

import type { SkillCategory, SkillCategoryData } from '@/entities/Skill';
import { SKILL_CATEGORY_VALUES } from '@/entities/Skill';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllSkillsData } from '../../model/selectors/selectors';
import { persistSkills } from '../../model/services/storage';
import { addSkillCategory, updateSkillCategory } from '../../model/slices/skillsSlice';
import {
  emptyCategoryFormValues,
  makeCategoryFormSchema,
  toCategoryFormValues,
  type CategoryFormOutput,
  type CategoryFormValues,
} from '../lib/categoryFormSchema';
import styles from './SkillCategoryForm.module.scss';

export interface SkillCategoryFormProps {
  className?: string;
  'data-testid'?: string;
  /** Edit mode: record being edited. Absent = create mode. */
  category?: SkillCategoryData;
  /** Edit mode exit — the page clears its selection (key-remounts us). */
  onExitEdit?: () => void;
}

export const SkillCategoryForm: React.FC<SkillCategoryFormProps> = ({
  className = '',
  category,
  onExitEdit,
  'data-testid': testId = 'skill-category-form',
}) => {
  // Same-feature selector + dispatch — legal inside AdminSkills (§8).
  const all = useSelector(selectAllSkillsData);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  // Recomputed every render: a category added by a parallel action is
  // immediately part of the uniqueness check (resolver picks it up).
  const existing = all.map((entry) => entry.category);
  const resolver = zodResolver(makeCategoryFormSchema(existing, category?.category));

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CategoryFormValues, unknown, CategoryFormOutput>({
    resolver,
    defaultValues: category ? toCategoryFormValues(category) : emptyCategoryFormValues(),
  });

  // Kit inputs are React-controlled — feed `value` from useWatch() (the
  // ProjectForm pattern; watch() is React Compiler-incompatible).
  const values = useWatch({ control });

  /** §3 order: persist → dispatch → toast → pristine form / exit. */
  const handleSave = handleSubmit((data) => {
    if (category) {
      const patch = { category: data.category, categoryName: data.categoryName };
      const next = all.map((entry) =>
        entry.category === category.category ? { ...entry, ...patch } : entry
      );
      if (!persistSkills(next)) {
        addToast({ message: t('skillsPersistError'), type: 'error' });
        return; // form keeps the values; store unchanged (§7)
      }
      dispatch(updateSkillCategory({ category: category.category, patch }));
      addToast({ message: t('skillsSaved'), type: 'success' });
      reset(toCategoryFormValues({ ...category, ...patch }));
      onExitEdit?.();
      return;
    }
    const record: SkillCategoryData = {
      category: data.category,
      categoryName: data.categoryName,
      technologies: [],
    };
    if (!persistSkills([...all, record])) {
      addToast({ message: t('skillsPersistError'), type: 'error' });
      return;
    }
    dispatch(addSkillCategory(record));
    addToast({ message: t('skillsSaved'), type: 'success' });
    reset(emptyCategoryFormValues());
  });

  const handleCancel = () => {
    if (onExitEdit) onExitEdit();
    else reset(emptyCategoryFormValues());
  };

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.intro}>
        <Heading level={2}>{t(category ? 'skillsEditCategory' : 'skillsAddCategory')}</Heading>
      </div>

      <div className={styles.field}>
        <label className={styles.selectLabel} htmlFor="skill-category-form-category">
          {t('skillsCategoryType')}
        </label>
        <select
          id="skill-category-form-category"
          className={styles.select}
          value={values.category ?? 'frontend'}
          onChange={(event) =>
            setValue('category', event.target.value as SkillCategory, { shouldDirty: true })
          }
        >
          {SKILL_CATEGORY_VALUES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.category && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t('skillsErrCategoryExists')}</span>
          </Paragraph>
        )}
      </div>

      <div className={styles.field}>
        <Input
          label={t('skillsCategoryName')}
          error={errors.categoryName ? t('skillsErrCategoryName') : undefined}
          value={values.categoryName ?? ''}
          maxLength={50}
          fullWidth
          {...register('categoryName')}
        />
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

SkillCategoryForm.displayName = 'SkillCategoryForm';
