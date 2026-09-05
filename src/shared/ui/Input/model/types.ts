import { InputHTMLAttributes } from 'react';
import type { PolymorphicProps } from '@/shared/lib/types/polymorphic';

export type InputVariant = 'default' | 'outline' | 'filled' | 'floating';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type InputOwnProps = {
  variant?: InputVariant;
  size?: InputSize;
  className?: string;
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  skeleton?: boolean;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  fullWidth?: boolean;
  helperText?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  onClear?: () => void;
  asChild?: boolean;
} & ({ showCounter?: false; maxLength?: number } | { showCounter: true; maxLength: number }) &
  ({ clearable?: false } | { clearable: true });

export type InputProps = InputOwnProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type InputStatus = 'error' | 'success' | 'loading' | 'skeleton';

export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: InputSize;
  variant?: InputVariant;
}

// Re-export shared PolymorphicProps for convenience
export type { PolymorphicProps };
