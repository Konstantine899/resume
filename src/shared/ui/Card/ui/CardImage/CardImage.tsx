import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import type { CardImageProps } from '../../model/types';
import styles from './CardImage.module.scss';

const CardImageComponent: React.FC<CardImageProps> = ({
  src,
  alt = '',
  className = '',
  height,
  width,
  objectFit = 'cover',
}) => {
  const imageClasses = classNames(styles.cardImage, className);

  return (
    <Image
      className={imageClasses}
      src={src}
      alt={alt}
      height={height}
      width={width}
      objectFit={objectFit}
      variant="default"
      placeholder="skeleton"
    />
  );
};

CardImageComponent.displayName = 'CardImage';

export const CardImage = memo(CardImageComponent);
CardImage.displayName = 'CardImage';
