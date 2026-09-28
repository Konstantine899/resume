import type { BadgeVariant, BadgeSize } from './types';

export const BADGE_VARIANTS: BadgeVariant[] = [
  'default',
  'success',
  'warning',
  'error',
  'accent',
  'outline',
];

export const BADGE_SIZES: BadgeSize[] = ['sm', 'md', 'lg'];

export const BADGE_DEFAULTS = {
  variant: 'default' as BadgeVariant,
  size: 'md' as BadgeSize,
  disabled: false,
};

/** role="status" применяется для этих вариантов */
export const STATUS_VARIANTS: BadgeVariant[] = ['success', 'warning', 'error'];

/** Автоматический aria-label для статусных вариантов */
export const ARIA_LABEL_MAP: Record<string, string> = {
  success: 'Badge: success',
  warning: 'Badge: warning',
  error: 'Badge: error',
};
