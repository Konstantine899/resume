// ============================================
// StatCard — dashboard metric card (admin-panel plan WU-4)
// ============================================
//
// Composes the shared kit Card (reuse-first) and resolves the metric's
// labelKey through t() — the data layer carries i18n keys, never copy.

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Card } from '@/shared/ui/Card';
import React from 'react';
import type { AdminMetric } from '../../model/types/types';
import styles from './StatCard.module.scss';

export interface StatCardProps {
  metric: AdminMetric;
}

export const StatCard: React.FC<StatCardProps> = ({ metric }) => {
  const { t } = useLanguage();

  return (
    <Card className={styles.stat}>
      <p className={styles.label}>{t(metric.labelKey)}</p>
      <p className={styles.value}>{metric.value}</p>
    </Card>
  );
};

StatCard.displayName = 'StatCard';
