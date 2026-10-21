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
import { aboutContentReducer } from '@/features/AdminAbout/model/slices/aboutContentSlice';
import { adminAuthReducer } from '@/features/AdminAuth';
import { adminDashboardReducer } from '@/features/AdminDashboard';
// Deep import, NOT the barrel (technologies-crud SPEC D1): the entity's
// public API is consumed by features; the composition root takes the
// reducer directly.
import { technologiesReducer } from '@/entities/Technology/model/slices/technologiesSlice';
// RTK Query stub (migration plan rev.3 §3.7): api-slice reducer lives here,
// in the root map — the middleware is wired in StoreProvider. Endpoints are
// NOT consumed by the UI yet (contracts C6/C7 untouched).
import { apiSlice } from '@/shared/api';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminContact's
// public API exports the editor form (RHF, epic admin-contact-crud) —
// instantiating the barrel here would pull it into the main chunk.
import { contactContentReducer } from '@/features/AdminContact/model/slices/contactContentSlice';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminJobs'
// public API exports the editor form (RHF) — instantiating the barrel
// here would pull it into the main chunk.
import { jobsReducer } from '@/features/AdminJobs/model/slices/jobsSlice';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminMyWork's
// public API exports the editor form (RHF) — instantiating the barrel
// here would pull it into the main chunk.
import { myWorkReducer } from '@/features/AdminMyWork/model/slices/myWorkSlice';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminSkills'
// public API exports the editor forms (RHF) — instantiating the barrel
// here would pull them into the main chunk.
import { skillsReducer } from '@/features/AdminSkills/model/slices/skillsSlice';

export const storeReducers = {
  aboutContent: aboutContentReducer,
  adminAuth: adminAuthReducer,
  adminDashboard: adminDashboardReducer,
  adminJobs: jobsReducer,
  adminSkills: skillsReducer,
  api: apiSlice.reducer,
  contactContent: contactContentReducer,
  myWork: myWorkReducer,
  technologies: technologiesReducer,
};
