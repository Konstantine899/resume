// ============================================
// Reducer map — single source of truth for the root store
// ============================================
//
// Lives OUTSIDE FSD slices (like src/App.tsx): the `app` layer may only
// import `shared`, so the composition root injects feature reducers here
// (admin-panel plan WU-2/§8.2-A). Extracted from App.tsx so tests build
// the exact same store shape instead of duplicating the map (WU-4).
//
// Stable reference (StoreProvider useMemo contract): module-level const —
// an inline object literal in JSX would rebuild the store on every render.
import { aboutContentReducer } from '@/features/AdminAbout/model/aboutContentSlice';
import { adminAuthReducer } from '@/features/AdminAuth';
import { adminDashboardReducer } from '@/features/AdminDashboard';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminContact's
// public API will export the editor form (RHF) in WU-3 — instantiating the
// barrel here would pull it into the main chunk.
import { contactContentReducer } from '@/features/AdminContact/model/contactContentSlice';

export const storeReducers = {
  aboutContent: aboutContentReducer,
  adminAuth: adminAuthReducer,
  adminDashboard: adminDashboardReducer,
  contactContent: contactContentReducer,
};
