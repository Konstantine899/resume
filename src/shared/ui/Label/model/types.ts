// src/shared/ui/Label/model/types.ts

// ============================================
// Label Component - TypeScript Types
// ============================================

import { LabelHTMLAttributes, ReactNode } from 'react';

/**
 * Label size variants
 */
export type LabelSize = 'sm' | 'md' | 'lg';

/**
 * Label visual variants
 */
export type LabelVariant = 'default' | 'error' | 'success' | 'warning';

/**
 * Label props interface
 */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Label text content
   */
  children: ReactNode;

  /**
   * ID of the associated input element (for accessibility)
   * @required
   */
  htmlFor: string;

  /**
   * Label size
   * @default 'md'
   */
  size?: LabelSize;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: LabelVariant;

  /**
   * Mark label as required (shows asterisk)
   * @default false
   */
  required?: boolean;

  /**
   * Show error state (highest priority)
   * @default false
   */
  error?: boolean;

  /**
   * Show success state (second priority)
   * @default false
   */
  success?: boolean;

  /**
   * Additional CSS class
   */
  className?: string;

  /**
   * Optional description text (displayed below label)
   */
  description?: string;
}
