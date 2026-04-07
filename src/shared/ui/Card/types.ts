// ============================================
// Card Component - TypeScript Types
// ============================================

import { HTMLAttributes, ReactNode } from 'react';

export type CardVariant =
  | 'default'       // Default card style
  | 'project'       // MyWork project cards
  | 'workHistory'   // WorkHistory job cards
  | 'skill'        // Skills container
  | 'about'         // About section card
  | 'codeBlock';    // Hero code block

export interface TechIcon {
  name?: string;
  url: string;
  invertInDark?: boolean;
}


export type CardSize =
  | 'compact'       // Compact (small content)
  | 'default'       // Standard card
  | 'large';        // Large (Hero, About)

  export type CardRadius =
  | 'rounded'       // 0.5rem
  | 'roundedXl'     // 0.75rem
  | 'rounded2xl';   // 1rem (responsive)


/**
 * Card props interface
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  title?: string;
  children: ReactNode;
  size?: CardSize;
  radius?: CardRadius;
  fullWidth?: boolean;
  className?: string;
  hoverable?: boolean;
  backgroundImage?: string;
  description?: string;
  techIcons?: TechIcon[];
  link?: string | null;
  image?: string;
  theme?: 'dark' | 'light';
  builtUsingLabel?: string;
  linkLabel?: string;
}

/**
 * Card header props
 */
export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
}

/**
 * Card body props
 */
export interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card footer props
 */
export interface CardFooterProps {
  children: ReactNode;
  className?: string;
  withBorder?: boolean;
}

/**
 * Card image props
 */
export interface CardImageProps {
  src: string;
  alt?: string;
  className?: string;
  height?: string | number;
  width?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}
