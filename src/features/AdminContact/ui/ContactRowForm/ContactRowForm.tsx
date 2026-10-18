// ============================================
// ContactRowForm — one-row add/edit modal form (contact-rows-crud R-5)
// ============================================
//
// The row-scoped counterpart of the old document form: ONE texts/formTexts
// row (key + EN + RU). Add mode renders an editable slug key; edit mode keeps
// it read-only (TechnologyForm immutability precedent — enforced again by the
// schema refine against `originalKey`).
//
// The parent (`ContactEditorForm`) owns the Modal and its title/aria (A12).
// Save pipeline is the golden standard of the CRUD chain: snapshot → mutate →
// persist → dispatch → toast → exit. A persist failure toasts
// `contactSaveError` and keeps the form open (state untouched).
//
// contact-row-textarea (issue #289, plan rev.6 §10.1): the long EN/RU
// values render as kit Textarea (rows=3, autoResize, table cap as
// maxLength) — owner directive «long text in modals = Textarea»; the short
// slug key stays a kit Input.

import type { ContactContent, LocalizedText } from '@/entities/ContactContent';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { persistContactContent } from '../../model/services/storage';
import {
  upsertContactTableRow,
  type ContactTableRow,
} from '../../model/slices/contactContentSlice';
import { withTableRows } from './lib/withTableRows';
import styles from './ContactRowForm.module.scss';

/** Per-table per-locale cap (SPEC R-1: the open record has ONE cap per table). */
const MAX_CHARS = { texts: 600, formTexts: 120 } as const;

export interface ContactRowFormProps {
  /** Current document — the snapshot the save pipeline mutates. */
  content: ContactContent;
  /** Which table the row belongs to. */
  table: ContactTableRow;
  /** All keys of that table — drives the duplicate-key refine. */
  existingKeys: string[];
  /** Existing row → edit mode (key read-only, values prefilled). */
  row?: { key: string; value: LocalizedText };
  /** Edit-mode exit — the parent closes the modal (key-remounts us). */
  onExitEdit?: () => void;
}

type RowFormValues = z.infer<ReturnType<typeof rowFormSchema>>;

const rowFormSchema = (table: ContactTableRow, existingKeys: string[], originalKey?: string) => {
  const max = MAX_CHARS[table];
  return z.object({
    key: z
      .string()
      .trim()
      .min(1, { message: 'adminContactRowKeyInvalid' })
      .max(64, { message: 'adminContactRowKeyInvalid' })
      .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, { message: 'adminContactRowKeyInvalid' })
      .refine((value) => value === originalKey || !existingKeys.includes(value), {
        message: 'adminContactRowKeyExists',
      }),
    en: z
      .string()
      .min(1, { message: 'adminContactRowValueRequired' })
      .max(max, { message: 'adminContactRowValueMax' }),
    ru: z
      .string()
      .min(1, { message: 'adminContactRowValueRequired' })
      .max(max, { message: 'adminContactRowValueMax' }),
  });
};

export const ContactRowForm: React.FC<ContactRowFormProps> = ({
  content,
  table,
  existingKeys,
  row,
  onExitEdit,
}) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const schema = useMemo(
    () => rowFormSchema(table, existingKeys, row?.key),
    [table, existingKeys, row?.key]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<RowFormValues>({
    resolver: zodResolver(schema),
    defaultValues: row
      ? { key: row.key, en: row.value.en, ru: row.value.ru }
      : { key: '', en: '', ru: '' },
  });

  // Controlled-on-top-of-register (AdminJobs FieldEditForm parity): RHF's
  // defaultValues alone do not reach the DOM in jsdom — `useWatch` + an
  // explicit `value` keeps display and store in sync everywhere.
  const values = useWatch({ control });

  const max = MAX_CHARS[table];

  /** Snapshot → mutate → persist → dispatch → toast → exit. */
  const handleSave = handleSubmit((data) => {
    const value: LocalizedText = { en: data.en, ru: data.ru };
    const next = withTableRows(content, table, { ...content[table], [data.key]: value });
    if (!persistContactContent(next)) {
      addToast({ message: t('contactSaveError'), type: 'error' });
      return; // form keeps the values; store unchanged
    }
    dispatch(upsertContactTableRow({ table, key: data.key, value }));
    addToast({ message: t('contactSaved'), type: 'success' });
    onExitEdit?.();
  });

  return (
    <Form gap="lg" onSubmit={handleSave}>
      <Input
        label={t('adminContactRowKey')}
        readOnly={row !== undefined}
        maxLength={64}
        fullWidth
        value={values.key ?? ''}
        error={errors.key?.message ? t(errors.key.message) : undefined}
        {...register('key')}
      />
      {/* R-1 (contact-row-textarea): long values are Textareas — the short
          slug key stays an Input (R-2). Same error contract as Input. */}
      <Textarea
        label={t('adminContactRowEn')}
        rows={3}
        autoResize
        maxLength={max}
        fullWidth
        value={values.en ?? ''}
        error={errors.en?.message ? t(errors.en.message) : undefined}
        {...register('en')}
      />
      <Textarea
        label={t('adminContactRowRu')}
        rows={3}
        autoResize
        maxLength={max}
        fullWidth
        value={values.ru ?? ''}
        error={errors.ru?.message ? t(errors.ru.message) : undefined}
        {...register('ru')}
      />
      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={!isDirty}>
          {t('contactSave')}
        </Button>
        <Button type="button" variant="outline" onClick={() => onExitEdit?.()}>
          {t('contactCancel')}
        </Button>
      </div>
    </Form>
  );
};
