// Seed tests (plan_projects_crud §5 + R-1: seed IS the live PROJECTS constant,
// and resetToDefaults always comes back to it).

import { describe, expect, it } from 'vitest';

import { PROJECTS, ProjectSchema } from '@/entities/Project';

import { createProjectsSeed } from './seed';

describe('createProjectsSeed', () => {
  it('mirrors the live PROJECTS constant (R-1: one source, no drift)', () => {
    expect(createProjectsSeed()).toEqual(PROJECTS);
  });

  it('returns a fresh deep copy — mutating it never leaks into the constant', () => {
    const seed = createProjectsSeed();
    const first = seed[0];
    if (first) {
      first.title = 'Mutated';
      first.description.en = 'Mutated';
      first.techIcons.push('sass');
    }

    expect(PROJECTS[0]?.title).toBe('Dragonfly');
    expect(PROJECTS[0]?.description.en).toContain('Dragonfly is a fully');
    expect(PROJECTS[0]?.techIcons).toEqual(['react', 'nextjs', 'tailwind', 'framer']);
  });

  it('has 7 records with exactly 4 featured ones (recruiter audit P1)', () => {
    const seed = createProjectsSeed();
    expect(seed).toHaveLength(7);
    expect(seed.filter((project) => project.featured).map((project) => project.id)).toEqual([
      '1',
      '2',
      '3',
      '7',
    ]);
  });

  it('every record validates against ProjectSchema', () => {
    expect(ProjectSchema.array().safeParse(createProjectsSeed()).success).toBe(true);
  });

  it('carries no createdAt/updatedAt (stamps are added only on Create/Update, §4)', () => {
    expect(
      createProjectsSeed().every(
        (project) => project.createdAt === undefined && project.updatedAt === undefined
      )
    ).toBe(true);
  });
});
