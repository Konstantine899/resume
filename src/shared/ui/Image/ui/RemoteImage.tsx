import { forwardRef } from 'react';
import { ImageRenderer } from './ImageRenderer';
import { RemoteImageProps } from '../model/types';

/**
 * Remote-обёртка: извлекает `src`/`lazyLoad`, нормализует в resolvedSrc (IMG-04).
 */
const RemoteImage = forwardRef<HTMLImageElement, RemoteImageProps>((props, ref) => {
  const { src, lazyLoad, ...rest } = props;
  // IMG-04: single resolved-src source — object form carries the optional srcSet,
  // string form normalizes to a source object so the srcset attribute stays absent.
  const resolvedSrc = typeof src === 'object' ? src : { src, srcSet: undefined };
  return <ImageRenderer ref={ref} {...rest} resolvedSrc={resolvedSrc} lazyLoad={lazyLoad} />;
});

RemoteImage.displayName = 'RemoteImage';

export { RemoteImage };
