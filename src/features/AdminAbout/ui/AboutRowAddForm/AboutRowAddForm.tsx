// ============================================
// AboutRowAddForm — add-row modal form (admin-about-table WU-12, R-2/D11)
// ============================================
//
// The add counterpart of AboutFieldEditForm: a kit Select picks the row
// kind (description | stat | cta — the cta option exists ONLY while the
// CTA row is deleted), then the kind's D11 fields render:
// - description → EN/RU Textarea ≤600 with the auto-label «Описание N»
//   (N = current length + 1, the same label pattern the vitrina rows use);
// - stat → label EN/RU + value EN/RU ≤60; the record KEY is the slug of
//   the EN label (collision → adminAboutKeyExists, empty slug →
//   adminAboutKeyInvalid — both surfaced by the shared resolver);
// - cta → EN/RU ≤40.
// Validation rides the SHARED slices in ../AboutEditorList/lib/fieldSchemas
// (caps live only in the entity contract). The form owns NO redux/storage —
// the parent list runs persist-THEN-dispatch behind `onAdd` (AboutFieldEditForm
// parity): a `false` return keeps this form mounted with the user's values
// (the modal stays open, R-2).
//
// The `key={kind}` remount of the inner fields (in the parent composition)
// resets values/errors when the kind switches — pristine Save per kind.

import { useState } from 'react';

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';

import type { AboutContent } from '@/entities/AboutContent';
import {
  aboutRowResolverSchema,
  slugFromLabel,
  type AboutRowFormValues,
  type AboutRowKind,
  type AboutRowPayload,
} from '../AboutEditorList/lib/fieldSchemas';
import styles from './AboutRowAddForm.module.scss';

/** The two editable locales — the field order is en then ru everywhere. */
const LOCALES = ['en', 'ru'] as const;

/** Resolver output → the payload the add seam writes (stat key = EN slug). */
const payloadOf = (kind: AboutRowKind, data: AboutRowFormValues): AboutRowPayload => {
  if (kind === 'description') {
    return {
      kind: 'description',
      value: { en: data.description?.en ?? '', ru: data.description?.ru ?? '' },
    };
  }
  if (kind === 'stat') {
    const label = { en: data.statLabel?.en ?? '', ru: data.statLabel?.ru ?? '' };
    return {
      kind: 'stat',
      key: slugFromLabel(label.en),
      label,
      value: { en: data.stat?.en ?? '', ru: data.stat?.ru ?? '' },
    };
  }
  return { kind: 'cta', value: { en: data.ctaLabel?.en ?? '', ru: data.ctaLabel?.ru ?? '' } };
};

interface RowFieldsProps {
  kind: AboutRowKind;
  document: AboutContent;
  onAdd: (payload: AboutRowPayload) => boolean | Promise<boolean>;
  onExitAdd?: () => void;
}

