// ============================================
// Nav Widget - NavItem (section link row)
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import React from 'react';
import type { NavItem as NavItemModel, NavItemVariant } from '../../model/types';
import styles from './NavItem.module.scss';

export interface NavItemProps {
  /** Section entry from NAV_ITEMS (single source of truth, decision R8). */
  item: NavItemModel;
  /** Whether this section is active — drives `aria-current` + active styling. */
  active?: boolean;
  /** Fired on activation; the parent wires it to `useNavigation.onNavClick`. */
  onNavigate?: () => void;
  /** Horizontal top bar (desktop) or full-width row (mobile menu, T6). */
  variant?: NavItemVariant;
  className?: string;
  'data-testid'?: string;
}

/**
 * One section link of the Nav widget — ported from the old Sidebar NavItem
 * for the horizontal top bar (issue #138, T3).
 *
 * - Composes the shared `Link` (ghost variant, `unstyled`) exactly like the
 *   old NavItem, including its `.desktop.active` specificity trick that
 *   overrides `Link.ghost` (0,3,0 > 0,2,0).
 * - i18n-first: the visible label always comes from `item.labelKey` via
 *   `t()` — never a hardcoded literal.
 * - Decision R10: `variant="mobile"` renders regular link semantics
 *   (`role="link"`), never an orphaned `menuitem`.
 */
export const NavItem: React.FC<NavItemProps> = ({
  item,
  active = false,
  onNavigate,
  variant = 'desktop',
  className,
  'data-testid': testId,
}) => {
  const { t } = useLanguage();

  const anchorClassName = classNames(
    styles.navItem,
    variant === 'mobile' ? styles.mobile : styles.desktop,
    active && styles.active,
    className
  );

  return (
    <Link
      unstyled
      variant="ghost"
      underline="never"
      href={item.href}
      className={anchorClassName}
      aria-current={active ? 'page' : undefined}
      // R10: the mobile row is a regular link — `menuitem` without a
      // `menubar` parent (old Sidebar mobile variant) is invalid ARIA.
      role={variant === 'mobile' ? 'link' : undefined}
      data-testid={testId}
      onClick={onNavigate}
    >
      <Icon name={item.icon} size={16} color="inherit" decorative />
      <span className={styles.navLabel}>{t(item.labelKey)}</span>
    </Link>
  );
};

NavItem.displayName = 'NavItem';
export default NavItem;
