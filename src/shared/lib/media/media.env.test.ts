import { describe, expect, it, vi } from 'vitest';

describe('shared/lib/media base resolution (env branches)', () => {
  it('honours an explicit VITE_MEDIA_BASE_URL override', async () => {
    await vi.resetModules();
    (import.meta.env as Record<string, unknown>).VITE_MEDIA_BASE_URL =
      'https://cdn.example.com/media';
    const m = await import('./media');
    expect(m.MEDIA_BASE).toBe('https://cdn.example.com/media');
    expect(m.mediaUrl('2f1c9a7e-4b3d-4c8f-9a1b-7d6e5f4a3b2c.webp')).toBe(
      'https://cdn.example.com/media/2f1c9a7e-4b3d-4c8f-9a1b-7d6e5f4a3b2c.webp'
    );
  });

  it('builds the base from VITE_API_BASE_URL when no override is set', async () => {
    await vi.resetModules();
    delete (import.meta.env as Record<string, unknown>).VITE_MEDIA_BASE_URL;
    (import.meta.env as Record<string, unknown>).VITE_API_BASE_URL = 'https://api.example.com/api';
    const m = await import('./media');
    expect(m.MEDIA_BASE).toBe('https://api.example.com/api/media');
  });

  it('falls back to localhost when neither env var is present', async () => {
    await vi.resetModules();
    delete (import.meta.env as Record<string, unknown>).VITE_MEDIA_BASE_URL;
    delete (import.meta.env as Record<string, unknown>).VITE_API_BASE_URL;
    const m = await import('./media');
    expect(m.MEDIA_BASE).toBe('http://localhost:3000/media');
  });
});
