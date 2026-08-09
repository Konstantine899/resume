// src/shared/ui/AspectRatio/model/constants.ts

/**
 * Default ratio used at runtime when the `ratio` prop is missing/invalid.
 * The type-level `ratio` stays required; this fallback only guards
 * `as any` misuse or an invalid format caught by the dev validator.
 */
export const DEFAULT_RATIO = '16/9';
