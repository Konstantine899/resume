// src/shared/ui/Button/types.ts

import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type IconPosition = 'left' | 'right';

export type ButtonMode = 'text' | 'icon' | 'combined';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconPosition?: IconPosition;
  rotation?: number;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
}

export type IconButtonOnlyProps = Omit<ButtonProps, 'children'> & {
  icon: ReactNode;
  children?: undefined;
  ariaLabel: string;
};

export type TextButtonProps = Omit<ButtonProps, 'icon' | 'iconPosition' | 'rotation'> & {
  children: ReactNode;
  icon?: undefined;
};

export type CombinedButtonProps = ButtonProps & {
  icon: ReactNode;
  children: ReactNode;
};

export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
  vertical?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}
