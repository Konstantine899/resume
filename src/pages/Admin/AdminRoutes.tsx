// ============================================
// Admin area route module — lazy boundary (admin-panel plan WU-2)
// ============================================
//
// Mounted via `lazy: () => import('./Admin/AdminRoutes')` in routerConfig,
// so the admin page module (and everything WU-3+ adds behind it) stays out
// of the showcase bundle. Deliberately hook-light placeholder for now: i18n
// text only. Own module so `react-refresh/only-export-components` keeps the
// route table (constants) and the route component (component) in clean files.
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Heading } from '@/shared/ui/Heading';
import React from 'react';

export const AdminRoutes: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div data-testid="admin-placeholder">
      <Heading level={1}>{t('navAdmin')}</Heading>
      <p>{t('adminComingSoon')}</p>
    </div>
  );
};

AdminRoutes.displayName = 'AdminRoutes';
