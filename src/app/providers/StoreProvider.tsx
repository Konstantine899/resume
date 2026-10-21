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
import type { Middleware, ReducersMapObject } from '@reduxjs/toolkit';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { apiSlice } from '@/shared/api';

type StoreProviderProps = {
  children: ReactNode;
  /**
   * Reducer-map for the root store. Injected from the composition root —
   * this slice may only import `shared` + Redux Toolkit itself.
   */
  reducers: ReducersMapObject;
};

export const StoreProvider = ({ children, reducers }: StoreProviderProps) => {
  // RTK Query stub (migration plan rev.3 §3.7): apiSlice middleware is part
  // of the store from day one, so the real-server swap needs no wiring.
  // The injected ReducersMapObject is intentionally generic (FSD: the api
  // reducer rides the map from the composition root), so TS cannot see the
  // `api` state key when typing the middleware — the `Middleware` cast is a
  // TYPE-only widening, the runtime wiring is exact (reducer + middleware
  // pair, both from apiSlice).
  const store = useMemo(
    () =>
      configureStore({
        reducer: reducers,
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().concat(apiSlice.middleware as Middleware),
      }),
    [reducers]
  );

  return <Provider store={store}>{children}</Provider>;
};
