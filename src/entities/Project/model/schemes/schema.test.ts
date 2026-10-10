// Schema tests (TDD red → green, plan_projects_crud §5 + §7).
// Expected values are independent literals — never recomputed the way
// the implementation computes them.

import { describe, expect, it } from 'vitest';

import { PROJECTS } from '../constants/constants';
import type { Project } from '../types/types';
import { ProjectFormDataSchema, ProjectSchema, ProjectsEnvelopeSchema } from './schema';

const VALID: Project = {
  id: 'p-1',
  title: 'Dragonfly',
  description: { en: 'An ecommerce platform.', ru: 'Интернет-платформа.' },
  techIcons: ['react', 'nextjs'],
  link: 'https://dragonflyprocessing.com',
  image: '/images/projects/dragonfly.webp',
  category: 'ecommerce',
  status: 'completed',
  featured: true,
  role: { en: 'Frontend Developer', ru: 'Фронтенд-разработчик' },
  metrics: ['1M+ users'],
  year: 2023,
  createdAt: '2023-06-15T00:00:00.000Z',
  updatedAt: '2024-01-10T00:00:00.000Z',
};

const FORM_DATA = {
  title: VALID.title,
  description: VALID.description,
  techIcons: VALID.techIcons,
  link: VALID.link,
  image: VALID.image,
  category: VALID.category,
  status: VALID.status,
  featured: VALID.featured,
  role: VALID.role,
  metrics: VALID.metrics,
  year: VALID.year,
};

describe('ProjectSchema', () => {
  it('accepts a valid record', () => {
    expect(ProjectSchema.safeParse(VALID).success).toBe(true);
  });

  it('output is assignable to Project (contract compatibility)', () => {
    const parsed = ProjectSchema.parse(VALID);
    const typed: Project = parsed;
    expect(typed.id).toBe('p-1');
  });

  it('accepts the live seed PROJECTS (seed must always validate, R-1)', () => {
    expect(ProjectSchema.array().safeParse(PROJECTS).success).toBe(true);
  });

  it('rejects title shorter than 2 chars after trim', () => {
    expect(ProjectSchema.safeParse({ ...VALID, title: ' A ' }).success).toBe(false);
  });

  it('rejects title longer than 100 chars', () => {
    expect(ProjectSchema.safeParse({ ...VALID, title: 'x'.repeat(101) }).success).toBe(false);
  });

  it('rejects an empty description locale', () => {
    const bad = { ...VALID, description: { en: '', ru: 'Описание.' } };
    expect(ProjectSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a description locale over 600 chars', () => {
    const bad = { ...VALID, description: { en: 'x'.repeat(601), ru: 'Описание.' } };
    expect(ProjectSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an empty techIcons array', () => {
    expect(ProjectSchema.safeParse({ ...VALID, techIcons: [] }).success).toBe(false);
  });

  it('rejects a techIcons key outside TECH_ICONS', () => {
    expect(ProjectSchema.safeParse({ ...VALID, techIcons: ['react', 'cobol'] }).success).toBe(
      false
    );
  });

  it('accepts an internal link and null, rejects http:// and bare paths', () => {
    expect(ProjectSchema.safeParse({ ...VALID, link: '/covid19-tracker' }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...VALID, link: null }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...VALID, link: 'http://example.com' }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, link: 'example.com' }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, link: '/' }).success).toBe(false);
  });

  it('rejects an image that is not a valid URL', () => {
    expect(ProjectSchema.safeParse({ ...VALID, image: 'not-a-url' }).success).toBe(false);
  });

  // Superset union (plan rev.3, решение 5): internal path | http(s):// | data:image/.
  it('accepts an internal image path, http://, https:// and data:image URLs', () => {
    expect(ProjectSchema.safeParse({ ...VALID, image: '/images/projects/foo.webp' }).success).toBe(
      true
    );
    expect(ProjectSchema.safeParse({ ...VALID, image: 'https://x.com/img.png' }).success).toBe(
      true
    );
    expect(ProjectSchema.safeParse({ ...VALID, image: 'http://x.com/img.png' }).success).toBe(true);
    expect(
      ProjectSchema.safeParse({ ...VALID, image: 'data:image/webp;base64,AAAA' }).success
    ).toBe(true);
  });

  it('rejects unsafe or malformed image values (security hardening)', () => {
    // Concatenated so the `no-script-url` rule doesn't flag the test literal.
    const scriptUrl = `java${'script:'}alert(1)`;
    const rejected = [
      scriptUrl,
      'ftp://host/x.png',
      'file:///etc/passwd',
      '//host/x.png',
      '/\\host/x.png',
      'data:text/html;base64,PHNjcmlwdD4=',
      'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
      'data:image/png;base64',
      '',
      '/',
      'example.com',
    ];
    for (const image of rejected) {
      expect(ProjectSchema.safeParse({ ...VALID, image }).success).toBe(false);
    }
  });

  it('accepts a data:image URL at the 512K-char cap and rejects one char over', () => {
    const prefix = 'data:image/webp;base64,';
    const atCap = prefix + 'A'.repeat(512_000 - prefix.length);
    expect(atCap).toHaveLength(512_000);
    expect(ProjectSchema.safeParse({ ...VALID, image: atCap }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...VALID, image: `${atCap}A` }).success).toBe(false);
  });

  it('rejects category/status outside their enums', () => {
    expect(ProjectSchema.safeParse({ ...VALID, category: 'mainframe' }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, status: 'paused' }).success).toBe(false);
  });

  it('rejects a role with a single empty locale (both are required)', () => {
    const bad = { ...VALID, role: { en: 'Developer', ru: '' } };
    expect(ProjectSchema.safeParse(bad).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, role: undefined }).success).toBe(true);
  });

  it('rejects a metric over 40 chars', () => {
    expect(ProjectSchema.safeParse({ ...VALID, metrics: ['x'.repeat(41)] }).success).toBe(false);
  });

  it('rejects a year outside 2000…2100 or a non-integer', () => {
    expect(ProjectSchema.safeParse({ ...VALID, year: 1999 }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, year: 2101 }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, year: 2023.5 }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...VALID, year: undefined }).success).toBe(true);
  });

  it('rejects an empty id', () => {
    expect(ProjectSchema.safeParse({ ...VALID, id: '' }).success).toBe(false);
  });
});

