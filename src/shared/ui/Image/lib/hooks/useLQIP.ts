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
export function useLQIP(imageUrl: string | null, options: LQIPOptions = {}): LQIPReturn {
  const { previewWidth = 20, quality = 10, enabled = true } = options;

  const [lqipDataUrl, setLqipDataUrl] = useState<string | null>(null);
  const [isLqipReady, setIsLqipReady] = useState(false);

  const generateLQIP = useCallback(
    async (url: string) => {
      if (!enabled || typeof window === 'undefined') {
        queueMicrotask(() => {
          setLqipDataUrl(null);
          setIsLqipReady(false);
        });
        return;
      }

      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = url;
        });

        // Создаём canvas маленького размера
        const canvas = document.createElement('canvas');
        const scale = previewWidth / img.width;
        canvas.width = previewWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setLqipDataUrl(null);
          setIsLqipReady(false);
          return;
        }

        // Рисуем уменьшенное изображение
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Получаем data URL с низким качеством
        const dataUrl = canvas.toDataURL('image/jpeg', quality / 100);

        setLqipDataUrl(dataUrl);
        setIsLqipReady(true);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('[LQIP] Failed to generate placeholder:', error);
        setLqipDataUrl(null);
        setIsLqipReady(false);
      }
    },
    [enabled, previewWidth, quality]
  );

  // Авто-генерация при изменении imageUrl
  useEffect(() => {
    if (imageUrl && enabled) {
      // Асинхронная генерация LQIP; sync-setState исключены (queueMicrotask + await)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void generateLQIP(imageUrl);
    } else {
      queueMicrotask(() => {
        setLqipDataUrl(null);
        setIsLqipReady(false);
      });
    }
  }, [imageUrl, enabled, generateLQIP]);

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
