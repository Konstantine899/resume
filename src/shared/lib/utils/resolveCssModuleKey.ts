/**
 * Resolves a CSS module class key when the SCSS class name uses kebab-case
 * but the build exports camelCase-only keys (see buildCssModulesConfig,
 * `localsConvention: 'camelCaseOnly'`).
 *
 * @example
 * ```ts
 * resolveCssModuleKey(styles, 'size-2xl')     // styles['size2Xl'] ?? ''
 * resolveCssModuleKey(styles, 'line-clamp-3') // styles['lineClamp3'] ?? ''
 * resolveCssModuleKey(styles, 'primary')      // styles['primary'] (direct hit)
 * ```
 *
 * Strategy:
 * 1. Try the key as-is (single-word classes and non-camelCaseOnly builds).
 * 2. Try the camelized variant (kebab-case → camelCase).
 * 3. Fallback: case-insensitive scan stripping non-alphanumeric characters.
 *
 * Returns an empty string instead of `undefined`, so callers never leak the
 * literal string `"undefined"` into the DOM class list.
 */
export const resolveCssModuleKey = <T extends Record<string, string>>(
  styles: T,
  key: string
): string => {
  const direct = styles[key];
  if (direct) {
    return direct;
  }

  const camelized = key.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  if (camelized !== key) {
    const camel = styles[camelized];
    if (camel) {
      return camel;
    }
  }

  const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = Object.keys(styles).find(
    (candidate) => candidate.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey
  );

  return match ? styles[match] : '';
};
