// src/shared/ui/Link/ui/Link.tsx

import { ExternalLink } from 'lucide-react';
import type {
  ComponentRef,
  ElementType,
  ForwardedRef,
  ForwardRefRenderFunction,
  ReactElement,
} from 'react';
import { forwardRef, memo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useLink } from '../lib/hooks/useLink';
import { LINK_DEFAULTS } from '../model/constants';
import type { LinkProps } from '../model/types';
import { LinkSkeleton } from './LinkSkeleton/LinkSkeleton';
import styles from './Link.module.scss';

/**
 * Link компонент для отображения ссылок
 *
 * @description
 * Поддерживает варианты (primary, secondary, ghost, gradient),
 * размеры, иконки, внешние ссылки, underline-режимы, skeleton-загрузку
 * и полиморфный `component` prop (по умолчанию — `<a>`).
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
 *
 * @example
 * ```tsx
 * // Polymorphic — render as a custom component
 * <Link component={RouterLink} href="/x">Go</Link>
 * ```
 */
type LinkComponent = <C extends ElementType = 'a'>(
  props: LinkProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
) => ReactElement;

function LinkImpl<C extends ElementType = 'a'>(
  {
    href,
    children,
    component,
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
  }: LinkProps<C>,
  ref: ForwardedRef<ComponentRef<C>>
): ReactElement {
  const { linkClassName, dataAttrs, isExternal, relValue, targetValue, iconSize } = useLink({
    href,
    variant,
    size,
    external,
    unstyled,
    underline,
    withLift,
    skeleton,
    requireHref,
    className,
    rel,
    target,
    component,
  });

  // Skeleton mode: delegate to LinkSkeleton (no anchor in the DOM)
  if (skeleton) {
    return <LinkSkeleton className={linkClassName} />;
  }

  const Component = (component || 'a') as ElementType;

  return (
    <Component
      ref={ref}
      href={href}
      className={linkClassName}
      rel={relValue}
      target={targetValue}
      {...dataAttrs}
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
    </Component>
  );
}

/**
 * forwardRef не умеет generic-функции, поэтому прокидываем LinkImpl через
 * НЕ-generic каст; generic typing применяется после memo (Heading precedent).
 */
const linkRef = forwardRef(
  LinkImpl as unknown as ForwardRefRenderFunction<unknown, LinkProps<'a'>>
);

/**
 * React.memo тоже не умеет generic-функции — финальный каст на LinkComponent
 * восстанавливает generic `component` prop и типизацию ref.
 */
const LinkMemo = memo(
  linkRef as unknown as (
    props: LinkProps<'a'> & { ref?: ForwardedRef<HTMLAnchorElement> }
  ) => ReactElement
);

LinkMemo.displayName = 'Link';

/**
 * Link — полиморфная ссылка с `component` prop.
 *
 * По умолчанию рендерится как `<a>`. Используйте `component="button"`,
 * другой HTML-элемент или React-компонент для переопределения корневого узла.
 */
export const Link = LinkMemo as unknown as LinkComponent;
