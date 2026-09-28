// ============================================
// Nav Widget - CtaButton (resume download CTA)
// ============================================
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { IconButton } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import { Download } from 'lucide-react';
import React from 'react';
import { CTA_HREF } from '../../model/constants';
import type { CtaButtonProps } from '../../model/types';

/**
 * Resume CTA of the Nav right side (issue #138, T5).
 *
 * - Decision R7: href is `CTA_HREF` (`#contact`) — points at Contact until a
 *   downloadable resume file exists, so the button is never a dead end.
 *   The constant is imported; the literal never appears here (source guard).
 * - Decision R4: `variant="desktop"` renders the always-visible text CTA
 *   (Link-text-primary with the Download icon — a text link, not a filled
 *   button); `variant="mobile"` renders a compact icon-only anchor carrying an
 *   i18n `aria-label` — the T6 mobile menu reuses the same component.
 * - i18n-first: both labels come from `getResume` via `t()` — never a literal.
 */
export const CtaButton: React.FC<CtaButtonProps> = ({
  variant,
  className = '',
  'data-testid': testId = 'nav-cta',
}) => {
  const { t } = useLanguage();

  if (variant === 'mobile') {
    return (
      <IconButton
        component="a"
        href={CTA_HREF}
        ariaLabel={t('getResume')}
        icon={<Icon name={Download} size={16} color="inherit" decorative />}
        variant="primary"
        size="sm"
        className={className}
        data-testid={testId}
      />
    );
  }

  return (
    <Link
      href={CTA_HREF}
      variant="text-primary"
      size="md"
      className={className}
      data-testid={testId}
      icon={<Icon name={Download} size={16} color="inherit" decorative />}
    >
      {t('getResume')}
    </Link>
  );
};

CtaButton.displayName = 'CtaButton';
export default CtaButton;
