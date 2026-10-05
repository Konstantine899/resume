/**
 * Selectors template — plan §4.5.2 (rev.4, gate-verified). Only emitted with
 * `--with-slice`. Precedent: `AdminAuth/model/selectors` — the structural
 * `<Name>RootState` (declared in `model/types`) lets selectors read the
 * slice without a global RootState, which cannot exist while reducers are
 * injected from `src/App.tsx`.
 *
 * @param {{ name: string, camel: string }} names
 * @returns {string}
 */
export function selectorsTemplate(names) {
  const { name, camel } = names;
  return `// ============================================
// ${name} selectors
// ============================================

import type { ${name}RootState } from '../types';

export const select${name}Initialized = (state: ${name}RootState): boolean =>
  state.${camel}.initialized;
`;
}
