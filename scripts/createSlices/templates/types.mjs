/**
 * `model/types.ts` template — plan §4.5.7 (rev.4, gate-verified).
 *
 * `Props` is an `interface` (About/Nav precedent); `State`/`RootState` are
 * `type` aliases (exact AdminAuth/model/types.ts precedent, plan §2.3.4) and
 * appear only with `--with-slice`. `State` must carry at least one field —
 * `@typescript-eslint/no-empty-object-type` rejects empty objects. `children`
 * is typed through a `type` ReactNode import (shared/ui/Card precedent).
 *
 * @param {{ name: string, camel: string, withSlice?: boolean }} names
 * @returns {string}
 */
export function typesTemplate(names) {
  const { name, camel, withSlice } = names;
  const base = `// ============================================
// ${name} — state types (generated)
// ============================================
//
// The store's reducer-map is injected from the composition root
// (src/App.tsx), so ${name} types its own view of the root state
// instead of importing a global RootState (which cannot exist while
// slices are injected from outside).

import type { ReactNode } from 'react';

export interface ${name}Props {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}
`;

  if (!withSlice) return base;

  return `${base}
export type ${name}State = {
  initialized: boolean;
};

/** Root-state shape as seen by ${name} selectors. */
export type ${name}RootState = {
  ${camel}: ${name}State;
};
`;
}
