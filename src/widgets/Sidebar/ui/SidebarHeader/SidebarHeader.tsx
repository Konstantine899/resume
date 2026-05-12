import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Link } from '@/shared/ui/Link';
import React from 'react';
import styles from './SidebarHeader.module.scss';

export interface SidebarHeaderProps {
  isCollapsed: boolean;
  isHoverExpanded?: boolean;
  onClick?: () => void;
  variant?: 'desktop' | 'mobile';
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  isCollapsed = false,
  isHoverExpanded = false,
  onClick,
  variant = 'desktop',
}) => {
  const { t } = useLanguage();

  // Показываем полный текст когда: НЕ collapsed ИЛИ hover expansion ИЛИ мобильная версия
  const showFullText = !isCollapsed || isHoverExpanded || variant === 'mobile';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'desktop') {
      e.stopPropagation();
    }
    onClick?.();
  };

  return (
    <div className={`${styles.header} ${variant === 'desktop' ? styles.desktop : styles.mobile}`}>
      <Link
        href="#home"
        variant="ghost"
        underline="never"
        onClick={handleClick}
        className={styles.logoLink}
        aria-label="Go to homepage"
      >
        {showFullText ? (
          <span className={styles.logoTextFull}>{t(`name`)}</span>
        ) : (
          <span className={styles.logoTextShort}>K</span>
        )}
      </Link>
    </div>
  );
};
