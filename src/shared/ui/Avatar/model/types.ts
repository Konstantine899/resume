/**
 * Пропсы для Avatar компонента
 */
export interface AvatarProps {
  /** URL изображения аватара */
  src?: string;
  /** Альтернативный текст для доступности */
  alt?: string;
  /** Имя для fallback (инициалы) */
  name?: string;
  /** Размер аватара */
  size?: AvatarSize;
  /** Форма аватара */
  shape?: AvatarShape;
  /** Статус пользователя (опционально) */
  status?: AvatarStatus;
  /** Позиция индикатора статуса */
  statusPosition?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  /** Дополнительный CSS класс */
  className?: string;
  /** Отключить загрузку изображения */
  disabled?: boolean;
  /** Обработчик клика */
  onClick?: () => void;
  /** Толщина рамки (в пикселях) */
  border?: number;
  /** Цвет рамки (CSS color) */
  borderColor?: string;
}

/**
 * Предопределённые размеры аватара
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Форма аватара
 */
export type AvatarShape = 'circle' | 'square';

/**
 * Статус пользователя
 */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';
