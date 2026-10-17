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
