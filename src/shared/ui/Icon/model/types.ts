import type { LucideIcon } from 'lucide-react';

/**
 * Пропсы для Icon компонента
 */
export interface IconProps {
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
  onClick?: () => void;
}

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
