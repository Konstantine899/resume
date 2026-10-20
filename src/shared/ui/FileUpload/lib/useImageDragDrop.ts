// src/shared/ui/FileUpload/lib/useImageDragDrop.ts
//
// Migrated from src/shared/ui/Image/lib/hooks/useImageDragDrop.ts (the old
// hook had ZERO consumers), upgraded per plan_project_images WU-4 / OPEN-6=A
// rev.3, then reworked per rev.4 (owner directive 2026-10-10):
//   - the value is a COMPRESSED Blob + suggested file name — the consumer
//     writes it into a real project directory (File System Access API) and
//     stores the resulting path; dataURL output is gone;
//   - codec: probe webp via toBlob, fall back to an EXPLICIT jpeg — Safari
//     does not encode webp in canvas and silently returns png;
//   - undecodable images (HEIC etc.) are caught by img.onerror — file.type
//     is spoofable, the canvas decode is the arbiter;
//   - the kit owns NO copy: errors surface as codes (plan A2);
//   - raw-SVG passthrough (skills-icon-upload, 2026-10-11): image/svg+xml
//     skips the canvas entirely (rasterization would kill the vector;
//     dimensionless SVG → naturalWidth 0 in Firefox) — content is checked
//     by TEXT, the byte cap applies to the FILE, the original File is
//     emitted as the blob.

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';

import type { FileUploadErrorCode, FileUploadSelection } from '../model/types';

/** Longest-edge cap for the canvas resize. */
const MAX_EDGE_PX = 1600;
const DEFAULT_QUALITY = 0.8;
/** ~400K-char dataURL in rev.3 ≈ 300 KB of binary — same budget, in bytes. */
const DEFAULT_MAX_BLOB_BYTES = 300_000;
const NAME_MAX_LENGTH = 64;

export interface UseImageDragDropOptions {
  /** Receives the compressed blob + name on success. */
  onFileSelect: (file: FileUploadSelection) => void;
  /** Receives a rejection code; the component maps it to consumer copy. */
  onError: (code: FileUploadErrorCode) => void;
  /** Receives a success marker; the component announces `texts.selected`. */
  onSuccess: () => void;
  /** Cap for the compressed blob size in bytes. */
  maxBlobBytes?: number;
  /**
   * Optional format gate (WU-14): lowercase, dot-prefixed extensions. When
   * present, a file whose extension OR MIME type falls outside the set is
   * rejected with `wrongFormat` before the canvas/SVG pipeline runs. Absent
   * = the historical `image/*`-only behaviour (4 existing consumers).
   */
  acceptExtensions?: string[];
}

export interface UseImageDragDropReturn {
  /** A file drag is over the zone. */
  isDragging: boolean;
  /** Preview of the last accepted selection (object URL). */
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

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, DEFAULT_QUALITY);
  });
}

/**
 * Encode via canvas: webp when the runtime supports it, else explicit jpeg.
 *
 * `toBlob` falls back to `image/png` for unsupported MIME types (Safari) —
 * the returned blob's `type` is the capability probe.
 */
async function encodeCompressed(canvas: HTMLCanvasElement): Promise<Blob | null> {
  const webp = await canvasToBlob(canvas, 'image/webp');
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await canvasToBlob(canvas, 'image/jpeg');
  return jpeg && jpeg.type === 'image/jpeg' ? jpeg : null;
}

/** Filesystem-safe name with the extension that matches the encoded blob. */
export function sanitizeFileName(originalName: string, blob: Blob): string {
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/svg+xml' ? 'svg' : 'jpg';
  const base = originalName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, NAME_MAX_LENGTH);
  return `${base || 'image'}.${ext}`;
}

/**
 * Cheap content check for a file typed as SVG — the MIME type is spoofable,
 * so the TEXT is the arbiter (the raster path uses img.onerror the same way).
 * Rejects a missing `<svg` root and active content (`<script`, `javascript:`).
 */
export function isSafeSvgText(text: string): boolean {
  // `[\s/>]` — a self-closing `<svg/>` root is valid SVG too.
  if (!/<svg[\s/>]/i.test(text)) return false;
  return !/<script[\s/>]/i.test(text) && !/javascript:/i.test(text);
}

