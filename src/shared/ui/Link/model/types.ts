// src/shared/ui/Link/model/types.ts

import type { LucideIcon } from 'lucide-react';
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import type { IconSize } from '@/shared/ui/Icon';

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
 * Props, которыми владеет Link (не наследуются от HTML-элемента).
 * @description Link-специфичные пропсы. HTML-атрибуты (href, target, rel и т.д.)
 * проксируются через generic `LinkProps<C>` при component="a".
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
export interface LinkOwnProps {
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

/**
 * Generic полиморфные props для компонента Link.
 * @description Позволяет переопределить корневой элемент через `component`.
 * По умолчанию рендерится как `<a>` (backward compatible).
 *
 * @template C - Тип элемента (по умолчанию 'a')
 *
 * @example
 * ```tsx
 * <Link component="a" href="/about">About</Link>
 * <Link component={RouterLink} href="/x">Go</Link>
 * ```
 */
export type LinkProps<C extends ElementType = 'a'> = LinkOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof LinkOwnProps | 'component'> & { component?: C };

/**
 * Props для useLink hook
 */
export interface LinkHookProps {
  /** URL ссылки */
  href: string;
  /** Вариант отображения */
  variant?: LinkVariant;
  /** Размер */
  size?: LinkSize;
  /** Внешняя ссылка (откроется в новой вкладке) */
  external?: boolean;
  /** Отключить стилизацию */
  unstyled?: boolean;
  /** Подчеркивание */
  underline?: LinkUnderline;
  /** Добавить hover lift эффект */
  withLift?: boolean;
  /** Режим скелетона (заглушка загрузки) */
  skeleton?: boolean;
  /** Валидация href (предупреждение если пустой) */
  requireHref?: boolean;
  /** Кастомный className (дописывается к вычисленному) */
  className?: string;
  /** Кастомный rel (мержится с noopener noreferrer для внешних ссылок) */
  rel?: string;
  /** Кастомный target (перекрывается на _blank для внешних ссылок) */
  target?: string;
  /** Корневой элемент (строка или компонент) — влияет на data-as */
  component?: ElementType;
}

/**
 * Возвращаемое значение хука useLink
 */
export interface UseLinkReturn {
  /** Вычисленный className (CSS module классы + модификаторы + custom className) */
  linkClassName: string;
  /** Data-атрибуты для распространения на элемент */
  dataAttrs: Record<string, string>;
  /** Является ли ссылка внешней (external prop или http(s):// href) */
  isExternal: boolean;
  /** Итоговый rel (с noopener noreferrer для внешних ссылок) */
  relValue: string | undefined;
  /** Итоговый target (_blank для внешних ссылок) */
  targetValue: string | undefined;
  /** Инференс размера иконки из размера ссылки (ICON_SIZE_MAP) */
  iconSize: IconSize;
}
