// ============================================
// AboutContent seed — THE source of defaults (plan About CRUD §5, R-8)
// ============================================
//
// Every default comes from its live source: `fullName` from the entity
// constant, en copy from the SAME locale JSON the vitrina's t() reads, ru
// copy from the static SEED_RU_TEXTS — the ru LOCALE BUNDLE is lazy (see
// shared/lib/i18n/config/i18n.ts), so the seed cannot await it, yet a store
// init must carry real ru copy for every visitor. Drift is impossible:
// locales-parity.test.ts pins every RU seed text to its ru.json value and
// seed.test.ts asserts this function against ru.json. `resetToDefaults`
// always returns this.

import { DEVELOPER_DATA } from '@/entities/Developer';
import type { AboutContent } from '@/entities/AboutContent';
import en from '@/shared/lib/i18n/locales/en.json';
import { SEED_RU_TEXTS } from '@/shared/lib/i18n/locales/seedTexts';

export const createAboutSeed = (): AboutContent => ({
  fullName: DEVELOPER_DATA.fullName,
  descriptions: [
    { en: en.aboutDescription, ru: SEED_RU_TEXTS.aboutDescription },
    { en: en.aboutDescription2, ru: SEED_RU_TEXTS.aboutDescription2 },
    { en: en.aboutDescription3, ru: SEED_RU_TEXTS.aboutDescription3 },
  ],
  stats: {
    aboutStatYears: { en: en.aboutStatYears, ru: SEED_RU_TEXTS.aboutStatYears },
    aboutStatProjects: { en: en.aboutStatProjects, ru: SEED_RU_TEXTS.aboutStatProjects },
    aboutStatUsers: { en: en.aboutStatUsers, ru: SEED_RU_TEXTS.aboutStatUsers },
    aboutStatRemote: { en: en.aboutStatRemote, ru: SEED_RU_TEXTS.aboutStatRemote },
  },
  ctaLabel: { en: en.getInTouch, ru: SEED_RU_TEXTS.getInTouch },
});
