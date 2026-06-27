import { describe, it, expect } from 'vitest';
import { preloadImage, preloadImages } from './preloadImage';

describe('preloadImage', () => {
  it('returns a promise', () => {
    const promise = preloadImage('/test.jpg');
    expect(promise).toBeInstanceOf(Promise);
  });

  it('handles valid image URL', () => {
    const promise = preloadImage('/avatar.jpg');
    expect(promise).toBeInstanceOf(Promise);
  });

  it('handles empty string', () => {
    const promise = preloadImage('');
    expect(promise).toBeInstanceOf(Promise);
  });
});

describe('preloadImages', () => {
  it('returns a promise', () => {
    const promise = preloadImages(['/img1.jpg', '/img2.jpg']);
    expect(promise).toBeInstanceOf(Promise);
  });

  it('handles empty array', async () => {
    const results = await preloadImages([]);
    expect(results).toEqual([]);
  });

  it('handles single image', () => {
    const promise = preloadImages(['/single.jpg']);
    expect(promise).toBeInstanceOf(Promise);
  });
});
