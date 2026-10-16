// projectFormSchema membership tests (technologies-crud SPEC D2): the
// catalog check moved DOWN from the deleted TECH_ICONS enum to this
// feature-level factory — entities never import entities. The issue must
// land ON the techIcons path so both forms' `errors.techIcons` alerts keep
// rendering exactly as before.

import { describe, expect, it } from 'vitest';

import { makeProjectFormSchema, type ProjectFormValues } from './projectFormSchema';

const VALID_KEYS = ['react', 'nextjs', 'css'];

const VALID: ProjectFormValues = {
  title: 'Dragonfly',
  description: { en: 'Shop', ru: 'Магазин' },
  techIcons: ['react'],
  link: 'https://example.com',
  image: '/images/projects/dragonfly.webp',
  category: 'ecommerce',
  status: 'completed',
  featured: true,
  role: { en: '', ru: '' },
  metrics: '',
  year: '',
  imageSubdir: 'projects',
};

describe('makeProjectFormSchema (D2 membership)', () => {
  it('accepts keys inside validKeys (and an empty selection)', () => {
    const schema = makeProjectFormSchema(VALID_KEYS);
    expect(schema.safeParse({ ...VALID, techIcons: ['react', 'css'] }).success).toBe(true);
    expect(schema.safeParse({ ...VALID, techIcons: [] }).success).toBe(true);
  });

  it('rejects a key outside validKeys with the issue on the techIcons path', () => {
    const result = makeProjectFormSchema(VALID_KEYS).safeParse({
      ...VALID,
      techIcons: ['react', 'cobol'],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['techIcons']);
      expect(result.error.issues[0]?.message).toBe('projectTechRequired');
    }
  });

  it('validKeys are live: an empty catalog rejects every non-empty selection', () => {
    const result = makeProjectFormSchema([]).safeParse({ ...VALID, techIcons: ['react'] });
    expect(result.success).toBe(false);
  });

  it('the static base schema still carries the relaxed 0..20 contract (D2 layering)', () => {
    // Membership is a FEATURE rule — the base stays catalog-agnostic.
    expect(makeProjectFormSchema(VALID_KEYS).shape.techIcons).toBeDefined();
  });
});
