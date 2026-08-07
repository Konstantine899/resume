// src/shared/ui/Icon/lib/utils/validateIconProps.ts

/* eslint-disable no-console */

import type { LucideIcon } from 'lucide-react';
import type { IconSize, IconStrokeWidth } from '../../model/types';
import { ICON_CONSTANTS } from '../../model/constants';

/**
 * Props, валидируемые в development-режиме.
 * @description Не все Icon пропсы валидируются — только те, где типизацию
 * можно обойти кастомными значениями (числовой size, произвольный color,
 * числовой strokeWidth, name как строка вместо LucideIcon).
 */
export interface IconValidationProps {
  /** Размер в пикселях или preset (xs/sm/md/lg/xl) */
  size?: number | IconSize;
  /** Цвет из preset или кастомный CSS color */
  color?: string;
  /** Толщина линий (1-3) */
  strokeWidth?: IconStrokeWidth;
  /** Иконка из lucide-react */
  name?: LucideIcon;
}

/**
 * Проверяет, является ли строка правдоподобным CSS color.
 * @description Допустимые варианты: `#hex`, `rgb(`/`rgba(`, CSS-переменная
 * `var(--x)`, `currentColor`, а также известный preset (проверяется отдельно).
 */
const isPlausibleCssColor = (color: string): boolean => {
  if (color.startsWith('#')) return true;
  if (color.startsWith('rgb(') || color.startsWith('rgba(')) return true;
  if (color.startsWith('var(')) return true;
  if (color === 'currentColor') return true;
  return false;
};

/**
 * Dev-валидация props для Icon.
 *
 * @description
 * - Runs ONLY when `process.env.NODE_ENV === 'development'` (guard is internal,
 *   so callers — the UI component and the useIcon hook — do not add their own guard)
 * - Uses `console.warn` (does NOT throw)
 * - Zero production overhead: body is a no-op in production
 *
 * @remarks
 * Consumes the existing `ICON_CONSTANTS.VALID_*` arrays — no new constants added.
 *
 * @param props - Icon props to validate
 *
 * @example
 * ```typescript
 * // Development mode: logs warning
 * validateIconProps({ size: 0 })
 * // → console.warn("...size must be a positive number or one of: xs, sm, md, lg, xl")
 *
 * // Production mode: no-op
 * validateIconProps({ size: 0 })
 * // → nothing happens
 * ```
 */
export function validateIconProps(props: IconValidationProps): void {
  if (process.env.NODE_ENV !== 'development') return;

  const { size, color, strokeWidth, name } = props;

  if (size !== undefined) {
    if (typeof size === 'number') {
      if (size <= 0) {
        console.warn(
          `[Icon] size must be a positive number or one of: ${ICON_CONSTANTS.VALID_SIZES.join(', ')} (got ${size})`
        );
      }
    } else if (
      !ICON_CONSTANTS.VALID_SIZES.includes(size as (typeof ICON_CONSTANTS.VALID_SIZES)[number])
    ) {
      console.warn(
        `[Icon] Invalid size: "${size}". Expected one of: ${ICON_CONSTANTS.VALID_SIZES.join(', ')}`
      );
    }
  }

  if (color !== undefined) {
    const isPreset = ICON_CONSTANTS.VALID_COLORS.includes(
      color as (typeof ICON_CONSTANTS.VALID_COLORS)[number]
    );
    if (!isPreset && !isPlausibleCssColor(color)) {
      console.warn(
        `[Icon] Invalid color: "${color}". Expected a valid preset or CSS color (e.g. #hex, rgb(...), var(--x), currentColor)`
      );
    }
  }

  if (strokeWidth !== undefined) {
    if (
      !ICON_CONSTANTS.VALID_STROKE_WIDTHS.includes(
        strokeWidth as (typeof ICON_CONSTANTS.VALID_STROKE_WIDTHS)[number]
      )
    ) {
      console.warn(
        `[Icon] Invalid strokeWidth: "${strokeWidth}". Expected one of: ${ICON_CONSTANTS.VALID_STROKE_WIDTHS.join(', ')}`
      );
    }
  }

  if (name !== undefined && typeof name !== 'function') {
    console.warn('[Icon] "name" must be a lucide icon component (LucideIcon)');
  }
}
