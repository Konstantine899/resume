import { forwardRef, memo } from 'react';
import { RemoteImage } from './RemoteImage';
import { LocalImage } from './LocalImage';
import { ImageProps } from '../model/types';

/**
 * Публичная точка входа — дискриминация discriminated union (#4):
 * `type === 'local'` → local-источник (import), иначе remote (src).
 */
const ImageComponent = forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  return props.type === 'local' ? (
    <LocalImage {...props} ref={ref} />
  ) : (
    <RemoteImage {...props} ref={ref} />
  );
});

ImageComponent.displayName = 'Image';

export const Image = memo(ImageComponent);
Image.displayName = 'Image';
