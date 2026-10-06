// Schema tests (TDD red → green, plan Contact CRUD §7 + §5 envelope).
// Expected values are independent literals — never recomputed the way
// the implementation computes them.

import { describe, expect, it } from 'vitest';

import {
  ContactContentEnvelopeSchema,
  ContactContentSchema,
  ContactFormDataSchema,
} from './schema';
import type { ContactContent } from '../types';

const VALID: ContactContent = {
  email: 'kostay375298918971@gmail.com',
  texts: {
    contactDescription: { en: 'Always open to new projects.', ru: 'Всегда открыт к проектам.' },
    responseTimeHint: { en: 'I reply within 24 hours', ru: 'Отвечаю в течение 24 часов' },
    nameField: { en: 'Name', ru: 'Имя' },
    email: { en: 'Email', ru: 'Почта' },
    message: { en: 'Message', ru: 'Сообщение' },
    namePlaceholder: { en: 'your name', ru: 'ваше имя' },
    emailPlaceholder: { en: 'you@example.com', ru: 'you@example.com' },
    messagePlaceholder: { en: 'tell me about the project', ru: 'расскажите о проекте' },
    sendMessage: { en: 'Send Message', ru: 'Отправить' },
    sending: { en: 'Sending...', ru: 'Отправка...' },
  },
  formTexts: {
    contactFormRequired: { en: 'All fields are required', ru: 'Все поля обязательны' },
    contactFormSent: { en: 'Message sent!', ru: 'Сообщение отправлено!' },
    contactFormError: { en: 'Failed to send.', ru: 'Не удалось отправить.' },
    contactFormConfigError: { en: 'Config incomplete', ru: 'Конфиг неполный' },
  },
};

/** Clone with one texts-key overridden, keeping VALID readable at call sites. */
const withText = (key: keyof ContactContent['texts'], en: string): ContactContent => {
  const texts = { ...VALID.texts };
  texts[key] = { ...VALID.texts[key], en };
  return { ...VALID, texts };
};

describe('ContactContentSchema', () => {
  it('accepts a valid document', () => {
    expect(ContactContentSchema.safeParse(VALID).success).toBe(true);
  });

  it('output is assignable to ContactContent (contract compatibility)', () => {
    const parsed = ContactContentSchema.parse(VALID);
    const typed: ContactContent = parsed;
    expect(typed.email).toBe('kostay375298918971@gmail.com');
  });

  it('rejects a missing email', () => {
    expect(ContactContentSchema.safeParse({ ...VALID, email: '' }).success).toBe(false);
  });

  it('rejects an email without a valid format', () => {
    expect(ContactContentSchema.safeParse({ ...VALID, email: 'not-an-email' }).success).toBe(false);
  });

  it('trims surrounding whitespace before the format check', () => {
    const parsed = ContactContentSchema.safeParse({ ...VALID, email: '  a@b.co  ' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe('a@b.co');
  });

  it('rejects an empty locale in texts', () => {
    expect(ContactContentSchema.safeParse(withText('nameField', '')).success).toBe(false);
  });

  it('rejects contactDescription over 600 chars per locale', () => {
    expect(
      ContactContentSchema.safeParse(withText('contactDescription', 'x'.repeat(601))).success
    ).toBe(false);
  });

  it('accepts contactDescription at the 600-char boundary', () => {
    expect(
      ContactContentSchema.safeParse(withText('contactDescription', 'x'.repeat(600))).success
    ).toBe(true);
  });

  it('rejects a non-description text over 120 chars per locale', () => {
    expect(ContactContentSchema.safeParse(withText('sendMessage', 'x'.repeat(121))).success).toBe(
      false
    );
  });

  it('accepts a non-description text at the 120-char boundary', () => {
    expect(ContactContentSchema.safeParse(withText('sendMessage', 'x'.repeat(120))).success).toBe(
      true
    );
  });

  it('rejects a missing text key', () => {
    const texts = { ...VALID.texts };
    Reflect.deleteProperty(texts, 'sending');
    expect(ContactContentSchema.safeParse({ ...VALID, texts }).success).toBe(false);
  });

  it('rejects an empty locale in formTexts', () => {
    const bad = {
      ...VALID,
      formTexts: { ...VALID.formTexts, contactFormSent: { en: 'Sent!', ru: '' } },
    };
    expect(ContactContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a formText over 120 chars per locale', () => {
    const bad = {
      ...VALID,
      formTexts: { ...VALID.formTexts, contactFormError: { en: 'x'.repeat(121), ru: 'Ошибка' } },
    };
    expect(ContactContentSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a missing formTexts key', () => {
    const formTexts = { ...VALID.formTexts };
    Reflect.deleteProperty(formTexts, 'contactFormConfigError');
    expect(ContactContentSchema.safeParse({ ...VALID, formTexts }).success).toBe(false);
  });
});

describe('ContactFormDataSchema (Create, §7)', () => {
  it('accepts a valid submission', () => {
    const data = { name: 'Konstantin', email: 'a@b.co', message: 'Hello there, hiring you!' };
    expect(ContactFormDataSchema.safeParse(data).success).toBe(true);
  });

  it('rejects a name shorter than 2 chars after trim', () => {
    const data = { name: ' K ', email: 'a@b.co', message: 'Hello there, hiring you!' };
    expect(ContactFormDataSchema.safeParse(data).success).toBe(false);
  });

  it('rejects a name longer than 80 chars', () => {
    const data = { name: 'x'.repeat(81), email: 'a@b.co', message: 'Hello there, hiring you!' };
    expect(ContactFormDataSchema.safeParse(data).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const data = { name: 'Konstantin', email: 'nope', message: 'Hello there, hiring you!' };
    expect(ContactFormDataSchema.safeParse(data).success).toBe(false);
  });

  it('rejects a message under 10 chars (owner-approved spam floor)', () => {
    const data = { name: 'Konstantin', email: 'a@b.co', message: 'hi' };
    expect(ContactFormDataSchema.safeParse(data).success).toBe(false);
  });

  it('rejects a message over 2000 chars', () => {
    const data = { name: 'Konstantin', email: 'a@b.co', message: 'x'.repeat(2001) };
    expect(ContactFormDataSchema.safeParse(data).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(ContactFormDataSchema.safeParse({ name: '', email: '', message: '' }).success).toBe(
      false
    );
  });
});

describe('ContactContentEnvelopeSchema', () => {
  it('accepts { v: 1, content } with a valid document', () => {
    expect(ContactContentEnvelopeSchema.safeParse({ v: 1, content: VALID }).success).toBe(true);
  });

  it('rejects an unknown version (future migration guard)', () => {
    expect(ContactContentEnvelopeSchema.safeParse({ v: 2, content: VALID }).success).toBe(false);
  });

  it('rejects a missing content field', () => {
    expect(ContactContentEnvelopeSchema.safeParse({ v: 1 }).success).toBe(false);
  });

  it('rejects an invalid document inside the envelope', () => {
    expect(
      ContactContentEnvelopeSchema.safeParse({ v: 1, content: { ...VALID, email: 'x' } }).success
    ).toBe(false);
  });
});
