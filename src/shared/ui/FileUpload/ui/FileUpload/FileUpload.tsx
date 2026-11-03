// src/shared/ui/FileUpload/ui/FileUpload/FileUpload.tsx
//
// Kit file-upload primitive (plan_project_images WU-4; rev.4: emits a
// compressed Blob — the consumer saves it into a real directory and stores
// the resulting path; no RHF inside, Select precedent).

import { useId, useState, type DragEvent } from 'react';

import { Button } from '@/shared/ui/Button';

import { useImageDragDrop } from '../../lib/useImageDragDrop';
import type { FileUploadProps, FileUploadTexts } from '../../model/types';
import styles from './FileUpload.module.scss';

export function FileUpload({
  label,
  texts,
  onFileSelect,
  maxBlobBytes,
  maxInputBytes,
  acceptExtensions,
  onBeforeSelect,
  disabled,
  className,
}: FileUploadProps) {
  const inputId = useId();
  const labelId = useId();
  const hintId = useId();
  const errorId = useId();

  const [announceSuccess, setAnnounceSuccess] = useState(false);

  const { isDragging, previewUrl, errorCode, inputRef, handleInputChange, ...drag } =
    useImageDragDrop({
      onFileSelect,
      // The parent re-validates through RHF; the kit only reports.
      onError: () => setAnnounceSuccess(false),
      onSuccess: () => setAnnounceSuccess(true),
      maxBlobBytes,
      maxInputBytes,
      acceptExtensions,
    });

  const errorText = errorCode
    ? texts[errorCode as keyof FileUploadTexts] || texts.tooLarge || undefined
    : undefined;
  const describedBy = [texts.hint ? hintId : null, errorText ? errorId : null]
    .filter(Boolean)
    .join(' ');

  const openDialog = async () => {
    if (disabled) return;
    if (onBeforeSelect) {
      try {
        await onBeforeSelect();
      } catch {
        return;
      }
    }
    inputRef.current?.click();
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <label id={labelId} htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      {/* The label doubles as the group name for the dropzone. */}
      <div
        role="group"
        aria-labelledby={labelId}
        className={[styles.dropzone, isDragging ? styles.dragging : null].filter(Boolean).join(' ')}
        aria-disabled={disabled ? 'true' : undefined}
        onDragEnter={(event: DragEvent) => {
          if (disabled) return;
          drag.handleDragEnter(event);
        }}
        onDragLeave={(event: DragEvent) => {
          if (disabled) return;
          drag.handleDragLeave(event);
        }}
        onDragOver={(event: DragEvent) => {
          if (disabled) return;
          drag.handleDragOver(event);
        }}
        onDrop={(event: DragEvent) => {
          if (disabled) return;
          drag.handleDrop(event);
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          // Native picker filter mirrors the JS gate (WU-14): a restricted
          // consumer gets its extensions; everyone else keeps image/*.
          accept={acceptExtensions ? acceptExtensions.join(',') : 'image/*'}
          className={styles.input}
          disabled={disabled}
          aria-describedby={describedBy || undefined}
          aria-invalid={errorText ? true : undefined}
          onChange={handleInputChange}
          tabIndex={-1}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={openDialog}
          aria-describedby={describedBy || undefined}
        >
          {texts.button}
        </Button>
        {texts.hint ? (
          <span id={hintId} className={styles.hint}>
            {texts.hint}
          </span>
        ) : null}
        {previewUrl ? <img src={previewUrl} alt="" className={styles.preview} /> : null}
      </div>

      {errorText ? (
        <p id={errorId} role="alert" className={styles.error}>
          {errorText}
        </p>
      ) : null}

      {/* Success announcement — empty until a file is accepted. */}
      <span aria-live="polite" className={styles.liveRegion}>
        {announceSuccess ? texts.selected : ''}
      </span>
    </div>
  );
}
