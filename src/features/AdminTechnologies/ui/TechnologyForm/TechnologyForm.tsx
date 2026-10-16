// ============================================
// TechnologyForm — create/edit a catalog record (technologies-crud WU-3)
// ============================================
//
// Gold standard: features/AdminSkills/ui/TechnologyForm (RHF + zodResolver,
// persist BEFORE dispatch, Toast feedback, exit-edit on success). The page
// OWNS the modal (A12) — this form has NO h2/intro: the modal header is
// the dialog's accessible name (aria-dialog-name).
//
// D7 (key immutability in edit): the key Input is DISABLED and the edit
// schema re-checks `value === originalKey` — the update is always keyed
// by the record's ORIGINAL key, never by the form's `key` field.
//
// invertInDark is a kit Select (two options да/нет): RHF stores the
// boolean, the Select speaks 'true'/'false' strings (kit A6 pattern).

import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTechnology,
  persistTechnologies,
  selectAllTechnologies,
  updateTechnology,
  type Technology,
} from '@/entities/Technology';
import type { SelectOption } from '@/shared/ui/Select';
import {
  emptyTechnologyFormValues,
  makeTechnologyFormSchema,
  toTechnologyFormValues,
} from './lib/technologyFormSchema';
import type { TechnologyFormValues } from './lib/technologyFormSchema';
import styles from './TechnologyForm.module.scss';

export interface TechnologyFormProps {
  className?: string;
  'data-testid'?: string;
  /** The record being edit-mode'd — absent/undefined = create mode. */
  technology?: Technology | null;
  /** The page closes its modal on success (A7) / Cancel (A8). */
  onExitEdit?: () => void;
}

export const TechnologyForm: React.FC<TechnologyFormProps> = ({
  className = '',
  'data-testid': testId = 'technology-form',
  technology,
  onExitEdit,
}) => {
  const catalog = useSelector(selectAllTechnologies);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const mode = technology ? 'edit' : 'create';
  // Uniqueness is checked against the CURRENT catalog minus nothing:
  // create cannot reuse any key; edit re-validates the original (D7).
  const existingKeys = useMemo(() => catalog.map((tech) => tech.key), [catalog]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<TechnologyFormValues, unknown, TechnologyFormValues>({
    resolver: zodResolver(makeTechnologyFormSchema(existingKeys, mode, technology?.key)),
    defaultValues: technology ? toTechnologyFormValues(technology) : emptyTechnologyFormValues(),
  });

  // Kit controls are React-controlled — feed `value` from useWatch()
  // (the ProjectForm pattern; watch() is React Compiler-incompatible).
  const values = useWatch({ control });

  const invertOptions: SelectOption[] = [
    { value: 'false', label: t('adminTechInvertNo') },
    { value: 'true', label: t('adminTechInvertYes') },
  ];

  /** §3 order: persist → dispatch → toast → exit. */
  const handleSave = handleSubmit((data) => {
    if (technology) {
      const patch = { url: data.iconUrl, invertInDark: data.invertInDark };
      const next = catalog.map((tech) =>
        tech.key === technology.key ? { ...tech, ...patch } : tech
      );
      if (!persistTechnologies(next)) {
        addToast({ message: t('adminTechPersistError'), type: 'error' });
        return; // form keeps the values; store unchanged (§7)
      }
      // D7: keyed by the ORIGINAL record key — the form's key field is inert.
      dispatch(updateTechnology({ key: technology.key, patch }));
      addToast({ message: t('adminTechSaved'), type: 'success' });
      onExitEdit?.();
      return;
    }
    const record: Technology = {
      key: data.key,
      url: data.iconUrl,
      invertInDark: data.invertInDark,
    };
    if (!persistTechnologies([...catalog, record])) {
      addToast({ message: t('adminTechPersistError'), type: 'error' });
      return;
    }
    dispatch(addTechnology(record));
    addToast({ message: t('adminTechSaved'), type: 'success' });
    onExitEdit?.();
  });

  const handleCancel = () => {
    if (onExitEdit) onExitEdit();
  };

  // Messages ARE i18n keys (see technologyFormSchema.ts) — t() echoes
  // unknown strings, so this mapping is total. RHF types `message` as
  // optional; every refine here sets one, the fallback is defensive.
  const keyError = errors.key ? t(errors.key.message ?? 'adminTechKeyInvalid') : undefined;
  const urlError = errors.iconUrl ? t(errors.iconUrl.message ?? 'adminTechUrlInvalid') : undefined;

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.field}>
        <Input
          label={t('adminTechKeyLabel')}
          error={keyError}
          value={values.key ?? ''}
          disabled={mode === 'edit'}
          fullWidth
          {...register('key')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminTechIconUrlLabel')}
          error={urlError}
          value={values.iconUrl ?? ''}
          fullWidth
          {...register('iconUrl')}
        />
      </div>

      <div className={styles.field}>
        <Select
          label={t('adminTechInvertLabel')}
          options={invertOptions}
          value={String(values.invertInDark ?? false)}
          onChange={(next) => setValue('invertInDark', next === 'true', { shouldDirty: true })}
          fullWidth
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('adminTechSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t('adminTechCancel')}
        </Button>
      </div>
    </Form>
  );
};

TechnologyForm.displayName = 'TechnologyForm';
