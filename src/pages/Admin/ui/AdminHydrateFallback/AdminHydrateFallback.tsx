// ============================================

// Admin hydration fallback — shown while the lazy /admin chain resolves

// ============================================

// Deep /admin loads hydrate asynchronously (React Router 8 initial-hydration
// path); the route-level `hydrateFallbackElement` prevents the blank frame
// plus RR's missing-HydrateFallback warning. Spinner's default label is
// t('loading') — i18n-first, no copy of our own.
import { Spinner } from '@/shared/ui/Spinner';
import React from 'react';
import styles from './AdminHydrateFallback.module.scss';

export const AdminHydrateFallback: React.FC = () => (
  <div className={styles.fallback} data-testid="admin-hydrate-fallback">
    <Spinner />
  </div>
);

AdminHydrateFallback.displayName = 'AdminHydrateFallback';
