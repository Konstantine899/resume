const rawApiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000';

// New media contract (backend PR-1a): files are served from `/media/:key`.
// VITE_MEDIA_BASE_URL may override the whole base for CDN usage; otherwise
// append the `/media` segment to the API base.
export const MEDIA_BASE =
  (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) ||
  `${rawApiBase.replace(/\/$/, '')}/media`;

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const BASE_EXTENSIONS = 'png|webp|avif|svg|jpg|jpeg|gif';

const BASE_KEY_RE = new RegExp(`^${UUID}\\.(${BASE_EXTENSIONS})$`);
const VARIANT_KEY_RE = new RegExp(`^${UUID}-(?:320|640|960)\\.webp$`);

export function isMediaKey(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) {
    return false;
  }
  return BASE_KEY_RE.test(value) || VARIANT_KEY_RE.test(value);
}

export function mediaUrl(value: string | null | undefined): string {
  if (value == null) return '';
  const text = (value as string).trim();
  if (text.length === 0) return '';
  if (text.startsWith('http://') || text.startsWith('https://')) return text;
  if (text.startsWith('/')) return text;
  if (!isMediaKey(text)) return text;
  return `${MEDIA_BASE.replace(/\/$/, '')}/${text}`;
}

export function mediaSrcSet(key: string | null | undefined): string | undefined {
  if (typeof key !== 'string' || !BASE_KEY_RE.test(key)) return undefined;
  const uuid = key.slice(0, key.lastIndexOf('.'));
  const base = MEDIA_BASE.replace(/\/$/, '');
  return [320, 640, 960].map((width) => `${base}/${uuid}-${width}.webp ${width}w`).join(', ');
}
