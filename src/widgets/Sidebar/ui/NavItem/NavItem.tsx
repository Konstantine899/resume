import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { Link } from '@/shared/ui/Link';
import { Tooltip } from '@/shared/ui/Tooltip';
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

  // Collapsed-desktop: рендерим только иконку, label уходит в Tooltip.
  // Невизуальный (фокус) триггер, чтобы не мешать hover-expand навигации.
  // role="menuitem" пробрасывается через Tooltip (полиморфный as).
  const iconOnlyDesktop = variant === 'desktop' && isCollapsed && !isHoverExpanded;

  const anchorClassName = `${styles.navItem} ${styles.desktop} ${!isCollapsed || isHoverExpanded ? styles.expanded : ''} ${isActive ? styles.active : ''}`;
  const anchorContent = (
    <>
      <Icon className={styles.navIcon} aria-hidden="true" />
      {showLabel && <span className={styles.navLabel}>{label}</span>}
    </>
  );

  // В collapsed-desktop используем Tooltip как триггер-ссылочку (as="a")
  // с сохранением всех навигационных атрибутов и роли menuitem.
  const anchorProps = {
    href,
    onClick: handleClick,
    onKeyDown,
    role: 'menuitem' as const,
    'aria-current': isActive ? ('page' as const) : undefined,
    'data-desktop-nav-item': variant === 'desktop' ? true : undefined,
  };

  if (iconOnlyDesktop) {
    return (
      <Tooltip
        {...anchorProps}
        as="a"
        content={label}
        position="right"
        trigger="focus"
        className={anchorClassName}
      >
        {anchorContent}
      </Tooltip>
    );
  }

  return (
    <Link unstyled variant="ghost" underline="never" {...anchorProps} className={anchorClassName}>
      {anchorContent}
    </Link>
  );
};
