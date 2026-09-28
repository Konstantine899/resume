// src/shared/ui/Button/lib/utils/resolveButtonAppearance.ts

import type { ButtonColorScheme, ButtonVariant } from '../../model/types';

/**
 * Resolved visual appearance of a button.
 * @description Output of {@link resolveButtonAppearance} — a variant/colorScheme pair
 * that is safe to feed into `useButton`.
 */
export interface ButtonAppearance {
  variant: ButtonVariant;
  colorScheme?: ButtonColorScheme;
}

/**
 * Resolves the requested appearance into a renderable variant/colorScheme pair.
 *
 * @remarks
 * `variant="danger"` is a semantic alias: at runtime it renders as `variant="primary"`
 * combined with `colorScheme="danger"` (the `.danger` CSS modifier is never applied).
 *
 * The mapping is idempotent, so it can be applied both at the component call site —
 * replacing the ternary that used to be copy-pasted across Button, IconButton and
 * ButtonWithIcon — and defensively inside `useButton` for direct hook consumers.
 *
 * @param variant - Requested visual variant
 * @param colorScheme - Explicit color scheme; wins over the derived `danger` scheme
 * @returns Appearance to render with
 *
 * @example
 * ```ts
 * resolveButtonAppearance('danger')
 * // → { variant: 'primary', colorScheme: 'danger' }
 * resolveButtonAppearance('outline', 'success')
 * // → { variant: 'outline', colorScheme: 'success' }
 * ```
 */
export const resolveButtonAppearance = (
  variant: ButtonVariant,
  colorScheme?: ButtonColorScheme
): ButtonAppearance => {
  if (variant !== 'danger') {
    return { variant, colorScheme };
  }

  return { variant: 'primary', colorScheme: colorScheme ?? 'danger' };
};
