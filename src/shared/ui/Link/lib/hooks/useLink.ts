// src/shared/ui/Link/lib/hooks/useLink.ts

import { useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { getExternalLinkProps, isExternalLink } from '@/shared/lib/utils/externalLink';
import { ICON_SIZE_MAP, LINK_DEFAULTS } from '../../model/constants';
import type { LinkHookProps, UseLinkReturn } from '../../model/types';
import { validateLinkProps } from '../utils/validateLinkProps';
import styles from '../../ui/Link.module.scss';

/**
 * Shared hook, который консолидирует логику Link: вычисление className,
 * генерацию data-атрибутов, определение внешних ссылок (shared utils),
 * безопасные rel/target и инференс размера иконки.
 *
 * @remarks
 * - Called during render (no useEffect wrapper)
 * - Validation runs synchronously ONLY in development mode (guard is internal
 *   to `validateLinkProps` — LNK-15)
 * - Delegates external detection to `isExternalLink`/`getExternalLinkProps`
 *   from `@/shared/lib/utils/externalLink` (single source of truth — LNK-13)
 * - Поведенческий noop: консолидирует 5 inline useMemo из Link.tsx
 *
 * @param props - Link конфигурация (LinkHookProps)
 * @returns Объект с linkClassName, dataAttrs, isExternal, relValue,
 * targetValue и iconSize
 *
 * @example
 * ```typescript
 * const { linkClassName, relValue, targetValue } = useLink({
 *   href: 'https://github.com',
 *   variant: 'primary',
 *   size: 'md',
 * });
 * ```
 */
export const useLink = ({
  href,
  variant = LINK_DEFAULTS.variant,
  size = LINK_DEFAULTS.size,
  external = LINK_DEFAULTS.external,
  unstyled = LINK_DEFAULTS.unstyled,
  underline = LINK_DEFAULTS.underline,
  withLift = LINK_DEFAULTS.withLift,
  skeleton = LINK_DEFAULTS.skeleton,
  requireHref = LINK_DEFAULTS.requireHref,
  className,
  rel,
  target,
  component,
}: LinkHookProps): UseLinkReturn => {
  // Синхронная валидация (только development — guard внутри валидатора)
  validateLinkProps({ href, variant, size, underline, requireHref, skeleton });

  // Memoized: Авто-определение внешних ссылок (delegates to shared utils)
  const isExternal = useMemo(() => external || isExternalLink(href), [external, href]);

  // Memoized: Безопасные rel/target для внешних ссылок (delegates to shared utils)
  const { relValue, targetValue } = useMemo(() => {
    if (isExternal) {
      const { rel: externalRel, target: externalTarget } = getExternalLinkProps(rel);
      return { relValue: externalRel, targetValue: externalTarget };
    }
    return { relValue: rel, targetValue: target };
  }, [isExternal, rel, target]);

  // Memoized: Консистентный размер иконки (ICON_SIZE_MAP в model/constants)
  const iconSize = useMemo(() => ICON_SIZE_MAP[size], [size]);

  // Memoized: Вычисление className для ссылки
  const linkClassName = useMemo(
    () =>
      classNames(
        styles.link,
        styles[variant],
        styles[size],
        unstyled && styles.unstyled,
        underline === 'always' && styles.underlineAlways,
        underline === 'hover' && styles.underlineHover,
        underline === 'never' && styles.underlineNever,
        withLift && styles.withLift,
        skeleton && styles.skeleton,
        className
      ),
    [variant, size, unstyled, underline, withLift, skeleton, className]
  );

  // Data-атрибуты для стилизации и тестирования.
  // data-as присутствует только для строковых элементов (компоненты его не имеют).
  const dataAttrs: Record<string, string> = {
    'data-variant': variant,
    'data-size': size,
    ...(typeof component === 'string' ? { 'data-as': component } : {}),
    ...(isExternal ? { 'data-external': 'true' } : {}),
  };

  return {
    linkClassName,
    dataAttrs,
    isExternal,
    relValue,
    targetValue,
    iconSize,
  };
};
