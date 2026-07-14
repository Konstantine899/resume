import type { HTMLAttributes } from 'react';

export type SpinnerVariant = 'spinner' | 'double-ring';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type SpinnerColor = 'primary' | 'secondary' | 'accent' | 'orange';

export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

export type SpinnerThickness = 'thin' | 'normal' | 'thick';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Визуальный вариант спиннера */
  variant?: SpinnerVariant;

  /** Размер спиннера */
  size?: SpinnerSize;

  /** Цвет спиннера */
  color?: SpinnerColor;

  /** Скорость анимации: slow / normal (default) / fast */
  speed?: SpinnerSpeed;

  /** Толщина линии: thin / normal (default) / thick */
  thickness?: SpinnerThickness;

  /** Цвет трека (фоновой части кольца). По умолчанию transparent */
  trackColor?: string;

  /** Кастомный класс */
  className?: string;

  /** Текст для screen readers */
  label?: string;
}
