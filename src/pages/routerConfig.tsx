// ============================================
// Route table — global routing (plan: wiki/plan/admin-panel.md §2.1-A)
// ============================================
//
// Placement rationale: this repo's FSD matrix (eslint-plugin-fsd-imports,
// ALLOWED_IMPORTS) allows `app` → `shared` ONLY, while `pages` may compose
// everything below it plus `app`. The route table composes page slices, so it
// lives in `pages` — not in `app` (the plan's original tree was wrong; the
// root `src/App.tsx` stays the provider composition root, outside slices).
//
// This module exports ONLY the route-table constant: components live in their
// own files (`react-refresh/only-export-components` flags constants + local
// components in one module).
//
// Route table:
//   `/`      → HomePage (public showcase; hash anchors #contact etc. are kept
//              natively — plan §8.3-B, no path-route migration)
//   `/admin` → lazy parent `pages/Admin/AdminLayout` (WU-3 shell: header +
//              sidebar + <Outlet/>) with lazy children — the dashboard
//              (DashboardPage, WU-4) and `settings` (AdminSettings). Every
//              module is a dynamic import: the showcase `/` never loads an
//              admin chunk.
//   `*`      → redirect to `/` (unknown paths never 404 the SPA shell)
import { AdminHydrateFallback } from './Admin/AdminHydrateFallback';
import { HomePage } from '@/pages/Home';
import { redirect } from 'react-router';
import type { RouteObject } from 'react-router';

export const routerConfig: RouteObject[] = [
  { path: '/', Component: HomePage },
  {
    path: '/admin',
    // Dynamic imports = vite code-split points (tests: AppRouter > lazy boundary).
    lazy: () => import('./Admin/AdminLayout').then((m) => ({ Component: m.AdminLayout })),
    // Deep-loads of /admin hydrate asynchronously (RR 8 initial-hydration
    // path) — a route-level fallback prevents the blank frame + RR warning.
    hydrateFallbackElement: <AdminHydrateFallback />,
    children: [
      {
        index: true,
        lazy: () => import('./Admin/DashboardPage').then((m) => ({ Component: m.DashboardPage })),
      },
      {
        path: 'settings',
        lazy: () => import('./Admin/AdminSettings').then((m) => ({ Component: m.AdminSettings })),
      },
      {
        // About CRUD stage-1 (plan §10 WU-3) — own chunk like the rest.
        path: 'about',
        lazy: () => import('./Admin/AdminAboutPage').then((m) => ({ Component: m.AdminAboutPage })),
      },
      {
        // Contact CRUD stage-1 (plan_contact_crud §10 WU-3) — own chunk.
        path: 'contact',
        lazy: () =>
          import('./Admin/AdminContactPage').then((m) => ({ Component: m.AdminContactPage })),
      },
      {
        // Projects CRUD stage-1 (plan_projects_crud §10 WU-4) — own chunk;
        // carries the RHF editor (resume-lazy-rhf-chunk, same as /admin/about).
        path: 'mywork',
        lazy: () =>
          import('./Admin/AdminMyWorkPage').then((m) => ({ Component: m.AdminMyWorkPage })),
      },
      {
        // Skills CRUD stage-1 (plan_skills_crud §9 WU-5) — own chunk;
        // carries the RHF editors (resume-lazy-rhf-chunk, same as /admin/about).
        path: 'skills',
        lazy: () =>
          import('./Admin/AdminSkillsPage').then((m) => ({ Component: m.AdminSkillsPage })),
      },
      {
        // WorkHistory CRUD stage-1 (plan_workhistory_crud §9 WU-5) — own
        // chunk; carries the RHF editor (resume-lazy-rhf-chunk, same as
        // /admin/about). RHF must never reach the showcase bundle.
        path: 'jobs',
        lazy: () => import('./Admin/AdminJobsPage').then((m) => ({ Component: m.AdminJobsPage })),
      },
    ],
  },
  { path: '*', loader: () => redirect('/') },
];