/**
 * Canonical MIME types per accepted extension (WU-14). The legacy
 * `image/jpg` (non-standard; some cameras/Windows report it) is treated as
 * a synonym of `image/jpeg` so a real JPEG is never rejected on a MIME
 * technicality. Extensions not listed here have no canonical MIME and pass
 * on the extension gate alone.
 */
const MIME_BY_EXT: Record<string, readonly string[]> = {
  '.jpg': ['image/jpeg', 'image/jpg'],
  '.jpeg': ['image/jpeg', 'image/jpg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
  '.gif': ['image/gif'],
};

/**
 * Format gate (WU-14): true when `file` matches `acceptExtensions` by BOTH
 * extension and MIME. The extension is lower-cased and dot-prefixed before
 * comparison; a disallowed extension, a missing extension, or a MIME that
 * disagrees with a listed extension all return false (spoof guard — the
 * extension alone is not trusted). Absent `acceptExtensions`, the caller
 * skips this gate entirely.
 */
export function isAcceptedFormat(file: File, acceptExtensions: readonly string[]): boolean {
  const ext = `.${(file.name.split('.').pop() ?? '').toLowerCase()}`;
  if (!acceptExtensions.includes(ext)) return false;
  const allowedMimes = MIME_BY_EXT[ext];
  // No canonical MIME for this extension — the extension gate alone decides.
  if (!allowedMimes) return true;
  return allowedMimes.includes(file.type.toLowerCase());
}

export function useImageDragDrop(options: UseImageDragDropOptions): UseImageDragDropReturn {
  const {
    onFileSelect,
    onError,
    onSuccess,
    maxBlobBytes = DEFAULT_MAX_BLOB_BYTES,
    acceptExtensions,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<FileUploadErrorCode | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const previewObjectUrl = useRef<string | null>(null);

  const setPreview = useCallback((url: string | null) => {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = url;
    setPreviewUrl(url);
  }, []);

  // Revoke the last object URL on unmount.
  useEffect(
    () => () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    },
    []
  );

  const fail = useCallback(
    (code: FileUploadErrorCode) => {
      setErrorCode(code);
      setPreview(null);
      onError(code);
    },
    [onError, setPreview]
  );

  const processFile = useCallback(
    (file: File) => {
      setErrorCode(null);

      if (!file.type.startsWith('image/')) {
        fail('notImage');
        return;
      }

      // WU-14 format gate: when the consumer restricts `acceptExtensions`,
      // a file whose extension OR MIME falls outside the set is rejected
      // BEFORE any pipeline work (spoof guard — extension alone is not
      // trusted, and the raster/SVG branches below never run). Absent the
      // prop the historical image/* behaviour is untouched.
      if (acceptExtensions && !isAcceptedFormat(file, acceptExtensions)) {
        fail('wrongFormat');
        return;
      }

      // Raw SVG passthrough (skills-icon-upload): the canvas pipeline would
      // rasterize the vector (hundreds of KB) and dimensionless SVGs decode
      // with naturalWidth 0 in Firefox. Content check by TEXT (MIME is
      // spoofable), byte cap on the FILE itself, original File is the blob.
      if (file.type === 'image/svg+xml') {
        if (file.size > maxBlobBytes) {
          fail('tooLarge');
          return;
        }
        const svgReader = new FileReader();
        svgReader.onerror = () => fail('undecodable');
        svgReader.onload = () => {
          if (!isSafeSvgText(String(svgReader.result ?? ''))) {
            fail('undecodable');
            return;
          }
          setPreview(URL.createObjectURL(file));
          setErrorCode(null);
          onFileSelect({ blob: file, name: sanitizeFileName(file.name, file) });
          onSuccess();
        };
        svgReader.readAsText(file);
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

          void (async () => {
            const blob = await encodeCompressed(canvas);
            if (blob === null) {
              fail('undecodable');
              return;
            }
            if (blob.size > maxBlobBytes) {
              fail('tooLarge');
              return;
            }

            setPreview(URL.createObjectURL(blob));
            setErrorCode(null);
            onFileSelect({ blob, name: sanitizeFileName(file.name, blob) });
            onSuccess();
          })();
        };
        img.src = source;
      };
      reader.readAsDataURL(file);
    },
    [fail, maxBlobBytes, acceptExtensions, onFileSelect, onSuccess, setPreview]
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
    setPreview(null);
    setErrorCode(null);
  }, [setPreview]);

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
