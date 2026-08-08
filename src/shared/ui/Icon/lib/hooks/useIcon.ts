// src/shared/ui/Icon/lib/hooks/useIcon.ts

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { getColorValue, getSizeInPixels, ICON_CONSTANTS } from '../../model/constants';
import type { IconHookProps } from '../../model/types';
import { validateIconProps } from '../utils/validateIconProps';
import styles from '../../ui/Icon.module.scss';

/**
 * Возвращаемое значение хука useIcon
 */
export interface UseIconReturn {
  /** Вычисленный className (CSS module классы + модификаторы + custom className) */
  iconClassName: string;
  /** Inline-стили для SVG-иконки ({ width, height, color }) */
  iconStyle: CSSProperties;
  /** Data-атрибуты для распространения на корневой элемент */
  dataAttrs: Record<string, string>;
  /** Aria-атрибуты: aria-hidden (декоративная) или aria-label */
  ariaProps: { 'aria-hidden': true } | { 'aria-label': string | undefined };
  /** Интерактивна ли иконка (onClick задан и не disabled) */
  isInteractive: boolean;
}

/**
 * Shared hook, который консолидирует логику Icon: вычисление className,
 * inline-стилей (getSizeInPixels/getColorValue), data-атрибутов, aria-атрибутов
 * и синхронную dev-валидацию.
 *
 * @remarks
 * - Called during render (no useEffect wrapper)
 * - Validation runs synchronously ONLY in development mode (guard is internal
 *   to `validateIconProps` — ICR-05)
 * - `data-interactive` сериализуется в строку `'true'/'false'` (существующие
 *   тесты ассертят строку `'false'`)
 * - Поведенческий noop: консолидирует inline useMemo/вычисления из Icon.tsx
 *
 * @param props - Icon конфигурация (IconHookProps)
 * @returns Объект с iconClassName, iconStyle, dataAttrs, ariaProps и isInteractive
 *
 * @example
 * ```typescript
 * const { iconClassName, iconStyle, dataAttrs } = useIcon({
 *   name: Home,
 *   size: 'xl',
 *   color: 'primary',
 *   onClick: fn,
 * });
 * ```
 */
export const useIcon = ({
  name,
  size = ICON_CONSTANTS.DEFAULT_SIZE,
  color = ICON_CONSTANTS.DEFAULT_COLOR,
  strokeWidth = ICON_CONSTANTS.DEFAULT_STROKE_WIDTH,
  className = '',
  ariaLabel,
  decorative = false,
  disabled = false,
  onClick,
  component,
}: IconHookProps): UseIconReturn => {
  // Синхронная валидация (только development — guard внутри валидатора)
  validateIconProps({ size, color, strokeWidth, name, ariaLabel, decorative, onClick });

  const isInteractive = onClick !== undefined && !disabled;

  // Memoized: inline-стили SVG (единственный path — getSizeInPixels/getColorValue)
  const iconStyle = useMemo<CSSProperties>(
    () => ({
      width: getSizeInPixels(size),
      height: getSizeInPixels(size),
      color: getColorValue(color),
    }),
    [size, color]
  );

  // Memoized: className (CSS module + модификаторы + custom className)
  const iconClassName = useMemo(
    () =>
      classNames(
        styles.icon,
        disabled && styles.disabled,
        isInteractive && styles.clickable,
        className
      ),
    [disabled, isInteractive, className]
  );

  // Memoized: aria-атрибуты — декоративная иконка скрывается от скринридеров
  const ariaProps = useMemo<UseIconReturn['ariaProps']>(
    () => (decorative ? { 'aria-hidden': true } : { 'aria-label': ariaLabel }),
    [decorative, ariaLabel]
  );

  // Data-атрибуты для стилизации и тестирования.
  // data-interactive сериализуется в строку (тесты ассертят 'false').
  // data-as присутствует только для строковых элементов (компоненты его не имеют).
  const dataAttrs = useMemo<Record<string, string>>(
    () => ({
      'data-size': String(size),
      'data-color': color,
      'data-interactive': String(isInteractive),
      ...(typeof component === 'string' ? { 'data-as': component } : {}),
    }),
    [size, color, isInteractive, component]
  );

  return {
    iconClassName,
    iconStyle,
    dataAttrs,
    ariaProps,
    isInteractive,
  };
};
