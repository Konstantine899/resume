// src/shared/ui/Divider/model/types.ts

import type { HTMLAttributes } from 'react';

/**
 * Ориентация разделителя
 * @horizontal - горизонтальная линия (по умолчанию)
 * @vertical - вертикальная линия
 */
export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Стиль линии разделителя
 * @solid - сплошная линия
 * @dashed - пунктирная линия
 * @dotted - точечная линия
 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Props для компонента Divider
 */
export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Ориентация разделителя */
  orientation?: DividerOrientation;

  /** Стиль линии */
  variant?: DividerVariant;

  /** Толщина линии (в пикселях) */
  thickness?: number;

  /** Кастомный класс */
  className?: string;
}
