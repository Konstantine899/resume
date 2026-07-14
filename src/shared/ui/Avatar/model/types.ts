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
  /** Дочерние элементы */
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
