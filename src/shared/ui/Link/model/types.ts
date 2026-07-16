// src/shared/ui/Link/model/types.ts

import type { LucideIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

/**
 * Варианты отображения ссылки
 * @description Определяет цветовое оформление
 * @group Constants
 * @example 'primary' — стандартный акцентный цвет
 * @example 'secondary' — приглушённый цвет
 * @example 'ghost' — наследует цвет текста
 * @example 'gradient' — градиентный текст
 */
export type LinkVariant = 'primary' | 'secondary' | 'ghost' | 'gradient';

/**
 * Размеры ссылки
 * @description Определяет размер текста
 * @group Constants
 * @example 'sm' — малый (для компактных интерфейсов)
 * @example 'md' — средний (по умолчанию)
 * @example 'lg' — крупный (для выделенных ссылок)
 */
export type LinkSize = 'sm' | 'md' | 'lg';

/**
 * Режимы подчёркивания
 * @description Определяет поведение underline
 * @group Constants
 * @example 'always' — всегда подчёркнута
 * @example 'hover' — только при наведении
 * @example 'never' — никогда
 */
export type LinkUnderline = 'always' | 'hover' | 'never';

/**
 * Props для компонента Link
 * @description Расширяет стандартные HTML anchor атрибуты
 * @group Base
 *
 * @example
 * ```tsx
 * <Link href="/about" variant="primary" size="lg">
 *   About Page
 * </Link>
 * ```
 *
 * @example
 * ```tsx
 * <Link href="https://github.com" external>
 *   GitHub Profile
 * </Link>
 * ```
 *
 * @example
 * ```tsx
 * // Skeleton loading
 * <Link href="/profile" skeleton>Profile</Link>
 * ```
 */
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** URL ссылки */
  href: string;
  /** Текст ссылки */
  children?: ReactNode;
  /** Вариант отображения */
  variant?: LinkVariant;
  /** Размер */
  size?: LinkSize;
  /** Внешняя ссылка (откроется в новой вкладке) */
  external?: boolean;
  /** Иконка слева (ReactNode) */
  icon?: ReactNode;
  /** Иконка справа (ReactNode) */
  iconRight?: ReactNode;
  /** Показать иконку внешней ссылки для external ссылок */
  showExternalIcon?: boolean;
  /** Кастомная иконка внешней ссылки (LucideIcon компонент) */
  externalIcon?: LucideIcon;
  /** Отключить стилизацию */
  unstyled?: boolean;
  /** Подчеркивание */
  underline?: LinkUnderline;
  /** Добавить hover lift эффект */
  withLift?: boolean;
  /** Валидация href (предупреждение если пустой) */
  requireHref?: boolean;
  /**
   * Режим скелетона (заглушка загрузки)
   * @default false
   * @description При true отображает Skeleton вместо текста
   */
  skeleton?: boolean;
}
