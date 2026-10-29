// ============================================
// Nav Widget - AdminLink (admin area placeholder)
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { ReactReduxContext } from 'react-redux';

import { selectIsAdmin } from '@/features/Auth';
import { ADMIN_HREF } from '../../model/constants';
import type { AdminLinkProps } from '../../model/types/types';

const AdminLinkView: React.FC<AdminLinkProps> = ({
  className = '',
  'data-testid': testId = 'nav-admin-link',
}) => {
  const { t } = useLanguage();

  return (
    <a
      href={ADMIN_HREF}
      aria-label={t('navAdmin')}
      title={t('navAdmin')}
      className={className}
      data-testid={testId}
    >
      {t('navAdmin')}
    </a>
  );
};

const ConnectedAdminLink: React.FC<AdminLinkProps> = (props) => {
  const isAdmin = useSelector(selectIsAdmin);
  if (!isAdmin) return null;
  return <AdminLinkView {...props} />;
};

export const AdminLink: React.FC<AdminLinkProps> = (props) => {
  const ctx = useContext(ReactReduxContext);
  if (!ctx) return <AdminLinkView {...props} />;
  return <ConnectedAdminLink {...props} />;
};

AdminLink.displayName = 'AdminLink';
export default AdminLink;
