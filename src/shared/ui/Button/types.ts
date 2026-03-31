// ============================================
// Button Component - TypeScript Types
// ============================================

import { ReactNode } from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 
  | 'primary'     // Primary action button
  | 'secondary'   // Secondary action button
  | 'outline'     // Outline style button
  | 'ghost'       // Minimal style button
  | 'danger';     // Destructive action button

/**
 * Button size types
 */
export type ButtonSize = 
  | 'sm'          // Small button
  | 'md'          // Medium button (default)
  | 'lg';         // Large button

/**
 * Button props interface
 */
export interface ButtonProps {
  /**
   * Button content
   */
  children: ReactNode;
  
  /**
   * Button variant style
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Click handler
   */
  onClick?: () => void;
  
  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Button type attribute
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Icon to display before text
   */
  icon?: ReactNode;
  
  /**
   * Icon position
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * HTML button attributes
   */
  [key: string]: any;
}

/**
 * Button group props for grouping multiple buttons
 */
export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  vertical?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Icon button props for icon-only buttons
 */
export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'icon' | 'iconPosition'> {
  /**
   * Icon to display
   */
  icon: ReactNode;
  
  /**
   * Accessible label for the button
   */
  'aria-label': string;
  
  /**
   * Icon size
   * @default 'md'
   */
  iconSize?: 'sm' | 'md' | 'lg';
}