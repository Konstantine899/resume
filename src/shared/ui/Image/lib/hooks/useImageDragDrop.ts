/**
 * Drag & Drop hook for image upload (Senior+ requirement #14)
 * @description Поддержка drag & drop для загрузки изображений через File API
 */

import { useState, useCallback, useRef } from 'react';

export interface ImageDragDropState {
  /** Перетаскивание активно */
  isDragging: boolean;
  /** Файл загружается */
  isUploading: boolean;
  /** URL превью загруженного изображения */
  previewUrl: string | null;
  /** Ошибка загрузки */
  error: string | null;
  /** Прогресс загрузки (0-100) */
  progress: number;
}

export interface ImageDragDropHandlers {
  /** Обработчик drag enter */
  handleDragEnter: (e: React.DragEvent) => void;
  /** Обработчик drag leave */
  handleDragLeave: (e: React.DragEvent) => void;
  /** Обработчик drag over */
  handleDragOver: (e: React.DragEvent) => void;
  /** Обработчик drop */
  handleDrop: (e: React.DragEvent) => void;
  /** Сбросить состояние */
  reset: () => void;
}

export interface ImageDragDropOptions {
  /** Максимальный размер файла в MB (по умолчанию 5) */
  maxSizeMB?: number;
  /** Разрешённые типы файлов */
  acceptedTypes?: string[];
  /** Колбэк при успешной загрузке */
  onFileSelect?: (file: File) => void;
  /** Колбэк при ошибке */
  onError?: (error: string) => void;
}

export type ImageDragDropReturn = ImageDragDropState & ImageDragDropHandlers;

/**
 * Хук для drag & drop загрузки изображений
 * @param options - конфигурация
 */
export function useImageDragDrop(options: ImageDragDropOptions = {}): ImageDragDropReturn {
  const {
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    onFileSelect,
    onError,
  } = options;

  const [state, setState] = useState<ImageDragDropState>({
    isDragging: false,
    isUploading: false,
    previewUrl: null,
    error: null,
    progress: 0,
  });

  const dragCounter = useRef(0);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Проверка типа
      if (!acceptedTypes.includes(file.type)) {
        return `Unsupported file type: ${file.type}. Accepted: ${acceptedTypes.join(', ')}`;
      }

      // Проверка размера
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: ${maxSizeMB}MB`;
      }

      return null;
    },
    [maxSizeMB, acceptedTypes]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;

      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        const isImage = Array.from(e.dataTransfer.items).some(
          (item) => item.kind === 'file' && acceptedTypes.includes(item.type)
        );
        if (isImage) {
          setState((prev) => ({ ...prev, isDragging: true }));
        }
      }
    },
    [acceptedTypes]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setState((prev) => ({ ...prev, isDragging: false }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setState((prev) => ({ ...prev, isDragging: false }));

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      const error = validateFile(file);

      if (error) {
        setState((prev) => ({ ...prev, error, previewUrl: null }));
        onError?.(error);
        return;
      }

      // Создаём превью
      setState((prev) => ({ ...prev, isUploading: true, progress: 0 }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          previewUrl: event.target?.result as string,
          progress: 100,
        }));
        onFileSelect?.(file);
      };
      reader.onerror = () => {
        const errorMsg = 'Failed to read file';
        setState((prev) => ({ ...prev, isUploading: false, error: errorMsg }));
        onError?.(errorMsg);
      };
      reader.readAsDataURL(file);
    },
    [validateFile, onFileSelect, onError]
  );

  const reset = useCallback(() => {
    dragCounter.current = 0;
    setState({
      isDragging: false,
      isUploading: false,
      previewUrl: null,
      error: null,
      progress: 0,
    });
  }, []);

  return {
    ...state,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    reset,
  };
}
