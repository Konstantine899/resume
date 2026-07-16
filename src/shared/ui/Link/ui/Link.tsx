// src/shared/ui/Link/ui/Link.tsx

import { classNames } from '@/shared/lib/utils/classNames';
import type { IconSize } from '@/shared/ui/Icon';
import { Icon } from '@/shared/ui/Icon';
import { ExternalLink } from 'lucide-react';
import { forwardRef, memo, useMemo } from 'react';
import type { LinkProps } from '../model/types';
import { LINK_DEFAULTS } from '../model/constants';
import { validateLinkProps } from '../lib/utils/validateLinkProps';
import { Skeleton } from '@/shared/ui/Skeleton';
import styles from './Link.module.scss';

/**
 * Link компонент для отображения ссылок
 *
 * @description
 * Поддерживает варианты (primary, secondary, ghost, gradient),
 * размеры, иконки, внешние ссылки, underline-режимы и skeleton-загрузку.
 *
 * @group UI Components
 *
 * @example
 * ```tsx
 * <Link href="/about" variant="primary" size="lg">
 *   About Page
 * </Link>
 * ```
 *
 * @example
 * ```tsx
 * <Link href="https://github.com" external>
 *   GitHub Profile
 * </Link>
 * ```
 *
 * @example
 * ```tsx
 * // Skeleton loading state
 * <Link href="/profile" skeleton>Profile</Link>
 * ```
 */
const LinkComponent = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      children,
      variant = LINK_DEFAULTS.variant,
      size = LINK_DEFAULTS.size,
      external = LINK_DEFAULTS.external,
      icon,
      iconRight,
      showExternalIcon = LINK_DEFAULTS.showExternalIcon,
      externalIcon,
      unstyled = LINK_DEFAULTS.unstyled,
      underline = LINK_DEFAULTS.underline,
      withLift = LINK_DEFAULTS.withLift,
      requireHref = LINK_DEFAULTS.requireHref,
      skeleton = LINK_DEFAULTS.skeleton,
      className,
      rel,
      target,
      onClick,
      ...props
    },
    ref
  ) => {
    // Runtime validation in development (inline, no useEffect)
    if (process.env.NODE_ENV === 'development') {
      validateLinkProps({
        href,
        variant,
        size,
        underline,
        requireHref,
        skeleton,
      } as LinkProps);
    }

    // Memoized: Авто-определение внешних ссылок
    const isExternal = useMemo(
      () => external || href.startsWith('http://') || href.startsWith('https://'),
      [external, href]
    );

    // Memoized: Безопасный rel для внешних ссылок
    const relValue = useMemo(
      () => (isExternal ? classNames(rel, 'noopener', 'noreferrer') : rel),
      [isExternal, rel]
    );

    // Memoized: Target для внешних ссылок
    const targetValue = useMemo(() => (isExternal ? '_blank' : target), [isExternal, target]);

    // Memoized: Консистентный размер иконки
    const iconSize = useMemo(() => {
      const iconSizeMap: Record<'sm' | 'md' | 'lg', IconSize> = {
        sm: 'xs',
        md: 'sm',
        lg: 'md',
      };
      return iconSizeMap[size];
    }, [size]);

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

    // Skeleton mode: render placeholder instead of full link
    if (skeleton) {
      return (
        <span className={linkClassName} aria-disabled="true" data-skeleton="true">
          <Skeleton variant="text" className={styles.skeletonPlaceholder} />
        </span>
      );
    }

    return (
      <a
        ref={ref}
        href={href}
        className={linkClassName}
        rel={relValue}
        target={targetValue}
        data-variant={variant}
        data-size={size}
        aria-disabled={props['aria-disabled']}
        onClick={onClick}
        {...props}
      >
        {icon && (
          <span className={styles.icon} aria-hidden={true}>
            {icon}
          </span>
        )}

        {children}

        {iconRight && (
          <span className={styles.icon} aria-hidden={true}>
            {iconRight}
          </span>
        )}

        {isExternal && showExternalIcon && !unstyled && (
          <span
            className={styles.externalIcon}
            aria-label="Opens in new tab"
            title="Opens in new tab"
          >
            <Icon name={externalIcon || ExternalLink} size={iconSize} color="inherit" decorative />
          </span>
        )}
      </a>
    );
  }
);

LinkComponent.displayName = 'Link';

export const Link = memo(LinkComponent);
export default Link;
