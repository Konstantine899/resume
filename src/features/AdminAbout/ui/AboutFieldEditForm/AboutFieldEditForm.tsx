// ============================================
// AboutFieldEditForm — one-field edit modal form
// (admin-about-table WU-4, SPEC R-3)
// ============================================
//
// The field-scoped counterpart of the AboutEditorList vitrina. Renders ONLY
// the inputs of the given `field` (scope honesty — the row Pencil's
// promise), validates through the SHARED per-field slices
// (../AboutEditorList/lib/fieldSchemas — single source of caps/min) and
// hands the PARSED value to the vitrina's save seam via `onSave`
// (persist-THEN-dispatch lives in the list, WU-2 — this form owns NO
// redux/storage).
//
// Notes:
// - AdminJobs FieldEditForm parity: the PAGE/LIST modal owns the
//   title/aria-dialog-name — no h2 here; Save is disabled while pristine.
// - A seam failure (`onSave` → false) leaves the form mounted with the
//   user's values (persist-fail keeps the modal open, R-3) — the error
//   toast was already fired by the seam handler.
// - Descriptions render kit Textarea (cap 600, rows 3); stats/ctaLabel/
//   fullName render kit Input (60/40/80). Locale pairs are labeled
//   `«label» · EN` / `«label» · RU` (AdminMyWork FieldEditForm precedent).

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import type { AboutContent } from '@/entities/AboutContent';
import {
  STAT_KEYS,
  aboutFieldResolverSchema,
  defaultValuesFor,
  statIndexOf,
  type AboutFieldFormValues,
  type AboutFieldValue,
  type EditAboutField,
} from '../AboutEditorList/lib/fieldSchemas';
import styles from './AboutFieldEditForm.module.scss';

/** The two editable locales — the field order is en then ru everywhere. */
const LOCALES = ['en', 'ru'] as const;

export interface AboutFieldEditFormProps {
  field: EditAboutField;
  /** The current document — default values for the active field only. */
  document: AboutContent;
  /**
   * The vitrina's save seam (persist-THEN-dispatch). Returning `false`
   * (persist failure) keeps this form mounted with the user's values.
   */
  onSave: (field: EditAboutField, value: AboutFieldValue) => boolean | Promise<boolean>;
  /** Edit-mode exit — the list clears its selection (key-remounts us). */
  onExitEdit?: () => void;
  className?: string;
  'data-testid'?: string;
}

/** Resolver output → the active field's value (only its key is populated). */
const valueOf = (
  field: EditAboutField,
  data: AboutFieldFormValues
): AboutFieldValue | undefined => {
  switch (field) {
    case 'fullName':
      return data.fullName;
    case 'ctaLabel':
      return data.ctaLabel;
  }
  if (field.startsWith('description-')) return data.description;
  return data.stat;
};

export const AboutFieldEditForm: React.FC<AboutFieldEditFormProps> = ({
  field,
  document,
  onSave,
  onExitEdit,
  className = '',
  'data-testid': testId = 'about-field-form',
}) => {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutFieldFormValues, unknown, AboutFieldFormValues>({
    resolver: zodResolver(aboutFieldResolverSchema(field)) as unknown as Resolver<
      AboutFieldFormValues,
      unknown,
      AboutFieldFormValues
    >,
    defaultValues: defaultValuesFor(field, document),
  });

  const values = useWatch({ control });

  const message = (error?: { message?: string }): string | undefined =>
    error?.message ? t(error.message) : undefined;

  /** Seam hand-off: persist-THEN-dispatch happens behind `onSave` (WU-2). */
  const handleSave = handleSubmit(async (data) => {
    const value = valueOf(field, data);
    if (value === undefined) return; // impossible post-resolve — honest guard
    const saved = await onSave(field, value);
    if (saved) onExitEdit?.();
  });

  const renderFields = () => {
    if (field === 'fullName') {
      return (
        <div className={styles.field}>
          <Input
            label={t('aboutFieldFullName')}
            error={message(errors.fullName)}
            value={values.fullName ?? ''}
            maxLength={80}
            fullWidth
            {...register('fullName')}
          />
        </div>
      );
    }

    if (field.startsWith('description-')) {
      return (
        <>
          {LOCALES.map((locale) => (
            <div key={locale} className={styles.field}>
              <Textarea
                label={`${t('aboutFieldDescriptions')} · ${locale.toUpperCase()}`}
                error={message(errors.description?.[locale])}
                value={values.description?.[locale] ?? ''}
                maxLength={600}
                rows={3}
                autoResize
                {...register(`description.${locale}`)}
              />
            </div>
          ))}
        </>
      );
    }

    const statKey = field.startsWith('stat-') ? STAT_KEYS[statIndexOf(field)] : null;

    return (
      <>
        {LOCALES.map((locale) => (
          <div key={locale} className={styles.field}>
            <Input
              label={`${statKey !== null ? t(statKey) : t('aboutFieldCta')} · ${locale.toUpperCase()}`}
              error={message(statKey !== null ? errors.stat?.[locale] : errors.ctaLabel?.[locale])}
              value={(statKey !== null ? values.stat?.[locale] : values.ctaLabel?.[locale]) ?? ''}
              maxLength={statKey !== null ? 60 : 40}
              fullWidth
              {...register(
                statKey !== null ? (`stat.${locale}` as const) : (`ctaLabel.${locale}` as const)
              )}
            />
          </div>
        ))}
      </>
    );
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
          {t('aboutSave')}
        </Button>
        <Button type="button" variant="outline" onClick={() => onExitEdit?.()}>
          {t('aboutCancel')}
        </Button>
      </div>
    </Form>
  );
};

AboutFieldEditForm.displayName = 'AboutFieldEditForm';
