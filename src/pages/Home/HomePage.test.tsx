import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StoreProvider } from '@/app/providers';
import { SKILLS_DATA } from '@/entities/Skill';
import { getFeaturedProjects, PROJECTS } from '@/entities/Project';
import { About } from '@/features/About';
import { Contact } from '@/features/Contact';
import { createAboutSeed, persistAboutContent, removeAboutContent } from '@/features/AdminAbout';
import {
  createContactSeed,
  persistContactContent,
  removeContactContent,
} from '@/features/AdminContact';
import { removeProjects } from '@/features/AdminMyWork';
import { persistSkills, removeSkills } from '@/features/AdminSkills';
import { MyWork } from '@/features/MyWork';
import { Skills } from '@/features/Skills';
import { WorkHistory } from '@/features/WorkHistory';
import { storeReducers } from '@/storeReducers';
import { HomePage } from './HomePage';
import styles from './HomePage.module.scss';

// Heavy composed features/widgets are out of scope for this integration test —
// we exercise the HomePage skip link only. About/Contact are captured as
// spies so the WU-2 wiring tests can assert the content props they receive
// from the store. MyWork is a spy too (WU-3 wiring test below), Skills the
// same for WU-4.
vi.mock('@/features/About', () => ({ About: vi.fn(() => null) }));
vi.mock('@/features/Contact', () => ({ Contact: vi.fn(() => null) }));
vi.mock('@/features/MyWork', () => ({ MyWork: vi.fn(() => null) }));
vi.mock('@/features/Skills', () => ({ Skills: vi.fn(() => null) }));
vi.mock('@/features/WorkHistory', () => ({ WorkHistory: vi.fn(() => null) }));
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

// Contact CRUD stage-1 (plan_contact_crud §10 WU-4): the same wiring for
// the Contact vitrina — store → prop, the vitrina itself stays store-free.
describe('HomePage: Contact content wiring (WU-4)', () => {
  afterEach(() => {
    removeContactContent();
    vi.clearAllMocks();
  });

  it('passes the persisted Contact content from the store into Contact', () => {
    const seeded = createContactSeed();
    seeded.email = 'wired@example.com';
    persistContactContent(seeded);
    vi.mocked(Contact).mockClear(); // drop calls from the tests above

    render(renderHome(<HomePage />));

    const calls = vi.mocked(Contact).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]?.[0]?.content?.email).toBe('wired@example.com');
  });

  it('falls back to the seed when localStorage is empty', () => {
    vi.mocked(Contact).mockClear();

    render(renderHome(<HomePage />));

    const calls = vi.mocked(Contact).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]?.[0]?.content?.email).toBe(createContactSeed().email);
  });
});

// Projects CRUD WU-3 (plan §11, case 5): Design C — pages/Home is the only
// layer that reads the myWork slice, the vitrina receives the featured
// projects as a prop and stays store-free (its 3 bare renders stay green).
describe('HomePage: MyWork content wiring (WU-3)', () => {
  afterEach(() => {
    removeProjects();
    vi.clearAllMocks();
  });

  it('passes selectFeaturedProjects from the store into MyWork', () => {
    vi.mocked(MyWork).mockClear();

    render(renderHome(<HomePage />));

    const calls = vi.mocked(MyWork).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const content = calls[0]?.[0]?.content;
    expect(content).toHaveLength(4);
    expect(content?.map((project) => project.title)).toEqual(
      getFeaturedProjects(PROJECTS).map((project) => project.title)
    );
  });
});

// Skills CRUD WU-4 (plan_skills_crud §12 WU-4): Design C — pages/Home reads
// the adminSkills slice and hands it to the vitrina as `content`; the vitrina
// itself keeps no react-redux import (R-5 hook-free guard).
describe('HomePage: Skills content wiring (WU-4)', () => {
  afterEach(() => {
    removeSkills();
    vi.clearAllMocks();
  });

  it('passes the persisted Skills data from the store into Skills', () => {
    persistSkills([
      {
        category: 'frontend',
        categoryName: 'WU4 Frontend',
        technologies: [{ name: 'React', iconSvg: '/icons/react.svg' }],
      },
    ]);
    vi.mocked(Skills).mockClear(); // drop calls from the tests above

    render(renderHome(<HomePage />));

    const calls = vi.mocked(Skills).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0]?.[0]?.content?.[0]?.categoryName).toBe('WU4 Frontend');
  });

  it('falls back to the seed when localStorage is empty', () => {
    removeSkills();
    vi.mocked(Skills).mockClear();

    render(renderHome(<HomePage />));

    const calls = vi.mocked(Skills).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const content = calls[0]?.[0]?.content;
    expect(content?.length).toBeGreaterThan(0);
    expect(content?.[0]?.categoryName).toBe(SKILLS_DATA[0]?.categoryName);
  });
});

// WU-1 (plan_workhistory_crud §8): recruiter-audit order — About → Skills →
// MyWork → WorkHistory → Contact. Assertion via React render (invocation)
// order of the feature spies; mockClear keeps invocationCallOrder history,
// so read the index of the LAST call per spy.
describe('HomePage: recruiter section order (§8)', () => {
  it('renders the five content blocks in the canonical order', () => {
    render(renderHome(<HomePage />));

    const lastCallOrder = (mock: { mock: { calls: unknown[]; invocationCallOrder: number[] } }) =>
      mock.mock.invocationCallOrder[mock.mock.calls.length - 1] as number;

    const order = [
      lastCallOrder(vi.mocked(About)),
      lastCallOrder(vi.mocked(Skills)),
      lastCallOrder(vi.mocked(MyWork)),
      lastCallOrder(vi.mocked(WorkHistory)),
      lastCallOrder(vi.mocked(Contact)),
    ];

    // strictly increasing → rendered in JSX order
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(new Set(order).size).toBe(5);
  });
});
