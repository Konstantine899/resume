import React from 'react';
import { Image } from '@/shared/ui/Image';
import { classNames } from '@/shared/lib/utils/classNames';
import { useImageStatus } from '@/shared/lib/hooks/useImageStatus';
import type { AvatarSize, AvatarVariant } from '../../model/types';
import { AVATAR_SIZES } from '../../model/constants';
import styles from './AvatarImage.module.scss';

export interface AvatarImageProps {
  /** URL изображения */
  src?: string;
  /** Альтернативный текст */
  alt?: string;
  /** Размер аватара */
  size?: AvatarSize;
  /** Форма аватара */
  variant?: AvatarVariant;
  /** Показывать скелетон во время загрузки */
  showSkeleton?: boolean;
  /** Принудительно показать состояние загрузки */
  forceLoading?: boolean;
  /** Дополнительный CSS класс */
  className?: string;
  /** Обработчик успешной загрузки */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  /** Обработчик ошибки загрузки */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * AvatarImage — компонент изображения для Avatar с обработкой состояний загрузки
 *
 * @example
 * ```tsx
 * <Avatar.Image src="/user.jpg" alt="John Doe" size="md" />
 * ```
 */
export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt = '',
  size = 'md',
  variant = 'circle',
  showSkeleton = true,
  forceLoading = false,
  className = '',
  onLoad,
  onError,
}) => {
  const normalizedSrc = src === '' ? undefined : src;
  const { imageStatus, handleLoadSuccess, handleLoadError } = useImageStatus(
    forceLoading,
    normalizedSrc,
    onLoad,
    onError
  );

  const avatarWidth = AVATAR_SIZES[size];

  return (
    <div
      className={classNames(styles.container, className)}
      data-state={imageStatus}
      data-size={size}
      data-variant={variant}
    >
      <Image
        src={normalizedSrc || ''}
        alt={alt}
        decorative
        variant={variant === 'circle' ? 'circular' : 'rounded'}
        width={avatarWidth}
        height={avatarWidth}
        placeholder={showSkeleton ? 'skeleton' : 'color'}
        showPlaceholder={showSkeleton}
        forceLoading={forceLoading}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
      />
    </div>
  );
};

AvatarImage.displayName = 'AvatarImage';
