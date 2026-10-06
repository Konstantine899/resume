// ============================================
// JobForm — admin create/edit form for one job (WorkHistory CRUD WU-5)
// ============================================
//
// Stage-1 CRUD (plan §9/§7): react-hook-form + zodResolver against
// `jobFormSchema` — every inline error message IS the i18n key.
//
// Field notes:
// - period is NEVER an input (A5/R-3): the reducer recomputes it from the
//   dates + current flag on save (makeJobRecord / applyJobUpdate).
// - current ⇄ endDate (A6): checking "still working here" disables the end
//   date input and clears it; with current=false the schema requires it.
// - description: a per-locale bullet editor (add / remove / reorder) — a
//   textarea cannot round-trip the string[] shape (R-6).
// - technologies: a chip editor capped at 15 unique entries (§7).
// - employmentType / level: native <select> over the entity enums (R-9);
//   dates: native <input type="date"> (no kit DatePicker exists).
//
// Invariants: persist BEFORE dispatch (§3) — persist failure toasts
// adminJobPersistError and the form keeps its values; ALL copy is i18n.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/Form';
import { Heading } from '@/shared/ui/Heading';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Paragraph } from '@/shared/ui/Paragraph';
import { EMPLOYMENT_TYPES, JOB_LEVELS, type Job } from '@/entities/Job';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { addJob, applyJobUpdate, makeJobRecord, updateJob } from '../model/jobsSlice';
import { selectAllJobs } from '../model/selectors';
import { persistJobs } from '../model/storage';
import {
  emptyJobFormValues,
  jobFormSchema,
  toJobFormValues,
  type JobFormOutput,
  type JobFormValues,
} from './lib/jobFormSchema';
import styles from './JobForm.module.scss';

export interface JobFormProps {
  className?: string;
  'data-testid'?: string;
  /** Edit mode: record being edited. Absent = create mode. */
  job?: Job;
  /** Edit mode exit — the page clears its selection (key-remounts us). */
  onExitEdit?: () => void;
}

/** RHF/zod error shapes for array fields are unions — narrow without `any`. */
const arrayLevelMessage = (value: unknown): string | undefined => {
  if (!value || Array.isArray(value)) return undefined;
  return (value as { message?: string }).message;
};

const bulletMessage = (value: unknown, index: number): string | undefined => {
  if (!Array.isArray(value)) return undefined;
  const entry = value[index] as { message?: string } | undefined;
  return entry?.message;
};

