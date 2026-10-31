import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authToken } from '@/shared/api';
import { removeMedia, uploadImage } from './imageUpload';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const asFetch = (fn: unknown): typeof fetch => fn as typeof fetch;

const svgFile = (name = 'logo.svg'): File => new File(['<svg/>'], name, { type: 'image/svg+xml' });

const requestInit = (fetchMock: ReturnType<typeof vi.fn>, index: number): RequestInit =>
  (fetchMock.mock.calls[index] as [string, RequestInit])[1];

const authorization = (init: RequestInit): string | null =>
  (init.headers as Headers).get('authorization');

const mediaResponse = {
  key: 'media-key.webp',
  width: 1200,
  height: 900,
  variants: [{ width: 320, key: 'media-key-320.webp' }],
};

describe('uploadImage (new media contract)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    authToken.clearAccessToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    authToken.clearAccessToken();
  });

  it('POSTs to /media?kind=portrait and returns the key contract', async () => {
    authToken.setAccessToken('token-1');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mediaResponse));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: true, file: mediaResponse });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/media?kind=portrait`);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(authorization(init)).toBe('Bearer token-1');
  });

  it('honours the requested kind (icon)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mediaResponse));
    globalThis.fetch = asFetch(fetchMock);

    await uploadImage({ blob: svgFile(), name: 'logo.svg' }, 'icon');

    expect((fetchMock.mock.calls[0] as [string])[0]).toBe(`${API_BASE}/media?kind=icon`);
  });
  it('omits the Authorization header for anonymous uploads', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(mediaResponse));
    globalThis.fetch = asFetch(fetchMock);

    await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(authorization(requestInit(fetchMock, 0))).toBeNull();
  });

  it('refreshes once on a 401 and retries with the new token', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse(mediaResponse));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: true, file: mediaResponse });
    expect(authToken.getAccessToken()).toBe('stale');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[1] as [string])[0]).toBe(`${API_BASE}/auth/refresh`);
    expect(authorization(requestInit(fetchMock, 2))).toBe('Bearer stale');
  });

  it('clears the token and reports permission when the refresh fails', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('', { status: 500 }));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'permission' });
    expect(authToken.getAccessToken()).toBeNull();
  });

  it('reports permission when the refresh request throws', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockRejectedValueOnce(new Error('network down'));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'permission' });
  });

  it('maps HTTP statuses and reports write-failed on missing key', async () => {
    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(new Response('', { status: 409 })));
    expect(
      ((await uploadImage({ blob: svgFile(), name: 'logo.svg' })) as { reason: string }).reason
    ).toBe('conflict');

    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(jsonResponse({ width: 1 })));
    expect(
      ((await uploadImage({ blob: svgFile(), name: 'logo.svg' })) as { reason: string }).reason
    ).toBe('write-failed');
  });

  it.each([
    [403, 'forbidden'],
    [413, 'too-large'],
    [400, 'invalid-format'],
    [415, 'unsupported'],
    [404, 'write-failed'],
    [500, 'retryable'],
  ] as const)('maps HTTP %s to %s', async (status, reason) => {
    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(new Response('', { status })));

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason });
  });

  it('reports write-failed on throw or invalid JSON', async () => {
    globalThis.fetch = asFetch(vi.fn().mockRejectedValue(new Error('offline')));
    expect(
      ((await uploadImage({ blob: svgFile(), name: 'logo.svg' })) as { reason: string }).reason
    ).toBe('write-failed');

    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })));
    expect(
      ((await uploadImage({ blob: svgFile(), name: 'logo.svg' })) as { reason: string }).reason
    ).toBe('write-failed');
  });
});

describe('removeMedia', () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => authToken.clearAccessToken());
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    authToken.clearAccessToken();
  });

  it('returns false for non-media keys without any request', async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = asFetch(fetchMock);
    expect(await removeMedia('not-a-key')).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('deletes a key and is tolerant to refresh failure', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('', { status: 500 }));
    globalThis.fetch = asFetch(fetchMock);
    expect(await removeMedia('2f1c9a7e-4b3d-4c8f-9a1b-7d6e5f4a3b2c.webp')).toBe(false);
  });

  it('returns true when the delete succeeds', async () => {
    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(new Response('', { status: 200 })));
    expect(await removeMedia('2f1c9a7e-4b3d-4c8f-9a1b-7d6e5f4a3b2c.webp')).toBe(true);
  });
});
