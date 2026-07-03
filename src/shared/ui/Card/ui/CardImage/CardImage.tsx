// ============================================
// CardImage Component
// ============================================

import React from 'react';
import type { CardImageProps } from '../../model/types';
import styles from './CardImage.module.scss';

/**
 * Изображение карточки
 *
 * @example
 * ```tsx
 * <Card>
 *   <Card.Image src="/image.jpg" alt="Описание" />
 *   <Card.Body>Контент</Card.Body>
 * </Card>
 * ```
 */
export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt = '',
  className = '',
  height,
  width,
  objectFit = 'cover',
  ...props
}) => {
  const imageClasses = [styles.cardImage, className].filter(Boolean).join(' ');

  return (
    <img
      className={imageClasses}
      src={src}
      alt={alt}
      height={height}
      width={width}
      style={{ objectFit }}
      {...props}
    />
  );
};

CardImage.displayName = 'CardImage';

export default CardImage;
