// fieldSchemas tests (mywork-field-actions WU-2)
//
// RED→GREEN contract for the per-field slices shared by the full
// ProjectForm adapters and the field-scoped FieldEditForm (SPEC R-B5,
// D2-parity with AdminJobs job-field-edit). Every schema DELEGATES to
// ProjectFormSchema/ProjectFormDataSchema — no second source of limits.

import { describe, expect, it } from 'vitest';

import type { Project } from '@/entities/Project';
import {
  defaultValuesFor,
  fieldEditSchemas,
  metricFieldSchema,
  toUpdateDto,
  type EditProjectField,
} from './fieldSchemas';

const baseProject: Project = {
  id: 'p1',
  title: 'Dragonfly',
  description: { en: 'Shop', ru: 'Магазин' },
  techIcons: ['react', 'nextjs'],
  link: 'https://example.com',
  image: '/images/projects/dragonfly.png',
  category: 'ecommerce',
  status: 'completed',
  featured: true,
  role: { en: 'Lead', ru: 'Тимлид' },
  metrics: ['1M+ users', '99.9% uptime'],
  year: 2021,
};

describe('fieldEditSchemas — scalar slices delegate to the shared schema', () => {
  it('title: trim + min 2 (empty-ish fails, trimmed valid)', () => {
    expect(fieldEditSchemas.title.safeParse({ title: '  A  ' }).success).toBe(false);
    expect(fieldEditSchemas.title.safeParse({ title: '  Ab  ' }).success).toBe(true);
  });

  it('category/status: enum delegation rejects unknown members', () => {
    expect(fieldEditSchemas.category.safeParse({ category: 'ecommerce' }).success).toBe(true);
    expect(fieldEditSchemas.category.safeParse({ category: 'nope' }).success).toBe(false);
    expect(fieldEditSchemas.status.safeParse({ status: 'completed' }).success).toBe(true);
    expect(fieldEditSchemas.status.safeParse({ status: 'nope' }).success).toBe(false);
  });

  it('featured: boolean', () => {
    expect(fieldEditSchemas.featured.safeParse({ featured: false }).success).toBe(true);
    expect(fieldEditSchemas.featured.safeParse({ featured: 'yes' }).success).toBe(false);
  });

  it('link: DOM adapter — "" becomes null, https and /paths pass, unsafe schemes fail', () => {
    const empty = fieldEditSchemas.link.safeParse({ link: '' });
    expect(empty.success).toBe(true);
    expect(empty.success && empty.data).toEqual({ link: null });
    expect(fieldEditSchemas.link.safeParse({ link: 'https://example.com' }).success).toBe(true);
    expect(fieldEditSchemas.link.safeParse({ link: '/about' }).success).toBe(true);
    // Split so the no-script-url lint rule does not flag the fixture —
    // the schema must still REJECT the unsafe scheme at runtime.
    const unsafe = `java${'script:alert(1)'}`;
    expect(fieldEditSchemas.link.safeParse({ link: unsafe }).success).toBe(false);
  });

  it('year: DOM adapter — "" becomes undefined, numeric string parses, junk fails', () => {
    const empty = fieldEditSchemas.year.safeParse({ year: '' });
    expect(empty.success).toBe(true);
    expect(empty.success && empty.data).toEqual({ year: undefined });
    const set = fieldEditSchemas.year.safeParse({ year: '2021' });
    expect(set.success && set.data).toEqual({ year: 2021 });
    expect(fieldEditSchemas.year.safeParse({ year: 'abc' }).success).toBe(false);
  });

  it('role: both-blank -> undefined; one locale blank -> fail; both set -> trimmed', () => {
    const blank = fieldEditSchemas.role.safeParse({ role: { en: '  ', ru: '' } });
    expect(blank.success).toBe(true);
    expect(blank.success && blank.data).toEqual({ role: undefined });
    expect(fieldEditSchemas.role.safeParse({ role: { en: 'Lead', ru: '' } }).success).toBe(false);
    const set = fieldEditSchemas.role.safeParse({ role: { en: ' Lead ', ru: 'Тимлид' } });
    expect(set.success && set.data).toEqual({ role: { en: 'Lead', ru: 'Тимлид' } });
  });

  it('description: empty locale is a valid edit (rev.4 — clear parity)', () => {
    expect(
      fieldEditSchemas.description.safeParse({ description: { en: 'Shop', ru: 'Магазин' } }).success
    ).toBe(true);
    // rev.4: a single empty locale is the CLEAR value, not a violation.
    expect(
      fieldEditSchemas.description.safeParse({ description: { en: 'Shop', ru: '' } }).success
    ).toBe(true);
  });

  it('techIcons: enum keys enforced, empty array is a valid edit (rev.4)', () => {
    expect(fieldEditSchemas.techIcons.safeParse({ techIcons: ['react'] }).success).toBe(true);
    // rev.4: clearing the list is now a valid edit (metrics optional parity).
    expect(fieldEditSchemas.techIcons.safeParse({ techIcons: [] }).success).toBe(true);
    expect(fieldEditSchemas.techIcons.safeParse({ techIcons: ['nope'] }).success).toBe(false);
  });
});

