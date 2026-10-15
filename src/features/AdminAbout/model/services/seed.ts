// ============================================
// AboutContent seed — THE source of defaults (plan About CRUD §5, R-8)
// ============================================
//
// Every default comes from its live source: `fullName` from the entity
// constant, all localized strings imported from the SAME locale JSON the
// vitrina's `t()` reads. There is no hand-copied second version, so seed
// and locales CANNOT drift — `resetToDefaults` always returns this.

import { DEVELOPER_DATA } from '@/entities/Developer';
import type { AboutContent } from '@/entities/AboutContent';
import en from '@/shared/lib/i18n/locales/en.json';
import ru from '@/shared/lib/i18n/locales/ru.json';

export const createAboutSeed = (): AboutContent => ({
  fullName: DEVELOPER_DATA.fullName,
  descriptions: [
    { en: en.aboutDescription, ru: ru.aboutDescription },
    { en: en.aboutDescription2, ru: ru.aboutDescription2 },
    { en: en.aboutDescription3, ru: ru.aboutDescription3 },
  ],
  stats: {
    aboutStatYears: { en: en.aboutStatYears, ru: ru.aboutStatYears },
    aboutStatProjects: { en: en.aboutStatProjects, ru: ru.aboutStatProjects },
    aboutStatUsers: { en: en.aboutStatUsers, ru: ru.aboutStatUsers },
    aboutStatRemote: { en: en.aboutStatRemote, ru: ru.aboutStatRemote },
  },
  ctaLabel: { en: en.getInTouch, ru: ru.getInTouch },
});
