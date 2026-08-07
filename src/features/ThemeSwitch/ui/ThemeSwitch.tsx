import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { ButtonWithIcon } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Moon, Sun } from 'lucide-react';
import React from 'react';
import { useThemeSwitch } from '../hooks/useThemeSwitch';
import type { ThemeSwitchProps } from '../model/types';
import styles from './ThemeSwitch.module.scss';

export interface ThemeSwitchComponentProps {
  isCollapsed?: boolean;
  isHoverExpanded?: boolean;
  variant?: 'desktop' | 'mobile';
}

export const ThemeSwitch: React.FC<ThemeSwitchProps & ThemeSwitchComponentProps> = ({
  className = '',
  'data-testid': testId = 'theme-switch',
  isCollapsed = false,
  isHoverExpanded = false,
  variant = 'desktop',
}) => {
  const { theme, toggleTheme, isTransitioning } = useThemeSwitch();
  const { t } = useLanguage();

  const showText = !isCollapsed || isHoverExpanded || variant === 'mobile';
  const sidebarMod = isCollapsed && !isHoverExpanded ? 'collapsed' : 'expanded';

  const handleThemeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'desktop') {
      e.stopPropagation();
    }
    toggleTheme();
  };

  const themeIconClasses = classNames(styles.controlIcon, isTransitioning && styles.spinning);

  const controlButtonClasses = classNames(
    styles.controlButton,
    styles[`controlButton--${sidebarMod}`]
  );

  return (
    <ButtonWithIcon
      leftIcon={
        <Icon
          name={theme === 'dark' ? Moon : Sun}
          size={18}
          color="inherit"
          decorative
          className={themeIconClasses}
        />
      }
      onClick={handleThemeToggle}
      variant="ghost"
      size="md"
      fullWidth
      title={!showText ? (theme === 'dark' ? t('lightMode') : t('darkMode')) : undefined}
      className={`${controlButtonClasses} ${className}`}
      data-testid={testId}
    >
      {showText && (
        <span className={styles.controlText}>
          {theme === 'dark' ? t('darkMode') : t('lightMode')}
        </span>
      )}
    </ButtonWithIcon>
  );
};

ThemeSwitch.displayName = 'ThemeSwitch';
