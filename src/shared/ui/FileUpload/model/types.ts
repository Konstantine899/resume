// src/shared/ui/FileUpload/model/types.ts

/**
 * Machine-readable rejection codes. The kit never owns copy (plan A2):
 * the hook returns a CODE, the component maps it to `FileUploadTexts`.
 */
export type FileUploadErrorCode =
  'notImage' | 'tooLarge' | 'undecodable' | 'wrongFormat' | 'inputTooLarge';

/**
 * Consumer-owned strings for every text the component can render.
 *
 * @remarks
 * Nothing is hardcoded inside the kit — real strings arrive through `t()`
 * from the consuming feature (i18n-first / plan A2).
 */
export interface FileUploadTexts {
  /** Visible button that opens the file dialog — also its accessible name. */
  button: string;
  /** Optional hint line under the button (accepted types, size guidance). */
  hint?: string;
  /** Error copy: the selected file is not an image. */
  notImage: string;
  /** Error copy: the incoming file is too large before decode. */
  inputTooLarge?: string;
  /** Error copy: the compressed blob exceeds the byte cap. */
  tooLarge: string;
  /** Error copy: the image could not be decoded (HEIC and friends). */
  undecodable: string;
  /**
   * Error copy: the file's format is outside `acceptExtensions` (WU-14).
   * Optional on purpose — the code is UNREACHABLE without the
   * `acceptExtensions` prop, so the four historical image/* consumers
   * carry no dead copy. Pass it whenever `acceptExtensions` is used.
   */
  wrongFormat?: string;
  /** Announced through the aria-live=polite region after a selection. */
  selected: string;
}

/**
 * What `onFileSelect` delivers: an image Blob plus a filesystem-safe
 * suggested name.
 *
 * @remarks
 * rev.4 (owner directive 2026-10-10): the consumer WRITES the blob into a
 * real project directory and stores the resulting `/images/projects/…`
 * path — the kit never emits a dataURL and never knows project paths.
 * rev.5 (skills-icon-upload): `image/svg+xml` is passed through RAW —
 * `blob` is the original File (no canvas), `name` keeps the `.svg`
 * extension; raster types keep the webp/jpeg compression contract.
 */
export interface FileUploadSelection {
  /** Original File for SVG; compressed webp/jpeg for raster types. */
  blob: Blob;
  /** Sanitized `name.ext`, e.g. `my-photo.webp`. */
  name: string;
}

/**
 * Props of the kit file-upload primitive (plan_project_images WU-4;
 * rev.4: emits a compressed Blob the consumer saves to a real directory).
 */
export interface FileUploadProps {
  /** Visible <label> text bound to the file input — required (a11y name). */
  label: string;
  /** All consumer-owned strings (plan A2 — the kit has no copy of its own). */
  texts: FileUploadTexts;
  /** Receives the compressed blob + suggested name on success. */
  onFileSelect: (file: FileUploadSelection) => void;
  /** Cap for the compressed blob size in bytes (default 300_000). */
  maxBlobBytes?: number;
  /** Cap for the incoming file size in bytes (default ~10_000_000). */
  maxInputBytes?: number;
  /** Called during root selection to enforce user gesture. */
  onBeforeSelect?: () => Promise<unknown>;
  /**
   * Optional format gate (WU-14): when present, a file whose extension OR
   * MIME type falls outside these lowercase, dot-prefixed extensions (e.g.
   * `['.jpg', '.jpeg', '.png']`) is rejected with `wrongFormat` before it
   * reaches the canvas pipeline. Absent = the historical image/* behaviour.
   */
  acceptExtensions?: string[];
  /** Disables the input and the button. */
  disabled?: boolean;
  /** Merged onto the root element. */
  className?: string;
}
