// ============================================
// Card Component
// ============================================

import { CARD_CONSTANTS } from '../model/constants';
import { validateCardProps } from '../lib/validateCardProps';
import { forwardRef, memo, useEffect, useMemo } from 'react';
import type { BaseCardProps } from '../model/types';
import styles from './Card.module.scss';
import { ProjectCard } from './ProjectCard';
import { WorkHistoryCard } from './WorkHistoryCard';
import { ContactCard } from './ContactCard';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardImage } from './CardImage';

/**
 * Card Component — универсальная карточка с composition API
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Card variant="default">Контент</Card>
 * ```
 *
 * @example
 * // Composition API
 * ```tsx
 * <Card>
 *   <Card.Header withBorder>Заголовок</Card.Header>
 *   <Card.Body>Основной контент</Card.Body>
 *   <Card.Footer withBorder>Подвал</Card.Footer>
 * </Card>
 * ```
 *
 * @example
 * // Specialized cards
 * ```tsx
 * <Card.Project title="Project" description="Desc" />
 * <Card.WorkHistory title="Job" company="Company" />
 * <Card.Contact title="Контакты" icon={<Mail />} />
 * ```
 */
const CardComponent = forwardRef<HTMLDivElement, BaseCardProps>(
  (
    {
      variant = CARD_CONSTANTS.DEFAULT_VARIANT,
      size = CARD_CONSTANTS.DEFAULT_SIZE,
      radius = CARD_CONSTANTS.DEFAULT_RADIUS,
      fullWidth = false,
      hoverable = true,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Runtime validation in development mode (optimized deps)
    const onClick = props.onClick;
    useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        const warnings = validateCardProps(variant, size, radius, hoverable, onClick);
        warnings.forEach((w) => {
          // eslint-disable-next-line no-console
          console.warn(w.message);
        });
      }
    }, [variant, size, radius, hoverable, onClick]);

    // Memoize className calculation
    const cardClasses = useMemo(
      () =>
        [
          styles.card,
          styles[variant],
          styles[size],
          radius && styles[radius],
          fullWidth && styles.fullWidth,
          !hoverable && styles.noHover,
          className,
        ]
          .filter(Boolean)
          .join(' '),
      [variant, size, radius, fullWidth, hoverable, className]
    );

    // Render specialized cards (type-safe without casts)
    if (variant === 'project') {
      return <ProjectCard {...(props as unknown as import('../model/types').ProjectCardProps)} />;
    }

    if (variant === 'workHistory') {
      return (
        <WorkHistoryCard {...(props as unknown as import('../model/types').WorkHistoryCardProps)} />
      );
    }

    if (variant === 'contact') {
      return <ContactCard {...(props as unknown as import('../model/types').ContactCardProps)} />;
    }

    // Base card
    return (
      <div
        ref={ref}
        className={cardClasses}
        {...props}
        role="group"
        data-state={hoverable ? 'hoverable' : 'static'}
        data-variant={variant}
        data-size={size}
        data-radius={radius}
      >
        {children}
      </div>
    );
  }
);

CardComponent.displayName = 'Card';

// Compound component pattern
const Card = Object.assign(memo(CardComponent), {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Image: CardImage,
  Project: ProjectCard,
  WorkHistory: WorkHistoryCard,
  Contact: ContactCard,
});

export { Card };
