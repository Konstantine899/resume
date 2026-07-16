// src/shared/ui/Label/model/types.ts

// ============================================
// Label Component - TypeScript Types
// ============================================

import { LabelHTMLAttributes, ReactNode } from 'react';

/**
 * Размеры Label
 * @description Определяет размер текста и отступы
 * @group Constants
 * @example 'sm' — малый (для компактных форм)
 * @example 'md' — средний (по умолчанию)
 * @example 'lg' — крупный (для заголовков секций)
 */
export type LabelSize = 'sm' | 'md' | 'lg';

/**
 * Визуальные варианты Label
 * @description Определяет цветовое оформление
 * @group Constants
 * @example 'default' — стандартный цвет текста
 * @example 'error' — красный (для ошибок)
 * @example 'success' — зелёный (для успеха)
 * @example 'warning' — жёлтый (для предупреждений)
 */
export type LabelVariant = 'default' | 'error' | 'success' | 'warning';

/**
 * Props для компонента Label
 * @description Расширяет стандартные HTML label атрибуты
 * @group Base
 *
 * @example
 * ```tsx
 * // Базовое использование
 * <Label htmlFor="email">Email Address</Label>
 * ```
 *
 * @example
 * ```tsx
 * // С required и description
 * <Label htmlFor="password" required description="Min 8 chars">
 *   Password
 * </Label>
 * ```
 *
 * @example
 * ```tsx
 * // Скелетон (состояние загрузки)
 * <Label htmlFor="email" skeleton>Email</Label>
 * ```
 */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Содержимое лейбла (текст)
   */
  children: ReactNode;

  /**
   * ID связанного input элемента (для a11y)
   * @required
   */
  htmlFor: string;

  /**
   * Размер лейбла
   * @default 'md'
   */
  size?: LabelSize;

  /**
   * Визуальный вариант
   * @default 'default'
   */
  variant?: LabelVariant;

  /**
   * Показывать индикатор обязательности
   * @default false
   */
  required?: boolean;

  /**
   * Показать состояние ошибки (наивысший приоритет)
   * @default false
   */
  error?: boolean;

  /**
   * Показать состояние успеха (средний приоритет)
   * @default false
   */
  success?: boolean;

  /**
   * Режим скелетона (заглушка загрузки)
   * @default false
   * @description При true отображает Skeleton вместо текста
   */
  skeleton?: boolean;

  /**
   * Дополнительный CSS класс
   */
  className?: string;

  /**
   * Опциональный описательный текст (отображается под лейблом)
   * @default undefined
   */
  description?: string;
}
