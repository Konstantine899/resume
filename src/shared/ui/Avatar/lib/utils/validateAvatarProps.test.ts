import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { validateAvatarProps } from './validateAvatarProps';

describe('validateAvatarProps', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  beforeAll(() => {
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    warn.mockClear();
  });

  afterAll(() => {
    vi.unstubAllEnvs();
    warn.mockRestore();
  });

  it('warns on invalid size', () => {
    validateAvatarProps({ size: 'xxl' } as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('invalid size'));
  });

  it('warns on invalid variant', () => {
    validateAvatarProps({ variant: 'triangle' } as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('invalid variant'));
  });

  it('warns on missing/empty alt', () => {
    validateAvatarProps({ alt: '' } as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('alt'));
  });

  it('warns on an invalid fallback type (boolean)', () => {
    validateAvatarProps({ fallback: true } as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('fallback'));
  });

  it('warns when showSkeleton is false but forceLoading is true', () => {
    validateAvatarProps({ showSkeleton: false, forceLoading: true } as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('showSkeleton'));
  });

  it('warns when glow/ring effects are used without heroStyle', () => {
    validateAvatarProps({ showGlow: true } as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('heroStyle'));
  });

  it('does not warn for valid props', () => {
    validateAvatarProps({ alt: 'Konstantin', size: 'md', variant: 'circle' } as never);
    expect(warn).not.toHaveBeenCalled();
  });
});
