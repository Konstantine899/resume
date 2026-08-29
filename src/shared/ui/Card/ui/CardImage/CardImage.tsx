import { forwardRef, memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Image } from '@/shared/ui/Image';
import type { CardImageProps } from '../../model/types';
import styles from './CardImage.module.scss';

export const CardImage = memo(
  forwardRef<HTMLImageElement, CardImageProps>(function CardImage(
    { src, alt = '', className = '', height, width, objectFit = 'cover' },
    ref
  ) {
    const imageClasses = classNames(styles.cardImage, className);

    return (
      <Image
        ref={ref}
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
  })
);
CardImage.displayName = 'CardImage';
