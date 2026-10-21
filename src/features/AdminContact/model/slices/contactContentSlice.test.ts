// Slice/selector tests (plan Contact CRUD §4: lazy hydration, full replace,
// reset→seed; §5: injection into storeReducers).

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ContactContent } from '@/entities/ContactContent';
import { storeReducers } from '@/storeReducers';
import {
  removeContactTableRow,
  resetContactTable,
  updateContactContent,
  upsertContactTableRow,
} from './contactContentSlice';
import { createContactSeed } from '../services/seed';
import { selectContactContent } from '../selectors/selectors';
import { CONTACT_CONTENT_STORAGE_KEY, persistContactContent } from '../services/storage';

const SEED = createContactSeed();

const CHANGED: ContactContent = {
  email: 'other@example.com',
  texts: {
    contactDescription: { en: 'Edited description.', ru: 'Описано.' },
    responseTimeHint: { en: 'ASAP', ru: 'Сразу' },
    nameField: { en: 'Your name', ru: 'Ваше имя' },
    email: { en: 'Your email', ru: 'Ваша почта' },
    message: { en: 'Your message', ru: 'Ваше сообщение' },
    namePlaceholder: { en: 'name', ru: 'имя' },
    emailPlaceholder: { en: 'email', ru: 'почта' },
    messagePlaceholder: { en: 'message', ru: 'сообщение' },
    sendMessage: { en: 'Go', ru: 'Погнали' },
    sending: { en: 'Working…', ru: 'Работаем…' },
  },
  formTexts: {
    contactFormRequired: { en: 'Fill everything', ru: 'Заполните всё' },
    contactFormSent: { en: 'Done!', ru: 'Готово!' },
    contactFormError: { en: 'Try again', ru: 'Попробуйте снова' },
    contactFormConfigError: { en: 'Misconfigured', ru: 'Нет конфига' },
  },
  socialLinks: {},
};

const makeStore = () => configureStore({ reducer: storeReducers });

beforeEach(() => {
  localStorage.clear();
});

describe('storeReducers injection', () => {
  it('exposes the contactContent slice under its plan key', () => {
    expect(storeReducers).toHaveProperty('contactContent');
  });
});

describe('lazy hydration (first reducer call = configureStore)', () => {
  it('hydrates from a stored document', () => {
    persistContactContent(CHANGED);
    const store = makeStore();
    expect(selectContactContent(store.getState())).toEqual(CHANGED);
  });

  it('falls back to seed on an empty store', () => {
    const store = makeStore();
    expect(selectContactContent(store.getState())).toEqual(SEED);
  });

  it('falls back to seed on corrupt storage (vitrina never crashes, §7)', () => {
    localStorage.setItem(CONTACT_CONTENT_STORAGE_KEY, '{broken');
    const store = makeStore();
    expect(selectContactContent(store.getState())).toEqual(SEED);
  });
});

describe('reducers', () => {
  it('updateContactContent replaces the WHOLE document (no merge, §4)', () => {
    const store = makeStore();
    store.dispatch(updateContactContent(CHANGED));
    expect(selectContactContent(store.getState())).toEqual(CHANGED);
  });

  it('state is immutable after dispatch (payload cannot be mutated from outside)', () => {
    const store = makeStore();
    const doc: ContactContent = JSON.parse(JSON.stringify(CHANGED));
    store.dispatch(updateContactContent(doc));
    // RTK auto-freezes: the stored document (and the caller's object) is
    // read-only, so no later mutation can leak into the state.
    expect(() => {
      doc.email = 'mutated-later@example.com';
    }).toThrow();
    expect(selectContactContent(store.getState()).email).toBe('other@example.com');
  });
});

