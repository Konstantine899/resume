// src/shared/ui/FileUpload/ui/FileUpload/FileUpload.tsx
//
// Kit file-upload primitive (plan_project_images WU-4). The manual URL
// field stays with the consumer — this is a second entry point that emits
// a compressed dataURL through `onFileSelect` (no RHF inside; the pilot
// form calls `setValue` itself, Select precedent).

import { useId, useState, type DragEvent } from 'react';

import { Button } from '@/shared/ui/Button';

import { useImageDragDrop } from '../../lib/useImageDragDrop';
import type { FileUploadProps } from '../../model/types';
import styles from './FileUpload.module.scss';

export function FileUpload({
  label,
  texts,
  onFileSelect,
  maxDataUrlChars,
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
      maxDataUrlChars,
    });

  const errorText = errorCode ? texts[errorCode] : undefined;
  const describedBy = [texts.hint ? hintId : null, errorText ? errorId : null]
    .filter(Boolean)
    .join(' ');

  const openDialog = () => {
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
        onDragEnter={(event: DragEvent) => drag.handleDragEnter(event)}
        onDragLeave={(event: DragEvent) => drag.handleDragLeave(event)}
        onDragOver={(event: DragEvent) => drag.handleDragOver(event)}
        onDrop={(event: DragEvent) => drag.handleDrop(event)}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
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
