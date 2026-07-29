import { InputHTMLAttributes } from 'react';

export type InputVariant = 'default' | 'outline' | 'filled' | 'floating';

export type InputSize = 'sm' | 'md' | 'lg';

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
} & ({ showCounter?: false; maxLength?: number } | { showCounter: true; maxLength: number }) &
  ({ clearable?: false } | { clearable: true });

export type PolymorphicProps<C extends React.ElementType, P = Record<string, never>> = {
  component?: C;
} & Omit<React.ComponentPropsWithoutRef<C>, keyof P> &
  P;

export type InputProps = InputOwnProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type InputStatus = 'error' | 'success' | 'loading' | 'skeleton';

export interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  size?: InputSize;
  variant?: InputVariant;
}
