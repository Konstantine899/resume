// ============================================
// apiSlice — RTK Query stub (migration plan rev.3, §3.7 amendment)
// ============================================
//
// TDD guard suite: pins the stub contract BEFORE implementation details
// drift. The stub must be deterministic (no network, no timers), must
// reject with a fixed 503 "backend not configured" payload, and must be
// registered in the root store (reducer + middleware) so the real-server
// swap (stubBaseQuery -> fetchBaseQuery) needs no wiring work.

import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import { storeReducers } from '@/storeReducers';
import { apiSlice, stubBaseQuery } from './apiSlice';

const makeStore = () =>
  configureStore({
    reducer: storeReducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });

describe('stubBaseQuery', () => {
  it('returns a deterministic 503 error with a fixed message (no network)', async () => {
    const result = await stubBaseQuery(undefined, {} as never, {});

    expect(result).toEqual({
      error: {
        status: 503,
        data: { message: 'backend not configured' },
      },
    });
  });

  it('ignores arguments — every call yields the identical payload', async () => {
    const [a, b] = await Promise.all([
      stubBaseQuery('/contact', {} as never, {}),
      stubBaseQuery({ url: '/contact', method: 'PUT' }, {} as never, {}),
    ]);

    expect(a).toEqual(b);
  });
});

describe('apiSlice endpoints', () => {
  it('exposes the Contact document endpoints', () => {
    expect(apiSlice.endpoints.getContactContent).toBeDefined();
    expect(apiSlice.endpoints.updateContactContent).toBeDefined();
  });

  it('uses the conventional reducerPath so future apiMiddleware wiring is uniform', () => {
    expect(apiSlice.reducerPath).toBe('api');
  });

  it('is registered in the root store reducer map', () => {
    expect(storeReducers).toHaveProperty('api');
  });

  it('getContactContent.initiate unwraps to the stub error on a real store', async () => {
    const store = makeStore();

    await expect(
      store.dispatch(apiSlice.endpoints.getContactContent.initiate()).unwrap()
    ).rejects.toMatchObject({
      status: 503,
      data: { message: 'backend not configured' },
    });
  });

  it('updateContactContent.initiate unwraps to the stub error on a real store', async () => {
    const store = makeStore();

    await expect(
      store
        .dispatch(apiSlice.endpoints.updateContactContent.initiate({ v: 1, content: {} }))
        .unwrap()
    ).rejects.toMatchObject({
      status: 503,
      data: { message: 'backend not configured' },
    });
  });
});

describe('apiSlice.updateAboutPortrait (WU-14)', () => {
  it('exposes the updateAboutPortrait endpoint', () => {
    expect(apiSlice.endpoints.updateAboutPortrait).toBeDefined();
  });

  it('persists through the injected seam and unwraps to the document', async () => {
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

  it('rejects with the persist-failed error when the seam returns false', async () => {
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
