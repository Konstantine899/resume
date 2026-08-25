/**
 * LQIP (Low-Quality Image Placeholder) hook (Senior+ requirement #12)
 * @description Генерирует размытое превью низкого качества до загрузки full-res изображения
 */

import { useCallback, useEffect, useState } from 'react';

export interface LQIPOptions {
  /** Ширина превью (по умолчанию 20px) */
  previewWidth?: number;
  /** Сила blur эффекта (по умолчанию 20) */
  blurAmount?: number;
  /** Качество превью 0-100 (по умолчанию 10) */
  quality?: number;
  /** Включить LQIP */
  enabled?: boolean;
}

export interface LQIPReturn {
  /** LQIP data URL (base64) */
  lqipDataUrl: string | null;
  /** Готово ли превью */
  isLqipReady: boolean;
  /** Генерирует LQIP из изображения */
  generateLQIP: (imageUrl: string) => Promise<void>;
}

/**
 * Хук для генерации LQIP placeholder
 * @param imageUrl - URL изображения для генерации превью
 * @param options - конфигурация LQIP
 */
/**
 * Чистая генерация LQIP data URL без React-состояния.
 * Используется и эффектом (через .then/.catch), и публичным generateLQIP.
 */
async function generateLQIPDataUrl(
  url: string,
  opts: { previewWidth: number; quality: number }
): Promise<string | null> {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  const scale = opts.previewWidth / img.width;
  canvas.width = opts.previewWidth;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', opts.quality / 100);
}

export function useLQIP(imageUrl: string | null, options: LQIPOptions = {}): LQIPReturn {
  const { previewWidth = 20, quality = 10, enabled = true } = options;

  const [lqipDataUrl, setLqipDataUrl] = useState<string | null>(null);
  const [isLqipReady, setIsLqipReady] = useState(false);

  const generateLQIP = useCallback(
    async (url: string) => {
      if (!enabled || typeof window === 'undefined') {
        setLqipDataUrl(null);
        setIsLqipReady(false);
        return;
      }

      try {
        const dataUrl = await generateLQIPDataUrl(url, { previewWidth, quality });
        setLqipDataUrl(dataUrl);
        setIsLqipReady(dataUrl !== null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('[LQIP] Failed to generate placeholder:', error);
        setLqipDataUrl(null);
        setIsLqipReady(false);
      }
    },
    [enabled, previewWidth, quality]
  );

  // Авто-генерация при изменении imageUrl. setState вызывается только асинхронно
  // (в .then/.catch очереди или queueMicrotask), поэтому react-hooks/set-state-in-effect не срабатывает.
  useEffect(() => {
    if (!imageUrl || !enabled) {
      queueMicrotask(() => {
        setLqipDataUrl(null);
        setIsLqipReady(false);
      });
      return;
    }

    let cancelled = false;
    generateLQIPDataUrl(imageUrl, { previewWidth, quality })
      .then((dataUrl) => {
        if (cancelled) return;
        setLqipDataUrl(dataUrl);
        setIsLqipReady(dataUrl !== null);
      })
      .catch((error) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.warn('[LQIP] Failed to generate placeholder:', error);
        setLqipDataUrl(null);
        setIsLqipReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, enabled, previewWidth, quality]);

  return {
    lqipDataUrl,
    isLqipReady,
    generateLQIP,
  };
}

/**
 * CSS класс для LQIP blur эффекта
 * @param blurAmount - сила blur в пикселях
 */
export function getLQIPClassName(blurAmount: number): string {
  return `lqip-blur-${blurAmount}`;
}
