// src/shared/ui/FileUpload/model/types.ts

/**
 * Machine-readable rejection codes. The kit never owns copy (plan A2):
 * the hook returns a CODE, the component maps it to `FileUploadTexts`.
 */
export type FileUploadErrorCode = 'notImage' | 'tooLarge' | 'undecodable';

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
  /** Error copy: the compressed dataURL exceeds the character cap. */
  tooLarge: string;
  /** Error copy: the image could not be decoded (HEIC and friends). */
  undecodable: string;
  /** Announced through the aria-live=polite region after a selection. */
  selected: string;
}

/**
 * Props of the kit file-upload primitive (plan_project_images WU-4,
 * OPEN-6=A: bytes become a client-compressed dataURL until a server exists).
 */
export interface FileUploadProps {
  /** Visible <label> text bound to the file input — required (a11y name). */
  label: string;
  /** All consumer-owned strings (plan A2 — the kit has no copy of its own). */
  texts: FileUploadTexts;
  /** Receives the compressed dataURL (webp when supported, else jpeg). */
  onFileSelect: (dataUrl: string) => void;
  /** Cap for the produced dataURL length in characters (default 400_000). */
  maxDataUrlChars?: number;
  /** Disables the input and the button. */
  disabled?: boolean;
  /** Merged onto the root element. */
  className?: string;
}
