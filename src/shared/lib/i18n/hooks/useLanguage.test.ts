import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLanguage } from './useLanguage';

const changeLanguage = vi.fn();
const t = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en', changeLanguage },
    t,
  }),
}));

describe('useLanguage', () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('normalizes the active language to en/ru', () => {
    const { result } = renderHook(() => useLanguage());
    expect(['en', 'ru']).toContain(result.current.language);
  });

  it('setLanguage switches language and persists it to localStorage', async () => {
    const { result } = renderHook(() => useLanguage());
    // The ru bundle is lazy: setLanguage awaits loadRu() before the switch
    // (no flash of en copy), so the changeLanguage call lands a microtask
    // later — await inside act.
    await act(async () => {
      result.current.setLanguage('ru');
    });
    expect(changeLanguage).toHaveBeenCalledWith('ru');
    expect(localStorage.getItem('language')).toBe('ru');
  });

  it('toggleLanguage flips between en and ru', async () => {
    const { result } = renderHook(() => useLanguage());
    await act(async () => {
      result.current.toggleLanguage();
    });
    expect(changeLanguage).toHaveBeenCalled();
  });

  it('exposes t and a static isTransitioning flag', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.t).toBe(t);
    expect(result.current.isTransitioning).toBe(false);
  });
});
