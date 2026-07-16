// src/shared/ui/Link/model/constants.ts

import type { LinkSize, LinkUnderline, LinkVariant } from './types';

export const LINK_CONSTANTS = {
  VALID_VARIANTS: ['primary', 'secondary', 'ghost', 'gradient'] as const,
  VALID_SIZES: ['sm', 'md', 'lg'] as const,
  VALID_UNDERLINE: ['always', 'hover', 'never'] as const,
} as const;

export interface LinkDefaults {
  variant: LinkVariant;
  size: LinkSize;
  external: boolean;
  showExternalIcon: boolean;
  unstyled: boolean;
  underline: LinkUnderline;
  withLift: boolean;
  requireHref: boolean;
  skeleton: boolean;
}

export const LINK_DEFAULTS: LinkDefaults = {
  variant: 'primary',
  size: 'md',
  external: false,
  showExternalIcon: true,
  unstyled: false,
  underline: 'hover',
  withLift: false,
  requireHref: true,
  skeleton: false,
};
