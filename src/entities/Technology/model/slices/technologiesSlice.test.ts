// Slice/selector tests (technologies-crud SPEC D4/D5: lazy hydration,
// catalog CRUD, storeReducers injection, seed-fallback selectors).

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { storeReducers } from '@/storeReducers';
import { TECHNOLOGIES_SEED, seedTechnologies } from '../constants/constants';
import { persistTechnologies } from '../services/storage';
import type { Technology } from '../types/types';
import { addTechnology, removeTechnology, updateTechnology } from './technologiesSlice';
import { selectAllTechnologies, selectTechnologyKeys } from '../selectors/selectors';

const SEED = seedTechnologies();

const NEW_TECH: Technology = {
  key: 'vue',
  url: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
};

const makeStore = () => configureStore({ reducer: storeReducers });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('storeReducers injection', () => {
  it('exposes the technologies slice under its plan key', () => {
    expect(storeReducers).toHaveProperty('technologies');
  });
});

describe('lazy hydration (first reducer call = configureStore)', () => {
  it('hydrates from a stored envelope', () => {
    const stored = [...seedTechnologies(), NEW_TECH];
    expect(persistTechnologies(stored)).toBe(true);

    const store = makeStore();
    expect(selectAllTechnologies(store.getState())).toHaveLength(SEED.length + 1);
  });

  it('falls back to seed on an empty store', () => {
    const store = makeStore();
    expect(selectAllTechnologies(store.getState())).toEqual(SEED);
  });

  it('falls back to seed on corrupt storage (vitrina never crashes)', () => {
    localStorage.setItem('technologies', '{broken');
    const store = makeStore();
    expect(selectAllTechnologies(store.getState())).toEqual(SEED);
  });
});

describe('reducers', () => {
  it('addTechnology appends the record verbatim', () => {
    const store = makeStore();

    store.dispatch(addTechnology(NEW_TECH));

    const all = selectAllTechnologies(store.getState());
    expect(all).toHaveLength(SEED.length + 1);
    expect(all[all.length - 1]).toEqual(NEW_TECH);
  });

  it('updateTechnology merges the patch and preserves the key', () => {
    const store = makeStore();

    store.dispatch(
      updateTechnology({
        key: 'react',
        patch: { url: 'https://cdn.example.com/react.svg', invertInDark: false },
      })
    );

    const updated = selectAllTechnologies(store.getState()).find((t) => t.key === 'react');
    expect(updated?.url).toBe('https://cdn.example.com/react.svg');
    expect(updated?.invertInDark).toBe(false);
  });

  it('updateTechnology is a no-op for an unknown key', () => {
    const store = makeStore();
    const before = selectAllTechnologies(store.getState());

    store.dispatch(
      updateTechnology({ key: 'ghost', patch: { url: 'https://cdn.example.com/x.svg' } })
    );

    expect(selectAllTechnologies(store.getState())).toEqual(before);
  });

  it('removeTechnology removes only the target; an unknown key is a no-op', () => {
    const store = makeStore();

    store.dispatch(removeTechnology('react'));
    expect(selectAllTechnologies(store.getState())).toHaveLength(SEED.length - 1);
    expect(selectAllTechnologies(store.getState()).find((t) => t.key === 'react')).toBeUndefined();

    store.dispatch(removeTechnology('ghost'));
    expect(selectAllTechnologies(store.getState())).toHaveLength(SEED.length - 1);
  });
});

describe('selectors (D4 seed fallback)', () => {
  it('selectAllTechnologies reads the technologies key of the root state', () => {
    const store = makeStore();
    expect(selectAllTechnologies(store.getState())).toBe(store.getState().technologies);
  });

  it('falls back to the seed when the slice is absent from state (bare tests / Storybook)', () => {
    expect(selectAllTechnologies({})).toEqual(TECHNOLOGIES_SEED);
  });

  it('selectTechnologyKeys returns keys in catalog order', () => {
    const store = makeStore();
    expect(selectTechnologyKeys(store.getState())).toEqual(TECHNOLOGIES_SEED.map((t) => t.key));
  });

  it('selectTechnologyKeys never throws without the slice', () => {
    expect(selectTechnologyKeys({})).toEqual(TECHNOLOGIES_SEED.map((t) => t.key));
  });
});
