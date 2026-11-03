/**
 * Redux slice templates — plan §4.5.2 (rev.4, gate-verified). Only emitted
 * with `--with-slice`.
 *
 * The file MUST be named `*Slice.ts`: the `no-param-reassign` override for
 * immer-draft mutations (`state.x = …`) is scoped to `*Slice*.ts` files under
 * `src/` (eslint.config.js). The `<camel>Reducer` wrapper is the lazy-hydration lesson
 * `resume-rtk-lazy-hydration`: persisted state is read on the FIRST reducer
 * call (configureStore time), never at module import.
 */

/**
 * `model/slices/<camel>Slice.ts`.
 * @param {{ name: string, camel: string }} names
 * @returns {string}
 */
export function reduxSliceTemplate(names) {
  const { name, camel } = names;
  return `// ============================================
// ${camel} slice — generated
// ============================================
//
// Lazy hydration (lesson resume-rtk-lazy-hydration): persisted state is read
// on the FIRST reducer call — i.e. at configureStore time — not at module
// import. A const \`initialState\` evaluated at import time would freeze
// whatever storage held when the bundle first loaded, so a value set later
// (tests, a future persistence stage) never showed.

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ${name}State } from '../types';

const initialState: ${name}State = { initialized: false };

const ${camel}Slice = createSlice({
  name: '${camel}',
  initialState,
  reducers: {
    setInitialized(state, action: PayloadAction<boolean>) {
      state.initialized = action.payload;
    },
  },
});

export const { setInitialized } = ${camel}Slice.actions;

export const ${camel}Reducer: typeof ${camel}Slice.reducer = (state, action) =>
  ${camel}Slice.reducer(state ?? initialState, action);
`;
}

/**
 * `model/slices/<camel>Slice.test.ts` — pure state machine only; reducer-map
 * injection from the composition root is covered by StoreProvider tests.
 * @param {{ name: string, camel: string }} names
 * @returns {string}
 */
export function sliceTestTemplate(names) {
  const { name, camel } = names;
  return `// ============================================
// ${camel} slice — generated
// ============================================
//
// Pure state machine only: reducer-map injection from the composition root
// (src/App.tsx) is covered by StoreProvider tests, not here.

import { describe, expect, it } from 'vitest';
import { setInitialized, ${camel}Reducer } from './${camel}Slice';
import { select${name}Initialized } from '../selectors';
import type { ${name}RootState } from '../types';

describe('${camel} slice', () => {
  it('hydrates the initial state on the first reducer call', () => {
    expect(${camel}Reducer(undefined, { type: 'unknown' })).toEqual({ initialized: false });
  });

  it('setInitialized updates the flag', () => {
    expect(${camel}Reducer({ initialized: false }, setInitialized(true))).toEqual({
      initialized: true,
    });
  });

  it('exposes namespaced action types', () => {
    expect(setInitialized(true).type).toBe('${camel}/setInitialized');
  });
});

describe('select${name}Initialized', () => {
  it('reads the ${camel} slice from the injected root shape', () => {
    const on: ${name}RootState = { ${camel}: { initialized: true } };
    const off: ${name}RootState = { ${camel}: { initialized: false } };

    expect(select${name}Initialized(on)).toBe(true);
    expect(select${name}Initialized(off)).toBe(false);
  });
});
`;
}
