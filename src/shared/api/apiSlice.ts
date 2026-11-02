// ============================================
// apiSlice — RTK Query (fetchBaseQuery + reauth)
// ============================================
//
// Plan 2 step 2: swapped the stub base query for a real fetchBaseQuery
// with a reauth wrapper. The access token lives in memory (authToken) and
// is attached as a Bearer header; on a 401 the wrapper calls
// /auth/refresh once and retries the original request. Logout wipes the
// in-memory token.
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { authToken } from './authToken';
import { publishAboutUpdate } from '@/shared/lib/contentSync/contentSync';
import { removeMedia } from '@/shared/lib/imageUpload';
import type {
  AuthCredentials,
  AuthTokenResponse,
  AuthUser,
  AboutContentDto,
  CreateContactMessageInput,
  ContactMessageAdminDto,
  ListContactMessagesQuery,
  ContactDocumentDto,
  ContactMessageAdminStatus,
  RegisterCredentials,
  SiteSettingsDto,
  UpdateAboutPortraitArg,
  UpdateAboutPortraitResult,
  UpdatePreferencesInput,
} from './types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = authToken.getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQuery = rawBaseQuery;

const SKIPS_REAUTH = (url: string): boolean =>
  url === '/auth/refresh' ||
  url === '/auth/login' ||
  url === '/auth/register' ||
  url.endsWith('/auth/refresh') ||
  url.endsWith('/auth/login') ||
  url.endsWith('/auth/register');

function requestUrl(args: string | FetchArgs): string {
  if (typeof args === 'string') return args;
  return String(args.url ?? '');
}

let refreshInFlight: Promise<AuthTokenResponse | null> | null = null;

async function refreshOnce(
  api: Parameters<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>[1],
  extraOptions: Parameters<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>>[2]
): Promise<AuthTokenResponse | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const refreshResult = await rawBaseQuery(
        { url: '/auth/refresh', method: 'POST' },
        api,
        extraOptions
      );
      if (refreshResult.error) return null;
      const data = refreshResult.data as AuthTokenResponse;
      if (data?.accessToken) authToken.setAccessToken(data.accessToken);
      return data ?? null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Reauth wrapper: on HTTP 401, attempt a single refresh and retry the
 * original request. Any other error (or a failed refresh) is returned
 * unchanged.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const url = requestUrl(args);
  const result = await rawBaseQuery(args, api, extraOptions);

  if (!(result.error && result.error.status === 401)) {
    return result;
  }

  if (SKIPS_REAUTH(url)) {
    // Login/register/refresh failures never trigger another refresh.
    if (url.endsWith('/auth/refresh')) {
      authToken.clearAccessToken();
      api.dispatch({ type: 'auth/signedOut' });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('unauthorized'));
      }
    }
    return result;
  }

  const refreshed = await refreshOnce(api, extraOptions);
  if (refreshed?.accessToken) {
    return rawBaseQuery(args, api, extraOptions);
  }

  authToken.clearAccessToken();
  api.dispatch({ type: 'auth/signedOut' });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('unauthorized'));
  }
  return result;
};