/** The kind's fields + Save/Cancel — remounted per kind (fresh pristine). */
const RowFields: React.FC<RowFieldsProps> = ({ kind, document, onAdd, onExitAdd }) => {
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutRowFormValues, unknown, AboutRowFormValues>({
    resolver: zodResolver(
      aboutRowResolverSchema(kind, Object.keys(document.stats))
    ) as unknown as Resolver<AboutRowFormValues, unknown, AboutRowFormValues>,
    defaultValues: {},
  });

  // Controlled-on-top-of-register (AboutFieldEditForm parity): RHF's
  // defaultValues alone do not reach the DOM in jsdom.
  const values = useWatch({ control });

  const message = (error?: { message?: string }): string | undefined =>
    error?.message ? t(error.message) : undefined;

  /** Seam hand-off: persist-THEN-dispatch lives in the list (WU-2 parity). */
  const handleSave = handleSubmit(async (data) => {
    const saved = await onAdd(payloadOf(kind, data));
    if (saved) onExitAdd?.();
  });

  const actions = (
    <div className={styles.actions}>
      <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
        {t('aboutSave')}
      </Button>
      <Button type="button" variant="outline" onClick={() => onExitAdd?.()}>
        {t('aboutCancel')}
      </Button>
    </div>
  );

  if (kind === 'description') {
    const label = `${t('aboutFieldDescriptions')} ${document.descriptions.length + 1}`;
    return (
      <Form className={styles.fields} gap="lg" onSubmit={handleSave}>
        {LOCALES.map((locale) => (
          <Textarea
            key={locale}
            label={`${label} · ${locale.toUpperCase()}`}
            error={message(errors.description?.[locale])}
            value={values.description?.[locale] ?? ''}
            maxLength={600}
            rows={3}
            autoResize
            fullWidth
            {...register(`description.${locale}`)}
          />
        ))}
        {actions}
      </Form>
    );
  }

  if (kind === 'stat') {
    return (
      <Form className={styles.fields} gap="lg" onSubmit={handleSave}>
        <Input
          label={t('adminAboutStatLabelEn')}
          error={message(errors.statLabel?.en)}
          value={values.statLabel?.en ?? ''}
          maxLength={60}
          fullWidth
          {...register('statLabel.en')}
        />
        <Input
          label={t('adminAboutStatLabelRu')}
          error={message(errors.statLabel?.ru)}
          value={values.statLabel?.ru ?? ''}
          maxLength={60}
          fullWidth
          {...register('statLabel.ru')}
        />
        <Input
          label={t('adminAboutStatValueEn')}
          error={message(errors.stat?.en)}
          value={values.stat?.en ?? ''}
          maxLength={60}
          fullWidth
          {...register('stat.en')}
        />
        <Input
          label={t('adminAboutStatValueRu')}
          error={message(errors.stat?.ru)}
          value={values.stat?.ru ?? ''}
          maxLength={60}
          fullWidth
          {...register('stat.ru')}
        />
        {actions}
      </Form>
    );
  }

  return (
    <Form className={styles.fields} gap="lg" onSubmit={handleSave}>
      {LOCALES.map((locale) => (
        <Input
          key={locale}
          label={`${t('aboutFieldCta')} · ${locale.toUpperCase()}`}
          error={message(errors.ctaLabel?.[locale])}
          value={values.ctaLabel?.[locale] ?? ''}
          maxLength={40}
          fullWidth
          {...register(`ctaLabel.${locale}`)}
        />
      ))}
      {actions}
    </Form>
  );
};

export interface AboutRowAddFormProps {
  /** Current document — drives the auto-label N and the slug collision set. */
  document: AboutContent;
  /** The cta option exists only while the CTA row is deleted (D11). */
  canAddCta: boolean;
  /**
   * The list's add seam (persist-THEN-dispatch). Returning `false`
   * (persist failure) keeps this form mounted with the user's values.
   */
  onAdd: (payload: AboutRowPayload) => boolean | Promise<boolean>;
  /** Add-mode exit — the list closes the modal (key-remounts us). */
  onExitAdd?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const AboutRowAddForm: React.FC<AboutRowAddFormProps> = ({
  document,
  canAddCta,
  onAdd,
  onExitAdd,
  className = '',
  'data-testid': testId = 'about-row-add-form',
}) => {
  const { t } = useLanguage();
  const [kind, setKind] = useState<AboutRowKind>('description');

  const kindOptions = [
    { value: 'description', label: t('adminAboutRowKindDescription') },
    { value: 'stat', label: t('adminAboutRowKindStat') },
    ...(canAddCta ? [{ value: 'cta', label: t('adminAboutRowKindCta') }] : []),
  ];

  return (
    <div className={classNames(styles.addForm, className)} data-testid={testId}>
      <Select
        label={t('adminAboutRowKindLabel')}
        value={kind}
        onChange={(value) => setKind(value as AboutRowKind)}
        options={kindOptions}
        fullWidth
      />
      {/* key=kind remounts the fields: switching kinds resets to pristine. */}
      <RowFields key={kind} kind={kind} document={document} onAdd={onAdd} onExitAdd={onExitAdd} />
    </div>
  );
};

AboutRowAddForm.displayName = 'AboutRowAddForm';
