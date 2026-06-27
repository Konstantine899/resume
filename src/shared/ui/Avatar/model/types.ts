/**
 * Размер аватара
 * @sm - 32px (компактный)
 * @md - 48px (стандартный)
 * @lg - 64px (крупный)
 * @xl - 96px (геройский)
 */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Форма аватара
 * @circle - круглый (50% border-radius)
 * @square - квадратный со скруглёнными углами
 */
export type AvatarVariant = 'circle' | 'square';

/**
 * Статус пользователя для индикатора активности
 * @online - активен (зелёный)
 * @offline - не в сети (серый)
 * @busy - занят (красный)
 * @away - отошёл (жёлтый)
 */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * Тип бейджа для аватара
 * @dot - точечный индикатор статуса
 * @number - бейдж с числом (например, уведомления)
 * @icon - бейдж с иконкой
 */
export type AvatarBadgeVariant = 'dot' | 'number' | 'icon';

/**
 * Props для основного компонента Avatar
 */
export interface AvatarProps {
  /** URL изображения аватара */
  src?: string;
  /** Альтернативный текст для доступности (используется для инициалов) */
  alt?: string;
  /** Размер аватара */
  size?: AvatarSize;
  /** Форма аватара */
  variant?: AvatarVariant;
  /** Кастомный fallback компонент (вместо стандартного с инициалами) */
  fallback?: React.ReactNode;
  /** Дополнительный CSS класс */
  className?: string;
  /** Обработчик ошибки загрузки изображения */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Обработчик успешной загрузки изображения */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Использовать геройский стиль с градиентом и эффектами */
  heroStyle?: boolean;
  /** Показать эффект свечения (glow) вокруг аватара */
  showGlow?: boolean;
  /** Показать декоративное кольцо вокруг аватара */
  showRing?: boolean;
  /** Показывать скелетон во время загрузки */
  showSkeleton?: boolean;
  /** Принудительно показать состояние загрузки */
  forceLoading?: boolean;
  /** Дочерние элементы (например, AvatarBadge, AvatarStatus) */
  children?: React.ReactNode;
}

/**
 * Props для компонента AvatarFallback (отображение инициалов)
 */
export interface AvatarFallbackProps {
  /** Имя для генерации инициалов */
  name?: string;
  /** Размер аватара */
  size?: AvatarSize;
  /** Форма аватара */
  variant?: AvatarVariant;
  /** Максимальное количество инициалей (по умолчанию 2) */
  maxInitials?: number;
  /** Дополнительный CSS класс */
  className?: string;
}

/**
 * Props для компонента AvatarBadge (бейдж статуса/уведомлений)
 */
export interface AvatarBadgeProps {
  /** Статус пользователя */
  status?: AvatarStatus;
  /** Тип бейджа */
  variant?: AvatarBadgeVariant;
  /** Число для отображения (для variant='number') */
  count?: number;
  /** Дополнительный CSS класс */
  className?: string;
}

/**
 * Props для компонента AvatarImage (изображение аватара)
 */
export interface AvatarImageProps {
  /** URL изображения */
  src: string;
  /** Альтернативный текст */
  alt: string;
  /** Размер аватара */
  size?: AvatarSize;
  /** Форма аватара */
  variant?: AvatarVariant;
  /** Дополнительный CSS класс */
  className?: string;
  /** Обработчик ошибки загрузки */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Обработчик успешной загрузки */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Props для компонента AvatarStatus (индикатор статуса)
 */
export interface AvatarStatusProps {
  /** Статус пользователя */
  status: AvatarStatus;
  /** Дополнительный CSS класс */
  className?: string;
}

/**
 * Props для компонента AvatarHero (геройская версия аватара)
 */
export interface AvatarHeroProps extends Omit<
  AvatarProps,
  'variant' | 'fallback' | 'onError' | 'onLoad'
> {
  /** Показать эффект свечения */
  showGlow?: boolean;
  /** Показать декоративное кольцо */
  showRing?: boolean;
}

/**
 * Props для компонента AvatarAbout (версия для секции About)
 */
export interface AvatarAboutProps extends Omit<
  AvatarProps,
  'variant' | 'fallback' | 'onError' | 'onLoad' | 'showGlow' | 'showRing'
> {
  size?: 'sm' | 'md' | 'lg';
}
