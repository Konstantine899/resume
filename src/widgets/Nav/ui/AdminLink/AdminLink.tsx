// ============================================
// Nav Widget - AdminLink (admin area placeholder)
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { IconButton } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Tooltip } from '@/shared/ui/Tooltip';
import { Lock } from 'lucide-react';
import React from 'react';
import { ADMIN_HREF } from '../../model/constants';
import type { AdminLinkProps } from '../../model/types';

/**
 * 🔐 admin entry of the Nav right side (issue #138, T5; wired back in WU-1).
 *
 * - Decision R3: a plain anchor to `ADMIN_HREF` (a REAL `/admin` path route
 *   since WU-1 — full document navigation on purpose: entering the admin
 *   area is a section boundary, and Storybook has no router context). The
 *   constant is imported; the literal never appears here (source guard).
 * - Decision R5: icon-only (no visible text) — an i18n `aria-label` carries
 *   the accessible name, and the SHARED `Tooltip` (position `bottom`, the
 *   side facing away from the top bar) supplies the sighted hover hint. The
 *   native `title` attribute was rejected: it cannot satisfy
 *   `getByRole('tooltip')` in the spec test.
 * - i18n-first: label AND tooltip text come from `navAdmin` via `t()`.
 */
export const AdminLink: React.FC<AdminLinkProps> = ({
  className = '',
  'data-testid': testId = 'nav-admin-link',
}) => {
  const { t } = useLanguage();

  return (
    <Tooltip content={t('navAdmin')} position="bottom">
      <IconButton
        component="a"
        href={ADMIN_HREF}
        ariaLabel={t('navAdmin')}
        icon={<Icon name={Lock} size={18} color="inherit" decorative />}
        variant="ghost"
        size="md"
        className={className}
        data-testid={testId}
      />
    </Tooltip>
  );
};

AdminLink.displayName = 'AdminLink';
export default AdminLink;
