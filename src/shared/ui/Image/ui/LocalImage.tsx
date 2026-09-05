import { forwardRef, useEffect, useState, useRef } from 'react';
import { ImageRenderer } from './ImageRenderer';
import { LocalImageProps } from '../model/types';

/**
 * Local-обёртка: резолвит dynamic import в URL с AbortController для race conditions.
 * Использует useRef для хранения URL и избегает лишних ре-рендеров до готовности.
 */
const LocalImage = forwardRef<HTMLImageElement, LocalImageProps>((props, ref) => {
  const { import: loader, ...rest } = props;
  const [url, setUrl] = useState<string | null>(null);
  const [loaderFailed, setLoaderFailed] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    loader()
      .then((res) => {
        if (!abortController.signal.aborted) {
          setUrl(res.default);
        }
      })
      .catch((err) => {
        if (!abortController.signal.aborted && err.name !== 'AbortError') {
          setLoaderFailed(true);
        }
      });

    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, [loader]);

  const resolvedSrc = { src: url ?? '', srcSet: undefined };
  const pendingLocal = url === null && !loaderFailed;

  return (
    <ImageRenderer ref={ref} {...rest} resolvedSrc={resolvedSrc} pendingLocal={pendingLocal} />
  );
});

LocalImage.displayName = 'LocalImage';

export { LocalImage };
