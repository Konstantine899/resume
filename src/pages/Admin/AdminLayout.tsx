// ============================================
// Admin area — layout shell: header + sidebar + <Outlet/> (plan WU-3)
// ============================================
//
// Resolves as the lazy PARENT route `/admin` in routerConfig; child routes
// (index stub, settings) render through <Outlet/>.
//
// Reuse (reuse-first): the header composes the showcase switch pair from the
// FEATURES directly — widgets/Nav's NavControls is not exported through the
// Nav public API, so deep-importing it would violate fsd public-api rules.
// All copy through i18n keys (i18n-first); styles token-only (shared/styles).
//
// WU-5: the whole shell sits behind AdminGate (§8.4-B) — no persisted flag
// and the visitor gets the dev-login panel instead of header/sidebar/outlet.
import { AdminGate, logout } from '@/features/AdminAuth';
import { LanguageSwitch } from '@/features/LanguageSwitch';
import { ThemeSwitch } from '@/features/ThemeSwitch';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/Button';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, NavLink, Outlet } from 'react-router';
import styles from './AdminLayout.module.scss';

const navLinkClassName = ({ isActive }: { isActive: boolean }): string =>
  classNames(styles.navLink, isActive && styles.navLinkActive);

export const AdminLayout: React.FC = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    logout(dispatch);
  };

  return (
    <AdminGate>
      <div className={styles.layout} data-testid="admin-layout">
        <header className={styles.header}>
          <span className={styles.brand}>{t('navAdmin')}</span>
          <div className={styles.controls}>
            <LanguageSwitch variant="desktop" isCollapsed fullWidth={false} />
            <ThemeSwitch variant="desktop" isCollapsed fullWidth={false} />
            <Button
              variant="ghost"
              size="sm"
              className={styles.logout}
              onClick={handleLogout}
              data-testid="admin-logout"
            >
              {t('adminLogout')}
            </Button>
          </div>
          <Link to="/" className={styles.backLink} data-testid="admin-back-to-site">
            {t('adminBackToSite')}
          </Link>
        </header>

        <div className={styles.body}>
          <nav
            className={styles.sidebar}
            aria-label={t('adminNavLabel')}
            data-testid="admin-sidebar"
          >
            <NavLink to="/admin" end className={navLinkClassName}>
              {t('adminNavDashboard')}
            </NavLink>
            <NavLink to="/admin/settings" className={navLinkClassName}>
              {t('adminNavSettings')}
            </NavLink>
          </nav>

          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGate>
  );
};

AdminLayout.displayName = 'AdminLayout';
