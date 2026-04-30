import { useLanguage } from '@/shared/lib/i18n/hooks';
import type { UseLanguageSwitchReturn } from '../model/types';

/**
 * LanguageSwitch Feature Hook
 * Wraps shared language context with feature-specific logic
 */
export const useLanguageSwitch = (): UseLanguageSwitchReturn => {
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  return {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isTransitioning: false, // Можно добавить позже
  };
};
