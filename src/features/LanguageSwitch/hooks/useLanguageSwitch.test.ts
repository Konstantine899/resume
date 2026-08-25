import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLanguageSwitch } from './useLanguageSwitch';

const setLanguage = vi.fn();
const toggleLanguage = vi.fn();

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage,
    toggleLanguage,
    t: (key: string) => key,
    isTransitioning: false,
  }),
}));

describe('useLanguageSwitch', () => {
  it('wraps the shared language API with feature-specific logic', () => {
    const { result } = renderHook(() => useLanguageSwitch());
    expect(result.current.language).toBe('en');
    expect(result.current.setLanguage).toBe(setLanguage);
    expect(result.current.toggleLanguage).toBe(toggleLanguage);
    expect(result.current.isTransitioning).toBe(false);
  });
});
