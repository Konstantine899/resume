// ============================================
// imageUpload — backend upload seam (media-pipeline PR-1b)
// ============================================
//
// New contract (WU-3): writes via `POST /media?kind=...` and returns a flat
// media key plus its width/height/variants. Legacy callers that still need
// the `/images` shim shape use `uploadLegacyImage`.
import { authToken } from '@/shared/api/authToken';
import { isMediaKey } from '@/shared/lib/media';

export type ImageUploadFailureReason =
  'permission-denied' | 'root-missing' | 'quota' | 'security' | 'write-failed' | 'conflict';

export type MediaVariant = { width: number; key: string };

export type UploadedMediaFile = {
  key: string;
  width: number;
  height: number;
  variants: MediaVariant[];
};

export type UploadedLegacyFile = { name: string; path: string };

export type ImageUploadOutcome =
  { ok: true; file: UploadedMediaFile } | { ok: false; reason: ImageUploadFailureReason };

export type LegacyImageUploadOutcome =
  { ok: true; file: UploadedLegacyFile } | { ok: false; reason: ImageUploadFailureReason };

type MediaUploadResponse = {
  key: string;
  width: number;
  height: number;
  variants?: MediaVariant[];
};

type UploadedFile = { url: string; filename: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const MEDIA_FALLBACK_REASON_BY_STATUS: Record<number, ImageUploadFailureReason> = {
  401: 'permission-denied',
  403: 'permission-denied',
  409: 'conflict',
  413: 'quota',
  400: 'security',
  415: 'security',
};

function mapStatus(status: number): ImageUploadFailureReason {
  return MEDIA_FALLBACK_REASON_BY_STATUS[status] ?? 'write-failed';
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
    if (!res) return { ok: false, reason: 'permission-denied' };
    if (!res.ok) return { ok: false, reason: mapStatus(res.status) };

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

// Legacy seam kept for icon forms (Skills/Technologies) until PR-3a. These
// callers still POST `/images` and receive the old `{ url, filename }` shape.
export const uploadLegacyImage = async (file: {
  blob: Blob;
  name: string;
}): Promise<LegacyImageUploadOutcome> => {
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
    const res = await requestWithAuthRefresh(doRequest);
    if (!res) return { ok: false, reason: 'permission-denied' };
    if (!res.ok) return { ok: false, reason: mapStatus(res.status) };

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
