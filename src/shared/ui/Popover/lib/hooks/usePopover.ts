import { useCallback, useEffect, useRef, useState } from 'react';
import { POPOVER_CONSTANTS } from '../../model/constants';
import type { PopoverPosition } from '../../model/types';
import { calculatePopoverPosition } from '../utils/popoverPosition';

interface UsePopoverReturn {
  isVisible: boolean;
  calculatedStyle: React.CSSProperties;
  adjustedPosition: PopoverPosition;
  triggerRef: React.RefObject<HTMLElement | null>;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  handlers: {
    handleClick: (e: React.MouseEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    handleContentClick: () => void;
  };
  shouldRender: boolean;
  open: () => void;
  close: () => void;
}

interface UsePopoverOptions {
  position?: PopoverPosition;
  offset?: number;
  autoAdjust?: boolean;
  disabled?: boolean;
  closeOnContentClick?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
}

/**
 * Custom hook для управления логикой Popover компонента
 *
 * Features:
 * - Управление видимостью (open/close)
 * - Позиционирование относительно триггера
 * - Auto-adjust при выходе за viewport
 * - Закрытие по клику вне / ESC
 * - Keyboard navigation
 * - Оптимизированные update позиции (RAF + resize/scroll listeners)
 *
 * @param options - Конфигурация popover
 * @param options.position - Позиция относительно триггера (top/bottom/left/right/center)
 * @param options.offset - Смещение от триггера в пикселях
 * @param options.autoAdjust - Автоматически корректировать позицию при выходе за viewport
 * @param options.disabled - Отключить popover
 * @param options.closeOnContentClick - Закрывать при клике на контент
 * @param options.closeOnClickOutside - Закрывать при клике вне popover
 * @param options.closeOnEsc - Закрывать по нажатию ESC
 *
 * @returns Object с состоянием, refs и обработчиками
 *
 * @example
 * ```tsx
 * const { isVisible, triggerRef, popoverRef, handlers } = usePopover({
 *   position: 'bottom',
 *   offset: 8,
 *   closeOnEsc: true,
 * });
 * ```
 */
export const usePopover = ({
  position = POPOVER_CONSTANTS.DEFAULT_POSITION,
  offset = POPOVER_CONSTANTS.DEFAULT_OFFSET,
  autoAdjust = true,
  disabled = false,
  closeOnContentClick = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
}: UsePopoverOptions): UsePopoverReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedStyle, setCalculatedStyle] = useState<React.CSSProperties>({});
  const [adjustedPosition, setAdjustedPosition] = useState<PopoverPosition>(position);
  const triggerRef = useRef<HTMLElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  /**
   * Вычисление позиции popover относительно триггера
   * Использует calculatePopoverPosition utility
   */
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    const result = calculatePopoverPosition({
      position,
      triggerRect,
      popoverRect,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      offset,
      autoAdjust,
    });

    setCalculatedStyle({
      top: `${result.top}px`,
      left: `${result.left}px`,
    });

    if (result.adjustedPosition) {
      setAdjustedPosition(result.adjustedPosition);
    }
  }, [position, offset, autoAdjust]);

  /**
   * Подписка на resize и scroll события для обновления позиции
   * Навешивается только когда popover видим
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isVisible, updatePosition]);

  /**
   * Обновление позиции при показе popover
   * Использует requestAnimationFrame для точного позиционирования
   */
  useEffect(() => {
    if (isVisible) {
      const raf = requestAnimationFrame(() => {
        if (popoverRef.current && triggerRef.current) {
          updatePosition();
        }
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isVisible, updatePosition]);

  /**
   * Закрытие по клику вне popover
   * Проверяет что клик не по триггеру и не по popover
   */
  useEffect(() => {
    if (!closeOnClickOutside || !isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsidePopover = popoverRef.current?.contains(event.target as Node);
      const isClickInsideTrigger = triggerRef.current?.contains(event.target as Node);

      if (!isClickInsidePopover && !isClickInsideTrigger) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickOutside, isVisible]);

  /**
   * Закрытие по нажатию ESC
   * Возвращает фокус на триггер после закрытия
   */
  useEffect(() => {
    if (!closeOnEsc || !isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === POPOVER_CONSTANTS.ESCAPE_KEY) {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEsc, isVisible]);

  /**
   * Обработчик клика по триггеру
   * Переключает видимость popover
   */
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        setIsVisible((prev) => !prev);
      }
    },
    [disabled]
  );

  /**
   * Обработчик клавиатуры на триггере
   * Enter/Space — переключить видимость
   * ESC — закрыть (если открыт)
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled) {
          setIsVisible((prev) => !prev);
        }
      }
      if (e.key === POPOVER_CONSTANTS.ESCAPE_KEY && isVisible) {
        setIsVisible(false);
        triggerRef.current?.focus();
      }
    },
    [disabled, isVisible]
  );

  /**
   * Обработчик клика внутри контента popover
   * Закрывает popover если closeOnContentClick=true
   */
  const handleContentClick = useCallback(() => {
    if (closeOnContentClick) {
      setIsVisible(false);
    }
  }, [closeOnContentClick]);

  const open = useCallback(() => setIsVisible(true), []);
  const close = useCallback(() => setIsVisible(false), []);

  return {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    triggerRef,
    popoverRef,
    handlers: {
      handleClick,
      handleKeyDown,
      handleContentClick,
    },
    shouldRender: isVisible && !disabled,
    open,
    close,
  };
};
