// ============================================
// AdminGate — dev login gate for /admin (plan §8.4-B, WU-5)
// ============================================
//
// Variant B (chosen 2026-09-30): no secret in the URL — a localStorage
// flag decides. Slice = live state (hydrated from the flag at store
// creation); every transition writes BOTH the slice and the flag, so the
// two never diverge. Replacing the flag with a JWT later touches only
// this component's condition (§8.4 migration note).

import { useLanguage } from '@/shared/lib/i18n/hooks';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Heading } from '@/shared/ui/Heading';
import React from 'react';
import type { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { enter } from '../model/authSlice';
import { selectIsAuthed } from '../model/selectors';
import { persistAdminAuth } from '../model/storage';
import styles from './AdminGate.module.scss';

export interface AdminGateProps {
  children: ReactNode;
}

export const AdminGate: React.FC<AdminGateProps> = ({ children }) => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const isAuthed = useSelector(selectIsAuthed);

  if (isAuthed) {
    return <>{children}</>;
  }

  const handleLogin = (): void => {
    persistAdminAuth(true);
    dispatch(enter());
  };

  return (
    <div className={styles.gate} data-testid="admin-gate">
      <Card className={styles.panel}>
        <Heading level={2}>{t('adminGateTitle')}</Heading>
        <Button variant="primary" onClick={handleLogin}>
          {t('adminLoginDev')}
        </Button>
        <Link to="/" className={styles.backLink} data-testid="admin-gate-back-to-site">
          {t('adminBackToSite')}
        </Link>
      </Card>
    </div>
  );
};

AdminGate.displayName = 'AdminGate';
