// src/shared/ui/Link/Link.tsx
import { classNames } from '@/shared/lib/utils/classNames';
import type { IconSize } from '@/shared/ui/Icon';
import { Icon } from '@/shared/ui/Icon';
import { ExternalLink } from 'lucide-react';
import { forwardRef, useMemo, useCallback, memo, useEffect } from 'react';
import type { LinkProps, LinkVariant, LinkSize, LinkUnderline } from '../model/types';
import styles from './Link.module.scss';

// Valid values for runtime validation
const VALID_VARIANTS: LinkVariant[] = ['primary', 'secondary', 'ghost', 'gradient'];
const VALID_SIZES: LinkSize[] = ['sm', 'md', 'lg'];
const VALID_UNDERLINES: LinkUnderline[] = ['always', 'hover', 'never'];

// Маппинг размеров Link в размеры Icon
const iconSizeMap: Record<'sm' | 'md' | 'lg', IconSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
};

/**
 * Runtime validation for Link props (development only)
 */
const validateLinkProps = (props: LinkProps) => {
  if (process.env.NODE_ENV === 'development') {
    const { variant, size, underline, href, requireHref } = props;

    if (variant && !VALID_VARIANTS.includes(variant)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Link: invalid variant "${variant}". Valid values: ${VALID_VARIANTS.join(', ')}`
      );
    }

    if (size && !VALID_SIZES.includes(size)) {
      // eslint-disable-next-line no-console
      console.warn(`Link: invalid size "${size}". Valid values: ${VALID_SIZES.join(', ')}`);
    }

    if (underline && !VALID_UNDERLINES.includes(underline)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Link: invalid underline "${underline}". Valid values: ${VALID_UNDERLINES.join(', ')}`
      );
    }

    if (requireHref && !href) {
      // eslint-disable-next-line no-console
      console.warn(
        'Link component: href prop is required. Set requireHref=false to disable this warning.'
      );
    }
  }
};

/**
 * Link компонент для отображения ссылок
 *
 * @example
 * <Link href="/about" variant="primary" size="lg">
 *   About Page
 * </Link>
 *
 * <Link href="https://github.com" external>
 *   GitHub Profile
 * </Link>
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      children,
      variant = 'primary',
      size = 'md',
      external = false,
      icon,
      iconRight,
      showExternalIcon = true,
      externalIcon,
      unstyled = false,
      underline = 'hover',
      withLift = false,
      requireHref = true,
      className,
      rel,
      target,
      onClick,
      ...props
    },
    ref
  ) => {
    // Runtime validation in development mode
    useEffect(() => {
      validateLinkProps({
        href,
        children,
        variant,
        size,
        external,
        icon,
        iconRight,
        showExternalIcon,
        externalIcon,
        unstyled,
        underline,
        withLift,
        requireHref,
        className,
        rel,
        target,
        onClick,
        ...props,
      });
    }, [
      variant,
      size,
      underline,
      href,
      requireHref,
      external,
      unstyled,
      withLift,
      rel,
      target,
      onClick,
      className,
      children,
      icon,
      iconRight,
      showExternalIcon,
      externalIcon,
      props,
    ]);

    // Memoize: Авто-определение внешних ссылок
    const isExternal = useMemo(
      () => external || href.startsWith('http://') || href.startsWith('https://'),
      [external, href]
    );

    // Memoize: Безопасный rel для внешних ссылок
    const relValue = useMemo(
      () => (isExternal ? classNames(rel, 'noopener', 'noreferrer') : rel),
      [isExternal, rel]
    );

    // Memoize: Target для внешних ссылок
    const targetValue = useMemo(() => (isExternal ? '_blank' : target), [isExternal, target]);

    // Memoize: Консистентный размер иконки
    const iconSize = useMemo(() => iconSizeMap[size], [size]);

    // Memoize: Обработчик клика
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
      },
      [onClick]
    );

    // Memoize: Вычисление className
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
          className
        ),
      [variant, size, unstyled, underline, withLift, className]
    );

    // Memoize: Рендер иконки слева
    const leftIconContent = useMemo(
      () =>
        icon ? (
          <span className={styles.icon} aria-hidden={true}>
            {icon}
          </span>
        ) : null,
      [icon]
    );

    // Memoize: Рендер иконки справа
    const rightIconContent = useMemo(
      () =>
        iconRight ? (
          <span className={styles.icon} aria-hidden={true}>
            {iconRight}
          </span>
        ) : null,
      [iconRight]
    );

    // Memoize: Рендер внешней иконки
    const externalIconContent = useMemo(() => {
      if (!isExternal || !showExternalIcon || unstyled) {
        return null;
      }

      return (
        <span
          className={styles.externalIcon}
          aria-label="Opens in new tab"
          title="Opens in new tab"
        >
          <Icon name={externalIcon || ExternalLink} size={iconSize} color="inherit" decorative />
        </span>
      );
    }, [isExternal, showExternalIcon, unstyled, externalIcon, iconSize]);

    return (
      <a
        ref={ref}
        href={href}
        className={linkClassName}
        rel={relValue}
        target={targetValue}
        aria-disabled={props['aria-disabled']}
        onClick={handleClick}
        {...props}
      >
        {leftIconContent}
        {children}
        {rightIconContent}
        {externalIconContent}
      </a>
    );
  }
);

Link.displayName = 'Link';

// Memo wrapper to prevent unnecessary re-renders when props haven't changed
export default memo(Link);
