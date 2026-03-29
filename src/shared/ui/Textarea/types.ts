// ============================================
// Textarea Component - TypeScript Types
// ============================================

import { TextareaHTMLAttributes } from 'react';

/**
 * Textarea variant types
 */
export type TextareaVariant = 
  | 'default'     // Default textarea style
  | 'outline'     // Outline style
  | 'filled';     // Filled background

/**
 * Textarea size types
 */
export type TextareaSize = 
  | 'sm'          // Small textarea
  | 'md'          // Medium textarea (default)
  | 'lg';         // Large textarea

/**
 * Textarea props interface
 */
export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /**
   * Textarea variant style
   * @default 'default'
   */
  variant?: TextareaVariant;
  
  /**
   * Textarea size
   * @default 'md'
   */
  size?: TextareaSize;
  
  /**
   * Additional CSS class
   */
  className?: string;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Success state
   */
  success?: boolean;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Full width textarea
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Number of rows
   * @default 3
   */
  rows?: number;
}