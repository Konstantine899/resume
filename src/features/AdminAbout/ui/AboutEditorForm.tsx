// ============================================
// AboutEditorForm — admin edit form for the About section
// ============================================
//
// Stage-1 CRUD (plan About CRUD §10 WU-3): react-hook-form + zodResolver
// against the SHARED AboutContentSchema from entities (one source of truth
// for the form and the persisted document, §7).
//
// Invariants:
// - persist happens BEFORE dispatch (§4, R-7): a failed write must never
//   leave the store ahead of storage; on failure the form keeps the values.
// - Reset is destructive → confirm dialog first, then remove + dispatch +
//   form.reset(seed) — otherwise the fields would keep the dirty values.
// - ALL copy is i18n (R-4): labels, validation messages and Toasts are
//   key lookups, never literals.

import { AboutContentSchema, type AboutContent, type StatKey } from '@/entities/AboutContent';
import { PROFILE_STACK } from '@/entities/Developer';
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
import { createAboutSeed } from '../model/services/seed';
import { resetToDefaults, updateAboutContent } from '../model/slices/aboutContentSlice';
import { selectAboutContent } from '../model/selectors';
import { persistAboutContent, removeAboutContent } from '../model/services/storage';
import styles from './AboutEditorForm.module.scss';

/** The two editable locales — the field order is en then ru everywhere. */
const LOCALES: readonly Language[] = ['en', 'ru'];

/** The four stat rows, in the same order the vitrina renders them. */
const STAT_KEYS: readonly StatKey[] = [
  'aboutStatYears',
  'aboutStatProjects',
  'aboutStatUsers',
  'aboutStatRemote',
];

type Locale = Language;

/**
 * RHF paths for the locale-split fields. Built as const tuples so the
 * template literals stay inside `FieldPath<AboutContent>` (a computed
 * `${number}` string would widen and fail the typed register()).
 */
const DESC_PATHS = [
  ['descriptions.0.en', 'descriptions.0.ru'],
  ['descriptions.1.en', 'descriptions.1.ru'],
  ['descriptions.2.en', 'descriptions.2.ru'],
] as const;
const CTA_PATHS = ['ctaLabel.en', 'ctaLabel.ru'] as const;

const localeIndex = (locale: Locale): 0 | 1 => (locale === 'en' ? 0 : 1);

/** Typed RHF path for a stat locale (`stats.aboutStatYears.en` etc.). */
const statPath = (key: StatKey, locale: Locale) => `stats.${key}.${locale}` as const;

/**
 * `FieldErrors` nests one object per locale-split node
 * (`errors.descriptions[0] = { en?: ..., ru?: ... }`); probing by key
 * presence keeps us out of RHF's merged-error type maze.
 */
const hasLocaleError = (node: unknown, locale: Locale): boolean =>
  typeof node === 'object' && node !== null && locale in node;

export interface AboutEditorFormProps {
  className?: string;
  'data-testid'?: string;
}

export const AboutEditorForm: React.FC<AboutEditorFormProps> = ({
  className = '',
  'data-testid': testId = 'about-editor-form',
}) => {
  // Same-feature selector + dispatch — legal inside AdminAbout (§8).
  const content = useSelector(selectAboutContent);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<AboutContent>({
    resolver: zodResolver(AboutContentSchema),
    defaultValues: content,
  });

  // The kit inputs are React-controlled (useInput keeps its own state and
  // renders `value` unconditionally), so RHF's imperative defaultValue write
  // gets clobbered and a "type over an empty DOM value" never fires onChange.
  // Feeding `value` from useWatch() closes the loop: every keystroke,
  // validation error and reset() flows through RHF state into the DOM.
  // useWatch, NOT watch(): useForm().watch is on React Compiler's
  // known-incompatible list (react-hooks/incompatible-library) and this
  // repo ships the compiler with zero-warning lint.
  const values = useWatch({ control });

  /** §4 order: persist → dispatch → toast → form → idle. */
  const handleSave = (values: AboutContent) => {
    if (!persistAboutContent(values)) {
      addToast({ message: t('aboutSaveError'), type: 'error' });
      return; // form keeps the values; store unchanged (§7)
    }
    dispatch(updateAboutContent(values));
    addToast({ message: t('aboutSaved'), type: 'success' });
    reset(values); // pristine again → Save disabled (§9 saved → idle)
  };

  /** §7: destructive reset → confirm → remove → dispatch → form ← seed. */
  const handleReset = () => {
    if (!window.confirm(t('aboutResetConfirm'))) return;
    removeAboutContent();
    dispatch(resetToDefaults());
    reset(createAboutSeed()); // without this the fields keep dirty values
  };

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSubmit(handleSave)}
    >
      <div className={styles.intro}>
        <Heading level={2}>{t('adminAboutTitle')}</Heading>
        <Paragraph theme="muted">{t('adminAboutHint')}</Paragraph>
      </div>

      <div className={styles.field}>
        <Input
          label={t('aboutFieldFullName')}
          error={errors.fullName ? t('aboutNameRequired') : undefined}
          value={values.fullName ?? ''}
          maxLength={80}
          autoComplete="name"
          fullWidth
          {...register('fullName')}
        />
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('aboutFieldDescriptions')}</Heading>
        {DESC_PATHS.map((paths, index) => (
          <div className={styles.localeRow} key={paths[0]}>
            {LOCALES.map((locale) => (
              <Textarea
                key={locale}
                label={`${t('aboutFieldDescriptions')} ${index + 1} · ${locale.toUpperCase()}`}
                value={values.descriptions?.[index]?.[locale] ?? ''}
                error={
                  hasLocaleError(errors.descriptions?.[index], locale)
                    ? t('aboutParagraphEmpty')
                    : undefined
                }
                maxLength={600}
                rows={4}
                {...register(paths[localeIndex(locale)])}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('aboutFieldStats')}</Heading>
        {STAT_KEYS.map((key) => (
          <div className={styles.localeRow} key={key}>
            {LOCALES.map((locale) => (
              <Input
                key={locale}
                label={`${t(key)} · ${locale.toUpperCase()}`}
                value={values.stats?.[key]?.[locale] ?? ''}
                error={
                  hasLocaleError(errors.stats?.[key], locale) ? t('aboutStatRequired') : undefined
                }
                maxLength={60}
                fullWidth
                {...register(statPath(key, locale))}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.group}>
        <Heading level={3}>{t('aboutFieldCta')}</Heading>
        <div className={styles.localeRow}>
          {LOCALES.map((locale) => (
            <Input
              key={locale}
              label={`${t('aboutFieldCta')} · ${locale.toUpperCase()}`}
              value={values.ctaLabel?.[locale] ?? ''}
              error={hasLocaleError(errors.ctaLabel, locale) ? t('aboutCtaRequired') : undefined}
              maxLength={40}
              fullWidth
              {...register(CTA_PATHS[localeIndex(locale)])}
            />
          ))}
        </div>
      </div>

      {/* Read-only stack preview — PROFILE_STACK is shared with the
          vitrina and deliberately OUT of CRUD scope (§5). Badge list has
          no heading on purpose: the plan fixes the copy at 16 keys. */}
      <ul className={styles.stackList} data-testid="about-form-stack">
        {PROFILE_STACK.map((tech) => (
          <li key={tech}>
            <Badge variant="outline" size="sm">
              {tech}
            </Badge>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('aboutSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          {t('aboutReset')}
        </Button>
      </div>
    </Form>
  );
};

AboutEditorForm.displayName = 'AboutEditorForm';
