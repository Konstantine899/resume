// Slice/selector tests (plan Contact CRUD §4: lazy hydration, full replace,
// reset→seed; §5: injection into storeReducers).

import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it } from 'vitest';

import type { ContactContent } from '@/entities/ContactContent';
import { storeReducers } from '@/storeReducers';
import { resetToDefaults, updateContactContent } from './contactContentSlice';
import { createContactSeed } from '../services/seed';
import { selectContactContent } from '../selectors';
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

  it('resetToDefaults returns exactly the seed', () => {
    const store = makeStore();
    store.dispatch(updateContactContent(CHANGED));
    store.dispatch(resetToDefaults());
    expect(selectContactContent(store.getState())).toEqual(SEED);
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

describe('selector', () => {
  it('reads the contactContent key of the root state', () => {
    const store = makeStore();
    expect(selectContactContent(store.getState())).toBe(store.getState().contactContent);
  });
});
