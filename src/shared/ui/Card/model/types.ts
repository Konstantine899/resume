// ============================================
// Card Component - TypeScript Types
// ============================================

import {
  HTMLAttributes,
  ReactNode,
  MouseEvent,
  ElementType,
  ComponentPropsWithoutRef,
} from 'react';

// ============================================
// Polymorphic Types
// ============================================

export type PolymorphicProps<C extends ElementType, P = Record<string, never>> = {
  component?: C;
} & Omit<ComponentPropsWithoutRef<C>, keyof P> &
  P;

// ============================================
// Base Types
// ============================================

/**
 * Варианты стилей карточки
 */
export type CardVariant =
  | 'default'
  | 'project'
  | 'workHistory'
  | 'skill'
  | 'about'
  | 'codeBlock'
  | 'contact';

/**
 * Размеры карточки
 */
export type CardSize = 'compact' | 'default' | 'large';

/**
 * Радиус скругления углов
 */
export type CardRadius = 'rounded' | 'roundedXl' | 'rounded2xl';

/**
 * Иконка технологии с метаданными
 */
export interface TechIcon {
  name?: string;
  url: string;
  invertInDark?: boolean;
}

// ============================================
// Base Card Own Props (non-polymorphic)
// ============================================

export interface CardOwnProps {
  variant?: CardVariant;
  size?: CardSize;
  radius?: CardRadius;
  fullWidth?: boolean;
  hoverable?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Props для базового компонента Card (default = button)
 */
export type BaseCardProps<C extends ElementType = 'div'> = PolymorphicProps<C, CardOwnProps>;

// ============================================
// Specialized Card Props
// ============================================

/**
 * Props для карточки проекта (ProjectCard)
 */
export interface ProjectCardProps extends Omit<CardOwnProps, 'variant' | 'size' | 'radius'> {
  title: string;
  description?: string;
  backgroundImage?: string;
  techIcons?: TechIcon[];
  link?: string | null;
  linkLabel?: string;
  builtUsingLabel?: string;
}

/**
 * Props для карточки истории работы (WorkHistoryCard)
 */
export interface WorkHistoryCardProps extends Omit<CardOwnProps, 'variant' | 'size' | 'radius'> {
  title: string;
  company?: string;
  period?: string;
  periodBadge?: string;
  location?: string;
  achievements?: string[];
  techStack?: string[];
}

/**
 * Props для контактной карточки (ContactCard)
 */
export interface ContactCardProps extends Omit<CardOwnProps, 'variant' | 'size' | 'radius'> {
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

/**
 * Props для карточки навыка (SkillCard)
 */
export interface SkillCardProps extends CardOwnProps {
  skillName?: string;
  level?: number;
  techIcons?: TechIcon[];
}

/**
 * Props для карточки About (AboutCard)
 */
export interface AboutCardProps extends CardOwnProps {
  title?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

// ============================================
// Composition API Types
// ============================================

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
}

export interface CardImageProps extends Omit<HTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

// ============================================
// CardTitle Props
// ============================================

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

// ============================================
// CardDescription Props
// ============================================

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
  className?: string;
}

// ============================================
// CardActions Props
// ============================================

export type CardActionsAlign = 'start' | 'center' | 'end';

export interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  align?: CardActionsAlign;
}

// ============================================
// CardGrid Props
// ============================================

export type CardGridColumns = 1 | 2 | 3 | 4;
export type CardGridGap = 'sm' | 'md' | 'lg';

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  columns?: CardGridColumns;
  gap?: CardGridGap;
}

// ============================================
// CardMeta Props
// ============================================

export interface CardMetaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// ============================================
// Event Types
// ============================================

export interface CardClickEvent {
  originalEvent: MouseEvent<HTMLDivElement>;
  targetType: 'card' | 'header' | 'footer' | 'body';
}

export type CardClickHandler = (event: CardClickEvent) => void;

export type CardHoverHandler = (isHovered: boolean) => void;
