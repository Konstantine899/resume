import type { HTMLAttributes } from 'react';

export type SpinnerVariant = 'spinner' | 'double-ring';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type SpinnerColor = 'primary' | 'secondary' | 'accent' | 'orange';

export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

export type SpinnerThickness = 'thin' | 'normal' | 'thick';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  /** Визуальный вариант спиннера */
  variant?: SpinnerVariant;

  /** Размер спиннера: preset ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') или число пикселей (SPR-06) */
  size?: SpinnerSize | number;

  /** Цвет спиннера */
  color?: SpinnerColor;

  /** Скорость анимации: slow / normal (default) / fast */
  speed?: SpinnerSpeed;

  /** Алиас для speed (Chakra v3): пишет тот же --spinner-speed. Канонический speed выигрывает (SPR-07) */
  animationDuration?: SpinnerSpeed;

  /** Толщина линии: thin / normal (default) / thick */
  thickness?: SpinnerThickness;

  /** Алиас для thickness (Chakra v3): пишет тот же --spinner-thickness. Канонический thickness выигрывает (SPR-07) */
  borderWidth?: SpinnerThickness;

  /** Задержка монтирования в мс (AntD семантика): ничего не рендерится до истечения delay (SPR-03) */
  delay?: number;

  /** Цвет трека (фоновой части кольца). По умолчанию transparent */
  trackColor?: string;

  /** Кастомный класс */
  className?: string;

  /** Текст для screen readers */
  label?: string;
}
