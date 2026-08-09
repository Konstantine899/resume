// src/shared/ui/AspectRatio/lib/utils/validateAspectRatioProps.ts

import { DEFAULT_RATIO } from '@/shared/ui/AspectRatio/model/constants';
import type { AspectRatioString } from '@/shared/ui/AspectRatio/model/types';

/**
 * Validate the AspectRatio `ratio` prop in development mode.
 *
 * Rejects values that do not match a plain "width/height" integer pair
 * (`/^\d+\/\d+$/` — floats like "1.5/2" fail) and falls back to
 * DEFAULT_RATIO at runtime elsewhere. Self-guarded: a no-op outside
 * development, so callers need no external guard (AR-07).
 *
 * @param props - { ratio } to validate
 *
 * @example
 * ```ts
 * validateAspectRatioProps({ ratio: 'abc' });
 * // Warns: AspectRatio: invalid ratio "abc". Using default "16/9"...
 * ```
 */
export function validateAspectRatioProps({ ratio }: { ratio?: AspectRatioString }): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (ratio === undefined) return;

  const validRatioPattern = /^\d+\/\d+$/;

  if (!validRatioPattern.test(ratio)) {
    // eslint-disable-next-line no-console
    console.warn(
      `AspectRatio: invalid ratio "${ratio}". Expected format "width/height" ` +
        `(e.g. "16/9", "4/3"). Falling back to default "${DEFAULT_RATIO}".`
    );
  }
}
