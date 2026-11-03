// ============================================
// Admin area — Settings stub page (admin-panel plan WU-3)
// ============================================
//
// Child route `/admin/settings` rendered through AdminLayout's <Outlet/>.
// Same deliberately hook-light pattern as AdminRoutes: i18n text only until
// real settings land. Own module so react-refresh/only-export-components
// keeps route-table constants, the layout shell and page components separate.
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Heading } from '@/shared/ui/Heading';
import React from 'react';

export const AdminSettings: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div data-testid="admin-settings">
      <Heading level={1}>{t('adminSettings')}</Heading>
      <p>{t('adminComingSoon')}</p>
    </div>
  );
};

AdminSettings.displayName = 'AdminSettings';
