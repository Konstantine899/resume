// ============================================
// Card Component - TypeScript Types
// ============================================

import { ReactNode } from 'react';

/**
 * Card variant types
 */
export type CardVariant = 
  | 'default'     // Default card style
  | 'elevated'    // Elevated with shadow
  | 'outline'     // Outline only
  | 'filled';     // Filled background

/**
 * Card size types
 */
export type CardSize = 
  | 'sm'          // Small card
  | 'md'          // Medium card (default)
  | 'lg';         // Large card

/**
 * Card props interface
 */
export interface CardProps {
  /**
   * Card content
   */
  children: ReactNode;
  
  /**
   * Card variant style
   * @default 'default'
   */
  variant?: CardVariant;
  
  /**
   * Card size
   * @default 'md'
   */
  size?: CardSize;
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Padding size
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Hover effect
   * @default false
   */
  hoverable?: boolean;
  
  /**
   * Click handler
   */
  onClick?: () => void;
  
  /**
   * Card header
   */
  header?: ReactNode;
  
  /**
   * Card footer
   */
  footer?: ReactNode;
  
  /**
   * Card image URL
   */
  image?: string;
  
  /**
   * Image alt text
   */
  imageAlt?: string;
  
  /**
   * Image position
   * @default 'top'
   */
  imagePosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Border radius override
   */
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  
  /**
   * HTML div attributes
   */
  [key: string]: any;
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