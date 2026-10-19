// ============================================
// renderAdminPage — shared admin page-test harness (issue #302)
// ============================================
//
// Every admin page suite repeated the same wiring boilerplate:
// configureStore({ reducer: storeReducers }) → <Provider> → render.
// The harness builds the REAL reducer map so a page test proves the
// store wiring too (lazy hydration, persist→dispatch order).
//
// The harness owns ONLY the store+Provider wiring — the vi.mock blocks
// (storage persist control, identity i18n, toasts) stay in each test
// file: their signatures differ per feature (identity-t option shapes,
// mocked storage module paths).

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { storeReducers } from '@/storeReducers';

const createAdminStore = () => configureStore({ reducer: storeReducers });

/** The REAL reducer-map store — typed getState() for assertions. */
export type AdminTestStore = ReturnType<typeof createAdminStore>;

export interface RenderAdminPageOptions {
  /** Pre-built store (e.g. after dispatching setup actions before render). */
  store?: AdminTestStore;
}

/**
 * Renders `ui` inside a Provider with the REAL admin store and returns
 * the store for state assertions.
 */
export function renderAdminPage(
  ui: ReactElement,
  options: RenderAdminPageOptions = {}
): AdminTestStore {
  const store = options.store ?? createAdminStore();
  render(<Provider store={store}>{ui}</Provider>);
  return store;
}
