import { forwardRef, useCallback, useEffect, useState } from 'react';
import { ImageRenderer } from './ImageRenderer';
import { LocalImageProps } from '../model/types';

/**
 * Local-обёртка: резолвит dynamic import в URL, держит skeleton (pendingLocal)
 * до первого результата. Ошибка loader'а → пустой src → штатный error-flow.
 */
const LocalImage = forwardRef<HTMLImageElement, LocalImageProps>((props, ref) => {
  const { import: loader, ...rest } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [loaderFailed, setLoaderFailed] = useState(false);

  const loadUrl = useCallback(() => {
    let active = true;
    loader()
      .then((res) => {
        if (active) setUrl(res.default);
      })
      .catch(() => {
        if (active) setLoaderFailed(true);
      });
    return () => {
      active = false;
    };
  }, [loader]);

  useEffect(loadUrl, [loadUrl]);

  const resolvedSrc = { src: url ?? '', srcSet: undefined };
  const pendingLocal = url === null && !loaderFailed;

  return (
    <ImageRenderer ref={ref} {...rest} resolvedSrc={resolvedSrc} pendingLocal={pendingLocal} />
  );
});

LocalImage.displayName = 'LocalImage';

export { LocalImage };
