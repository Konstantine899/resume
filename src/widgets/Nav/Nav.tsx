// ============================================
// Nav Widget - Sticky Top Bar
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import React from 'react';
import styles from './Nav.module.scss';
import { sectionIdFromHref, useNavigation } from './lib/useNavigation';
import { NAV_ITEMS } from './model/constants';
import type { NavProps } from './model/types';

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
              <Link
                unstyled
                variant="ghost"
                underline="never"
                href={item.href}
                className={styles.link}
                aria-current={activeSection === sectionIdFromHref(item.href) ? 'page' : undefined}
                onClick={() => onNavClick(item.href)}
              >
                <Icon name={item.icon} size={16} color="inherit" decorative />
                <span>{t(item.labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Right-side controls: ThemeSwitch, LanguageSwitch, CTA, AdminLink (T4/T5). */}
        <div className={styles.controls} data-testid="nav-controls" />
      </nav>
    </header>
  );
};

Nav.displayName = 'Nav';
export default Nav;
