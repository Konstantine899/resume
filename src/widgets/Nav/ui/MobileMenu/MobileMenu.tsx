// ============================================
// Nav Widget - MobileMenu (slide-in panel)
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import { getFirstFocusableElement } from '@/shared/lib/utils/focusTrap';
import { Overlay } from '@/shared/ui/Overlay';
import React, { useEffect, useRef } from 'react';
import { sectionIdFromHref, trapFocus } from '../../lib/useNavigation';
import { MOBILE_MENU_ID, NAV_ITEMS } from '../../model/constants';
import { AdminLink } from '../AdminLink';
import { NavControls } from '../NavControls';
import { NavItem } from '../NavItem';
import styles from './MobileMenu.module.scss';

export interface MobileMenuProps {
  /** Controlled open state from `useNavigation.isMobileMenuOpen` (R11). */
  open: boolean;
  /** Requested close — Escape/backdrop; Nav returns focus to the burger. */
  onClose: () => void;
  /** Section activation — wired to `useNavigation.onNavClick` (R8). */
  onNavigate?: (href: string) => void;
  /** Currently active section id (from `useNavigation.activeSection`). */
  activeSection?: string;
  'data-testid'?: string;
}

/**
 * Slide-in mobile menu panel of the Nav widget (issue #138, T6).
 *
 * - Decision R9: `role="dialog" aria-modal="true"` with an i18n `aria-label`
 *   (`navMenuLabel`) — and NO inner `role="navigation"` wrapper: the section
 *   rows are a plain `<ul>` belonging to the ONE navigation landmark that
 *   lives on Nav's own `<nav>`.
 * - Decision R4: panel content is sections (NavItem `mobile`) + 🌍🎨 switch
 *   rows (`NavControls variant="mobile"`) + 🔐 `AdminLink`. NO CTA (it stays
 *   in the header), NO header, NO footer — unlike the old Sidebar panel.
 * - Decision R11: `trapFocus(panelRef, onClose)` from `useNavigation` binds
 *   the WORKING focus trap while open — Tab cycles inside the panel,
 *   Escape closes. Initial focus mirrors the old Sidebar: the first panel
 *   item receives focus on open; returning focus to the burger is Nav's job
 *   (the hook state owner observes the close transition).
 * - Visuals ported from the old `Sidebar/ui/MobileMenu` styles, adapted to
 *   theme tokens (`--mobile-menu-*`, `--z-sidebar`) — no literal colors.
 */
export const MobileMenu: React.FC<MobileMenuProps> = ({
  open,
  onClose,
  onNavigate,
  activeSection = '',
  'data-testid': testId = MOBILE_MENU_ID,
}) => {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  // R11: bind the focus trap while open — Tab cycles within the panel,
  // Escape forwards to onClose. Old-parity initial focus: first item.
  useEffect(() => {
    if (!open) return undefined;

    const releaseTrap = trapFocus(panelRef, onClose);
    const container = panelRef.current;
    if (container) getFirstFocusableElement(container)?.focus();

    return releaseTrap;
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      id={MOBILE_MENU_ID}
      className={classNames(styles.overlay, open && styles.open)}
      role="dialog"
      aria-modal="true"
      aria-label={t('navMenuLabel')}
      aria-hidden={!open}
      data-testid={testId}
    >
      {/* Sections — a plain <ul>, NOT a second role="navigation" (R9). */}
      <div className={styles.panel}>
        <ul className={styles.sections}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavItem
                item={item}
                variant="mobile"
                active={activeSection === sectionIdFromHref(item.href)}
                onNavigate={() => onNavigate?.(item.href)}
              />
            </li>
          ))}
        </ul>

        {/* R4 panel footer block: 🌍🎨 rows + 🔐 — no CTA, no header, no footer text. */}
        <div className={styles.controls}>
          <NavControls variant="mobile" />
          <AdminLink className={styles.adminLink} />
        </div>
      </div>

      {/* Scrim BELOW the panel inside this stacking context (z 1 < panel z 2);
          the shared Overlay supplies the fade + blur of the old menu. */}
      <Overlay visible={open} blur onClick={onClose} zIndex={1} />
    </div>
  );
};

MobileMenu.displayName = 'MobileMenu';
export default MobileMenu;
