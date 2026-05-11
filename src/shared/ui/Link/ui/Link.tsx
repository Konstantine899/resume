// src/shared/ui/Link/Link.tsx
import { classNames } from '@/shared/lib/utils/classNames';
import type { IconSize } from '@/shared/ui/Icon';
import { Icon } from '@/shared/ui/Icon';
import { ExternalLink } from 'lucide-react';
import { forwardRef } from 'react';
import type { LinkProps } from '../model/types';
import styles from './Link.module.scss';

// Маппинг размеров Link в размеры Icon
const iconSizeMap: Record<'sm' | 'md' | 'lg', IconSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
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
    // Валидация href в development режиме
    if (process.env.NODE_ENV === 'development' && requireHref && !href) {
      // eslint-disable-next-line no-console
      console.warn(
        'Link component: href prop is required. Set requireHref=false to disable this warning.'
      );
    }

    // Авто-определение внешних ссылок
    const isExternal = external || href.startsWith('http://') || href.startsWith('https://');

    // Безопасный rel для внешних ссылок
    const relValue = isExternal ? classNames(rel, 'noopener', 'noreferrer') : rel;

    // Target для внешних ссылок
    const targetValue = isExternal ? '_blank' : target;

    // Консистентный размер иконки
    const iconSize = iconSizeMap[size];

    // Обработчик клика
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
    };

    const linkClassName = classNames(
      styles.link,
      styles[variant],
      styles[size],
      unstyled && styles.unstyled,
      underline === 'always' && styles.underlineAlways,
      underline === 'hover' && styles.underlineHover,
      underline === 'never' && styles.underlineNever,
      withLift && styles.withLift,
      className
    );

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

Link.displayName = 'Link';

export default Link;