describe('ProjectFormDataSchema', () => {
  it('accepts record fields without id/createdAt/updatedAt', () => {
    expect(ProjectFormDataSchema.safeParse(FORM_DATA).success).toBe(true);
  });

  it('strips id/createdAt/updatedAt (form never edits them)', () => {
    const parsed = ProjectFormDataSchema.parse(VALID);
    expect(parsed).not.toHaveProperty('id');
    expect(parsed).not.toHaveProperty('createdAt');
    expect(parsed).not.toHaveProperty('updatedAt');
  });

  it('applies the same field rules as ProjectSchema', () => {
    expect(ProjectFormDataSchema.safeParse({ ...FORM_DATA, title: 'x' }).success).toBe(false);
    expect(ProjectFormDataSchema.safeParse({ ...FORM_DATA, techIcons: [] }).success).toBe(false);
  });
});

describe('ProjectsEnvelopeSchema', () => {
  it('accepts { v: 1, projects } with valid records', () => {
    expect(ProjectsEnvelopeSchema.safeParse({ v: 1, projects: [VALID] }).success).toBe(true);
  });

  it('rejects an unknown version (future migration guard)', () => {
    expect(ProjectsEnvelopeSchema.safeParse({ v: 2, projects: [VALID] }).success).toBe(false);
  });

  it('rejects a missing projects field', () => {
    expect(ProjectsEnvelopeSchema.safeParse({ v: 1 }).success).toBe(false);
  });

  it('rejects an invalid record inside the envelope', () => {
    const bad = { ...VALID, title: '' };
    expect(ProjectsEnvelopeSchema.safeParse({ v: 1, projects: [bad] }).success).toBe(false);
  });
});
