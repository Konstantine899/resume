import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { loadRu } from '../config/i18n';
import type { Language } from '../types';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const language = (i18n.language === 'ru' ? 'ru' : 'en') as Language;

  const setLanguage = useCallback(
    (lang: Language) => {
      localStorage.setItem('language', lang);
      // The ru bundle is lazy: land it BEFORE the switch, otherwise
      // changeLanguage('ru') would resolve against a missing bundle and
      // render en copy — a visible flash of the wrong language. A failed
      // ru fetch degrades to en via fallbackLng (never raw keys).
      const ready = lang === 'ru' ? loadRu().catch(() => undefined) : Promise.resolve();
      void ready.then(() => i18n.changeLanguage(lang));
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ru' : 'en';
    setLanguage(newLang);
  }, [language, setLanguage]);

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isTransitioning: false, // Можно добавить анимацию позже
  };
};
