import type { HTMLAttributes } from 'react';

export type LoaderVariant = 'spinner' | 'dots' | 'pulse';

export type LoaderSize = 'sm' | 'md' | 'lg';

export type LoaderColor = 'primary' | 'secondary' | 'accent';

export interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Вариант лоадера */
  variant?: LoaderVariant;

  /** Размер лоадера */
  size?: LoaderSize;

  /** Цвет лоадера */
  color?: LoaderColor;

  /** Кастомный класс */
  className?: string;

  /** Текст для screen readers */
  label?: string;
}
