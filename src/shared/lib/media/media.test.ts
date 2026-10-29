import { describe, expect, it } from 'vitest';

import { mediaSrcSet, mediaUrl, isMediaKey } from './media';
import { MEDIA_BASE } from './media';

const UUID = '2f1c9a7e-4b3d-4c8f-9a1b-7d6e5f4a3b2c';

describe('shared/lib/media resolver', () => {
  it('resolves keys through the shared base URL', () => {
    const key = `${UUID}.webp`;
    expect(mediaUrl(key)).toBe(`${MEDIA_BASE}/${key}`);
  });

  it('leaves legacy paths and urls unchanged', () => {
    expect(mediaUrl('/images/foo.webp')).toBe('/images/foo.webp');
    expect(mediaUrl('https://cdn.example.com/a.svg')).toBe('https://cdn.example.com/a.svg');
    expect(mediaUrl('/api/images/legacy.png')).toBe('/api/images/legacy.png');
  });

  it('collapses empties to an empty string', () => {
    expect(mediaUrl('')).toBe('');
    expect(mediaUrl(undefined)).toBe('');
    expect(mediaUrl('   ')).toBe('');
  });

  it('passes through unknown non-key values', () => {
    expect(mediaUrl('not-a-key')).toBe('not-a-key');
  });

  it('recognizes base and variant keys', () => {
    expect(isMediaKey(`${UUID}.webp`)).toBe(true);
    expect(isMediaKey(`${UUID}-640.webp`)).toBe(true);
    expect(isMediaKey(`${UUID}.png`)).toBe(true);
    expect(isMediaKey(`https://example/a.png`)).toBe(false);
    expect(isMediaKey(`../x.webp`)).toBe(false);
  });

  it('builds a 3-step srcset only for base keys', () => {
    const base = `${UUID}.webp`;
    expect(mediaSrcSet(base)).toBe(
      `${MEDIA_BASE}/${UUID}-320.webp 320w, ${MEDIA_BASE}/${UUID}-640.webp 640w, ${MEDIA_BASE}/${UUID}-960.webp 960w`
    );
    expect(mediaSrcSet(`${UUID}-640.webp`)).toBeUndefined();
    expect(mediaSrcSet('/images/foo.webp')).toBeUndefined();
  });
});

describe('media remaining branches', () => {
  it('keeps http redirects/resolved urls unchanged', () => {
    expect(mediaUrl('http://localhost:3000/media/foo.webp')).toBe(
      'http://localhost:3000/media/foo.webp'
    );
    expect(mediaUrl('https://cdn.example.com/foo.webp')).toBe('https://cdn.example.com/foo.webp');
  });
});
