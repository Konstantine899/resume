// ============================================
// Card Component - TypeScript Types
// ============================================

import { HTMLAttributes, ReactNode, MouseEvent } from 'react';

// ============================================
// Base Types
// ============================================

/**
 * Варианты стилей карточки
 */
export type CardVariant =
  | 'default' // Базовый стиль карточки
  | 'project' // Карточка проекта для MyWork
  | 'workHistory' // Карточка истории работы
  | 'skill' // Контейнер для навыков
  | 'about' // Карточка для About секции
  | 'codeBlock' // Блок кода в Hero
  | 'contact'; // Контактная карточка

/**
 * Размеры карточки
 */
export type CardSize =
  | 'compact' // Компактный (малый контент)
  | 'default' // Стандартный размер
  | 'large'; // Большой (Hero, About)

/**
 * Радиус скругления углов
 */
export type CardRadius =
  | 'rounded' // 0.5rem
  | 'roundedXl' // 0.75rem
  | 'rounded2xl'; // 1rem (responsive)

/**
 * Иконка технологии с метаданными
 */
export interface TechIcon {
  /** Название технологии */
  name?: string;
  /** URL изображения иконки */
  url: string;
  /** Инвертировать цвета в тёмной теме */
  invertInDark?: boolean;
}

// ============================================
// Base Card Props
// ============================================

/**
 * Props для базового компонента Card
 */
export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Вариант стиля карточки */
  variant?: CardVariant;
  /** Размер карточки */
  size?: CardSize;
  /** Радиус скругления */
  radius?: CardRadius;
  /** Растянуть на всю ширину */
  fullWidth?: boolean;
  /** Добавлять hover эффекты */
  hoverable?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Дочерние элементы */
  children?: ReactNode;
}

// ============================================
// Specialized Card Props
// ============================================

/**
 * Props для карточки проекта (ProjectCard)
 */
export interface ProjectCardProps extends Omit<BaseCardProps, 'variant' | 'size' | 'radius'> {
  /** Заголовок проекта */
  title: string;
  /** Описание проекта */
  description?: string;
  /** URL фонового изображения */
  backgroundImage?: string;
  /** Иконки технологий */
  techIcons?: TechIcon[];
  /** Ссылка на проект */
  link?: string | null;
  /** Текст для ссылки */
  linkLabel?: string;
  /** Текст для метки технологий */
  builtUsingLabel?: string;
}

/**
 * Props для карточки истории работы (WorkHistoryCard)
 */
export interface WorkHistoryCardProps extends Omit<BaseCardProps, 'variant' | 'size' | 'radius'> {
  /** Должность */
  title: string;
  /** Название компании */
  company?: string;
  /** Период работы */
  period?: string;
  /** Бейдж периода (напр. "Настоящее время") */
  periodBadge?: string;
  /** Локация */
  location?: string;
  /** Достижения (список) */
  achievements?: string[];
  /** Стек технологий */
  techStack?: string[];
}

/**
 * Props для контактной карточки (ContactCard)
 */
export interface ContactCardProps extends Omit<BaseCardProps, 'variant' | 'size' | 'radius'> {
  /** Заголовок */
  title?: string;
  /** Иконка */
  icon?: ReactNode;
  /** Дочерние элементы */
  children?: ReactNode;
}

/**
 * Props для карточки навыка (SkillCard)
 */
export interface SkillCardProps extends BaseCardProps {
  /** Название навыка */
  skillName?: string;
  /** Уровень владения (0-100) */
  level?: number;
  /** Иконки технологий */
  techIcons?: TechIcon[];
}

/**
 * Props для карточки About (AboutCard)
 */
export interface AboutCardProps extends BaseCardProps {
  /** Заголовок */
  title?: string;
  /** Иконка */
  icon?: ReactNode;
  /** Дочерние элементы */
  children?: ReactNode;
}

// ============================================
// Composition API Types
// ============================================

/**
 * Props для Card.Header
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Дочерние элементы */
  children: ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
  /** Показывать нижнюю границу */
  withBorder?: boolean;
}

/**
 * Props для Card.Body
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Дочерние элементы */
  children: ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
}

/**
 * Props для Card.Footer
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Дочерние элементы */
  children: ReactNode;
  /** Дополнительные CSS классы */
  className?: string;
  /** Показывать верхнюю границу */
  withBorder?: boolean;
}

/**
 * Props для Card.Image
 */
export interface CardImageProps extends Omit<HTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** URL изображения */
  src: string;
  /** Альтернативный текст */
  alt?: string;
  /** Дополнительные CSS классы */
  className?: string;
  /** Высота */
  height?: string | number;
  /** Ширина */
  width?: string | number;
  /** Объект fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

// ============================================
// Event Types
// ============================================

/**
 * Событие клика по карточке
 */
export interface CardClickEvent {
  /** Оригинальное событие */
  originalEvent: MouseEvent<HTMLDivElement>;
  /** Тип клика (card, header, footer, body) */
  targetType: 'card' | 'header' | 'footer' | 'body';
}

/**
 * Callback при клике на карточку
 */
export type CardClickHandler = (event: CardClickEvent) => void;

/**
 * Callback при наведении на карточку
 */
export type CardHoverHandler = (isHovered: boolean) => void;
