// uploadPortrait — backend-backed portrait upload seam.
//
// Wraps the shared `imageUpload` seam (POST /images) and returns the same
// machine-readable outcome the component already maps to i18n keys.
import { uploadImage } from '@/shared/lib/imageUpload';
import type { FileUploadSelection } from '@/shared/ui/FileUpload';

export interface UploadedPortrait {
  name: string;
  path: string;
}

type PortraitUploadOutcome =
  | { ok: true; file: UploadedPortrait }
  | { ok: false; reason: 'unsupported' }
  | { ok: false; reason: 'aborted' }
  | { ok: false; reason: 'permission-denied' }
  | { ok: false; reason: 'root-missing' }
  | { ok: false; reason: 'quota' }
  | { ok: false; reason: 'security' }
  | { ok: false; reason: 'write-failed' };

export type PortraitUploadFailure = Extract<PortraitUploadOutcome, { ok: false }>['reason'];

export const uploadPortrait = async (file: FileUploadSelection): Promise<PortraitUploadOutcome> => {
  try {
    const outcome = await uploadImage({ blob: file.blob, name: file.name });
    if (!outcome.ok) return { ok: false, reason: outcome.reason };
    return { ok: true, file: { name: outcome.file.name, path: outcome.file.path } };
  } catch {
    return { ok: false, reason: 'write-failed' };
  }
};
