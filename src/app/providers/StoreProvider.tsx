// ============================================
// StoreProvider — global RTK store (admin-panel plan §8.2-A / WU-2)
// ============================================
//
// Placement: `app/providers` (FSD decision table: app-wide providers live
// in `app`). The FSD matrix forbids `app` → `features`, so the reducer-map
// is INJECTED from the composition root (`src/App.tsx`, outside slices):
// pass a module-level constant as `reducers` — a fresh object literal per
// render would rebuild the store (the map is a useMemo dependency).

import { configureStore } from '@reduxjs/toolkit';
import type { ReducersMapObject } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';

type StoreProviderProps = {
  children: ReactNode;
  /**
   * Reducer-map for the root store. Injected from the composition root —
   * this slice may only import `shared` + Redux Toolkit itself.
   */
  reducers: ReducersMapObject;
};

export const StoreProvider = ({ children, reducers }: StoreProviderProps) => {
  const store = useMemo(() => configureStore({ reducer: reducers }), [reducers]);

  return <Provider store={store}>{children}</Provider>;
};