describe('metricFieldSchema', () => {
  it('trimmed non-empty, max 40', () => {
    expect(metricFieldSchema.safeParse({ metric: '1M+ users' }).success).toBe(true);
    expect(metricFieldSchema.safeParse({ metric: '   ' }).success).toBe(false);
    expect(metricFieldSchema.safeParse({ metric: 'x'.repeat(41) }).success).toBe(false);
  });
});

describe('defaultValuesFor — record → RHF input forms', () => {
  it('scalar defaults mirror the record (year stringified, link/role empty-normalised)', () => {
    expect(defaultValuesFor('title', baseProject)).toEqual({ title: 'Dragonfly' });
    expect(defaultValuesFor('year', baseProject)).toEqual({ year: '2021' });
    expect(defaultValuesFor('link', baseProject)).toEqual({ link: 'https://example.com' });
    expect(defaultValuesFor('role', baseProject)).toEqual({ role: { en: 'Lead', ru: 'Тимлид' } });
    expect(defaultValuesFor('description', baseProject)).toEqual({
      description: { en: 'Shop', ru: 'Магазин' },
    });
  });

  it('year absent -> "", link null -> "", role absent -> blank locales', () => {
    const sparse: Project = { ...baseProject, year: undefined, link: null, role: undefined };
    expect(defaultValuesFor('year', sparse)).toEqual({ year: '' });
    expect(defaultValuesFor('link', sparse)).toEqual({ link: '' });
    expect(defaultValuesFor('role', sparse)).toEqual({ role: { en: '', ru: '' } });
  });

  it('metric-N reads the indexed entry (missing -> "")', () => {
    expect(defaultValuesFor('metric-1', baseProject)).toEqual({ metric: '99.9% uptime' });
    expect(defaultValuesFor('metric-5', baseProject)).toEqual({ metric: '' });
  });
});

describe('toUpdateDto — resolver output → ONE-field partial patch', () => {
  it('scalar partials carry exactly the edited key', () => {
    expect(toUpdateDto('title', { title: 'Dragonfly 2' }, baseProject)).toEqual({
      title: 'Dragonfly 2',
    });
    expect(toUpdateDto('link', { link: null }, baseProject)).toEqual({ link: null });
    expect(toUpdateDto('year', { year: undefined }, baseProject)).toEqual({ year: undefined });
  });

  it('metric-N splices the indexed entry into the existing array', () => {
    expect(toUpdateDto('metric-0', { metric: '2M+ users' }, baseProject)).toEqual({
      metrics: ['2M+ users', '99.9% uptime'],
    });
    expect(toUpdateDto('metric-1', { metric: 'Zero downtime' }, baseProject)).toEqual({
      metrics: ['1M+ users', 'Zero downtime'],
    });
  });

  it('metric-N on a record without metrics starts the array', () => {
    const sparse: Project = { ...baseProject, metrics: undefined };
    expect(toUpdateDto('metric-0', { metric: 'First' }, sparse)).toEqual({ metrics: ['First'] });
  });
});

describe('EditProjectField union', () => {
  it('scalar keys are members (runtime presence in the schemas record)', () => {
    const scalarKeys: EditProjectField[] = [
      'title',
      'category',
      'status',
      'featured',
      'year',
      'link',
      'description',
      'role',
      'techIcons',
    ];
    for (const key of scalarKeys) {
      expect(fieldEditSchemas).toHaveProperty(key);
    }
  });
});
