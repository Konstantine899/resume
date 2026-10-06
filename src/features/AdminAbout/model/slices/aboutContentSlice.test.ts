// Slice/selector tests (plan About CRUD §4: lazy hydration, full replace,
// reset→seed; §5: injection into storeReducers).

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AboutContent } from '@/entities/AboutContent';
import { storeReducers } from '@/storeReducers';
import { createAboutSeed } from '../services/seed';
import { resetToDefaults, updateAboutContent } from './aboutContentSlice';
import { selectAboutContent } from '../selectors';
import { ABOUT_CONTENT_STORAGE_KEY, persistAboutContent } from '../services/storage';

const SEED = createAboutSeed();

const CHANGED: AboutContent = {
  fullName: 'Другое Имя',
  descriptions: [
    { en: 'P1', ru: 'А1' },
    { en: 'P2', ru: 'А2' },
    { en: 'P3', ru: 'А3' },
  ],
  stats: {
    aboutStatYears: { en: 'y', ru: 'г' },
    aboutStatProjects: { en: 'p', ru: 'п' },
    aboutStatUsers: { en: 'u', ru: 'ю' },
    aboutStatRemote: { en: 'r', ru: 'у' },
  },
  ctaLabel: { en: 'Go', ru: 'Пойдём' },
};

const makeStore = () => configureStore({ reducer: storeReducers });

beforeEach(() => {
  localStorage.clear();
});

describe('storeReducers injection', () => {
  it('exposes the aboutContent slice under its plan key', () => {
    expect(storeReducers).toHaveProperty('aboutContent');
  });
});

describe('lazy hydration (first reducer call = configureStore)', () => {
  it('hydrates from a stored document', () => {
    persistAboutContent(CHANGED);
    const store = makeStore();
    expect(selectAboutContent(store.getState())).toEqual(CHANGED);
  });

  it('falls back to seed on an empty store', () => {
    const store = makeStore();
    expect(selectAboutContent(store.getState())).toEqual(SEED);
  });

  it('falls back to seed on corrupt storage (vitrina never crashes, §7)', () => {
    localStorage.setItem(ABOUT_CONTENT_STORAGE_KEY, '{broken');
    const store = makeStore();
    expect(selectAboutContent(store.getState())).toEqual(SEED);
  });
});

describe('reducers', () => {
  it('updateAboutContent replaces the WHOLE document (no merge, §4)', () => {
    const store = makeStore();
    store.dispatch(updateAboutContent(CHANGED));
    expect(selectAboutContent(store.getState())).toEqual(CHANGED);
  });

  it('resetToDefaults returns exactly the seed', () => {
    const store = makeStore();
    store.dispatch(updateAboutContent(CHANGED));
    store.dispatch(resetToDefaults());
    expect(selectAboutContent(store.getState())).toEqual(SEED);
  });

  it('state is immutable after dispatch (payload cannot be mutated from outside)', () => {
    const store = makeStore();
    const doc: AboutContent = JSON.parse(JSON.stringify(CHANGED));
    store.dispatch(updateAboutContent(doc));
    // RTK auto-freezes: the stored document (and the caller's object) is
    // read-only, so no later mutation can leak into the state.
    expect(() => {
      doc.fullName = 'mutated-later';
    }).toThrow();
    expect(selectAboutContent(store.getState()).fullName).toBe('Другое Имя');
  });
});

describe('selector', () => {
  it('reads the aboutContent key of the root state', () => {
    const store = makeStore();
    expect(selectAboutContent(store.getState())).toBe(store.getState().aboutContent);
  });
});
