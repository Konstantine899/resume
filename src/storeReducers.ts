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
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminContact's
// public API will export the editor form (RHF) in WU-3 — instantiating the
// barrel here would pull it into the main chunk.
import { contactContentReducer } from '@/features/AdminContact/model/slices/contactContentSlice';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminJobs'
// public API will export the editor form (RHF) in WU-5 — instantiating the
// barrel here would pull it into the main chunk.
import { jobsReducer } from '@/features/AdminJobs/model/slices/jobsSlice';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminMyWork's
// public API will export the editor form (RHF) in WU-4 — instantiating the
// barrel here would pull it into the main chunk.
import { myWorkReducer } from '@/features/AdminMyWork/model/slices/myWorkSlice';
// Deep import, NOT the barrel (lesson resume-lazy-rhf-chunk): AdminSkills'
// public API will export the editor forms (RHF) in WU-5 — instantiating the
// barrel here would pull them into the main chunk.
import { skillsReducer } from '@/features/AdminSkills/model/slices/skillsSlice';

export const storeReducers = {
  aboutContent: aboutContentReducer,
  adminAuth: adminAuthReducer,
  adminDashboard: adminDashboardReducer,
  adminJobs: jobsReducer,
  adminSkills: skillsReducer,
  contactContent: contactContentReducer,
  myWork: myWorkReducer,
};
