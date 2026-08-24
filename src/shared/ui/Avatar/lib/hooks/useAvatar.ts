import { useEffect, useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { useImageStatus } from '@/shared/lib/hooks/useImageStatus';
import { AVATAR_SIZES } from '../../model/constants';
import type { AvatarProps } from '../../model/types';
import { validateAvatarProps } from '../utils/validateAvatarProps';
import styles from '../../ui/Avatar/Avatar.module.scss';

export interface UseAvatarOptions extends AvatarProps {
  /** Принудительное состояние загрузки (для демо) */
  forceLoading?: boolean;
}

export interface UseAvatarReturn {
  /** Вычисленный className для корневого элемента */
  avatarClassName: string;
  /** Статус изображения (idle, loading, loaded, error) */
  imageStatus: 'idle' | 'loading' | 'loaded' | 'error';
  /** Показывать fallback (true если нет src или ошибка загрузки) */
  showFallback: boolean;
  /** Обработчик успешной загрузки изображения */
  handleLoadSuccess: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Обработчик ошибки загрузки изображения */
  handleLoadError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Ширина аватара в пикселях */
  avatarWidth: number;
}

/**
 * Хук для управления логикой Avatar компонента
 *
 * @example
 * ```tsx
 * const { avatarClassName, imageStatus, showFallback, handleLoadSuccess, handleLoadError } = useAvatar({
 *   src: '/avatar.jpg',
 *   alt: 'User',
 *   size: 'md',
 *   variant: 'circle',
 *   showGlow: true,
 *   heroStyle: true,
 * });
 * ```
 */
export function useAvatar({
  src,
  alt = 'Avatar placeholder',
  size = 'md',
  variant = 'circle',
  showSkeleton = true,
  forceLoading = false,
  heroStyle = false,
  showGlow = false,
  showRing = false,
  className = '',
  onError,
  onLoad,
}: UseAvatarOptions): UseAvatarReturn {
  const normalizedSrc = src === '' ? undefined : src;

  // Runtime validation in dev mode
  useEffect(() => {
    validateAvatarProps({
      src,
      alt,
      size,
      variant,
      showSkeleton,
      forceLoading,
      heroStyle,
      showGlow,
      showRing,
    });
  }, [src, alt, size, variant, showSkeleton, forceLoading, heroStyle, showGlow, showRing]);

  // Image state management
  const { imageStatus, showFallback, handleLoadSuccess, handleLoadError } = useImageStatus(
    forceLoading,
    normalizedSrc,
    onLoad,
    onError
  );

  // Compute avatar width from size
  const avatarWidth = AVATAR_SIZES[size];

  // Compute className
  const avatarClassName = useMemo(
    () =>
      classNames(styles.avatar, styles[size], styles[variant], className, {
        [styles.heroStyle]: heroStyle,
      }),
    [size, variant, heroStyle, className]
  );

  return {
    avatarClassName,
    imageStatus,
    showFallback,
    handleLoadSuccess,
    handleLoadError,
    avatarWidth,
  };
}
