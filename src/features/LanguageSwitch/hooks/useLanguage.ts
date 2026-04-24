import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '../model/types';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const language = (i18n.language === 'ru' ? 'ru' : 'en') as Language;

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
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
