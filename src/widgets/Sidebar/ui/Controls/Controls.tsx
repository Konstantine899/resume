import { Globe, Moon, Sun } from 'lucide-react';
import React from 'react';
import styles from './Controls.module.scss';

export interface ControlsProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toggleLanguage: () => void;
  isCollapsed?: boolean;
  isHoverExpanded?: boolean;
  variant?: 'desktop' | 'mobile';
  isTransitioning?: boolean;
  isLangTransitioning?: boolean;
  t?: (key: string) => string;
}

export const Controls: React.FC<ControlsProps> = ({
  theme,
  toggleTheme,
  toggleLanguage,
  isCollapsed = false,
  isHoverExpanded = false,
  variant = 'desktop',
  isTransitioning = false,
  isLangTransitioning = false,
  t = (key: string) => key,
}) => {
  const showText = !isCollapsed || isHoverExpanded || variant === 'mobile';

  const handleLanguageToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'desktop') {
      e.stopPropagation();
    }
    toggleLanguage();
  };

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'desktop') {
      e.stopPropagation();
    }
    toggleTheme();
  };

  return (
    <div className={`${styles.controls} ${variant === 'desktop' ? styles.desktop : styles.mobile}`}>
      {/* Language Toggle */}
      <button
        onClick={handleLanguageToggle}
        className={styles.controlButton}
        type="button"
        aria-label={t('language')}
        title={!showText ? t('language') : undefined}
      >
        <Globe
          className={`${styles.controlIcon} ${isLangTransitioning ? styles.spinning : ''}`}
          aria-hidden="true"
        />
        {showText && (
          <span className={styles.controlText}>
            <span className={styles.languageFull}>{t('languageFull')}</span>
          </span>
        )}
      </button>

      {/* Theme Toggle */}
      <button
        onClick={handleThemeToggle}
        className={styles.controlButton}
        type="button"
        aria-label={`Switch to ${theme === 'dark' ? t('lightMode') : t('darkMode')}`}
        title={!showText ? (theme === 'dark' ? t('lightMode') : t('darkMode')) : undefined}
      >
        {theme === 'dark' ? (
          <Moon
            className={`${styles.controlIcon} ${isTransitioning ? styles.spinning : ''}`}
            aria-hidden="true"
          />
        ) : (
          <Sun
            className={`${styles.controlIcon} ${isTransitioning ? styles.spinning : ''}`}
            aria-hidden="true"
          />
        )}
        {showText && (
          <span className={styles.controlText}>
            {theme === 'dark' ? t('darkMode') : t('lightMode')}
          </span>
        )}
      </button>

      {variant === 'mobile' && <p className={styles.footerText}>{t('footerTitle')}</p>}
    </div>
  );
};
