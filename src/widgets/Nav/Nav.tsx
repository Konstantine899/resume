// ============================================
// Nav Widget - Sticky Top Bar
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import React from 'react';
import styles from './Nav.module.scss';
import { sectionIdFromHref, useNavigation } from './lib/useNavigation';
import { NAV_ITEMS } from './model/constants';
import type { NavProps } from './model/types';
import { AdminLink } from './ui/AdminLink';
import { CtaButton } from './ui/CtaButton';
import { NavControls } from './ui/NavControls';
import { NavItem } from './ui/NavItem';

/**
 * Sticky top navigation bar (issue #138).
 *
 * Renders a semantic `<header>` with `position: sticky; top: 0` and
 * `z-index: var(--z-nav)` — above page content, below overlays/modals.
 *
 * Decision R6: the page keeps exactly ONE skip link (in HomePage); this
 * widget never renders its own.
 *
 * Active-section highlighting and click handling come from `useNavigation`
 * (single state owner, plan §5; NAV_ITEMS-derived tracking, decision R8).
 * Section rows are rendered by `NavItem` (T3); the right side pairs
 * `NavControls` (T4) with the `CtaButton` + `AdminLink` of T5 in the order
 * of decision R5. The mobile menu panel that will reuse the same components
 * with `variant="mobile"` lands in T6.
 */
export const Nav: React.FC<NavProps> = ({
  className = '',
  onNavigation,
  'data-testid': testId = 'nav',
}) => {
  const { t } = useLanguage();
  const { activeSection, onNavClick } = useNavigation({ onNavigation });

  return (
    <header className={classNames(styles.header, className)} data-testid={testId}>
      <nav className={styles.nav} aria-label={t('navAriaLabel')}>
        <ul className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavItem
                item={item}
                variant="desktop"
                active={activeSection === sectionIdFromHref(item.href)}
                onNavigate={() => onNavClick(item.href)}
              />
            </li>
          ))}
        </ul>

        {/* Right-side controls (decision R5): 🌍🎨 switches (T4) → 📄 CTA → 🔐 AdminLink (T5). */}
        <div className={styles.controls} data-testid="nav-controls">
          <NavControls />
          <CtaButton variant="desktop" />
          <AdminLink />
        </div>
      </nav>
    </header>
  );
};

Nav.displayName = 'Nav';
export default Nav;
