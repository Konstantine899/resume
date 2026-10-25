import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { storeReducers } from '@/storeReducers';
import { apiSlice } from './apiSlice';
import * as authToken from './authToken';

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
