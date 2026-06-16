// src/shared/ui/Button/model/types.ts

import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'sidebar';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type LoadingVariant = 'spinner' | 'skeleton';

// ============================================
// Base props для всех кнопок
// ============================================
interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  loadingVariant?: LoadingVariant;
  fullWidth?: boolean;
  className?: string;
}

// ============================================
// Button — только текст
// ============================================
export interface ButtonProps extends BaseButtonProps {
  children: ReactNode;
  leftIcon?: undefined;
  rightIcon?: undefined;
  ariaLabel?: undefined;
}

// ============================================
// IconButton — только иконка
// ============================================
export interface IconButtonProps extends BaseButtonProps {
  icon: ReactNode;
  ariaLabel: string; // Обязательно для accessibility
  children?: undefined;
  leftIcon?: undefined;
  rightIcon?: undefined;
}

// ============================================
// ButtonWithIcon — текст + иконка
// ============================================
export interface ButtonWithIconProps extends BaseButtonProps {
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  icon?: undefined;
  ariaLabel?: undefined;
}

// ============================================
// Union type для экспорта
// ============================================
export type ButtonComponentProps = ButtonProps | IconButtonProps | ButtonWithIconProps;
