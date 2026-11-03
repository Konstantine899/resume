// ============================================
// FieldEditForm — one-field edit modal form (job-field-edit WU-1)
// ============================================
//
// SPEC R-2 r4: the field-scoped counterpart of JobForm. Renders ONLY the
// inputs of the given `field` (scope honesty — the row Pencil's promise),
// validates through the SHARED per-field slices (./JobForm/lib/fieldSchemas,
// D2 — no second source of truth) and saves a ONE-field partial through the
// §3 pipeline: snapshot → applyJobUpdate → persistJobs → dispatch.
//
// Notes:
// - `period` is never collected: the partial carries startDate/endDate/
//   current and applyJobUpdate recomputes `period` (A5).
// - current ⇄ endDate (A6): checking the box disables the end DatePicker
//   and clears it; the shared periodCrossRules require an end date when
//   current=false.
// - Save is disabled while pristine (JobForm parity); persist failure
//   toasts adminJobPersistError and keeps the modal open.
// - The PAGE modal owns the title/aria-dialog-name (A12) — no h2 here.

import { useToast } from '@/shared/lib/contexts/ToastContext';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { DatePicker } from '@/shared/ui/DatePicker';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Paragraph } from '@/shared/ui/Paragraph';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { Job, UpdateJobDto } from '@/entities/Job';
import { applyJobUpdate, updateJob } from '../../model/slices/jobsSlice';
import { selectAllJobs } from '../../model/selectors/selectors';
import { persistJobs } from '../../model/services/storage';
import { fieldEditSchemas, toDateInput, type EditField } from '../JobForm/lib/fieldSchemas';
import styles from './FieldEditForm.module.scss';

export interface FieldEditFormProps {
  job: Job;
  field: EditField;
  /** Edit-mode exit — the page clears its selection (key-remounts us). */
  onExitEdit?: () => void;
  className?: string;
  'data-testid'?: string;
}

/** Input-side form state; only the ACTIVE field's keys are actually used. */
type FieldFormValues = {
  position?: { en: string; ru: string };
  startDate?: string;
  endDate?: string;
  current?: boolean;
  location?: string;
  companyUrl?: string;
  technologies?: string[];
};

/** Resolver output — per-field DTO-ready slices (transforms applied). */
type FieldFormOutput =
  | { position: { en: string; ru: string } }
  | { startDate: Date; endDate: Date | null; current: boolean }
  | { location: string }
  | { companyUrl: string | undefined }
  | { technologies: string[] };

/** Record → input defaults for the active field only. */
const defaultValuesFor = (field: EditField, job: Job): FieldFormValues => {
  switch (field) {
    case 'position':
      return { position: { ...job.position } };
    case 'period':
      return {
        startDate: toDateInput(job.startDate),
        endDate: job.endDate ? toDateInput(job.endDate) : '',
        current: job.current,
      };
    case 'location':
      return { location: job.location };
    case 'companyUrl':
      return { companyUrl: job.companyUrl ?? '' };
    case 'technologies':
      return { technologies: [...job.technologies] };
  }
};

/** Resolver output → ONE-field partial (id rides only at the call site). */
const toUpdateDto = (field: EditField, data: FieldFormOutput): Omit<UpdateJobDto, 'id'> => {
  switch (field) {
    case 'position': {
      const { position } = data as { position: { en: string; ru: string } };
      return { position };
    }
    case 'period': {
      const { startDate, endDate, current } = data as {
        startDate: Date;
        endDate: Date | null;
        current: boolean;
      };
      return { startDate, endDate, current };
    }
    case 'location': {
      const { location } = data as { location: string };
      return { location };
    }
    case 'companyUrl': {
      const { companyUrl } = data as { companyUrl: string | undefined };
      return { companyUrl };
    }
    case 'technologies': {
      const { technologies } = data as { technologies: string[] };
      return { technologies };
    }
  }
};

export const FieldEditForm: React.FC<FieldEditFormProps> = ({
  job,
  field,
  onExitEdit,
  className = '',
  'data-testid': testId = 'job-field-form',
}) => {
  const jobs = useSelector(selectAllJobs);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [techDraft, setTechDraft] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FieldFormValues, unknown, FieldFormOutput>({
    resolver: zodResolver(fieldEditSchemas[field]) as unknown as Resolver<
      FieldFormValues,
      unknown,
      FieldFormOutput
    >,
    defaultValues: defaultValuesFor(field, job),
  });

  const values = useWatch({ control });

  const message = (error?: { message?: string }): string | undefined =>
    error?.message ? t(error.message) : undefined;

  /** §3 order: persist → dispatch → toast → exit. ONE-field partial. */
  const handleSave = handleSubmit((data) => {
    const partial = toUpdateDto(field, data);
    const next = jobs.map((entry) =>
      entry.id === job.id ? applyJobUpdate(entry, { id: job.id, ...partial }) : entry
    );
    if (!persistJobs(next)) {
      addToast({ message: t('adminJobPersistError'), type: 'error' });
      return; // form keeps the values; store unchanged
    }
    dispatch(updateJob({ id: job.id, ...partial }));
    addToast({ message: t('adminJobSaved'), type: 'success' });
    onExitEdit?.();
  });

  const handleCancel = () => onExitEdit?.();

  const toggleCurrent = (checked: boolean) => {
    setValue('current', checked, { shouldDirty: true });
    // A6: current ⇒ endDate null — clear the disabled input's value too.
    if (checked) setValue('endDate', '', { shouldDirty: true });
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

  const renderFields = () => {
    switch (field) {
      case 'position':
        return (
          <>
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
          </>
        );
      case 'period':
        return (
          <>
            <div className={styles.dateRow}>
              <div className={styles.field}>
                <DatePicker
                  label={t('adminJobStartDate')}
                  value={values.startDate || null}
                  onChange={(iso) => setValue('startDate', iso ?? '', { shouldDirty: true })}
                  error={message(errors.startDate)}
                  clearable
                />
              </div>
              <div className={styles.field}>
                <DatePicker
                  label={t('adminJobEndDate')}
                  value={values.endDate || null}
                  onChange={(iso) => setValue('endDate', iso ?? '', { shouldDirty: true })}
                  error={message(errors.endDate)}
                  minDate={values.startDate || undefined}
                  disabled={values.current === true}
                  clearable
                />
              </div>
            </div>
            <div className={styles.checkRow}>
              <input
                id="job-field-current"
                type="checkbox"
                checked={values.current ?? false}
                {...register('current')}
                onChange={(event) => toggleCurrent(event.target.checked)}
              />
              <label htmlFor="job-field-current">{t('adminJobCurrent')}</label>
            </div>
          </>
        );
      case 'location':
        return (
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
        );
      case 'companyUrl':
        return (
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
        );
      case 'technologies':
        return (
          <div className={styles.field}>
            <Label htmlFor="job-field-tech">{t('adminJobTechnologies')}</Label>
            <div className={styles.chipRow}>
              <input
                id="job-field-tech"
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
            <div className={styles.chips} data-testid="job-field-tech-chips">
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
            {message(errors.technologies) && (
              <Paragraph asChild theme="error" size="s">
                <span role="alert">{t(message(errors.technologies) ?? '')}</span>
              </Paragraph>
            )}
          </div>
        );
    }
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
          {t('adminJobSave')}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t('adminJobCancel')}
        </Button>
      </div>
    </Form>
  );
};

FieldEditForm.displayName = 'FieldEditForm';
