// ============================================
// imageUpload — backend upload seam (migration)
// ============================================
//
// Replaces browser File-System-Access writes with the authenticated
// backend `/images` endpoint. Returns a typed outcome so consumers
// never need to inspect raw HTTP errors.
import { authToken } from '@/shared/api/authToken';

export type ImageUploadFailureReason =
  'permission-denied' | 'root-missing' | 'quota' | 'security' | 'write-failed';

export type ImageUploadOutcome =
  | { ok: true; file: { name: string; path: string } }
  | { ok: false; reason: ImageUploadFailureReason };

type UploadedFile = { url: string; filename: string };

function mapStatus(status: number): ImageUploadFailureReason {
  if (status === 401 || status === 403) return 'permission-denied';
  if (status === 413) return 'quota';
  if (status === 400) return 'security';
  return 'write-failed';
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const uploadImage = async (file: {
  blob: Blob;
  name: string;
}): Promise<ImageUploadOutcome> => {
  const formData = new FormData();
  formData.append('file', file.blob, file.name);

  const doRequest = async (): Promise<Response> => {
    const headers = new Headers();
    const token = authToken.getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}/images`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
  };

  try {
    let res = await doRequest();

    if (res.status === 401) {
      // Single refresh + retry.
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const data = (await refreshRes.json()) as { accessToken?: string };
          if (data?.accessToken) authToken.setAccessToken(data.accessToken);
          res = await doRequest();
        } else {
          authToken.clearAccessToken();
          return { ok: false, reason: 'permission-denied' };
        }
      } catch {
        return { ok: false, reason: 'permission-denied' };
      }
    }

    if (!res.ok) {
      return { ok: false, reason: mapStatus(res.status) };
    }

    const data = (await res.json()) as UploadedFile;
    if (!data?.url) return { ok: false, reason: 'write-failed' };

    return {
      ok: true,
      file: {
        name: data.filename || file.name,
        path: `${API_BASE}${data.url}`,
      },
    };
  } catch {
    return { ok: false, reason: 'write-failed' };
  }
};
