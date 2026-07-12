import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
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
  src,
  lazyMode,
  threshold = INTERSECTION_OBSERVER_CONFIG.threshold,
  root = null,
  rootMargin = INTERSECTION_OBSERVER_CONFIG.rootMargin,
  priority = false,
}: UseImageLoadingConfig): UseImageLoadingReturn {
  // Состояние загрузки
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(
    'idle'
  );

  // Ref для изображения и Observer
  const imageRef = useRef<HTMLImageElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasLoadedRef = useRef(false);

  // Вычисляемые значения
  const isLoaded = useMemo(() => loadingStatus === 'loaded', [loadingStatus]);
  const isError = useMemo(() => loadingStatus === 'error', [loadingStatus]);
  const isLoading = useMemo(() => loadingStatus === 'loading', [loadingStatus]);

  // Обработчик успешной загрузки
  const handleLoad = useCallback(() => {
    setLoadingStatus('loaded');
    hasLoadedRef.current = true;
  }, []);

  // Обработчик ошибки загрузки
  const handleError = useCallback(() => {
    setLoadingStatus('error');
  }, []);

  // Функция начала загрузки
  const startLoading = useCallback(() => {
    if (loadingStatus !== 'idle' && loadingStatus !== 'error') {
      return;
    }

    setLoadingStatus('loading');

    // Если у нас есть ref к изображению, начинаем загрузку
    if (imageRef.current && src) {
      const img = imageRef.current;

      // Очищаем старые обработчики
      img.onload = null;
      img.onerror = null;

      // Устанавливаем новые обработчики
      img.onload = handleLoad;
      img.onerror = handleError;

      // Начинаем загрузку
      img.src = src;
    }
  }, [loadingStatus, src, handleLoad, handleError]);

  // Функция сброса состояния
  const reset = useCallback(() => {
    setLoadingStatus('idle');
    hasLoadedRef.current = false;

    if (imageRef.current) {
      imageRef.current.onload = null;
      imageRef.current.onerror = null;
    }
  }, []);

  // Эффект для Intersection Observer
  useEffect(() => {
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
  }, [lazyMode, priority, startLoading, threshold, root, rootMargin]);

  // Возвращаем ref для внешнего использования
  const externalRef = useRef<HTMLImageElement | null>(null);

  // Синхронизируем internal и external ref
  useEffect(() => {
    externalRef.current = imageRef.current;
  }, []);

  // Возвращаем объект с правильным типом
  return {
    loadingStatus,
    isLoaded,
    isError,
    isLoading,
    ref: externalRef,
    startLoading,
    reset,
  } as UseImageLoadingReturn;
}

/**
 * Упрощённая версия хука для базового использования
 * @description Автоматически определяет режим загрузки
 *
 * @param src - URL изображения
 * @param options - Дополнительные опции
 * @returns Состояние загрузки
 *
 * @example
 * const { isLoaded, isError } = useImageLoadingSimple('/image.jpg');
 */
export function useImageLoadingSimple(
  src: string,
  options?: { priority?: boolean; lazy?: boolean }
): Omit<UseImageLoadingReturn, 'ref' | 'startLoading' | 'reset'> {
  const { priority = false, lazy = true } = options ?? {};

  const config: UseImageLoadingConfig = useMemo(
    () => ({
      src,
      lazyMode: priority ? 'eager' : lazy ? 'native' : 'eager',
      priority,
    }),
    [src, priority, lazy]
  );

  const { loadingStatus, isLoaded, isError, isLoading } = useImageLoading(config);

  return { loadingStatus, isLoaded, isError, isLoading };
}

export default useImageLoading;
