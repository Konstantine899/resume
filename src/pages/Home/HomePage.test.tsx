import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreProvider } from '@/app/providers';
import { About } from '@/features/About';
import { createAboutSeed, persistAboutContent, removeAboutContent } from '@/features/AdminAbout';
import { storeReducers } from '@/storeReducers';
import { HomePage } from './HomePage';
import styles from './HomePage.module.scss';

// Heavy composed features/widgets are out of scope for this integration test —
// we exercise the HomePage skip link only. About is captured as a spy so the
// WU-2 wiring test can assert the content prop it receives from the store.
vi.mock('@/features/About', () => ({ About: vi.fn(() => null) }));
vi.mock('@/features/Contact', () => ({ Contact: () => null }));
vi.mock('@/features/MyWork', () => ({ MyWork: () => null }));
vi.mock('@/features/Skills', () => ({ Skills: () => null }));
vi.mock('@/features/WorkHistory', () => ({ WorkHistory: () => null }));
// The Nav right-side switches (T4) are provider-dependent slices out of this
// skip-link test's scope — same null-mock style as the features above.
vi.mock('@/features/LanguageSwitch', () => ({ LanguageSwitch: () => null }));
vi.mock('@/features/ThemeSwitch', () => ({ ThemeSwitch: () => null }));

// HomePage reads the AboutContent slice (WU-2) — every render needs the
// store, same shape App.tsx injects (AppRouter.test pattern).
const renderHome = (ui: ReactElement) => (
  <StoreProvider reducers={storeReducers}>{ui}</StoreProvider>
);

describe('HomePage: skip-link integration (R3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a skip link with href="#main-content"', () => {
    render(renderHome(<HomePage />));

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    expect(skip).toHaveAttribute('href', '#main-content');
  });

  it('is keyboard-focusable', () => {
    render(renderHome(<HomePage />));

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    skip.focus();
    expect(document.activeElement).toBe(skip);
  });

  it('carries the hidden-until-focus off-screen class (R3/fix 6)', () => {
    render(renderHome(<HomePage />));

    const skip = screen.getByRole('link', { name: /skip to main content/i });
    // jsdom does not apply the SCSS module; the class carries `left:-9999px`
    // until `:focus` — guards against the cascade being dropped on migration.
    expect(skip.className).toContain(styles.skipToMain);
  });
});

// WU-2 (plan About CRUD §10): HomePage reads the AboutContent slice and
// passes it down — the vitrina itself stays store-free (Design C).
describe('HomePage: About content wiring (WU-2)', () => {
  afterEach(() => {
    removeAboutContent();
    vi.clearAllMocks();
  });

  it('passes the persisted About content from the store into About', () => {
    const seeded = createAboutSeed();
    seeded.fullName = 'WU2 Store Name';
    persistAboutContent(seeded);
    vi.mocked(About).mockClear(); // drop calls from the skip-link tests above

    render(renderHome(<HomePage />));

    const calls = vi.mocked(About).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]?.[0]?.content?.fullName).toBe('WU2 Store Name');
  });

  it('falls back to the seed when localStorage is empty', () => {
    vi.mocked(About).mockClear(); // drop calls from the skip-link tests above

    render(renderHome(<HomePage />));

    const calls = vi.mocked(About).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]?.[0]?.content?.fullName).toBe(createAboutSeed().fullName);
  });
});