export const reauthBaseQuery = baseQueryWithReauth;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AboutContent', 'SiteSettings'] as const,
  endpoints: (builder) => ({
    /** GET the whole Contact document. */
    getContactContent: builder.query<ContactDocumentDto, void>({
      query: () => '/contact',
    }),
    /** PUT the whole Contact document — full replace (contract C2). */
    updateContactContent: builder.mutation<ContactDocumentDto, ContactDocumentDto>({
      query: (content) => ({ url: '/contact', method: 'PUT', body: content }),
    }),

    // WU-14 (admin-about-table): unchanged persist-through-seam behavior.
    updateAboutPortrait: builder.mutation<UpdateAboutPortraitResult, UpdateAboutPortraitArg>({
      queryFn: async (arg) => {
        const { content, persist } = arg;
        if (!(await persist(content))) {
          return { error: { status: 500, data: { message: 'persist-failed' } } };
        }
        return { data: { document: content } };
      },
      invalidatesTags: ['AboutContent'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          publishAboutUpdate(
            (data as { document?: { updatedAt?: string } }).document?.updatedAt ??
              new Date().toISOString()
          );
        } catch {
          // Failure state remains local; callers surface toast.
        }
      },
    }),

    // Auth endpoints (Plan 2 step 2).
    login: builder.mutation<AuthTokenResponse, AuthCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: unknown) => {
        const data = response as AuthTokenResponse;
        authToken.setAccessToken(data.accessToken);
        return data;
      },
    }),
    register: builder.mutation<AuthTokenResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: unknown) => {
        const data = response as AuthTokenResponse;
        authToken.setAccessToken(data.accessToken);
        return data;
      },
    }),
    refresh: builder.mutation<AuthTokenResponse, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      transformResponse: (response: unknown) => {
        const data = response as AuthTokenResponse;
        authToken.setAccessToken(data.accessToken);
        return data;
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          // Logout errors still wipe the local token.
        }
        authToken.clearAccessToken();
      },
    }),
    me: builder.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
    // Preferences (Phase A backend): partial update of the current user's
    // theme/language. Anonymous callers never reach here.
    updatePreferences: builder.mutation<AuthUser, UpdatePreferencesInput>({
      query: (body) => ({ url: '/users/me/preferences', method: 'PATCH', body }),
      transformResponse: (response: unknown) => response as AuthUser,
    }),
    // Compatibility alias.
    updateUserPreferences: builder.mutation<AuthUser, UpdatePreferencesInput>({
      query: (body) => ({ url: '/users/me/preferences', method: 'PATCH', body }),
      transformResponse: (response: unknown) => response as AuthUser,
    }),

    // Contact ingestion (plan-contact-crm, Variant A).
    createContactMessage: builder.mutation<{ id: string }, CreateContactMessageInput>({
      query: (body) => ({ url: '/contact/messages', method: 'POST', body }),
      transformResponse: (response: unknown) => response as { id: string },
    }),
    // Site settings (Phase A backend): global resume download URL.
    getSiteSettings: builder.query<SiteSettingsDto, void>({
      query: () => '/site/settings',
      providesTags: ['SiteSettings'],
    }),
    updateSiteSettings: builder.mutation<SiteSettingsDto, Partial<SiteSettingsDto>>({
      query: (body) => ({ url: '/site/settings', method: 'PUT', body }),
      invalidatesTags: ['SiteSettings'],
    }),
    getAboutContent: builder.query<AboutContentDto, void>({
      query: () => '/about',
      providesTags: ['AboutContent'],
    }),
    updateAboutContent: builder.mutation<AboutContentDto, AboutContentDto>({
      query: (body) => ({ url: '/about', method: 'PUT', body }),
      invalidatesTags: ['AboutContent'],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          publishAboutUpdate(
            (data as { updatedAt?: string }).updatedAt ?? new Date().toISOString()
          );
          const headers = (meta as { response?: { headers?: Headers } } | undefined)?.response
            ?.headers;
          const replacedKey = headers?.get('x-replaced-media-key');
          if (typeof replacedKey === 'string' && replacedKey.trim().length > 0) {
            void removeMedia(replacedKey.trim()).catch(() => undefined);
          }
        } catch {
          // Failure state remains local; callers surface toast.
        }
      },
      transformResponse: (response: unknown) => response as AboutContentDto,
    }),

    // Contact messages (admin inbox, Phase 4).
    getContactMessages: builder.query<ContactMessageAdminDto[], ListContactMessagesQuery | void>({
      query: (arg) => {
        const q = (arg as ListContactMessagesQuery | undefined) ?? {};
        const params = new URLSearchParams();
        if (q.status && q.status !== 'ALL') params.set('status', q.status);
        if (q.skip !== undefined) params.set('skip', String(q.skip));
        if (q.take !== undefined) params.set('take', String(q.take));
        const qs = params.toString();
        return '/admin/contact/messages' + (qs ? `?${qs}` : '');
      },
    }),
    updateContactMessageStatus: builder.mutation<
      ContactMessageAdminDto,
      { id: string; status: ContactMessageAdminStatus }
    >({
      query: ({ id, status }) => ({
        url: `/admin/contact/messages/${id}`,
        method: 'PATCH',
        body: { status },
      }),
    }),
  }),
});

// Hooks are not exported: the project uses the RTK Query core subpath
// (`@reduxjs/toolkit/query`) on purpose and calls `.initiate()` directly.
