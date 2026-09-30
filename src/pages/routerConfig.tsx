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
//   `/admin` → localised placeholder until WU-3 swaps it for `pages/Admin`
//              behind a lazy boundary
//   `*`      → redirect to `/` (unknown paths never 404 the SPA shell)
import { HomePage } from '@/pages/Home';
import { redirect } from 'react-router';
import type { RouteObject } from 'react-router';
import { AdminComingSoon } from './AdminComingSoon';

export const routerConfig: RouteObject[] = [
  { path: '/', Component: HomePage },
  { path: '/admin', Component: AdminComingSoon },
  { path: '*', loader: () => redirect('/') },
];
