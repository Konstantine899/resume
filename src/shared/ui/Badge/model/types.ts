import type React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'accent' | 'outline';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  disabled?: boolean;
  /** role="status" применяется автоматически для success/warning/error */
  role?: 'status' | 'presentation';
  /** Автоматический aria-label на основе variant */
  'aria-label'?: string;
}
