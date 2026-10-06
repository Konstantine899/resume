// ============================================
// Icon key inventory (plan_skills_crud §7 — iconSvg ∈ 62 file names)
// ============================================
//
// The admin technology form offers exactly the keys that exist in
// `shared/assets/icons/skills/` — a stale hardcoded list would drift the
// moment an SVG is added. `import.meta.glob` with NO eager option gives
// the module paths without evaluating the assets (the URL side lives in
// `resolveIconSvg`), and the keys stay relative (alias `@/` inside
// import.meta.glob is not guaranteed).

const iconModules = import.meta.glob('../../../shared/assets/icons/skills/*.svg');

/** Sorted key names (`'react'`, `'long-polling'`, …) — no `.svg` suffix. */
export const SKILL_ICON_KEYS: readonly string[] = Object.keys(iconModules)
  .map((path) => {
    const base = path.split('/').pop() ?? path;
    return base.endsWith('.svg') ? base.slice(0, -4) : base;
  })
  .sort();
