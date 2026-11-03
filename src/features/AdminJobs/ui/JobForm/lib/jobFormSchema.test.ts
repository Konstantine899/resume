// ============================================
// jobFormSchema tests (WorkHistory CRUD — §7 validation table)
// ============================================
//
// RED-first contract: every §7 rule maps to its i18n key on BOTH locales,
// cross-field rules (current ⇄ endDate, endDate ≥ startDate) live in
// superRefine, and the resolver output is DTO-ready (Date objects,
// '' → undefined companyUrl, current ⇒ endDate null — the reducer keeps
// them in sync anyway, A6).

import { describe, expect, it } from 'vitest';
import { jobFormSchema, type JobFormValues } from './jobFormSchema';

// zod v4 dropped SafeParseReturnType — derive the union from the schema.
type ParseResult = ReturnType<typeof jobFormSchema.safeParse>;

/** Valid minimal fixture — parse() overlays a patch on top of it. */
const validValues = (): JobFormValues => ({
  company: 'Acme Corp',
  position: { en: 'Developer', ru: 'Разработчик' },
  startDate: '2020-01-01',
  endDate: '',
  current: true,
  description: { en: ['Shipped features'], ru: ['Выпустил фичи'] },
  technologies: ['React'],
  location: 'Remote',
  employmentType: 'full-time',
  level: 'senior',
  companyUrl: '',
  featured: false,
});

const parse = (patch: Partial<JobFormValues> = {}) => {
  const values = { ...validValues(), ...patch };
  return jobFormSchema.safeParse(values);
};

/** Issue messages whose path starts with the given segments (first issue per match). */
const messagesAt = (result: ParseResult, path: string[]) =>
  result.success
    ? []
    : result.error.issues
        .filter((issue) => issue.path.slice(0, path.length).join('.') === path.join('.'))
        .map((i) => i.message);

describe('jobFormSchema', () => {
  it('accepts a minimal valid current position and returns a DTO-ready output', () => {
    const result = parse();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.startDate).toBeInstanceOf(Date);
    expect(result.data.endDate).toBeNull();
    expect(result.data.current).toBe(true);
    expect(result.data.companyUrl).toBeUndefined();
    expect(result.data.featured).toBe(false);
    expect(result.data.employmentType).toBe('full-time');
    expect(result.data.level).toBe('senior');
  });

  it('returns a real endDate Date for a finished position', () => {
    const result = parse({ current: false, endDate: '2022-02-28' });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.endDate).toBeInstanceOf(Date);
    expect(result.data.endDate?.getFullYear()).toBe(2022);
  });

  it('flags a too-short company with adminJobErrCompany', () => {
    expect(messagesAt(parse({ company: 'A' }), ['company'])).toContain('adminJobErrCompany');
    expect(messagesAt(parse({ company: '   ' }), ['company'])).toContain('adminJobErrCompany');
  });

  it('flags a too-short position in EVERY locale with adminJobErrPosition', () => {
    expect(messagesAt(parse({ position: { en: 'Dev', ru: 'Аб' } }), ['position', 'ru'])).toContain(
      'adminJobErrPosition'
    );
    expect(messagesAt(parse({ position: { en: 'Ab', ru: 'Дев' } }), ['position', 'en'])).toContain(
      'adminJobErrPosition'
    );
  });

  it('flags a missing, unparseable or future startDate with adminJobErrStartDate', () => {
    expect(messagesAt(parse({ startDate: '' }), ['startDate'])).toContain('adminJobErrStartDate');
    expect(messagesAt(parse({ startDate: 'not-a-date' }), ['startDate'])).toContain(
      'adminJobErrStartDate'
    );
    expect(messagesAt(parse({ startDate: '2099-01-01' }), ['startDate'])).toContain(
      'adminJobErrStartDate'
    );
  });

  it('requires endDate for a non-current position and orders it after startDate', () => {
    expect(messagesAt(parse({ current: false, endDate: '' }), ['endDate'])).toContain(
      'adminJobErrEndDate'
    );
    expect(
      messagesAt(parse({ current: false, startDate: '2022-01-01', endDate: '2020-01-01' }), [
        'endDate',
      ])
    ).toContain('adminJobErrEndDate');
    expect(messagesAt(parse({ current: false, endDate: 'broken' }), ['endDate'])).toContain(
      'adminJobErrEndDate'
    );
  });

  it('ignores endDate entirely while current is true (output null)', () => {
    const result = parse({ current: true, endDate: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.endDate).toBeNull();
  });

  it('bounds description to 1–6 bullets of ≤200 chars per locale', () => {
    expect(
      messagesAt(parse({ description: { en: [], ru: ['x'] } }), ['description', 'en'])
    ).toContain('adminJobErrDescription');
    const seven = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    expect(
      messagesAt(parse({ description: { en: seven, ru: ['x'] } }), ['description', 'en'])
    ).toContain('adminJobErrDescription');
    expect(
      messagesAt(parse({ description: { en: ['x'.repeat(201)], ru: ['x'] } }), [
        'description',
        'en',
      ])
    ).toContain('adminJobErrDescription');
    expect(
      messagesAt(parse({ description: { en: ['x'], ru: [] } }), ['description', 'ru'])
    ).toContain('adminJobErrDescription');
  });

  it('caps technologies at 15 unique entries (adminJobErrTechnologies)', () => {
    expect(
      messagesAt(parse({ technologies: Array.from({ length: 16 }, (_, i) => `t${i}`) }), [
        'technologies',
      ])
    ).toContain('adminJobErrTechnologies');
    expect(messagesAt(parse({ technologies: ['React', 'React'] }), ['technologies'])).toContain(
      'adminJobErrTechnologies'
    );
  });

  it('bounds location 2–80 with adminJobErrLocation', () => {
    expect(messagesAt(parse({ location: 'R' }), ['location'])).toContain('adminJobErrLocation');
    expect(messagesAt(parse({ location: 'x'.repeat(81) }), ['location'])).toContain(
      'adminJobErrLocation'
    );
  });

  it('accepts only absolute https:// company URLs (adminJobErrUrl), "" → undefined', () => {
    expect(messagesAt(parse({ companyUrl: 'example.com' }), ['companyUrl'])).toContain(
      'adminJobErrUrl'
    );
    expect(messagesAt(parse({ companyUrl: 'http://example.com' }), ['companyUrl'])).toContain(
      'adminJobErrUrl'
    );
    expect(messagesAt(parse({ companyUrl: 'https://example.com' }), ['companyUrl'])).toEqual([]);
    const blank = parse({ companyUrl: '  ' });
    expect(blank.success).toBe(true);
    if (blank.success) expect(blank.data.companyUrl).toBeUndefined();
  });

  it('accepts only enum members for employmentType/level (adminJobErrEnum)', () => {
    expect(messagesAt(parse({ employmentType: 'wizard' as never }), ['employmentType'])).toContain(
      'adminJobErrEnum'
    );
    expect(messagesAt(parse({ level: 'god' as never }), ['level'])).toContain('adminJobErrEnum');
  });
});
