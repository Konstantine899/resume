// ============================================
// DashboardPage — first admin page (admin-panel plan WU-4)
// ============================================
//
// Renders the adminDashboard slice through the shared CardGrid/StatCard
// stack; empty store → localized empty state. Lives in pages (it is a
// route component) and composes the feature via its public API (FSD).

import {
  selectAdminMetrics,
  StatCard,
  type AdminDashboardRootState,
} from '@/features/AdminDashboard';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { CardGrid } from '@/shared/ui/Card';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Heading } from '@/shared/ui/Heading';
import React from 'react';
import { useSelector } from 'react-redux';
import styles from './DashboardPage.module.scss';

export const DashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const metrics = useSelector((state: AdminDashboardRootState) => selectAdminMetrics(state));

  return (
    <div className={styles.dashboard} data-testid="admin-dashboard">
      <Heading level={1}>{t('adminNavDashboard')}</Heading>
      {metrics.length === 0 ? (
        <EmptyState title={t('adminDashboardEmpty')} />
      ) : (
        <CardGrid>
          {metrics.map((metric) => (
            <StatCard key={metric.id} metric={metric} />
          ))}
        </CardGrid>
      )}
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
