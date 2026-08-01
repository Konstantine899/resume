import { useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
import { resolveCssModuleKey } from '@/shared/lib/utils/resolveCssModuleKey';
import type { HeadingHookProps, UseHeadingReturn } from '../../model/types';
import styles from '../../ui/Heading.module.scss';

/**
 * Хук для управления логикой Heading компонента
 *
 * @example
 * ```tsx
 * const { headingClassName, dataAttrs } = useHeading({
 *   level: 1,
 *   size: 'xl',
 *   theme: 'gradient',
 *   align: 'center',
 * });
 * ```
 */
export function useHeading({
  level = 2,
  size = 'm',
  theme = 'primary',
  align = 'left',
  className = '',
  isGradient = false,
}: HeadingHookProps): UseHeadingReturn {
  return useMemo(() => {
    // resolveCssModuleKey: сборка экспортирует camelCase-ключи (camelCaseOnly),
    // поэтому kebab-ключи вида `heading--size-2xl` резолвятся в `headingSize2Xl`.
    const sizeClass = resolveCssModuleKey(styles, `heading--${mapSizeToClass(size)}`);
    const themeClass = resolveCssModuleKey(styles, `heading--theme-${theme}`);
    const alignClass = resolveCssModuleKey(styles, `heading--align-${align}`);

    const headingClassName = classNames(
      styles.heading,
      sizeClass,
      themeClass,
      alignClass,
      className
    );

    const attrs: Record<string, string> = {
      'data-level': String(level),
      'data-size': size,
      'data-theme': theme,
      'data-align': align,
    };

    if (isGradient) {
      attrs['data-gradient'] = 'true';
    }

    return {
      headingClassName,
      dataAttrs: attrs,
    };
  }, [level, size, theme, align, className, isGradient]);
}
