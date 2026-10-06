// Slice/selector tests (plan_projects_crud §4: lazy hydration, collection
// CRUD, persist-first helpers; §5: injection into storeReducers).

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProjectSchema, type Project, type ProjectFormData } from '@/entities/Project';
import { storeReducers } from '@/storeReducers';
import {
  addProject,
  deleteProject,
  makeProjectRecord,
  makeUpdatePatch,
  resetToDefaults,
  updateProject,
} from './myWorkSlice';
import { selectAllProjects, selectFeaturedProjects, selectProjectById } from './selectors';
import { createProjectsSeed } from './seed';
import { persistProjects } from './storage';

const SEED = createProjectsSeed();

const FORM_DATA: ProjectFormData = {
  title: 'New Project',
  description: { en: 'A brand new project.', ru: 'Совершенно новый проект.' },
  techIcons: ['react', 'css'],
  link: null,
  image: 'https://x.com/img.png',
  category: 'other',
  status: 'in-progress',
  featured: false,
};

const PATCH_AT = '2026-10-06T00:00:00.000Z';

const makeStore = () => configureStore({ reducer: storeReducers });

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('storeReducers injection', () => {
  it('exposes the myWork slice under its plan key', () => {
    expect(storeReducers).toHaveProperty('myWork');
  });
});

describe('lazy hydration (first reducer call = configureStore)', () => {
  it('hydrates from a stored envelope', () => {
    const stored = createProjectsSeed();
    stored.push(makeProjectRecord(FORM_DATA));
    expect(persistProjects(stored)).toBe(true);

    const store = makeStore();
    expect(selectAllProjects(store.getState())).toHaveLength(SEED.length + 1);
  });

  it('falls back to seed on an empty store', () => {
    const store = makeStore();
    expect(selectAllProjects(store.getState())).toEqual(SEED);
  });

  it('falls back to seed on corrupt storage (vitrina never crashes, §7)', () => {
    localStorage.setItem('resume.projects', '{broken');
    const store = makeStore();
    expect(selectAllProjects(store.getState())).toEqual(SEED);
  });
});

describe('makeProjectRecord / makeUpdatePatch (persist-first consistency, §3)', () => {
  it('generates a unique id and identical createdAt/updatedAt ISO stamps', () => {
    const a = makeProjectRecord(FORM_DATA);
    const b = makeProjectRecord(FORM_DATA);

    expect(a.id).not.toBe(b.id);
    expect(a.createdAt).toBe(a.updatedAt);
    expect(a.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(ProjectSchema.safeParse(a).success).toBe(true);
  });

  it('makeUpdatePatch keeps every form field and stamps updatedAt', () => {
    const patch = makeUpdatePatch(FORM_DATA);

    expect(patch.title).toBe(FORM_DATA.title);
    expect(patch.techIcons).toEqual(['react', 'css']);
    expect(patch.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('reducers', () => {
  it('addProject appends the record verbatim (id/stamps come from the helper)', () => {
    const store = makeStore();
    const record = makeProjectRecord(FORM_DATA);

    store.dispatch(addProject(record));

    const all = selectAllProjects(store.getState());
    expect(all).toHaveLength(SEED.length + 1);
    expect(all[all.length - 1]).toEqual(record);
  });

  it('updateProject merges the patch and preserves id/createdAt', () => {
    const store = makeStore();
    const before = selectProjectById(store.getState(), '1');
    expect(before).toBeDefined();

    store.dispatch(updateProject({ id: '1', patch: { ...FORM_DATA, updatedAt: PATCH_AT } }));

    const after = selectProjectById(store.getState(), '1');
    expect(after?.title).toBe(FORM_DATA.title);
    expect(after?.createdAt).toBe(before?.createdAt);
    expect(after?.updatedAt).toBe(PATCH_AT);
  });

  it('updateProject is a no-op for an unknown id', () => {
    const store = makeStore();
    const before = selectAllProjects(store.getState());

    store.dispatch(updateProject({ id: 'ghost', patch: { ...FORM_DATA, updatedAt: PATCH_AT } }));

    expect(selectAllProjects(store.getState())).toEqual(before);
  });

  it('deleteProject removes only the target; an unknown id is a no-op', () => {
    const store = makeStore();

    store.dispatch(deleteProject('4'));
    expect(selectAllProjects(store.getState())).toHaveLength(SEED.length - 1);
    expect(selectProjectById(store.getState(), '4')).toBeUndefined();

    store.dispatch(deleteProject('ghost'));
    expect(selectAllProjects(store.getState())).toHaveLength(SEED.length - 1);
  });

  it('resetToDefaults returns exactly the seed', () => {
    const store = makeStore();
    store.dispatch(addProject(makeProjectRecord(FORM_DATA)));

    store.dispatch(resetToDefaults());

    expect(selectAllProjects(store.getState())).toEqual(SEED);
  });
});

describe('selectors', () => {
  it('selectAllProjects reads the myWork key of the root state', () => {
    const store = makeStore();
    expect(selectAllProjects(store.getState())).toBe(store.getState().myWork);
  });

  it('selectFeaturedProjects returns only featured records (4 of the seed)', () => {
    const store = makeStore();
    const featured = selectFeaturedProjects(store.getState());

    expect(featured).toHaveLength(4);
    expect(featured.every((project: Project) => project.featured)).toBe(true);
  });

  it('selectProjectById finds and misses', () => {
    const store = makeStore();

    expect(selectProjectById(store.getState(), '1')?.title).toBe('Dragonfly');
    expect(selectProjectById(store.getState(), 'nope')).toBeUndefined();
  });
});
