// ============================================
// ContactEditorForm — admin edit form for the Contact section
// ============================================
//
// Stage-1 CRUD (plan Contact CRUD §10 WU-3): react-hook-form + zodResolver
// against the SHARED ContactContentSchema from entities (one source of
// truth for the form and the persisted document, §7).
//
// Invariants:
// - persist happens BEFORE dispatch (§4, R-7): a failed write must never
//   leave the store ahead of storage; on failure the form keeps the values.
// - Reset is destructive → confirm dialog first, then remove + dispatch +
//   form.reset(seed).
// - ALL copy is i18n (R-4): labels, validation messages and Toasts are
//   key lookups, never literals.
// - SOCIAL_LINKS is deliberately read-only here (decision B, §2): out of
//   CRUD scope, previewed as badges like About's PROFILE_STACK.

import {
  ContactContentSchema,
  type ContactContent,
  type FormTextKey,
  type TextKey,
} from '@/entities/ContactContent';
import { SOCIAL_LINKS } from '@/entities/Developer';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import type { Language } from '@/shared/lib/i18n/types';
import { classNames } from '@/shared/lib/utils/classNames';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Textarea } from '@/shared/ui/Textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { selectContactContent } from '../../model/selectors';
import { createContactSeed } from '../../model/services/seed';
import { persistContactContent, removeContactContent } from '../../model/services/storage';
import { resetToDefaults, updateContactContent } from '../../model/slices/contactContentSlice';
import styles from './ContactEditorForm.module.scss';

/** The two editable locales — the field order is en then ru everywhere. */
const LOCALES: readonly Language[] = ['en', 'ru'];

/** The ten editable section strings, in vitrina render order. */
const TEXT_KEYS: readonly TextKey[] = [
  'contactDescription',
  'responseTimeHint',
  'nameField',
  'email',
  'message',
  'namePlaceholder',
  'emailPlaceholder',
  'messagePlaceholder',
  'sendMessage',
  'sending',
];

/** The four Create-flow toasts. */
const FORM_TEXT_KEYS: readonly FormTextKey[] = [
  'contactFormRequired',
  'contactFormSent',
  'contactFormError',
  'contactFormConfigError',
];

type Locale = Language;

/**
 * Typed RHF paths (`texts.contactDescription.en` etc.). Template literals
 * stay inside `FieldPath<ContactContent>` only when built from the const
 * unions — a computed plain string would widen and fail register().
 */
const textPath = (key: TextKey, locale: Locale) => `texts.${key}.${locale}` as const;
const formTextPath = (key: FormTextKey, locale: Locale) => `formTexts.${key}.${locale}` as const;

/**
 * `FieldErrors` nests one object per locale-split node — probing by key
 * presence keeps us out of RHF's merged-error type maze (About pattern).
 */
const hasLocaleError = (node: unknown, locale: Locale): boolean =>
  typeof node === 'object' && node !== null && locale in node;

export interface ContactEditorFormProps {
  className?: string;
  'data-testid'?: string;
}

export const ContactEditorForm: React.FC<ContactEditorFormProps> = ({
  className = '',
  'data-testid': testId = 'contact-editor-form',
}) => {
  // Same-feature selector + dispatch — legal inside AdminContact (§8).
  const content = useSelector(selectContactContent);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ContactContent>({
    resolver: zodResolver(ContactContentSchema),
    defaultValues: content,
  });

  // useWatch, NOT watch(): useForm().watch is on React Compiler's
  // known-incompatible list and this repo ships the compiler with
  // zero-warning lint (About lesson, resume-lazy-rhf-chunk era).
  const values = useWatch({ control });

  /** §4 order: persist → dispatch → toast → form → idle. */
  const handleSave = (values: ContactContent) => {
    if (!persistContactContent(values)) {
      addToast({ message: t('contactSaveError'), type: 'error' });
      return; // form keeps the values; store unchanged (§7)
    }
    dispatch(updateContactContent(values));
    addToast({ message: t('contactSaved'), type: 'success' });
    reset(values); // pristine again → Save disabled (§9 saved → idle)
  };

  /** §7: destructive reset → confirm → remove → dispatch → form ← seed. */
  const handleReset = () => {
    if (!window.confirm(t('contactResetConfirm'))) return;
    removeContactContent();
    dispatch(resetToDefaults());
    reset(createContactSeed()); // without this the fields keep dirty values
  };

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSubmit(handleSave)}
    >
      <div className={styles.intro}>
        <Heading level={2}>{t('adminContactTitle')}</Heading>
        <Paragraph theme="muted">{t('adminContactHint')}</Paragraph>
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminFieldEmail')}
          error={errors.email ? t('contactEmailInvalid') : undefined}
          value={values.email ?? ''}
          type="email"
          maxLength={120}
          autoComplete="email"
          fullWidth
          {...register('email')}
        />
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('adminFieldTexts')}</Heading>
        {TEXT_KEYS.map((key) => (
          <div className={styles.localeRow} key={key}>
            {LOCALES.map((locale) =>
              key === 'contactDescription' ? (
                <Textarea
                  key={locale}
                  label={`${t(key)} · ${locale.toUpperCase()}`}
                  value={values.texts?.[key]?.[locale] ?? ''}
                  error={
                    hasLocaleError(errors.texts?.[key], locale) ? t('contactTextEmpty') : undefined
                  }
                  maxLength={600}
                  rows={4}
                  {...register(textPath(key, locale))}
                />
              ) : (
                <Input
                  key={locale}
                  label={`${t(key)} · ${locale.toUpperCase()}`}
                  value={values.texts?.[key]?.[locale] ?? ''}
                  error={
                    hasLocaleError(errors.texts?.[key], locale) ? t('contactTextEmpty') : undefined
                  }
                  maxLength={120}
                  fullWidth
                  {...register(textPath(key, locale))}
                />
              )
            )}
          </div>
        ))}
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('adminFieldFormTexts')}</Heading>
        {FORM_TEXT_KEYS.map((key) => (
          <div className={styles.localeRow} key={key}>
            {LOCALES.map((locale) => (
              <Input
                key={locale}
                label={`${t(key)} · ${locale.toUpperCase()}`}
                value={values.formTexts?.[key]?.[locale] ?? ''}
                error={
                  hasLocaleError(errors.formTexts?.[key], locale)
                    ? t('contactFormTextEmpty')
                    : undefined
                }
                maxLength={120}
                fullWidth
                {...register(formTextPath(key, locale))}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Read-only social preview — SOCIAL_LINKS is shared with the
          vitrina and deliberately OUT of CRUD scope (§2 decision B). */}
      <ul className={styles.socialList} data-testid="contact-form-socials">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.name}>
            <Badge variant="outline" size="sm">
              {link.name}
            </Badge>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('contactSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          {t('contactReset')}
        </Button>
      </div>
    </Form>
  );
};

ContactEditorForm.displayName = 'ContactEditorForm';
