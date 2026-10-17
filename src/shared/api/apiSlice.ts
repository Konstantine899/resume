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
import type { ContactDocumentDto } from './types';

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
  }),
});
