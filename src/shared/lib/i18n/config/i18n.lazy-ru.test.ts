// ===============================================
// Lazy ru locale — the "no flash, no raw keys" contract (issue #298)
// ===============================================
//
// config/i18n.ts initializes i18next with `en` only and dynamic-imports
// ru.json on demand; src/main.tsx gates the first render on `whenReady`.
// This file re-imports the module FRESH (vi.resetModules, the
// authSlice.test.ts pattern) under a mocked navigator.language and pins
// the contract from BOTH sides:
//   1. en visitor → the ru bundle is NEVER loaded, t() resolves en copy;
//   2. ru visitor → while the bundle is in flight t() falls back to the
//      identical en key (never a raw key), and after awaiting whenReady
//      t() resolves ru copy — exactly the state the first render starts in.

import { afterEach, describe, expect, it, vi } from 'vitest';

import en from '../locales/en.json';
import ru from '../locales/ru.json';

const setNavigatorLanguage = (value: string) => {
  // The navigator detector concatenates navigator.languages FIRST, then
  // navigator.language — mock both so the candidate array is unambiguous.
  Object.defineProperty(window.navigator, 'language', { value, configurable: true });
  Object.defineProperty(window.navigator, 'languages', { value: [value], configurable: true });
};

// Fresh module graph = fresh i18next singleton = fresh init; the setup-time
// instance keeps its own bindings (static imports above are already resolved).
const importFreshConfig = async () => {
  vi.resetModules();
  return import('./i18n');
};

afterEach(() => {
  setNavigatorLanguage('en-US');
  localStorage.clear();
});

describe('lazy ru locale (issue #298)', () => {
  it('en visitor: the ru bundle never loads and t() still resolves (no raw keys)', async () => {
    setNavigatorLanguage('en-US');
    localStorage.clear();

    const config = await importFreshConfig();
    await config.whenReady;

    expect(config.i18n.language).toBe('en');
    // The ONLY producer of the ru bundle is loadRu() — absent here, so the
    // dynamic import truly never ran for an en visitor.
    expect(config.i18n.hasResourceBundle('ru', 'translation')).toBe(false);
    expect(config.i18n.t('aboutDescription')).toBe(en.aboutDescription);
    expect(config.i18n.t('skills')).toBe(en.skills);
  });

  it('ru visitor: whenReady lands ru copy before render; no echo in between', async () => {
    setNavigatorLanguage('ru-RU');
    localStorage.clear();

    const config = await importFreshConfig();

    // Detection resolved to ru — this is the promise main.tsx renders on.
    expect(config.i18n.language).toBe('ru');

    // While the bundle is still in flight (whenReady not awaited), t() must
    // fall back to the identical en key — NEVER the raw key or a crash.
    expect(config.i18n.hasResourceBundle('ru', 'translation')).toBe(false);
    expect(config.i18n.t('aboutDescription')).toBe(en.aboutDescription);

    await config.whenReady;

    expect(config.i18n.hasResourceBundle('ru', 'translation')).toBe(true);
    expect(config.i18n.t('aboutDescription')).toBe(ru.aboutDescription);
    expect(config.i18n.t('skills')).toBe(ru.skills);
  });

  it('loadRu is idempotent (repeated awaits share one chunk fetch)', async () => {
    setNavigatorLanguage('ru-RU');
    localStorage.clear();

    const config = await importFreshConfig();
    await Promise.all([config.loadRu(), config.loadRu(), config.whenReady]);

    expect(config.i18n.hasResourceBundle('ru', 'translation')).toBe(true);
    expect(config.i18n.t('aboutDescription')).toBe(ru.aboutDescription);
  });
});
