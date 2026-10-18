// ============================================
// ContactSocialForm — one social-row add/edit modal form (contact-social-crud R-4)
// ============================================
//
// The socials counterpart of ContactRowForm: ONE row (key + name + href).
// Add mode renders an editable slug key; edit mode keeps it read-only
// (TechnologyForm immutability precedent). All THREE fields are kit
// Inputs — they are short scalars; the Textarea convention (plan rev.6
// §10.1) applies only to long text.
//
// Validation is single-sourced with the entity contract (S9): the caps
// come from SOCIAL_NAME_MAX/SOCIAL_HREF_MAX and the href rule from
// isHttpsUrl — the form only attaches the i18n error keys. Note the
// name-max key interpolates {{max}} (the pre-existing ContactRowForm
// max-error renders without params — latent, out of scope here).
//
// The parent (`ContactEditorForm`) owns the Modal and its title/aria.
// Save pipeline is the golden standard: snapshot → mutate → persist →
// dispatch → toast → exit; a persist failure toasts `contactSaveError`
// and keeps the form open (state untouched).

import type { ContactContent, ContactSocialLink } from '@/entities/ContactContent';
import { SOCIAL_HREF_MAX, SOCIAL_NAME_MAX, isHttpsUrl } from '@/entities/ContactContent';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { z } from 'zod';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { upsertContactTableRow } from '../../model/slices/contactContentSlice';
import { persistContactContent } from '../../model/services/storage';
import { withTableRows } from '../ContactRowForm/lib/withTableRows';
import styles from './ContactSocialForm.module.scss';

export interface ContactSocialFormProps {
  /** Current document — the snapshot the save pipeline mutates. */
  content: ContactContent;
  /** All keys of the socials table — drives the duplicate-key refine. */
  existingKeys: string[];
  /** Existing row → edit mode (key read-only, values prefilled). */
  row?: { key: string; value: ContactSocialLink };
  /** Modal exit — the parent closes it (key-remounts us). */
  onExitEdit?: () => void;
}

type SocialFormValues = z.infer<ReturnType<typeof socialFormSchema>>;

const socialFormSchema = (existingKeys: string[], originalKey?: string) =>
  z.object({
    key: z
      .string()
      .trim()
      .min(1, { message: 'adminContactRowKeyInvalid' })
      .max(64, { message: 'adminContactRowKeyInvalid' })
      .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, { message: 'adminContactRowKeyInvalid' })
      .refine((value) => value === originalKey || !existingKeys.includes(value), {
        message: 'adminContactRowKeyExists',
      }),
    name: z
      .string()
      .trim()
      .min(1, { message: 'adminContactSocialNameRequired' })
      .max(SOCIAL_NAME_MAX, { message: 'adminContactSocialNameMax' }),
    href: z
      .string()
      .trim()
      .min(1, { message: 'adminContactSocialUrlRequired' })
      .max(SOCIAL_HREF_MAX, { message: 'adminContactSocialUrlInvalid' })
      .refine(isHttpsUrl, { message: 'adminContactSocialUrlInvalid' }),
  });

export const ContactSocialForm: React.FC<ContactSocialFormProps> = ({
  content,
  existingKeys,
  row,
  onExitEdit,
}) => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const schema = useMemo(() => socialFormSchema(existingKeys, row?.key), [existingKeys, row?.key]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<SocialFormValues>({
    resolver: zodResolver(schema),
    defaultValues: row
      ? { key: row.key, name: row.value.name, href: row.value.href }
      : { key: '', name: '', href: '' },
  });
  const values = useWatch({ control });

  const handleSave: SubmitHandler<SocialFormValues> = (data) => {
    const value: ContactSocialLink = { name: data.name, href: data.href };
    const next = withTableRows(content, 'socials', {
      ...content.socialLinks,
      [data.key]: value,
    });
    if (!persistContactContent(next)) {
      addToast({ message: t('contactSaveError'), type: 'error' });
      return; // form stays open (gold standard)
    }
    dispatch(upsertContactTableRow({ table: 'socials', key: data.key, value }));
    addToast({ message: t('contactSaved'), type: 'success' });
    onExitEdit?.();
  };

  return (
    <Form onSubmit={handleSubmit(handleSave)} gap="lg" noValidate>
      <Input
        label={t('adminContactRowKey')}
        placeholder="github"
        error={errors.key?.message ? t(errors.key.message) : undefined}
        fullWidth
        required
        maxLength={64}
        readOnly={row !== undefined}
        value={values.key ?? ''}
        {...register('key')}
      />
      <Input
        label={t('adminContactSocialName')}
        placeholder="GitHub"
        error={errors.name?.message ? t(errors.name.message, { max: SOCIAL_NAME_MAX }) : undefined}
        fullWidth
        required
        maxLength={SOCIAL_NAME_MAX}
        value={values.name ?? ''}
        {...register('name')}
      />
      <Input
        label={t('adminContactSocialUrl')}
        placeholder="https://github.com/username"
        error={errors.href?.message ? t(errors.href.message) : undefined}
        fullWidth
        required
        maxLength={SOCIAL_HREF_MAX}
        value={values.href ?? ''}
        {...register('href')}
      />
      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={!isDirty}>
          {t('contactSave')}
        </Button>
        <Button type="button" variant="ghost" onClick={onExitEdit}>
          {t('contactCancel')}
        </Button>
      </div>
    </Form>
  );
};
