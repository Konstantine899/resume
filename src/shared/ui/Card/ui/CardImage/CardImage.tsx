// ============================================
// CardImage Component
// ============================================

import { memo, useMemo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { CardImageProps } from '../../model/types';
import styles from './CardImage.module.scss';

/**
 * CardImage Component — изображение для карточки
 *
 * @example
 * // Basic usage
 * ```tsx
 * <Card.Image src="/image.jpg" alt="Описание" />
 * ```
 *
 * @example
 * // With custom objectFit
 * ```tsx
 * <Card.Image src="/image.jpg" alt="Описание" objectFit="contain" />
 * ```
 *
 * @example
 * // With dimensions
 * ```tsx
 * <Card.Image src="/image.jpg" alt="Описание" width={200} height={150} />
 * ```
 */
const CardImageComponent: React.FC<CardImageProps> = ({
  src,
  alt = '',
  className = '',
  height,
  width,
  objectFit = 'cover',
  ...props
}) => {
  // Validate objectFit in development mode
  const validatedObjectFit = useMemo(() => {
    const validObjectFits = ['cover', 'contain', 'fill', 'none', 'scale-down'] as const;
    if (objectFit && !validObjectFits.includes(objectFit)) {
      // eslint-disable-next-line no-console
      console.warn(
        `CardImage: invalid objectFit "${objectFit}". Valid values: ${validObjectFits.join(', ')}. Using 'cover' as fallback.`
      );
      return 'cover';
    }
    return objectFit;
  }, [objectFit]);

  const imageClasses = classNames(styles.cardImage, className);

  return (
    <img
      className={imageClasses}
      src={src}
      alt={alt}
      height={height}
      width={width}
      style={{ objectFit: validatedObjectFit }}
      {...props}
    />
  );
};

CardImageComponent.displayName = 'CardImage';

export const CardImage = memo(CardImageComponent);
CardImage.displayName = 'CardImage';

export default CardImage;
