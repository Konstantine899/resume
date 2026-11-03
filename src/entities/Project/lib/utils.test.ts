import { describe, expect, it } from 'vitest';
import {
  applyProjectFilters,
  filterProjectsByCategory,
  filterProjectsByStatus,
  getAllProjects,
  getFeaturedProjects,
  searchProjects,
} from './utils';
import { PROJECTS } from '../model/constants/constants';
import type { Project } from '../model/types/types';

const makeProject = (partial: Pick<Project, 'id' | 'title'> & Partial<Project>): Project => ({
  description: { en: '', ru: '' },
  techIcons: [],
  link: null,
  image: '',
  featured: false,
  ...partial,
});

const REACT_SHOP = makeProject({
  id: 'p1',
  title: 'React Shop',
  description: { en: 'Storefront with cart', ru: 'Магазин с корзиной' },
  category: 'ecommerce',
  status: 'completed',
  featured: true,
});

const NEXT_DASHBOARD = makeProject({
  id: 'p2',
  title: 'Next Dashboard',
  description: { en: 'Analytics panel', ru: 'Панель аналитики' },
  category: 'dashboard',
  status: 'in-progress',
});

const LEGACY_API = makeProject({
  id: 'p3',
  title: 'Legacy API',
  description: { en: 'React bridge for old services', ru: 'Мост для старых сервисов' },
  category: 'api',
});

const PROJECTS_FIXTURE = [REACT_SHOP, NEXT_DASHBOARD, LEGACY_API];

describe('entities/Project filter utils', () => {
  it('filters by category', () => {
    expect(filterProjectsByCategory(PROJECTS_FIXTURE, 'dashboard')).toEqual([NEXT_DASHBOARD]);
  });

  it('filters by status and drops records without one', () => {
    expect(filterProjectsByStatus(PROJECTS_FIXTURE, 'completed')).toEqual([REACT_SHOP]);
    expect(filterProjectsByStatus(PROJECTS_FIXTURE, 'archived')).toEqual([]);
  });

  it('keeps only featured projects', () => {
    expect(getFeaturedProjects(PROJECTS_FIXTURE)).toEqual([REACT_SHOP]);
  });

  it('searches titles case-insensitively', () => {
    expect(searchProjects(PROJECTS_FIXTURE, 'react')).toEqual([REACT_SHOP, LEGACY_API]);
  });

  it('falls back to the English description when the title does not match', () => {
    expect(searchProjects(PROJECTS_FIXTURE, 'analytics')).toEqual([NEXT_DASHBOARD]);
  });

  it('searches the requested locale', () => {
    expect(searchProjects(PROJECTS_FIXTURE, 'корзин', 'ru')).toEqual([REACT_SHOP]);
    expect(searchProjects(PROJECTS_FIXTURE, 'панель', 'ru')).toEqual([NEXT_DASHBOARD]);
  });

  it('applies every filter in sequence', () => {
    expect(
      applyProjectFilters(PROJECTS_FIXTURE, {
        category: 'ecommerce',
        status: 'completed',
        featured: true,
        search: 'react',
      })
    ).toEqual([REACT_SHOP]);
  });

  it('applies a single filter without touching the rest', () => {
    expect(applyProjectFilters(PROJECTS_FIXTURE, { category: 'api' })).toEqual([LEGACY_API]);
    expect(applyProjectFilters(PROJECTS_FIXTURE, { status: 'in-progress' })).toEqual([
      NEXT_DASHBOARD,
    ]);
    expect(applyProjectFilters(PROJECTS_FIXTURE, { featured: true })).toEqual([REACT_SHOP]);
    expect(applyProjectFilters(PROJECTS_FIXTURE, { search: 'legacy' })).toEqual([LEGACY_API]);
  });

  it('returns a copy when no filters are set', () => {
    const result = applyProjectFilters(PROJECTS_FIXTURE, {});

    expect(result).toEqual(PROJECTS_FIXTURE);
    expect(result).not.toBe(PROJECTS_FIXTURE);
  });

  it('exposes the seed collection', () => {
    expect(getAllProjects()).toBe(PROJECTS);
  });
});
