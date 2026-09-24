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
  size,
  theme = 'primary',
  align = 'left',
  className = '',
  isGradient = false,
}: HeadingHookProps): UseHeadingReturn {
  return useMemo(() => {
    // Typography control: `level` → .hN base scale, `size` → token size
    // override. Both are emitted ONLY when no custom className is provided —
    // a custom className means the consumer owns typography (feature-level
    // scales like Contact .title / WorkHistoryCard .title), and we must not
    // fight it with .heading.hN (0,2,0) > .title (0,1,0) in source order.
    const levelClass = className ? '' : resolveCssModuleKey(styles, `h${level}`);
    const sizeClass = size && !className ? resolveCssModuleKey(styles, mapSizeToClass(size)) : '';
    // resolveCssModuleKey: сборка экспортирует camelCase-ключи (camelCaseOnly),
    // поэтому kebab-ключи вида `heading--size-2xl` резолвятся в `headingSize2Xl`.
    const themeClass = resolveCssModuleKey(styles, theme);
    const alignClass = resolveCssModuleKey(styles, `align-${align}`);

    const headingClassName = classNames(
      styles.heading,
      levelClass,
      sizeClass,
      themeClass,
      alignClass,
      className
    );

    const attrs: Record<string, string> = {
      'data-level': String(level),
      'data-theme': theme,
      'data-align': align,
    };

    if (size !== undefined) {
      attrs['data-size'] = size;
    }

    if (isGradient) {
      attrs['data-gradient'] = 'true';
    }

    return {
      headingClassName,
      dataAttrs: attrs,
    };
  }, [level, size, theme, align, className, isGradient]);
}
