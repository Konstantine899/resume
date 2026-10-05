// Seed tests (plan Contact CRUD §5 + R-8: seed must BE the current locales).

import { describe, expect, it } from 'vitest';

import { ContactContentSchema, CONTACT_EMAIL } from '@/entities/ContactContent';
// Public API only (fsd-imports/tests-public-api-only): the same locale JSON
// the i18n instance reads, exposed as `resources`.
import { resources } from '@/shared/lib/i18n';

import { createContactSeed } from './seed';

const en = resources.en.translation;
const ru = resources.ru.translation;

const TEXT_KEYS = [
  'contactDescription',
  'responseTimeHint',
  'nameField',
  'email',
  'message',
  'namePlaceholder',
  'emailPlaceholder',
  'messagePlaceholder',
  'sendMessage',
  'sending',
] as const;

const FORM_TEXT_KEYS = [
  'contactFormRequired',
  'contactFormSent',
  'contactFormError',
  'contactFormConfigError',
] as const;

describe('createContactSeed', () => {
  it('takes email from CONTACT_EMAIL (single source, R-2)', () => {
    expect(createContactSeed().email).toBe(CONTACT_EMAIL);
  });

  it('texts equal the current locale values (drift guard, R-8)', () => {
    const { texts } = createContactSeed();
    for (const key of TEXT_KEYS) {
      expect(texts[key]).toEqual({ en: en[key], ru: ru[key] });
    }
  });

  it('formTexts equal the current locale values (drift guard, R-8)', () => {
    const { formTexts } = createContactSeed();
    for (const key of FORM_TEXT_KEYS) {
      expect(formTexts[key]).toEqual({ en: en[key], ru: ru[key] });
    }
  });

  it('never includes the shared `contact` nav key (split-brain guard)', () => {
    const { texts } = createContactSeed();
    expect(Object.keys(texts)).not.toContain('contact');
    expect(Object.keys(texts)).toHaveLength(TEXT_KEYS.length);
  });

  it('always produces a schema-valid document (locales can never exceed limits)', () => {
    expect(ContactContentSchema.safeParse(createContactSeed()).success).toBe(true);
  });

  it('returns a fresh object each call (no shared mutable state)', () => {
    const a = createContactSeed();
    const b = createContactSeed();
    expect(a).not.toBe(b);
    a.email = 'mutated@example.com';
    expect(b.email).toBe(CONTACT_EMAIL);
  });
});
