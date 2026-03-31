// ============================================
// Input Component - TypeScript Types
// ============================================

import { InputHTMLAttributes } from 'react';

/**
 * Input variant types
 */
export type InputVariant = 
  | 'default'     // Default input style
  | 'outline'     // Outline style
  | 'filled';     // Filled background

/**
 * Input size types
 */
export type InputSize = 
  | 'sm'          // Small input
  | 'md'          // Medium input (default)
  | 'lg';         // Large input

/**
 * Input props interface
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input variant style
   * @default 'default'
   */
  variant?: InputVariant;
  
  /**
   * Input size
   * @default 'md'
   */
  size?: InputSize;
  
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
   * Icon to display before input
   */
  icon?: React.ReactNode;
  
  /**
   * Icon to display after input
   */
  iconAfter?: React.ReactNode;
  
  /**
   * Full width input
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Helper text
   */
  helperText?: string;
}

/**
 * Input group props for grouping multiple inputs
 */
export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: InputSize;
  variant?: InputVariant;
}