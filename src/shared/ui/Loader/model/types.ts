import type { HTMLAttributes } from 'react';

export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'double-ring';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type LoaderColor = 'primary' | 'secondary' | 'accent' | 'orange';

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
