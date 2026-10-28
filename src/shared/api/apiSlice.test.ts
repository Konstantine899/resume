import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { storeReducers } from '@/storeReducers';
import { apiSlice, baseQueryWithReauth } from './apiSlice';
import * as authToken from './authToken';

const { publishAboutUpdate } = vi.hoisted(() => ({ publishAboutUpdate: vi.fn() }));

vi.mock('@/shared/lib/contentSync/contentSync', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/lib/contentSync/contentSync')>()),
  publishAboutUpdate,
}));

const makeStore = () =>
  configureStore({
    reducer: storeReducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('apiSlice (fetch-based)', () => {
  beforeEach(() => {
    authToken.clear();
    publishAboutUpdate.mockClear();
    vi.restoreAllMocks();
  });

  it('exposes the auth endpoints', () => {
    expect(apiSlice.endpoints.login).toBeDefined();
    expect(apiSlice.endpoints.refresh).toBeDefined();
    expect(apiSlice.endpoints.logout).toBeDefined();
    expect(apiSlice.endpoints.me).toBeDefined();
  });

  it('exposes the Contact document endpoints', () => {
    expect(apiSlice.endpoints.getContactContent).toBeDefined();
    expect(apiSlice.endpoints.updateContactContent).toBeDefined();
  });

  it('uses the conventional reducerPath', () => {
    expect(apiSlice.reducerPath).toBe('api');
  });

  it('is registered in the root store reducer map', () => {
    expect(storeReducers).toHaveProperty('api');
  });

  it('login stores the access token in memory', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ accessToken: 'abc', tokenType: 'Bearer', expiresIn: 900 })
      ) as unknown as typeof fetch;

    const store = makeStore();
    const result = await store
      .dispatch(apiSlice.endpoints.login.initiate({ email: 'a@b.c', password: 'secret' }))
      .unwrap();

    expect(result.accessToken).toBe('abc');
    expect(authToken.getAccessToken()).toBe('abc');
  });

  it('me unwraps to the user payload', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ id: '1', email: 'a@b.c', role: 'admin' })
      ) as unknown as typeof fetch;

    const store = makeStore();
    const result = await store.dispatch(apiSlice.endpoints.me.initiate()).unwrap();

    expect(result).toEqual({ id: '1', email: 'a@b.c', role: 'admin' });
  });

  it('retries a 401 request after a successful refresh', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: 'new-token', tokenType: 'Bearer', expiresIn: 900 })
      )
      .mockResolvedValueOnce(jsonResponse({ id: '1', email: 'a@b.c', role: 'admin' }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const store = makeStore();
    const result = await store.dispatch(apiSlice.endpoints.me.initiate()).unwrap();

    expect(result).toEqual({ id: '1', email: 'a@b.c', role: 'admin' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(authToken.getAccessToken()).toBe('new-token');
  });

  it('logout wipes the in-memory access token', async () => {
    authToken.setAccessToken('token');
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 })) as unknown as typeof fetch;

    const store = makeStore();
    await store.dispatch(apiSlice.endpoints.logout.initiate()).unwrap();

    expect(authToken.getAccessToken()).toBeNull();
  });

  it('updateAboutPortrait persists through the injected seam', async () => {
    const store = makeStore();
    const persist = vi.fn(() => true);
    const content = { fullName: 'Konstantine', portrait: '/images/about/me.png' };

    const result = await store
      .dispatch(apiSlice.endpoints.updateAboutPortrait.initiate({ content, persist }))
      .unwrap();

    expect(persist).toHaveBeenCalledTimes(1);
    expect(persist).toHaveBeenCalledWith(content);
    expect(result).toEqual({ document: content });
  });

  it('updateAboutPortrait rejects when the seam returns false', async () => {
    const store = makeStore();
    const persist = vi.fn(() => false);
    const content = { fullName: 'Konstantine', portrait: '/images/about/me.png' };

    await expect(
      store.dispatch(apiSlice.endpoints.updateAboutPortrait.initiate({ content, persist })).unwrap()
    ).rejects.toMatchObject({
      status: 500,
      data: { message: 'persist-failed' },
    });
  });
});

// ============================================
// Reauth wrapper — direct base-query calls
// ============================================
const makeBaseQueryApi = () => {
  const dispatch = vi.fn();
  return {
    dispatch,
    api: {
      dispatch,
      getState: () => ({}),
      signal: new AbortController().signal,
      abort: vi.fn(),
      extra: undefined,
      endpoint: 'test',
      type: 'query' as const,
      forced: false,
    },
  };
};

