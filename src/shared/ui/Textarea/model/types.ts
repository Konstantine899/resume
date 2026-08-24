// ============================================
// Textarea Component - TypeScript Types
// ============================================

import { type TextareaHTMLAttributes } from 'react';
import type React from 'react';

/**
 * Textarea variant types
 */
export type TextareaVariant = 'default' | 'outline' | 'filled';

/**
 * Textarea size types
 */
export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * CSS resize property values
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

/**
 * Textarea props interface
 */
export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size' | 'id'
> {
  /** Variant style */
  variant?: TextareaVariant;
  /** Size preset */
  size?: TextareaSize;
  /** Additional CSS class */
  className?: string;
  /** Label text */
  label?: string;
  /** Error message (also sets aria-invalid) */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Loading state — shows Loader spinner */
  loading?: boolean;
  /** Full width textarea */
  fullWidth?: boolean;
  /** Helper text (hidden when error is present) */
  helperText?: string;
  /** Number of visible rows */
  rows?: number;
  /** Show clear button when textarea has value */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Show character counter (requires maxLength on textarea) */
  showCounter?: boolean;
  /** Enable auto-resize height based on content */
  autoResize?: boolean;
  /** Maximum number of rows for auto-resize (uncapped when not set) */
  maxRows?: number;
  /** CSS resize property control */
  resize?: TextareaResize;
  /** Trim value on blur (removes leading/trailing whitespace) */
  trimOnBlur?: boolean;
  /** Custom id for accessibility linking */
  id?: string;
  /** Icon before textarea content */
  icon?: React.ReactNode;
  /** Icon after textarea content */
  iconAfter?: React.ReactNode;
}
