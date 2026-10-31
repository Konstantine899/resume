// uploadPortrait — backend-backed portrait upload seam (media-pipeline PR-1b).
//
// Wraps the shared `imageUpload` seam (POST /media?kind=portrait) and returns
// the key contract the admin form stores in the document.
import { uploadImage } from '@/shared/lib/imageUpload';
import type { FileUploadSelection } from '@/shared/ui/FileUpload';
import type { ImageUploadFailureReason } from '@/shared/lib/imageUpload';

export interface UploadedPortrait {
  key: string;
  width: number;
  height: number;
  variants: { width: number; key: string }[];
}

export type PortraitUploadFailure = ImageUploadFailureReason | 'aborted';

type PortraitUploadOutcome =
  | { ok: true; file: UploadedPortrait }
  | { ok: false; reason: PortraitUploadFailure; detail?: string };

export const uploadPortrait = async (file: FileUploadSelection): Promise<PortraitUploadOutcome> => {
  try {
    const outcome = await uploadImage({ blob: file.blob, name: file.name }, 'portrait');
    if (!outcome.ok) return { ok: false, reason: outcome.reason, detail: outcome.detail };
    return {
      ok: true,
      file: {
        key: outcome.file.key,
        width: outcome.file.width,
        height: outcome.file.height,
        variants: outcome.file.variants,
      },
    };
  } catch {
    return { ok: false, reason: 'write-failed' };
  }
};
