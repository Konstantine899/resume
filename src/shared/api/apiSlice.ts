// ============================================
// apiSlice — RTK Query STUB (migration plan rev.3, §3.7 amendment)
// ============================================
//
// Scaffolding only: the endpoints exist and the slice is wired into the
// root store, but NOTHING in the UI consumes them — the showcase keeps its
// synchronous localStorage read (contract C6) and persist->dispatch (C7).
//
// Real-server swap point: replace `stubBaseQuery` with
// `fetchBaseQuery({ baseUrl: ... })` and finalize the wire format
// (decision D3, plan §3.5). The coexistence mode (server truth vs local
// cache, plan §3.3 variants 1/2/3) is approved together with the backend,
// not here.

// NOTE (migration plan rev.3 §3.7): the CORE subpath (`/query`) is used on
// purpose — the react-hooks module (`use*Query`) would add bundle weight
// that NOTHING consumes until the real server arrives. Swap to
// `@reduxjs/toolkit/query/react` together with `fetchBaseQuery` when the
// backend lands (same swap point, documented in SPEC R-2).
import { createApi } from '@reduxjs/toolkit/query';
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type {
  ContactDocumentDto,
  UpdateAboutPortraitArg,
  UpdateAboutPortraitResult,
} from './types';

type StubArgs = undefined | string | { url: string; method?: string };

/**
 * Deterministic stub base query — no network, no timers. Always rejects
 * with 503 "backend not configured" so consumers (future) see a stable,
 * testable error shape identical to what fetchBaseQuery produces.
 */
export const stubBaseQuery: BaseQueryFn<StubArgs> = async () => ({
  error: {
    status: 503,
    data: { message: 'backend not configured' },
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: stubBaseQuery,
  // No tagTypes / invalidation yet — added with the real backend.
  endpoints: (builder) => ({
    /** GET the whole Contact document. */
    getContactContent: builder.query<ContactDocumentDto, void>({
      query: () => '/contact',
    }),
    /** PUT the whole Contact document — full replace (contract C2). */
    updateContactContent: builder.mutation<ContactDocumentDto, ContactDocumentDto>({
      query: (content) => ({ url: '/contact', method: 'PUT', body: content }),
    }),
    /**
     * WU-14 (admin-about-table): update the About PORTRAIT — full-replace of
     * the document whose `portrait` field carries the new `/images/about/<name>`
     * path. The form calls ONLY `apiSlice.endpoints.updateAboutPortrait.initiate()`
     * and never touches storage directly for this operation.
     *
     * The `queryFn` persists through the feature-injected `persist` seam (the
     * arg carries it) — this layer imports NOTHING from `features`/`entities`
     * (FSD: allowedImports.shared = ['shared']). A failed persist returns
     * `{ error }` so the mutation REJECTS; the caller toasts and skips the
     * store dispatch (persist-THEN-dispatch).
     *
     * SWAP-POINT (real Nest.js backend): replace this `queryFn` with
     * `query: (arg) => ({ url: '/about/portrait', method: 'PUT', body: arg.content })`
     * and drop the `persist` seam from the arg — the FILENAME/path travels in
     * the body and lands in the DB. Nothing else changes: the caller keeps
     * calling `.initiate()` and branching on `.unwrap()`.
     */
    updateAboutPortrait: builder.mutation<UpdateAboutPortraitResult, UpdateAboutPortraitArg>({
      queryFn: async (arg) => {
        const { content, persist } = arg;
        if (!persist(content)) {
          // Same shape stubBaseQuery produces — `.unwrap()` throws with this.
          return { error: { status: 500, data: { message: 'persist-failed' } } };
        }
        return { data: { document: content } };
      },
    }),
  }),
});
