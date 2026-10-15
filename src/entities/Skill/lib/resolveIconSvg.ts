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

const iconModules = import.meta.glob('../../../shared/assets/icons/skills/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;

/** basename (`react.svg`) and key (`react`) → current asset URL. */
const ICON_URL_BY_KEY = new Map<string, string>();
for (const [path, url] of Object.entries(iconModules)) {
  const base = path.split('/').pop() ?? path;
  ICON_URL_BY_KEY.set(base, url);
  ICON_URL_BY_KEY.set(base.endsWith('.svg') ? base.slice(0, -4) : base, url);
}

export const resolveIconSvg = (value: string): string | undefined => {
  if (value.startsWith('/') || value.startsWith('http') || value.startsWith('data:')) {
    return value;
  }

  const url = ICON_URL_BY_KEY.get(value);
  if (url === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[entities/Skill] Unknown iconSvg key "${value}" — placeholder will render`);
    return undefined;
  }
  return url;
};
