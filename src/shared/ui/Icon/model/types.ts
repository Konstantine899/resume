import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Пропсы, которыми владеет Icon (не наследуются от HTML-элемента).
 * @description Icon-специфичные пропсы. HTML-атрибуты (href, tabIndex, role и т.д.)
 * проксируются через generic `IconProps<C>` при component-полиморфизме.
 * @group Base
 */
export interface IconOwnProps {
  /** Иконка из lucide-react */
  name: LucideIcon;
  /** Размер в пикселях или preset (xs/sm/md/lg/xl) */
  size?: number | IconSize;
  /** Цвет из preset или кастомный CSS color */
  color?: string;
  /** Толщина линий (1-3) */
  strokeWidth?: IconStrokeWidth;
  /** Дополнительный CSS класс */
  className?: string;
  /** Альтернативный текст для доступности */
  ariaLabel?: string;
  /** Скрыть от скринридеров (декоративная иконка) */
  decorative?: boolean;
  /** Отключить интерактивность */
  disabled?: boolean;
  /** Обработчик клика */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Состояние нажатия для toggle иконок */
  isPressed?: boolean;
  /** HTML id для якорных ссылок */
  id?: string;
}

/**
 * Generic полиморфные props для компонента Icon.
 * @description Позволяет переопределить корневой элемент через `component`.
 * По умолчанию рендерится как `<span>` (backward compatible).
 *
 * @template C - Тип элемента (по умолчанию 'span')
 *
 * @example
 * ```tsx
 * <Icon name={Home} />
 * <Icon component="a" href="/about" name={Home} />
 * <Icon component="button" name={Home} onClick={fn} />
 * ```
 */
export type IconProps<C extends ElementType = 'span'> = IconOwnProps &
  Omit<ComponentPropsWithRef<C>, keyof IconOwnProps | 'component'> & { component?: C };

/**
 * Предопределённые размеры иконок
 */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Предопределённая толщина линий
 */
export type IconStrokeWidth = 1 | 1.5 | 2 | 2.5 | 3;

/**
 * Предопределённые цвета (CSS переменные из theme)
 */
export type IconColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'danger'
  | 'warning'
  | 'foreground'
  | 'foreground-muted'
  | 'inherit';
