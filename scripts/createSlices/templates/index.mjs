/**
 * Slice public-API template — plan §4.5.6 (rev.4, gate-verified).
 *
 * Named re-exports only — never `export *` (resume convention:
 * `shared/ui/Button/index.ts`, `features/AdminAuth/index.ts`). The
 * `--with-slice` exports are active only when the redux files exist.
 *
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @returns {string}
 */
export function publicApiTemplate(names) {
  const { name, camel, withSlice } = names;
  const base = `// ============================================
// ${name} — Public API (FSD slice)
// ============================================

export { ${name} } from './ui/${name}';
export type { ${name}Props } from './model/types';
`;

  if (!withSlice) return base;

  return `${base}export type { ${name}State, ${name}RootState } from './model/types';
export { ${camel}Reducer, setInitialized } from './model/${camel}Slice';
export { select${name}Initialized } from './model/selectors';
`;
}
