// ============================================
// Card Component
// ============================================

import React from 'react';
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
 * Универсальный компонент карточки с поддержкой различных вариантов
 * и composition API для гибкой структуры
 *
 * @example
 * ```tsx
 * // Базовое использование
 * <Card variant="default">Контент</Card>
 *
 * // Composition API
 * <Card>
 *   <Card.Header>Заголовок</Card.Header>
 *   <Card.Body>Основной контент</Card.Body>
 *   <Card.Footer>Подвал</Card.Footer>
 * </Card>
 *
 * // Специализированные карточки
 * <ProjectCard title="Project" description="Desc" />
 * <WorkHistoryCard title="Job" company="Company" />
 * <ContactCard title="Контакты" icon={<Mail />} />
 * ```
 */
export const Card: React.FC<BaseCardProps> & {
  /** Карточка проекта */
  Project: typeof ProjectCard;
  /** Карточка истории работы */
  WorkHistory: typeof WorkHistoryCard;
  /** Контактная карточка */
  Contact: typeof ContactCard;
  /** Заголовок карточки */
  Header: typeof CardHeader;
  /** Тело карточки */
  Body: typeof CardBody;
  /** Подвал карточки */
  Footer: typeof CardFooter;
  /** Изображение карточки */
  Image: typeof CardImage;
} = ({
  variant = 'default',
  size = 'default',
  radius = '',
  fullWidth = false,
  hoverable = true,
  className = '',
  children,
  ...props
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[size],
    radius && styles[radius],
    fullWidth && styles.fullWidth,
    !hoverable && styles.noHover,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Рендер специализированных карточек
  if (variant === 'project') {
    return <ProjectCard {...(props as import('../model/types').ProjectCardProps)} />;
  }

  if (variant === 'workHistory') {
    return <WorkHistoryCard {...(props as import('../model/types').WorkHistoryCardProps)} />;
  }

  if (variant === 'contact') {
    return <ContactCard {...(props as import('../model/types').ContactCardProps)} />;
  }

  // Базовая карточка
  return (
    <div className={cardClasses} {...props} role="group">
      {children}
    </div>
  );
};

Card.displayName = 'Card';

// Присваиваем static properties
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Project = ProjectCard;
Card.WorkHistory = WorkHistoryCard;
Card.Contact = ContactCard;

export default Card;
