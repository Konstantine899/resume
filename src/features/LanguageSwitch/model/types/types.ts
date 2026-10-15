export interface UseLanguageSwitchReturn {
  language: 'en' | 'ru';
  setLanguage: (lang: 'en' | 'ru') => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  isTransitioning?: boolean;
}

export interface LanguageSwitchProps {
  className?: string;
  'data-testid'?: string;
  isCollapsed?: boolean;
  isHoverExpanded?: boolean;
  variant?: 'desktop' | 'mobile';
}
