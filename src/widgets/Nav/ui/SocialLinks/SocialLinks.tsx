// ============================================
// Nav Widget - SocialLinks (GitHub / LinkedIn / Telegram)
// ============================================
import { SOCIAL_LINKS } from '@/entities/Developer';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { classNames } from '@/shared/lib/utils';
import { Icon } from '@/shared/ui/Icon';
import { Link } from '@/shared/ui/Link';
import React from 'react';
import type { SocialLinksProps } from '../../model/types/types';
import styles from './SocialLinks.module.scss';

/**
 * Icon-only social profile links of the Nav right side (recruiter audit P1).
 *
 * - Reuses the shared `SOCIAL_LINKS` entity constants (single source of
 *   truth with the Contact/Hero socials) and the brand `Icon`s from
 *   `shared/ui/Icon`.
 * - i18n-first: every accessible name comes from the entry's `labelKey`
 *   via `t()` — never a literal.
 * - Rendered as a plain flex row (NOT a `<ul>`): a second list inside the
 *   one `<nav>` landmark would break the "exactly one list" contracts the
 *   Nav/MobileMenu specs pin to the section list.
 * - `variant="mobile"` mirrors the drawer layout (row hugs the left edge
 *   of the panel footer instead of stretching across it).
 */
export const SocialLinks: React.FC<SocialLinksProps> = ({
  variant = 'desktop',
  className = '',
  'data-testid': testId = 'nav-social-links',
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={classNames(styles.links, variant === 'mobile' && styles.mobile, className)}
      data-testid={testId}
    >
      {SOCIAL_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          external
          showExternalIcon={false}
          variant="text-primary"
          size="sm"
          className={styles.link}
          aria-label={t(link.labelKey)}
        >
          <Icon name={link.icon} size={16} color="inherit" decorative />
        </Link>
      ))}
    </div>
  );
};

SocialLinks.displayName = 'SocialLinks';
export default SocialLinks;
