// ============================================
// Nav Widget - NavControls (language + theme switches)
// ============================================
import { LanguageSwitch } from '@/features/LanguageSwitch';
import { ThemeSwitch } from '@/features/ThemeSwitch';
import { classNames } from '@/shared/lib/utils';
import React from 'react';
import type { NavControlsProps } from '../../model/types';
import styles from './NavControls.module.scss';

/**
 * The switch pair of the Nav right side (issue #138, T4).
 *
 * - Decision R5: order is 🌍 `LanguageSwitch` → 🎨 `ThemeSwitch`; in the
 *   desktop top bar both render as ICON-ONLY buttons carrying the switch's
 *   built-in `title` tooltip (the same mechanism the old Sidebar used in its
 *   collapsed state — `isCollapsed` is the switch API for "icon only").
 *   CTA comes AFTER this component in Nav's right-side container (the
 *   AdminLink placeholder stays unrendered there — recruiter audit P0).
 * - `variant="mobile"` mirrors the old Sidebar MobileMenu composition:
 *   full text rows (reused by the T6 mobile menu panel).
 * - Decision R12: props are typed locally in `model/types.ts` against the
 *   REAL switch components — the stale Sidebar `ThemeSwitchProps` is never
 *   imported.
 */
export const NavControls: React.FC<NavControlsProps> = ({
  variant = 'desktop',
  className = '',
  'data-testid': testId = 'nav-controls-switches',
}) => {
  const isIconOnly = variant === 'desktop';

  return (
    <div
      className={classNames(styles.controls, variant === 'mobile' && styles.mobile, className)}
      data-testid={testId}
    >
      <LanguageSwitch variant={variant} isCollapsed={isIconOnly} fullWidth={!isIconOnly} />
      <ThemeSwitch variant={variant} isCollapsed={isIconOnly} fullWidth={!isIconOnly} />
    </div>
  );
};

NavControls.displayName = 'NavControls';
export default NavControls;
