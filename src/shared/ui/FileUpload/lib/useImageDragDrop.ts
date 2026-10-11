// src/shared/ui/FileUpload/lib/useImageDragDrop.ts
//
// Migrated from src/shared/ui/Image/lib/hooks/useImageDragDrop.ts (the old
// hook had ZERO consumers) and upgraded per plan_project_images WU-4 /
// OPEN-6=A rev.3:
//   - the value is the COMPRESSED dataURL, not the raw File;
//   - codec: probe webp first, fall back to an EXPLICIT jpeg — Safari does
//     not encode webp in canvas and silently returns png, which blows the
//     localStorage budget 5–10×;
//   - undecodable images (HEIC etc.) are caught by img.onerror — file.type
//     is spoofable, the canvas decode is the arbiter;
//   - the kit owns NO copy: errors surface as codes (plan A2).

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

import type { FileUploadErrorCode } from '../model/types';

/** Longest-edge cap for the canvas resize (keeps photo dataURLs in budget). */
const MAX_EDGE_PX = 1600;
const DEFAULT_QUALITY = 0.8;
const DEFAULT_MAX_DATA_URL_CHARS = 400_000;

export interface UseImageDragDropOptions {
  /** Receives the compressed dataURL on success. */
  onFileSelect: (dataUrl: string) => void;
  /** Receives a rejection code; the component maps it to consumer copy. */
  onError: (code: FileUploadErrorCode) => void;
  /** Receives a success marker; the component announces `texts.selected`. */
  onSuccess: () => void;
  /** Cap for the produced dataURL length in characters. */
  maxDataUrlChars?: number;
}

export interface UseImageDragDropReturn {
  /** A file drag is over the zone. */
  isDragging: boolean;
  /** Preview of the last accepted selection (dataURL). */
  previewUrl: string | null;
  /** Last rejection code, or null when the last selection succeeded. */
  errorCode: FileUploadErrorCode | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (event: DragEvent) => void;
  handleDragLeave: (event: DragEvent) => void;
  handleDragOver: (event: DragEvent) => void;
  handleDrop: (event: DragEvent) => void;
  /** Clears error + preview (e.g. when the parent resets the field). */
  reset: () => void;
}

/** Encode via canvas: webp when the runtime supports it, else explicit jpeg. */
function encodeCompressed(canvas: HTMLCanvasElement): string | null {
  const probe = canvas.toDataURL('image/webp', DEFAULT_QUALITY);
  if (typeof probe === 'string' && probe.startsWith('data:image/webp')) return probe;
  const jpeg = canvas.toDataURL('image/jpeg', DEFAULT_QUALITY);
  return typeof jpeg === 'string' && jpeg.length > 0 ? jpeg : null;
}

export function useImageDragDrop(options: UseImageDragDropOptions): UseImageDragDropReturn {
  const {
    onFileSelect,
    onError,
    onSuccess,
    maxDataUrlChars = DEFAULT_MAX_DATA_URL_CHARS,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<FileUploadErrorCode | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const fail = useCallback(
    (code: FileUploadErrorCode) => {
      setErrorCode(code);
      setPreviewUrl(null);
      onError(code);
    },
    [onError]
  );

  const processFile = useCallback(
    (file: File) => {
      setErrorCode(null);

      if (!file.type.startsWith('image/')) {
        fail('notImage');
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => fail('undecodable');
      reader.onload = () => {
        const source = String(reader.result ?? '');

        const img = new Image();
        img.onerror = () => fail('undecodable');
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const scale = Math.min(1, MAX_EDGE_PX / Math.max(width, height));

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(width * scale));
          canvas.height = Math.max(1, Math.round(height * scale));

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            fail('undecodable');
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const dataUrl = encodeCompressed(canvas);
          if (dataUrl === null) {
            fail('undecodable');
            return;
          }
          if (dataUrl.length > maxDataUrlChars) {
            fail('tooLarge');
            return;
          }

          setPreviewUrl(dataUrl);
          setErrorCode(null);
          onFileSelect(dataUrl);
          onSuccess();
        };
        img.src = source;
      };
      reader.readAsDataURL(file);
    },
    [fail, maxDataUrlChars, onFileSelect, onSuccess]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const input = event.target; // copy — no-param-reassign on the event
      const file = input.files?.[0];
      if (file) processFile(file);
      // Allow re-selecting the same file name.
      input.value = '';
    },
    [processFile]
  );

  const handleDragEnter = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current += 1;
    const items = Array.from(event.dataTransfer?.items ?? []);
    if (items.some((item) => item.kind === 'file' && item.type.startsWith('image/'))) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const file = event.dataTransfer?.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const reset = useCallback(() => {
    dragCounter.current = 0;
    setIsDragging(false);
    setPreviewUrl(null);
    setErrorCode(null);
  }, []);

  return {
    isDragging,
    previewUrl,
    errorCode,
    inputRef,
    handleInputChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    reset,
  };
}