/**
 * fetchBaseQuery builds a `Request` and calls `fetch(request)` — so URL,
 * method and headers live on the request object, and the JSON body must be
 * cloned BEFORE the handler resolves. Each call gets a fresh Response
 * (a shared mockResolvedValue would be cloned-then-consumed internally).
 */
const captureFetch = (handler: (request: Request) => Response | Promise<Response>) => {
  const requests: Request[] = [];
  const bodies: string[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const request = input as Request;
    requests.push(request);
    bodies.push(request.body ? await request.clone().text() : '');
    return handler(request);
  });
  return { fetchMock, requests, bodies };
};

describe('baseQueryWithReauth', () => {
  beforeEach(() => {
    authToken.clear();
    vi.restoreAllMocks();
  });

  it('passes a non-401 result through without refreshing', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'boom' }, 500));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { api, dispatch } = makeBaseQueryApi();

    const result = await baseQueryWithReauth('/about', api as never, {});

    expect(result.error).toMatchObject({ status: 500 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'auth/signedOut' });
  });

  it('skips reauth for a URL that only ENDS WITH /auth/login', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 401 }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { api, dispatch } = makeBaseQueryApi();

    const result = await baseQueryWithReauth(
      { url: 'http://example.test/auth/login', method: 'POST' },
      api as never,
      {}
    );

    expect(result.error).toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('signs out when the refresh resolves without an access token', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({}));
    global.fetch = fetchMock as unknown as typeof fetch;
    const { api, dispatch } = makeBaseQueryApi();
    const listener = vi.fn();
    window.addEventListener('unauthorized', listener);

    const result = await baseQueryWithReauth({ url: '/about' }, api as never, {});
    window.removeEventListener('unauthorized', listener);

    expect(result.error).toMatchObject({ status: 401 });
    expect(authToken.getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'auth/signedOut' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('signs out when the refresh body parses to null', async () => {
    authToken.setAccessToken('stale');
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(
        new Response('null', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      ) as unknown as typeof fetch;
    const { api, dispatch } = makeBaseQueryApi();

    const result = await baseQueryWithReauth({ url: '/about' }, api as never, {});

    expect(result.error).toMatchObject({ status: 401 });
    expect(authToken.getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'auth/signedOut' });
  });

  it('treats a request without a url as an empty string', async () => {
    global.fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true })) as unknown as typeof fetch;
    const { api } = makeBaseQueryApi();

    const result = await baseQueryWithReauth(
      { url: undefined } as unknown as Parameters<typeof baseQueryWithReauth>[0],
      api as never,
      {}
    );

    expect(result).toBeDefined();
  });

  it('signs out when an explicit refresh URL 401s (endsWith branch)', async () => {
    authToken.setAccessToken('stale');
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 401 })) as unknown as typeof fetch;
    const { api, dispatch } = makeBaseQueryApi();
    const listener = vi.fn();
    window.addEventListener('unauthorized', listener);

    const result = await baseQueryWithReauth(
      { url: 'http://example.test/auth/refresh', method: 'POST' },
      api as never,
      {}
    );
    window.removeEventListener('unauthorized', listener);

    expect(result.error).toMatchObject({ status: 401 });
    expect(authToken.getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'auth/signedOut' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent refreshes into a single request', async () => {
    authToken.clear();
    let refreshCalls = 0;
    const { fetchMock } = captureFetch((request) => {
      if (request.url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return jsonResponse({ accessToken: 'dedup' });
      }
      if (request.headers.get('authorization') === 'Bearer dedup') {
        return jsonResponse({ ok: true });
      }
      return new Response('', { status: 401 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    const [me, settings] = await Promise.all([
      store.dispatch(apiSlice.endpoints.me.initiate()).unwrap(),
      store.dispatch(apiSlice.endpoints.getSiteSettings.initiate()).unwrap(),
    ]);

    expect(refreshCalls).toBe(1);
    expect(me).toEqual({ ok: true });
    expect(settings).toEqual({ ok: true });
  });
});

// ============================================
// Endpoint wiring (URLs, methods, payloads, side effects)
// ============================================
describe('apiSlice endpoint wiring', () => {
  beforeEach(() => {
    authToken.clear();
    publishAboutUpdate.mockClear();
    vi.restoreAllMocks();
  });

  it('builds the contact inbox query string', async () => {
    const { fetchMock, requests } = captureFetch(() => jsonResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    await store
      .dispatch(
        apiSlice.endpoints.getContactMessages.initiate({ status: 'NEW', skip: 5, take: 10 })
      )
      .unwrap();

    const parsed = new URL((requests[0] as Request).url);
    expect(parsed.pathname).toBe('/admin/contact/messages');
    expect(parsed.searchParams.get('status')).toBe('NEW');
    expect(parsed.searchParams.get('skip')).toBe('5');
    expect(parsed.searchParams.get('take')).toBe('10');
  });

  it('omits status=ALL and an empty query string', async () => {
    const { fetchMock, requests } = captureFetch(() => jsonResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    await store
      .dispatch(apiSlice.endpoints.getContactMessages.initiate({ status: 'ALL' }))
      .unwrap();
    await store.dispatch(apiSlice.endpoints.getContactMessages.initiate(undefined)).unwrap();

    expect(new URL((requests[0] as Request).url).search).toBe('');
    expect(new URL((requests[1] as Request).url).search).toBe('');
  });

  it('PATCHes a contact message status', async () => {
    const message = {
      id: 'm1',
      email: 'a@b.c',
      body: 'hi',
      status: 'READ',
      createdAt: '2026-10-28T10:00:00.000Z',
    };
    const { fetchMock, requests, bodies } = captureFetch(() => jsonResponse(message));
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    const result = await store
      .dispatch(
        apiSlice.endpoints.updateContactMessageStatus.initiate({ id: 'm1', status: 'READ' })
      )
      .unwrap();

    const request = requests[0] as Request;
    expect(new URL(request.url).pathname).toBe('/admin/contact/messages/m1');
    expect(request.method).toBe('PATCH');
    expect(JSON.parse(bodies[0] as string)).toEqual({ status: 'READ' });
    expect(result).toEqual(message);
  });

  it('GETs the whole contact document', async () => {
    const document = { v: 1 as const, content: { email: 'a@b.c' } };
    const { fetchMock, requests } = captureFetch(() => jsonResponse(document));
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    const result = await store.dispatch(apiSlice.endpoints.getContactContent.initiate()).unwrap();

    const request = requests[0] as Request;
    expect(new URL(request.url).pathname).toBe('/contact');
    expect(request.method).toBe('GET');
    expect(result).toEqual(document);
  });

  it('PUTs the full contact document', async () => {
    const document = { v: 1 as const, content: { email: 'a@b.c' } };
    const { fetchMock, requests, bodies } = captureFetch(() => jsonResponse(document));
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    await store.dispatch(apiSlice.endpoints.updateContactContent.initiate(document)).unwrap();

    const request = requests[0] as Request;
    expect(new URL(request.url).pathname).toBe('/contact');
    expect(request.method).toBe('PUT');
    expect(JSON.parse(bodies[0] as string)).toEqual(document);
  });

  it('reads the About document and the site settings aliases', async () => {
    const about = { fullName: 'Konstantine' };
    const settings = { id: 's1', resumeUrl: null };
    const { fetchMock } = captureFetch((request) =>
      new URL(request.url).pathname === '/about' ? jsonResponse(about) : jsonResponse(settings)
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    const [aboutResult, settingsResult, aliasResult] = await Promise.all([
      store.dispatch(apiSlice.endpoints.getAboutContent.initiate()).unwrap(),
      store.dispatch(apiSlice.endpoints.getSiteSettings.initiate()).unwrap(),
      store.dispatch(apiSlice.endpoints.siteSettings.initiate()).unwrap(),
    ]);

    expect(aboutResult).toEqual(about);
    expect(settingsResult).toEqual(settings);
    expect(aliasResult).toEqual(settings);
  });

  it('publishes the About revision after a successful PUT', async () => {
    const dto = {
      fullName: 'Konstantine',
      descriptions: [],
      stats: {},
      ctaLabel: null,
      updatedAt: '2026-10-28T10:00:00.000Z',
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(dto)) as unknown as typeof fetch;
    const store = makeStore();

    await store.dispatch(apiSlice.endpoints.updateAboutContent.initiate(dto)).unwrap();

    expect(publishAboutUpdate).toHaveBeenCalledWith('2026-10-28T10:00:00.000Z');
  });

  it('falls back to the current time when the About PUT has no updatedAt', async () => {
    const dto = {
      fullName: 'Konstantine',
      descriptions: [],
      stats: {},
      ctaLabel: null,
    };
    global.fetch = vi.fn().mockResolvedValue(jsonResponse(dto)) as unknown as typeof fetch;
    const store = makeStore();

    await store.dispatch(apiSlice.endpoints.updateAboutContent.initiate(dto)).unwrap();

    expect(publishAboutUpdate).toHaveBeenCalledWith(expect.any(String));
    expect(publishAboutUpdate).not.toHaveBeenCalledWith(undefined);
  });

  it('does NOT publish when the About PUT fails', async () => {
    const dto = {
      fullName: 'Konstantine',
      descriptions: [],
      stats: {},
      ctaLabel: null,
    };
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'nope' }, 500)) as unknown as typeof fetch;
    const store = makeStore();

    await expect(
      store.dispatch(apiSlice.endpoints.updateAboutContent.initiate(dto)).unwrap()
    ).rejects.toMatchObject({ status: 500 });
    expect(publishAboutUpdate).not.toHaveBeenCalled();
  });

  it('publishes the portrait document revision', async () => {
    const store = makeStore();
    const persist = vi.fn(() => true);
    const content = { fullName: 'Konstantine', updatedAt: '2026-10-28T11:00:00.000Z' };

    await store
      .dispatch(apiSlice.endpoints.updateAboutPortrait.initiate({ content, persist }))
      .unwrap();

    expect(publishAboutUpdate).toHaveBeenCalledWith('2026-10-28T11:00:00.000Z');
  });

  it('does NOT publish when the portrait persist seam fails', async () => {
    const store = makeStore();
    const persist = vi.fn(() => false);
    const content = { fullName: 'Konstantine', updatedAt: '2026-10-28T11:00:00.000Z' };

    await expect(
      store.dispatch(apiSlice.endpoints.updateAboutPortrait.initiate({ content, persist })).unwrap()
    ).rejects.toMatchObject({ status: 500 });
    expect(publishAboutUpdate).not.toHaveBeenCalled();
  });

  it('register and refresh store the access token from the response', async () => {
    const store = makeStore();
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ accessToken: 'register-token' })
      ) as unknown as typeof fetch;
    await store
      .dispatch(apiSlice.endpoints.register.initiate({ email: 'a@b.c', password: 'secret' }))
      .unwrap();
    expect(authToken.getAccessToken()).toBe('register-token');

    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ accessToken: 'refresh-token' })) as unknown as typeof fetch;
    await store.dispatch(apiSlice.endpoints.refresh.initiate()).unwrap();
    expect(authToken.getAccessToken()).toBe('refresh-token');
  });

  it('logout wipes the token even when the request fails', async () => {
    authToken.setAccessToken('token');
    global.fetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ message: 'nope' }, 500)) as unknown as typeof fetch;
    const store = makeStore();

    await expect(
      store.dispatch(apiSlice.endpoints.logout.initiate()).unwrap()
    ).rejects.toBeTruthy();
    expect(authToken.getAccessToken()).toBeNull();
  });

  it('PATCHes preferences through both aliases and POSTs contact messages', async () => {
    const user = { id: '1', email: 'a@b.c', role: 'admin' };
    const { fetchMock, requests, bodies } = captureFetch((request) =>
      new URL(request.url).pathname === '/contact/messages'
        ? jsonResponse({ id: 'msg-1' })
        : jsonResponse(user)
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    const store = makeStore();

    await store.dispatch(apiSlice.endpoints.updatePreferences.initiate({ theme: 'dark' })).unwrap();
    await store
      .dispatch(apiSlice.endpoints.updateUserPreferences.initiate({ language: 'ru' }))
      .unwrap();
    const created = await store
      .dispatch(
        apiSlice.endpoints.createContactMessage.initiate({
          email: 'a@b.c',
          body: 'Hello there',
        })
      )
      .unwrap();

    expect(created).toEqual({ id: 'msg-1' });
    const preferences = requests[0] as Request;
    const alias = requests[1] as Request;
    const message = requests[2] as Request;
    expect(new URL(preferences.url).pathname).toBe('/users/me/preferences');
    expect(preferences.method).toBe('PATCH');
    expect(JSON.parse(bodies[0] as string)).toEqual({ theme: 'dark' });
    expect(new URL(alias.url).pathname).toBe('/users/me/preferences');
    expect(alias.method).toBe('PATCH');
    expect(new URL(message.url).pathname).toBe('/contact/messages');
    expect(message.method).toBe('POST');
  });
});
