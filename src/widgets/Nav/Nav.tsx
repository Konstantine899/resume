// ============================================
// Nav Widget - Sticky Top Bar
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import { IconButton } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Menu, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import styles from './Nav.module.scss';
import { sectionIdFromHref, useNavigation } from './lib/useNavigation';
import { MOBILE_MENU_ID, NAV_ITEMS } from './model/constants';
import type { NavProps } from './model/types';
import { CtaButton } from './ui/CtaButton';
import { MobileMenu } from './ui/MobileMenu';
import { NavControls } from './ui/NavControls';
import { NavItem } from './ui/NavItem';
import { SocialLinks } from './ui/SocialLinks';

/**
 * Sticky top navigation bar (issue #138).
 *
 * Renders a semantic `<header>` with `position: sticky; top: 0` and
 * `z-index: var(--z-nav)` — above page content, below overlays/modals.
 * While the mobile menu is open the header context rises to
 * `var(--z-sidebar)` so the panel and the elevated burger honour the
 * z-index plan (content < panel/burger < Modal < Toast).
 *
 * Decision R6: the page keeps exactly ONE skip link (in HomePage); this
 * widget never renders its own.
 *
 * Active-section highlighting and click handling come from `useNavigation`
 * (single state owner, plan §5; NAV_ITEMS-derived tracking, decision R8).
 * Desktop renders `NavItem` rows left, `NavControls` + `CtaButton` +
 * social links right (R5). Mobile renders the burger ☰/✕ toggle with the
 * compact CTA beside it (R4), and the T6 `MobileMenu` panel (R9/R10/R11).
 * The `AdminLink` 🔐 placeholder stays available as a component but is no
 * longer rendered on any public nav surface (recruiter audit P0).
 */
export const Nav: React.FC<NavProps> = ({
  className = '',
  onNavigation,
  'data-testid': testId = 'nav',
}) => {
  const { t } = useLanguage();
  const { activeSection, onNavClick, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } =
    useNavigation({ onNavigation });

  const burgerRef = useRef<HTMLButtonElement>(null);
  // R11 return-focus: any close transition hands focus back to the burger —
  // covers Escape/backdrop (onClose) AND section-click closes (onNavClick).
  const wasMobileMenuOpen = useRef(false);

  useEffect(() => {
    if (wasMobileMenuOpen.current && !isMobileMenuOpen) {
      burgerRef.current?.focus();
    }
    wasMobileMenuOpen.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  return (
    <header
      className={classNames(styles.header, isMobileMenuOpen && styles.menuOpen, className)}
      data-testid={testId}
    >
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

        {/* Mobile actions (R4): burger ☰/✕ toggle + compact CTA — hidden at the desktop breakpoint. */}
        <div className={styles.mobileActions} data-testid="nav-mobile-actions">
          <IconButton
            ref={burgerRef}
            variant="ghost"
            size="md"
            icon={<Icon name={isMobileMenuOpen ? X : Menu} size={20} color="inherit" decorative />}
            ariaLabel={isMobileMenuOpen ? t('navMenuClose') : t('navMenuOpen')}
            aria-expanded={isMobileMenuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={toggleMobileMenu}
            className={styles.burger}
            data-testid="nav-burger"
          />
          <CtaButton variant="mobile" data-testid="nav-cta-mobile" />
        </div>

        {/* Right-side controls (decision R5): 🌍🎨 switches (T4) → 📄 CTA → socials. */}
        <div className={styles.controls} data-testid="nav-controls">
          <NavControls />
          <CtaButton variant="desktop" />
          <SocialLinks />
        </div>
      </nav>

      {/* T6: mobile slide-in panel (R9 dialog, R10 plain links, R11 focus trap). */}
      <MobileMenu
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onNavigate={onNavClick}
        activeSection={activeSection}
      />
    </header>
  );
};

Nav.displayName = 'Nav';
export default Nav;
