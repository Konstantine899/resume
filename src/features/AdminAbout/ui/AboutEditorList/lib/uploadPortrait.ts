// uploadPortrait — backend-backed portrait upload seam (media-pipeline PR-1b).
//
// Wraps the shared `imageUpload` seam (POST /media?kind=portrait) and returns
// the key contract the admin form stores in the document.
import { uploadImage } from '@/shared/lib/imageUpload';
import type { FileUploadSelection } from '@/shared/ui/FileUpload';

export interface UploadedPortrait {
  key: string;
  width: number;
  height: number;
  variants: { width: number; key: string }[];
}

type PortraitUploadOutcome =
  | { ok: true; file: UploadedPortrait }
  | { ok: false; reason: 'unsupported' }
  | { ok: false; reason: 'aborted' }
  | { ok: false; reason: 'permission-denied' }
  | { ok: false; reason: 'root-missing' }
  | { ok: false; reason: 'quota' }
  | { ok: false; reason: 'security' }
  | { ok: false; reason: 'write-failed' }
  | { ok: false; reason: 'conflict' };

export type PortraitUploadFailure = Extract<PortraitUploadOutcome, { ok: false }>['reason'];

export const uploadPortrait = async (file: FileUploadSelection): Promise<PortraitUploadOutcome> => {
  try {
    const outcome = await uploadImage({ blob: file.blob, name: file.name }, 'portrait');
    if (!outcome.ok) return { ok: false, reason: outcome.reason };
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
