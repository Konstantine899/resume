// ============================================
// Admin placeholder destination — WU-1 only
// ============================================
//
// Temporary `/admin` content (plan: wiki/plan/admin-panel.md, WU-1). Replaced
// by `pages/Admin` (lazy-loaded) in WU-3 — deliberately hook-light: i18n text
// only. Own module so `react-refresh/only-export-components` keeps the route
// table (constants) and the router component (component) in clean files.
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Heading } from '@/shared/ui/Heading';
import React from 'react';

export const AdminComingSoon: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div data-testid="admin-placeholder">
      <Heading level={1}>{t('navAdmin')}</Heading>
      <p>{t('adminComingSoon')}</p>
    </div>
  );
};

AdminComingSoon.displayName = 'AdminComingSoon';
