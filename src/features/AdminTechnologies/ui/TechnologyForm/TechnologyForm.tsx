// ============================================
// TechnologyForm — create/edit a catalog record (technologies-crud WU-3)
// + tech-icon-upload (issue #261, WU-1/WU-2)
// ============================================
//
// Gold standard: features/AdminSkills/ui/TechnologyForm (RHF + zodResolver,
// persist BEFORE dispatch, Toast feedback, exit-edit on success). The page
// OWNS the modal (A12) — this form has NO h2/intro: the modal header is
// the dialog's accessible name (aria-dialog-name).
//
// tech-icon-upload A1: the iconUrl URL Input is GONE — the icon only comes
// from the kit FileUpload. onFileSelect keeps the pending
// `FileUploadSelection` in component state and marks the RHF field dirty
// with the file NAME as a provisional marker (`setValue('iconUrl', name,
// {shouldDirty: true})` — Save enables); the REAL `/images/technologies/
// <name>` path is resolved in the async `handleSave` against the shared
// images directory (pick-root flow, ProjectForm/Skills pattern). A failed
// write toasts and keeps the form open; edit with no new file KEEPS the
// stored url (keep-current); create requires a file.
//
// D7 (key immutability in edit): the key Input is DISABLED and the edit
// schema re-checks `value === originalKey` — the update is always keyed
// by the record's ORIGINAL key, never by the form's `key` field.
//
// invertInDark is a kit Select (two options да/нет): RHF stores the
// boolean, the Select speaks 'true'/'false' strings (kit A6 pattern).

import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/shared/lib/contexts/ToastContext';
import { isAbortError, isDirectoryPickerSupported, saveUploadedImage } from '@/shared/lib/imageDir';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { FileUpload, type FileUploadSelection } from '@/shared/ui/FileUpload';
import { Form } from '@/shared/ui/Form';
import { Input } from '@/shared/ui/Input';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Select } from '@/shared/ui/Select';
import React, { useCallback, useMemo, useState } from 'react';
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

/** SVG byte cap for the icon upload (~50 KB — Skills rev.2 parity). */
const ICON_MAX_BYTES = 50_000;
/** Fixed subdir under the remembered images root. */
const ICON_SUBDIR = 'technologies';

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

  // A1: the picked file waits here until Save — `handleSave` writes it into
  // the shared images directory and stores the returned path.
  const [pendingFile, setPendingFile] = useState<FileUploadSelection | null>(null);

  const handleFileSelect = useCallback(
    (selection: FileUploadSelection) => {
      setPendingFile(selection);
      // Provisional marker (the file name) — only marks the form dirty so
      // Save enables; the real path is resolved in handleSave.
      setValue('iconUrl', selection.name, { shouldDirty: true });
    },
    [setValue]
  );

  const invertOptions: SelectOption[] = [
    { value: 'false', label: t('adminTechInvertNo') },
    { value: 'true', label: t('adminTechInvertYes') },
  ];

  // §3 order: persist → dispatch → toast → exit. A1: an async submit — a
  // pending selection is written to disk FIRST; a failed write toasts and
  // keeps the form open (nothing persists).
  const handleSave = handleSubmit(async (data) => {
    let url = data.iconUrl;
    if (pendingFile) {
      if (!isDirectoryPickerSupported()) {
        addToast({ message: t('adminTechIconUploadUnsupported'), type: 'error' });
        return; // form keeps the pending file; store unchanged
      }
      try {
        url = await saveUploadedImage({
          blob: pendingFile.blob,
          name: pendingFile.name,
          subdir: ICON_SUBDIR,
        });
      } catch (error) {
        // The user dismissed the picker — no alarm, no persist.
        if (isAbortError(error)) return;
        addToast({ message: t('adminTechIconUploadSaveError'), type: 'error' });
        return; // form keeps the values for a retry (§7)
      }
    } else if (technology) {
      // Keep-current: the provisional marker (or any form value) must not
      // overwrite the stored url when no NEW file was picked.
      url = technology.url;
    }

    if (technology) {
      const patch = { url, invertInDark: data.invertInDark };
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
      url,
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

  // WU-2 / A2: edit-mode preview of the CURRENT stored icon — the
  // FileUpload preview shows only the just-picked file.
  const currentIconUrl = technology ? technology.url : undefined;

  // Messages ARE i18n keys (see technologyFormSchema.ts) — t() echoes
  // unknown strings, so this mapping is total. RHF types `message` as
  // optional; every refine here sets one, the fallback is defensive.
  const keyError = errors.key ? t(errors.key.message ?? 'adminTechKeyInvalid') : undefined;
  const iconError = errors.iconUrl
    ? t(errors.iconUrl.message ?? 'adminTechIconRequired')
    : undefined;

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
        {currentIconUrl && (
          <div className={styles.iconPreviewRow}>
            <img className={styles.iconPreview} src={currentIconUrl} alt="" />
            <Paragraph asChild theme="muted" size="s">
              <span>{t('adminTechIconCurrent')}</span>
            </Paragraph>
          </div>
        )}
        <FileUpload
          label={t('adminTechIconUploadLabel')}
          texts={{
            button: t('adminTechIconUploadButton'),
            hint: t('adminTechIconUploadHint'),
            notImage: t('adminTechIconUploadNotImage'),
            tooLarge: t('adminTechIconUploadTooLarge'),
            undecodable: t('adminTechIconUploadUndecodable'),
            selected: t('adminTechIconUploadSelected'),
          }}
          onFileSelect={handleFileSelect}
          maxBlobBytes={ICON_MAX_BYTES}
        />
        {iconError && (
          <Paragraph asChild theme="error" size="s">
            <span role="alert">{iconError}</span>
          </Paragraph>
        )}
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
