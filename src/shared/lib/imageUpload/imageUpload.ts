// ============================================
// imageUpload — backend upload seam (media-pipeline PR-1b)
// ============================================
//
// Contract: writes via `POST /media?kind=...` and returns a flat media key plus its width/height/variants. New uploads only.
import { authToken } from '@/shared/api/authToken';
import { isMediaKey } from '@/shared/lib/media';

export type ImageUploadFailureReason =
  | 'invalid-format'
  | 'too-large'
  | 'unsupported'
  | 'permission'
  | 'forbidden'
  | 'conflict'
  | 'storage-full'
  | 'retryable'
  | 'write-failed';

export type MediaVariant = { width: number; key: string };

export type UploadedMediaFile = {
  key: string;
  width: number;
  height: number;
  variants: MediaVariant[];
};

export type ImageUploadOutcome =
  | { ok: true; file: UploadedMediaFile }
  | { ok: false; reason: ImageUploadFailureReason; detail?: string };

type MediaUploadResponse = {
  key: string;
  width: number;
  height: number;
  variants?: MediaVariant[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function extractDetail(res: Response): Promise<string | undefined> {
  try {
    const data = (await res.clone().json()) as { detail?: unknown; message?: unknown };
    if (typeof data?.detail === 'string') return data.detail;
    if (typeof data?.message === 'string') return data.message;
  } catch {
    // Response was not JSON — ignore and fall back to generic copy.
  }
  return undefined;
}

function mapStatus(status: number): ImageUploadFailureReason {
  switch (status) {
    case 400:
      return 'invalid-format';
    case 401:
      return 'permission';
    case 403:
      return 'forbidden';
    case 409:
      return 'conflict';
    case 413:
      return 'too-large';
    case 415:
      return 'unsupported';
    case 429:
      return 'retryable';
    case 507:
      return 'storage-full';
    default:
      return status >= 500 ? 'retryable' : 'write-failed';
  }
}

async function requestWithAuthRefresh(request: () => Promise<Response>): Promise<Response | null> {
  let res = await request();
  if (res.status !== 401) return res;

  // Single refresh + retry.
  try {
    const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as { accessToken?: string };
      if (data?.accessToken) authToken.setAccessToken(data.accessToken);
      res = await request();
      return res;
    }
    authToken.clearAccessToken();
  } catch {
    authToken.clearAccessToken();
  }
  return null;
}

export const uploadImage = async (
  file: { blob: Blob; name: string },
  kind: 'portrait' | 'icon' = 'portrait'
): Promise<ImageUploadOutcome> => {
  const formData = new FormData();
  formData.append('file', file.blob, file.name);

  const doRequest = async (): Promise<Response> => {
    const headers = new Headers();
    const token = authToken.getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}/media?kind=${kind}`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });
  };

  try {
    const res = await requestWithAuthRefresh(doRequest);
    if (!res) return { ok: false, reason: 'permission' };
    if (!res.ok) {
      return { ok: false, reason: mapStatus(res.status), detail: await extractDetail(res) };
    }

    const data = (await res.json()) as MediaUploadResponse;
    if (!data?.key) return { ok: false, reason: 'write-failed' };

    return {
      ok: true,
      file: {
        key: data.key,
        width: data.width,
        height: data.height,
        variants: Array.isArray(data.variants) ? data.variants : [],
      },
    };
  } catch {
    return { ok: false, reason: 'write-failed' };
  }
};

/**
 * Best-effort deletion of a stored media key (media-pipeline PR-2b).
 * Only media keys are accepted; legacy paths are left untouched here.
 */
export const removeMedia = async (key: string): Promise<boolean> => {
  if (!isMediaKey(key)) return false;

  const doRequest = async (): Promise<Response> => {
    const headers = new Headers();
    const token = authToken.getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}/media/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });
  };

  try {
    const res = await requestWithAuthRefresh(doRequest);
    return Boolean(res?.ok);
  } catch {
    return false;
  }
};
