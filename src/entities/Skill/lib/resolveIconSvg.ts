// ============================================
// Dual-mode icon resolver (plan_skills_crud A3, §12 WU-2)
// ============================================
//
// The store holds KEY NAMES (`'react'`), never vite URLs: content hashes
// change on every rebuild, so a stored URL would rot (R-3). This resolver
// maps a key back to the current asset URL at render time:
//
// - passthrough mode: values that already LOOK like URLs — absolute
//   paths (seed shape in dev/vitest: `/src/…/react.svg`), http(s) and
//   data: URLs — are returned untouched;
// - lookup mode: anything else is a key resolved through the static
//   `import.meta.glob` map (basename, with or without `.svg`);
// - unknown keys → `undefined` + a warning; the caller renders the
//   placeholder (§7 fallback).
//
// The glob is RELATIVE (alias `@/` inside import.meta.glob is not
// guaranteed) and uses `?url` so the 62 SVGs stay out of the JS bundle as
// data-URIs — each becomes a plain asset URL string.

import { SKILL_ICON_KEYS } from './skillIcons';

const KNOWN_KEYS = new Set(SKILL_ICON_KEYS);

const rawApiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000';

const SERVER_SHARED_ASSETS_BASE_URL = (import.meta.env.VITE_SHARED_ASSETS_BASE_URL ?? '').replace(
  /\/+$/,
  ''
);

export const resolveIconSvg = (value: string): string | undefined => {
  if (value.startsWith('/') || value.startsWith('http') || value.startsWith('data:')) {
    return value;
  }

  const normalizedKey = value.endsWith('.svg') ? value.slice(0, -4) : value;

  if (!KNOWN_KEYS.has(normalizedKey)) {
    // eslint-disable-next-line no-console
    console.warn(`[entities/Skill] Unknown iconSvg key "${value}" — placeholder will render`);
    return undefined;
  }

  const baseUrl = SERVER_SHARED_ASSETS_BASE_URL || `${rawApiBase.replace(/\/+$/, '')}`;
  return `${baseUrl}/assets/${encodeURIComponent(normalizedKey)}.svg`;
};
