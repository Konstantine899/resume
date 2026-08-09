import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseImageLoadingConfig, UseImageLoadingReturn } from '../../model/types';
import { INTERSECTION_OBSERVER_CONFIG } from '../../model/constants';

/**
 * Хук для управления загрузкой изображений с поддержкой lazy loading
 * @description Предоставляет состояние загрузки и методы управления
 *
 * @param config - Конфигурация хука
 * @returns Объект с состоянием и методами управления
 *
 * @example
 * const { loadingStatus, ref, isLoaded, isError } = useImageLoading({
 *   src: '/image.jpg',
 *   lazyMode: 'intersection',
 *   threshold: 0.1,
 * });
 *
 * @example
 * const { startLoading, reset } = useImageLoading({
 *   src: '/image.jpg',
 *   lazyMode: 'eager',
 * });
 */
export function useImageLoading({
  src: _src,
  lazyMode,
  threshold = INTERSECTION_OBSERVER_CONFIG.threshold,
  root = null,
  rootMargin = INTERSECTION_OBSERVER_CONFIG.rootMargin,
  priority = false,
  forceLoading = false,
}: UseImageLoadingConfig): UseImageLoadingReturn {
  // Состояние загрузки
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    'loading'
  );

  // Ref для изображения и Observer
  const imageRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasLoadedRef = useRef(false);
  const hasStartedRef = useRef(false);

  // Вычисляемые значения (plain const — no useMemo needed)
  const isLoaded = loadingStatus === 'loaded';
  const isError = loadingStatus === 'error';
  const isLoading = loadingStatus === 'loading';

  // Принудительное состояние loading (для Storybook демо)
  useEffect(() => {
    if (forceLoading) {
      setLoadingStatus('loading');
    }
  }, [forceLoading]);

  // Обработчик успешной загрузки (React event callback — LOAD-2)
  const onLoad = useCallback(
    (_event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (forceLoading) return;
      setLoadingStatus('loaded');
      hasLoadedRef.current = true;
    },
    [forceLoading]
  );

  // Обработчик ошибки загрузки (React event callback — LOAD-2)
  const onError = useCallback(
    (_event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (forceLoading) return;
      setLoadingStatus('error');
    },
    [forceLoading]
  );

  // Функция начала загрузки
  const startLoading = useCallback(() => {
    if (loadingStatus !== 'idle' && loadingStatus !== 'error') {
      return;
    }

    setLoadingStatus('loading');
  }, [loadingStatus]);

  // Функция сброса состояния
  const reset = useCallback(() => {
    setLoadingStatus('idle');
    hasLoadedRef.current = false;
    hasStartedRef.current = false;
  }, []);

  // Эффект для Intersection Observer (с hasStartedRef guard — no set-state-in-effect)
  useEffect(() => {
    if (forceLoading || hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    // Если priority или eager mode, загружаем сразу
    if (priority || lazyMode === 'eager') {
      startLoading();
      return;
    }

    // Если native lazy loading, браузер сам обработает
    if (lazyMode === 'native') {
      return;
    }

    // Intersection Observer для custom lazy loading
    const element = imageRef.current;
    if (!element || lazyMode !== 'intersection') {
      return;
    }

    // Создаём Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasLoadedRef.current) {
            startLoading();

            // Unobserve после начала загрузки
            if (observerRef.current) {
              observerRef.current.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    // Начинаем наблюдение
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // NOTE: startLoading intentionally omitted — hasStartedRef prevents re-runs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lazyMode, priority, threshold, root, rootMargin]);

  // Возвращаем imageRef напрямую (без externalRef indirection)
  return {
    loadingStatus,
    isLoaded,
    isError,
    isLoading,
    ref: imageRef,
    startLoading,
    reset,
    onLoad,
    onError,
  } as UseImageLoadingReturn;
}
