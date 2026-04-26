import type { LucideIcon } from 'lucide-react';
import React from 'react';
import styles from './NavItem.module.scss';

export interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  isHoverExpanded?: boolean;
  onClick?: (href: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  variant?: 'desktop' | 'mobile';
}

export const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive = false,
  isCollapsed = false,
  isHoverExpanded = false,
  onClick,
  onKeyDown,
  variant = 'desktop',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (variant === 'desktop') {
      e.stopPropagation();
    }
    onClick?.(href);
  };

  // Текст показываем когда: развернут ИЛИ hover expansion ИЛИ мобильная версия
  const showLabel = !isCollapsed || isHoverExpanded || variant === 'mobile';

  return (
    <a
      href={href}
      onClick={handleClick}
      onKeyDown={onKeyDown}
      className={`${styles.navItem} ${variant === 'desktop' ? styles.desktop : styles.mobile} ${!isCollapsed || isHoverExpanded ? styles.expanded : ''} ${isActive ? styles.active : ''}`}
      role="menuitem"
      aria-current={isActive ? 'page' : undefined}
      title={isCollapsed && !isHoverExpanded ? label : undefined}
      data-desktop-nav-item={variant === 'desktop' ? true : undefined}
    >
      <Icon className={styles.navIcon} aria-hidden="true" />
      {showLabel && <span className={styles.navLabel}>{label}</span>}
    </a>
  );
};
