// src/widgets/Sidebar/ui/Controls/Controls.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
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

  // ✅ Определяем модификатор для состояния sidebar
  const sidebarMod = isCollapsed && !isHoverExpanded ? 'collapsed' : 'expanded';

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

  // Build class names using classNames utility
  const containerClasses = classNames(
    styles.controls,
    styles[sidebarMod], // ✅ Модификатор состояния
    variant === 'desktop' ? styles.desktop : styles.mobile
  );

  const languageIconClasses = classNames(
    styles.controlIcon,
    isLangTransitioning && styles.spinning
  );

  const themeIconClasses = classNames(styles.controlIcon, isTransitioning && styles.spinning);

  // ✅ Класс кнопки с модификатором
  const controlButtonClasses = classNames(
    styles.controlButton,
    styles[`controlButton--${sidebarMod}`] // ✅ BEM-модификатор
  );

  return (
    <div className={containerClasses}>
      {/* Language Toggle */}
      <Button
        icon={<Globe className={languageIconClasses} aria-hidden="true" />}
        aria-label={t('language')}
        onClick={handleLanguageToggle}
        variant="ghost"
        size={variant === 'mobile' ? 'lg' : 'md'}
        fullWidth
        title={!showText ? t('language') : undefined}
        className={controlButtonClasses}
      >
        {showText && (
          <span className={styles.controlText}>
            <span className={styles.languageFull}>{t('languageFull')}</span>
          </span>
        )}
      </Button>

      {/* Theme Toggle */}
      <Button
        icon={
          theme === 'dark' ? (
            <Moon className={themeIconClasses} aria-hidden="true" />
          ) : (
            <Sun className={themeIconClasses} aria-hidden="true" />
          )
        }
        aria-label={`Switch to ${theme === 'dark' ? t('lightMode') : t('darkMode')}`}
        onClick={handleThemeToggle}
        variant="ghost"
        size={variant === 'mobile' ? 'lg' : 'md'}
        fullWidth
        title={!showText ? (theme === 'dark' ? t('lightMode') : t('darkMode')) : undefined}
        className={controlButtonClasses}
      >
        {showText && (
          <span className={styles.controlText}>
            {theme === 'dark' ? t('darkMode') : t('lightMode')}
          </span>
        )}
      </Button>

      {variant === 'mobile' && <p className={styles.footerText}>{t('footerTitle')}</p>}
    </div>
  );
};
