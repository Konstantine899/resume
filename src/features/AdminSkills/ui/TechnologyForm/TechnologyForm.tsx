import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import styles from './TechnologyForm.module.scss';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Select } from '@/shared/ui/Select';
import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { addTechnology, updateTechnology } from '../../model/slices/skillsSlice';
import { persistSkills } from '../../model/services/storage';
import { selectAllSkillsData } from '../../model/selectors/selectors';
import type { SkillTechnology } from '@/entities/Skill';
import { resolveIconSvg } from '@/entities/Skill';
import { selectAllTechnologies } from '@/entities/Technology/model/selectors/selectors';
import {
  emptyTechnologyFormValues,
  makeTechnologyFormSchema,
  toTechnologyFormValues,
  type TechnologyFormValues,
} from '../lib/technologyFormSchema';

export interface TechnologyFormProps {
  className?: string;
  'data-testid'?: string;
  categoryId: string;
  technology?: SkillTechnology;
  onExitEdit?: () => void;
}

export const TechnologyForm: React.FC<TechnologyFormProps> = ({
  className,
  categoryId,
  technology,
  onExitEdit,
  'data-testid': testId = 'technology-form',
}) => {
  const all = useSelector(selectAllSkillsData);
  const technologies = useSelector(selectAllTechnologies);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const mode = technology ? 'edit' : 'create';

  const categoryRecord = all.find((entry) => entry.category === categoryId);
  const existingKeys = (categoryRecord?.technologies ?? [])
    .map((tech) => tech.techKey ?? tech.name)
    .filter((key): key is string => Boolean(key))
    .filter((key) => key !== (technology?.techKey ?? technology?.name));

  const availableKeys = technologies.map((tech) => tech.key);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TechnologyFormValues, unknown, TechnologyFormValues>({
    resolver: zodResolver(makeTechnologyFormSchema(existingKeys, availableKeys, mode)),
    defaultValues: technology ? toTechnologyFormValues(technology) : emptyTechnologyFormValues(),
  });

  const values = useWatch({ control });

  const selectedTechnology = useMemo(
    () => technologies.find((tech) => tech.key === values.techKey),
    [technologies, values.techKey]
  );

  const handleTechnologySelect = (value: string) => {
    setValue('techKey', value, { shouldDirty: true, shouldValidate: true });
    const picked = technologies.find((tech) => tech.key === value);
    if (picked) {
      setValue('invertInDark', picked.invertInDark ?? false, { shouldDirty: true });
    }
  };

  const currentIconUrl = technology
    ? (selectedTechnology?.url ?? resolveIconSvg(technology.iconSvg ?? ''))
    : selectedTechnology?.url;

  const techKeyError = errors.techKey ? t('skillsErrTechName') : undefined;

  const handleCancel = () => {
    if (onExitEdit) onExitEdit();
  };

  const handleSave = handleSubmit((data) => {
    const picked = technologies.find((tech) => tech.key === data.techKey);

    if (!picked) {
      addToast({ message: t('skillsErrTechName'), type: 'error' });
      return;
    }

    if (technology) {
      const patch = {
        name: picked.key,
        iconSvg: picked.url,
        invertInDark: data.invertInDark,
        techKey: picked.key,
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
        return;
      }

      dispatch(updateTechnology({ categoryId, techName: technology.name ?? technology.techKey ?? '', patch }));
      addToast({ message: t('skillsSaved'), type: 'success' });
      onExitEdit?.();
      return;
    }

    const record: SkillTechnology = {
      name: picked.key,
      iconSvg: picked.url,
      invertInDark: data.invertInDark,
      techKey: picked.key,
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
    onExitEdit?.();
  });

  const options = technologies.map((tech) => ({
    value: tech.key,
    label: tech.key,
  }));

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.field}>
        <Select
          label={t('skillsSelectTechnology')}
          value={values.techKey ?? ''}
          onChange={handleTechnologySelect}
          options={options}
          placeholder={technologies.length > 0 ? t('skillsSelectTechnology') : undefined}
          error={techKeyError}
          fullWidth
        />
      </div>

      {selectedTechnology && (
        <div className={styles.iconPreviewRow}>
          <img className={styles.iconPreview} src={selectedTechnology.url} alt="" />
          <Paragraph asChild theme="muted" size="s">
            <span>{selectedTechnology.key}</span>
          </Paragraph>
        </div>
      )}
      {!selectedTechnology && currentIconUrl && (
        <div className={styles.iconPreviewRow}>
          <img className={styles.iconPreview} src={currentIconUrl} alt="" />
          <Paragraph asChild theme="muted" size="s">
            <span>{technology?.name ?? technology?.iconSvg ?? ''}</span>
          </Paragraph>
        </div>
      )}

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