export const JobForm: React.FC<JobFormProps> = ({
  className = '',
  job,
  onExitEdit,
  'data-testid': testId = 'job-form',
}) => {
  // Same-feature selector + dispatch — legal inside AdminJobs (§8).
  const jobs = useSelector(selectAllJobs);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [techDraft, setTechDraft] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<JobFormValues, unknown, JobFormOutput>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: job ? toJobFormValues(job) : emptyJobFormValues(),
  });

  // Kit/native inputs are React-controlled — feed `value` from useWatch()
  // (the TechnologyForm pattern; watch() is React Compiler-incompatible).
  const values = useWatch({ control });

  const message = (error?: { message?: string }): string | undefined =>
    error?.message ? t(error.message) : undefined;

  /** §3 order: persist → dispatch → toast → pristine form / exit. */
  const handleSave = handleSubmit((data) => {
    const { current, ...dto } = data;
    if (job) {
      const next = jobs.map((entry) =>
        entry.id === job.id ? applyJobUpdate(entry, { id: job.id, ...dto, current }) : entry
      );
      if (!persistJobs(next)) {
        addToast({ message: t('adminJobPersistError'), type: 'error' });
        return; // form keeps the values; store unchanged (§7)
      }
      dispatch(updateJob({ id: job.id, ...dto, current }));
      addToast({ message: t('adminJobSaved'), type: 'success' });
      onExitEdit?.();
      return;
    }
    // `period` placeholder: makeJobRecord recomputes it from the dates
    // (A5) — the form never collects it (§7).
    const record = makeJobRecord({ ...dto, period: '' }, current);
    if (!persistJobs([...jobs, record])) {
      addToast({ message: t('adminJobPersistError'), type: 'error' });
      return;
    }
    dispatch(addJob(record));
    addToast({ message: t('adminJobSaved'), type: 'success' });
    reset(emptyJobFormValues());
  });

  const handleCancel = () => {
    if (onExitEdit) onExitEdit();
    else reset(emptyJobFormValues());
  };

  const toggleCurrent = (checked: boolean) => {
    setValue('current', checked, { shouldDirty: true });
    // A6: current ⇒ endDate null — clear the disabled input's value too.
    if (checked) setValue('endDate', '', { shouldDirty: true });
  };

  const bullets = (locale: 'en' | 'ru'): string[] => values.description?.[locale] ?? [''];
  const setBullets = (locale: 'en' | 'ru', next: string[]) =>
    setValue(`description.${locale}`, next, { shouldDirty: true });

  const addBullet = (locale: 'en' | 'ru') => setBullets(locale, [...bullets(locale), '']);
  const removeBullet = (locale: 'en' | 'ru', index: number) =>
    setBullets(
      locale,
      bullets(locale).filter((_, i) => i !== index)
    );
  const moveBullet = (locale: 'en' | 'ru', index: number, delta: -1 | 1) => {
    const list = [...bullets(locale)];
    const target = index + delta;
    const [moved] = list.splice(index, 1);
    if (moved !== undefined && target >= 0 && target < list.length + 1) {
      list.splice(target, 0, moved);
      setBullets(locale, list);
    }
  };

  const technologies = values.technologies ?? [];
  const addTechnology = () => {
    const chip = techDraft.trim();
    if (chip === '') return;
    if (!technologies.includes(chip)) {
      setValue('technologies', [...technologies, chip], { shouldDirty: true });
    }
    setTechDraft('');
  };
  const removeTechnology = (chip: string) =>
    setValue(
      'technologies',
      technologies.filter((entry) => entry !== chip),
      { shouldDirty: true }
    );

  const renderBulletEditor = (locale: 'en' | 'ru') => {
    const list = bullets(locale);
    const blockLabel = locale === 'en' ? 'adminJobDescriptionEn' : 'adminJobDescriptionRu';
    const arrayError = arrayLevelMessage(errors.description?.[locale as 'en'] as unknown);
    return (
      <div className={styles.bulletBlock} data-testid={`job-bullets-${locale}`}>
        <Heading level={3}>{t(blockLabel)}</Heading>
        {list.map((text, index) => (
          <div className={styles.bulletRow} key={`${locale}-${index}`}>
            <input
              type="text"
              className={styles.bulletInput}
              maxLength={200}
              aria-label={`${t(blockLabel)}-${index + 1}`}
              value={text}
              {...register(`description.${locale}.${index}`)}
            />
            <button
              type="button"
              className={styles.bulletIcon}
              aria-label={t('adminJobBulletUp')}
              disabled={index === 0}
              onClick={() => moveBullet(locale, index, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.bulletIcon}
              aria-label={t('adminJobBulletDown')}
              disabled={index === list.length - 1}
              onClick={() => moveBullet(locale, index, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className={styles.bulletIcon}
              aria-label={t('adminJobRemoveBullet')}
              disabled={list.length <= 1}
              onClick={() => removeBullet(locale, index)}
            >
              ×
            </button>
            {bulletMessage(errors.description?.[locale as 'en'] as unknown, index) && (
              <Paragraph asChild theme="error" size="s">
                <span role="alert">
                  {t(bulletMessage(errors.description?.[locale as 'en'] as unknown, index) ?? '')}
                </span>
              </Paragraph>
            )}
          </div>
        ))}
        {arrayError && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t(arrayError)}</span>
          </Paragraph>
        )}
        <Button type="button" variant="outline" size="sm" onClick={() => addBullet(locale)}>
          {t('adminJobAddBullet')}
        </Button>
      </div>
    );
  };

  return (
    <Form
      className={classNames(styles.form, className)}
      data-testid={testId}
      gap="lg"
      onSubmit={handleSave}
    >
      <div className={styles.intro}>
        <Heading level={2}>{t(job ? 'adminEditJob' : 'adminAddJob')}</Heading>
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminJobPositionEn')}
          error={message(errors.position?.en)}
          value={values.position?.en ?? ''}
          maxLength={100}
          fullWidth
          {...register('position.en')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminJobPositionRu')}
          error={message(errors.position?.ru)}
          value={values.position?.ru ?? ''}
          maxLength={100}
          fullWidth
          {...register('position.ru')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminJobCompany')}
          error={message(errors.company)}
          value={values.company ?? ''}
          maxLength={80}
          fullWidth
          {...register('company')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminJobCompanyUrl')}
          error={message(errors.companyUrl)}
          value={values.companyUrl ?? ''}
          placeholder="https://"
          fullWidth
          {...register('companyUrl')}
        />
      </div>

      <div className={styles.field}>
        <Input
          label={t('adminJobLocation')}
          error={message(errors.location)}
          value={values.location ?? ''}
          maxLength={80}
          fullWidth
          {...register('location')}
        />
      </div>

      <div className={styles.dateRow}>
        <div className={styles.field}>
          <label className={styles.dateLabel} htmlFor="job-form-start">
            {t('adminJobStartDate')}
          </label>
          <input
            id="job-form-start"
            type="date"
            className={styles.dateInput}
            aria-invalid={errors.startDate ? true : undefined}
            value={values.startDate ?? ''}
            {...register('startDate')}
          />
          {errors.startDate && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t(message(errors.startDate) ?? 'adminJobErrStartDate')}</span>
            </Paragraph>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.dateLabel} htmlFor="job-form-end">
            {t('adminJobEndDate')}
          </label>
          <input
            id="job-form-end"
            type="date"
            className={styles.dateInput}
            disabled={values.current === true}
            aria-invalid={errors.endDate ? true : undefined}
            value={values.endDate ?? ''}
            {...register('endDate')}
          />
          {errors.endDate && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t(message(errors.endDate) ?? 'adminJobErrEndDate')}</span>
            </Paragraph>
          )}
        </div>
      </div>

      <div className={styles.checkRow}>
        <input
          id="job-form-current"
          type="checkbox"
          checked={values.current ?? false}
          {...register('current')}
          onChange={(event) => toggleCurrent(event.target.checked)}
        />
        <label htmlFor="job-form-current">{t('adminJobCurrent')}</label>
      </div>

      <div className={styles.editorSection}>
        <Heading level={3}>{t('adminJobDescription')}</Heading>
        {renderBulletEditor('en')}
        {renderBulletEditor('ru')}
      </div>

      <div className={styles.field}>
        <Label htmlFor="job-form-tech">{t('adminJobTechnologies')}</Label>
        <div className={styles.chipRow}>
          <input
            id="job-form-tech"
            type="text"
            className={styles.chipInput}
            value={techDraft}
            onChange={(event) => setTechDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addTechnology();
              }
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={addTechnology}>
            {t('adminJobAddTech')}
          </Button>
        </div>
        <div className={styles.chips} data-testid="job-tech-chips">
          {technologies.map((tech) => (
            <span key={tech} className={styles.chip}>
              {tech}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`${t('adminJobRemoveTech')}-${tech}`}
                onClick={() => removeTechnology(tech)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {arrayLevelMessage(errors.technologies) && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{t(arrayLevelMessage(errors.technologies) ?? '')}</span>
          </Paragraph>
        )}
      </div>

      <div className={styles.selectRow}>
        <div className={styles.field}>
          <label className={styles.dateLabel} htmlFor="job-form-employment">
            {t('adminJobEmploymentType')}
          </label>
          <select
            id="job-form-employment"
            className={styles.select}
            value={values.employmentType ?? 'full-time'}
            onChange={(event) =>
              setValue('employmentType', event.target.value as (typeof EMPLOYMENT_TYPES)[number], {
                shouldDirty: true,
              })
            }
          >
            {EMPLOYMENT_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.employmentType && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t(message(errors.employmentType) ?? 'adminJobErrEnum')}</span>
            </Paragraph>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.dateLabel} htmlFor="job-form-level">
            {t('adminJobLevel')}
          </label>
          <select
            id="job-form-level"
            className={styles.select}
            value={values.level ?? 'middle'}
            onChange={(event) =>
              setValue('level', event.target.value as (typeof JOB_LEVELS)[number], {
                shouldDirty: true,
              })
            }
          >
            {JOB_LEVELS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.level && (
            <Paragraph asChild theme="error" size="s">
              <span role="alert">{t(message(errors.level) ?? 'adminJobErrEnum')}</span>
            </Paragraph>
          )}
        </div>
      </div>

      <div className={styles.checkRow}>
        <input
          id="job-form-featured"
          type="checkbox"
          checked={values.featured ?? false}
          {...register('featured')}
        />
        <label htmlFor="job-form-featured">{t('adminJobFeatured')}</label>
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" loading={isSubmitting} disabled={!isDirty}>
          {t('adminJobSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t('adminJobCancel')}
        </Button>
      </div>
    </Form>
  );
};

JobForm.displayName = 'JobForm';
