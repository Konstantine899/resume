// src/shared/ui/Button/types.ts

import { ReactNode } from 'react';

/**
 * Button variant types
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Button size types
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Icon position for combined buttons
 */
export type IconPosition = 'left' | 'right';

/**
 * Button mode - определяет как рендерить кнопку
 * - 'text': только текст (children)
 * - 'icon': только иконка (icon), требует ariaLabel
 * - 'combined': иконка + текст
 */
export type ButtonMode = 'text' | 'icon' | 'combined';

/**
 * Unified Button props interface
 */
export interface ButtonProps {
  children?: ReactNode;
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconPosition?: IconPosition;
  rotation?: number;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  ariaLabel?: string;
  className?: string;
  [key: string]: any;
}

/**
 * Helper type для icon-only кнопок
 * Гарантирует наличие icon и обязательного ariaLabel
 */
export type IconButtonOnlyProps = Omit<ButtonProps, 'children'> & {
  /** Icon is required for icon-only buttons */
  icon: ReactNode;
  /** Children must be undefined for icon-only */
  children?: undefined;
  /** Accessible label is required for icon-only buttons */
  ariaLabel: string;
};

/**
 * Helper type для text-only кнопок
 */
export type TextButtonProps = Omit<ButtonProps, 'icon' | 'iconPosition' | 'rotation'> & {
  children: ReactNode;
  icon?: undefined;
};

/**
 * Helper type для combined кнопок (icon + text)
 */
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