describe('row operations (contact-rows-crud R-2)', () => {
  it('upsertContactTableRow appends a custom row to texts', () => {
    const store = makeStore();
    store.dispatch(
      upsertContactTableRow({
        table: 'texts',
        key: 'customRow',
        value: { en: 'Hi', ru: 'Привет' },
      })
    );
    const doc = selectContactContent(store.getState());
    expect(doc.texts['customRow']).toEqual({ en: 'Hi', ru: 'Привет' });
    expect(Object.keys(doc.texts)).toHaveLength(Object.keys(SEED.texts).length + 1);
  });

  it('upsertContactTableRow replaces an existing row in place (key order kept)', () => {
    const store = makeStore();
    store.dispatch(
      upsertContactTableRow({ table: 'texts', key: 'sending', value: { en: 'New', ru: 'Новое' } })
    );
    const doc = selectContactContent(store.getState());
    expect(Object.keys(doc.texts)).toEqual(Object.keys(SEED.texts));
    expect(doc.texts['sending']).toEqual({ en: 'New', ru: 'Новое' });
    expect(doc.texts['sendMessage']).toEqual(SEED.texts['sendMessage']);
  });

  it('upsert targets ONLY the given table', () => {
    const store = makeStore();
    store.dispatch(
      upsertContactTableRow({
        table: 'formTexts',
        key: 'customToast',
        value: { en: 'Toast', ru: 'Тост' },
      })
    );
    const doc = selectContactContent(store.getState());
    expect(doc.formTexts['customToast']).toEqual({ en: 'Toast', ru: 'Тост' });
    expect(doc.texts).toEqual(SEED.texts);
    expect(doc.email).toBe(SEED.email);
  });

  it('removeContactTableRow deletes the row from the given table only', () => {
    const store = makeStore();
    store.dispatch(removeContactTableRow({ table: 'texts', key: 'sending' }));
    const doc = selectContactContent(store.getState());
    expect(doc.texts['sending']).toBeUndefined();
    expect(Object.keys(doc.texts)).toHaveLength(Object.keys(SEED.texts).length - 1);
    expect(doc.formTexts).toEqual(SEED.formTexts);
    expect(doc.email).toBe(SEED.email);
  });

  it('removeContactTableRow is a safe no-op for an unknown key', () => {
    const store = makeStore();
    store.dispatch(removeContactTableRow({ table: 'texts', key: 'ghost' }));
    expect(selectContactContent(store.getState())).toEqual(SEED);
  });

  it('resetContactTable restores only that table to the seed', () => {
    const store = makeStore();
    store.dispatch(
      upsertContactTableRow({
        table: 'texts',
        key: 'customRow',
        value: { en: 'Hi', ru: 'Привет' },
      })
    );
    store.dispatch(
      upsertContactTableRow({
        table: 'formTexts',
        key: 'customToast',
        value: { en: 'Toast', ru: 'Тост' },
      })
    );
    store.dispatch(resetContactTable({ table: 'texts' }));
    const doc = selectContactContent(store.getState());
    expect(doc.texts).toEqual(SEED.texts);
    // The other table and email survive a per-table reset.
    expect(doc.formTexts['customToast']).toEqual({ en: 'Toast', ru: 'Тост' });
    expect(doc.email).toBe(SEED.email);
  });
});

describe('socials row operations (contact-social-crud R-3)', () => {
  it('upsertContactTableRow adds a social row without touching the text tables', () => {
    const store = makeStore();
    store.dispatch(
      upsertContactTableRow({
        table: 'socials',
        key: 'website',
        value: { name: 'Site', href: 'https://example.com' },
      })
    );
    const doc = selectContactContent(store.getState());
    expect(doc.socialLinks['website']).toEqual({ name: 'Site', href: 'https://example.com' });
    expect(doc.texts).toEqual(SEED.texts);
    // Seed rows survive an addition.
    expect(doc.socialLinks['github']).toEqual({
      name: 'GitHub',
      href: 'https://github.com/konstantin-atroshchenko',
    });
  });

  it('upsertContactTableRow replaces an existing social row in place', () => {
    const store = makeStore();
    store.dispatch(
      upsertContactTableRow({
        table: 'socials',
        key: 'github',
        value: { name: 'GH', href: 'https://gh.io' },
      })
    );
    const doc = selectContactContent(store.getState());
    expect(Object.keys(doc.socialLinks)).toEqual(Object.keys(SEED.socialLinks));
    expect(doc.socialLinks['github']).toEqual({ name: 'GH', href: 'https://gh.io' });
  });

  it('removeContactTableRow deletes a social row only', () => {
    const store = makeStore();
    store.dispatch(removeContactTableRow({ table: 'socials', key: 'github' }));
    const doc = selectContactContent(store.getState());
    expect(doc.socialLinks['github']).toBeUndefined();
    expect(Object.keys(doc.socialLinks)).toHaveLength(Object.keys(SEED.socialLinks).length - 1);
    expect(doc.formTexts).toEqual(SEED.formTexts);
  });

  it('resetContactTable restores the socials seed and leaves texts alone', () => {
    const store = makeStore();
    store.dispatch(removeContactTableRow({ table: 'socials', key: 'github' }));
    store.dispatch(
      upsertContactTableRow({
        table: 'socials',
        key: 'website',
        value: { name: 'Site', href: 'https://example.com' },
      })
    );
    store.dispatch(resetContactTable({ table: 'socials' }));
    const doc = selectContactContent(store.getState());
    expect(doc.socialLinks).toEqual(SEED.socialLinks);
    expect(doc.texts).toEqual(SEED.texts);
  });
});

describe('selector', () => {
  it('reads the contactContent key of the root state', () => {
    const store = makeStore();
    expect(selectContactContent(store.getState())).toBe(store.getState().contactContent);
  });
});
