import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Globe } from 'lucide-react';
import React from 'react';
import styles from './LanguageSwitch.module.scss';

export interface LanguageSwitchComponentProps {
  className?: string;
  'data-testid'?: string;
  isCollapsed?: boolean;
  isHoverExpanded?: boolean;
  variant?: 'desktop' | 'mobile';
}

export const LanguageSwitch: React.FC<LanguageSwitchComponentProps> = ({
  className = '',
  'data-testid': testId = 'language-switch',
  isCollapsed = false,
  isHoverExpanded = false,
  variant = 'desktop',
}) => {
  const { language, setLanguage, t, isTransitioning } = useLanguage();

  const showText = !isCollapsed || isHoverExpanded || variant === 'mobile';
  const sidebarMod = isCollapsed && !isHoverExpanded ? 'collapsed' : 'expanded';

  const handleLanguageToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'desktop') {
      e.stopPropagation();
    }
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const languageIconClasses = classNames(styles.controlIcon, isTransitioning && styles.spinning);

  const controlButtonClasses = classNames(
    styles.controlButton,
    styles[`controlButton--${sidebarMod}`]
  );

  return (
    <Button
      icon={<Globe className={languageIconClasses} aria-hidden="true" />}
      aria-label={t('language')}
      onClick={handleLanguageToggle}
      variant="ghost"
      size="md"
      fullWidth
      title={!showText ? t('language') : undefined}
      className={`${controlButtonClasses} ${className}`}
      data-testid={testId}
    >
      {showText && (
        <span className={styles.controlText}>
          <span className={styles.languageFull}>{t('languageFull')}</span>
        </span>
      )}
    </Button>
  );
};

LanguageSwitch.displayName = 'LanguageSwitch';
