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
import type {
  AuthCredentials,
  AuthTokenResponse,
  AuthUser,
  ContactDocumentDto,
  UpdateAboutPortraitArg,
  UpdateAboutPortraitResult,
} from './types';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:3000',
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = authToken.getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

export const baseQuery = rawBaseQuery;

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
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    const refreshData = refreshResult.data as { accessToken?: string } | undefined;

    if (refreshData?.accessToken) {
      authToken.setAccessToken(refreshData.accessToken);
      return rawBaseQuery(args, api, extraOptions);
    }

    authToken.clearAccessToken();
  }

  return result;
};

export const reauthBaseQuery = baseQueryWithReauth;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
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
        if (!persist(content)) {
          return { error: { status: 500, data: { message: 'persist-failed' } } };
        }
        return { data: { document: content } };
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
  }),
});

// Hooks are not exported: the project uses the RTK Query core subpath
// (`@reduxjs/toolkit/query`) on purpose and calls `.initiate()` directly.
