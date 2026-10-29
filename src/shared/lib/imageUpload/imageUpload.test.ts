// ============================================
// imageUpload — backend upload seam
// ============================================
//
// Contract: a typed outcome instead of raw HTTP errors. The access token
// rides as a Bearer header, a single 401 triggers one refresh + retry,
// and every other failure maps to a reason consumers can toast.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authToken } from '@/shared/api';
import { uploadImage } from './imageUpload';

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

describe('uploadImage (backend upload seam)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    authToken.clearAccessToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    authToken.clearAccessToken();
  });

  it('POSTs the blob with a Bearer header and returns the resolved path', async () => {
    authToken.setAccessToken('token-1');
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ url: '/images/logo.svg', filename: 'logo.svg' }));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({
      ok: true,
      file: { name: 'logo.svg', path: `${API_BASE}/images/logo.svg` },
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${API_BASE}/images`);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(authorization(init)).toBe('Bearer token-1');

    const body = init.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect((body.get('file') as File).name).toBe('logo.svg');
  });

  it('omits the Authorization header for anonymous uploads', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ url: '/images/logo.svg', filename: 'logo.svg' }));
    globalThis.fetch = asFetch(fetchMock);

    await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(authorization(requestInit(fetchMock, 0))).toBeNull();
  });

  it('falls back to the local file name when the response has no filename', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ url: '/images/renamed.svg' }));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile('original.svg'), name: 'original.svg' });

    expect(result).toEqual({
      ok: true,
      file: { name: 'original.svg', path: `${API_BASE}/images/renamed.svg` },
    });
  });

  it('refreshes once on a 401 and retries with the new token', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh' }))
      .mockResolvedValueOnce(jsonResponse({ url: '/images/logo.svg', filename: 'logo.svg' }));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({
      ok: true,
      file: { name: 'logo.svg', path: `${API_BASE}/images/logo.svg` },
    });
    expect(authToken.getAccessToken()).toBe('fresh');
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const refreshCall = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(refreshCall[0]).toBe(`${API_BASE}/auth/refresh`);
    expect(refreshCall[1].method).toBe('POST');
    expect(requestInit(fetchMock, 2).headers).toBeInstanceOf(Headers);
    expect(authorization(requestInit(fetchMock, 2))).toBe('Bearer fresh');
  });

  it('still retries when the refresh response carries no access token', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({ url: '/images/logo.svg', filename: 'logo.svg' }));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result.ok).toBe(true);
    expect(authToken.getAccessToken()).toBe('stale');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('clears the token and reports permission-denied when the refresh fails', async () => {
    authToken.setAccessToken('stale');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('', { status: 500 }));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'permission-denied' });
    expect(authToken.getAccessToken()).toBeNull();
  });

  it('reports permission-denied when the refresh request throws', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockRejectedValueOnce(new Error('network down'));
    globalThis.fetch = asFetch(fetchMock);

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'permission-denied' });
  });

  it.each([
    [403, 'permission-denied'],
    [413, 'quota'],
    [400, 'security'],
    [422, 'write-failed'],
    [500, 'write-failed'],
  ] as const)('maps HTTP %s to %s', async (status, reason) => {
    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(new Response('', { status })));

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason });
  });

  it('reports write-failed when the payload has no url', async () => {
    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(jsonResponse({ filename: 'x.svg' })));

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'write-failed' });
  });

  it('reports write-failed when the request itself throws', async () => {
    globalThis.fetch = asFetch(vi.fn().mockRejectedValue(new Error('offline')));

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'write-failed' });
  });

  it('reports write-failed when the success body is not valid JSON', async () => {
    globalThis.fetch = asFetch(vi.fn().mockResolvedValue(new Response('<html>', { status: 200 })));

    const result = await uploadImage({ blob: svgFile(), name: 'logo.svg' });

    expect(result).toEqual({ ok: false, reason: 'write-failed' });
  });
});
