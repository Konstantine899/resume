import { useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { mapSizeToClass } from '@/shared/lib/utils/mapSizeToClass';
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
    const sizeBaseClass = `heading--${mapSizeToClass(size)}`;
    const sizeClass = styles[sizeBaseClass] ?? '';
    const themeClass = styles[`heading--theme-${theme}`] ?? '';
    const alignClass = styles[`heading--align-${align}`] ?? '';

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
