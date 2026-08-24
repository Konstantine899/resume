import { debounce, type DebouncedFunction } from '@/shared/lib/utils/debounce';
import { useClickOutside } from '@/shared/lib/hooks/useClickOutside';
import { useCallback, useEffect, useRef, useState, useMemo, useId } from 'react';
import { TOOLTIP_CONSTANTS } from '../../model/constants';
import type { TooltipConfig, TooltipPosition, TooltipTriggerType } from '../../model/types';
import { calculateTooltipPosition } from '../utils/tooltipPosition';
import { validateTooltipProps } from '../utils/validateTooltipProps';

/**
 * Опции useTooltip — конфигурация состояния тултипа.
 * Отдельный интерфейс (как UseButtonOptions), не привязан к типу монолита.
 */
export type UseTooltipOptions = TooltipConfig;

interface UseTooltipReturn {
  isVisible: boolean;
  calculatedStyle: React.CSSProperties;
  adjustedPosition: TooltipPosition;
  positioned: boolean;
  triggerRef: React.RefObject<HTMLElement | null>;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  tooltipId: string;
  activeTrigger: TooltipTriggerType;
  disabled: boolean;
  handlers: {
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    handleFocus: () => void;
    handleBlur: () => void;
    handleClick: (e: React.MouseEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
  };
  isVisibleEnabled: boolean;
}

/**
 * Custom hook для логики Tooltip компонента
 * Инкапсулирует state, эффекты и обработчики событий.
 */
export const useTooltip = ({
  position = 'top',
  trigger = 'hover',
  showDelay = TOOLTIP_CONSTANTS.DEFAULT_SHOW_DELAY,
  hideDelay = TOOLTIP_CONSTANTS.DEFAULT_HIDE_DELAY,
  disabled = false,
  offset = TOOLTIP_CONSTANTS.DEFAULT_OFFSET,
  maxWidth = TOOLTIP_CONSTANTS.DEFAULT_MAX_WIDTH,
  autoAdjust = true,
  color,
  arrowShadowColor,
}: UseTooltipOptions): UseTooltipReturn => {
  const tooltipId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedStyle, setCalculatedStyle] = useState<React.CSSProperties>({});
  const [adjustedPosition, setAdjustedPosition] = useState<TooltipPosition>(position);
  const [positioned, setPositioned] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const activeTrigger = trigger;

  // Runtime validation in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const warnings = validateTooltipProps({
        position,
        trigger,
        showDelay,
        hideDelay,
        offset,
        maxWidth,
        color,
        arrowShadowColor,
      });
      warnings.forEach((w) => {
        // eslint-disable-next-line no-console
        console.warn(w.message);
      });
    }
  }, [position, trigger, showDelay, hideDelay, offset, maxWidth, color, arrowShadowColor]);

  // Debounced show/hide: один враппер на ref, cross-cancel между show/hide.
  // `cancel` существует на возврате debounce (см. shared/lib/utils/debounce).
  const showRef = useRef<DebouncedFunction<() => void> | null>(null);
  const hideRef = useRef<DebouncedFunction<() => void> | null>(null);

  // Единая точка изменения видимости: сбрасывает `positioned`, чтобы
  // при каждом новом показе тултип сначала встал на место (top/left),
  // и только потом включился visible-класс (без прыжка с первого кадра).
  const setVisible = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setPositioned(false);
    setIsVisible(next);
  }, []);

  const debouncedShow = useCallback(() => {
    hideRef.current?.cancel();
    if (!showRef.current) {
      showRef.current = debounce(() => setVisible(true), showDelay);
    }
    showRef.current();
  }, [showDelay, setVisible]);

  const debouncedHide = useCallback(() => {
    showRef.current?.cancel();
    if (!hideRef.current) {
      hideRef.current = debounce(() => setVisible(false), hideDelay);
    }
    hideRef.current();
  }, [hideDelay, setVisible]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      showRef.current?.cancel();
      hideRef.current?.cancel();
    };
  }, []);

  // Вычисление позиции (pure, без setState в hot path — только при изменении refs).
  // maxWidth применяется всегда (не зависит от геометрии) — тултип не «скачет»
  // по ширине, даже если позиция ещё не вычислена (zero-rect guard).
  const updatePosition = useCallback(() => {
    const baseStyle: React.CSSProperties = { maxWidth: `${maxWidth}px` };
    if (!triggerRef.current || !tooltipRef.current) {
      setCalculatedStyle(baseStyle);
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Zero-rect guard: триггер или контент скрыты (display:none, mid-layout) —
    // не позиционируем, ждём следующего кадра (retry при показе).
    if (triggerRect.width === 0 && triggerRect.height === 0) {
      setCalculatedStyle(baseStyle);
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const result = calculateTooltipPosition({
      position,
      triggerRect,
      tooltipRect,
      viewportWidth,
      viewportHeight,
      offset,
      autoAdjust,
    });

    setCalculatedStyle({
      top: `${result.top}px`,
      left: `${result.left}px`,
      maxWidth: `${maxWidth}px`,
    });

    if (result.adjustedPosition) {
      setAdjustedPosition(result.adjustedPosition);
    }
  }, [position, offset, maxWidth, autoAdjust]);

  // rAF-throttle: не чаще одного пересчёта на кадр при scroll/resize
  const rafRef = useRef<number | null>(null);
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updatePosition();
    });
  }, [updatePosition]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Подписка на resize/scroll (throttled через rAF)
  useEffect(() => {
    if (!isVisible) return;

    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [isVisible, scheduleUpdate]);

  // Позиционирование при показе: сначала померить/поставить top/left,
  // затем включить `positioned` (visible-класс и transition начинаются
  // только после того, как тултип стоит на месте — нет прыжка с первого кадра).
  // Сброс positioned происходит в open-путях (show-to-visible), не в эффекте.
  useEffect(() => {
    if (!isVisible) return undefined;

    const raf = requestAnimationFrame(() => {
      if (tooltipRef.current && triggerRef.current) {
        updatePosition();
        setPositioned(true);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [isVisible, updatePosition]);

  // ResizeObserver: пересчитываем позицию, если контент тултипа меняет размер
  // после показа (картинки, async-контент). Гвард на тип — в jsdom/SSR
  // ResizeObserver может отсутствовать.
  useEffect(() => {
    if (!isVisible || !tooltipRef.current || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updatePosition();
    });
    observer.observe(tooltipRef.current);

    return () => observer.disconnect();
  }, [isVisible, updatePosition]);

  // Fallback: если триггер размонтирован при открытом тултипе (compound) —
  // закрываем тултип, чтобы он не остался «застрявшим».
  // Deferred через rAF — setState не вызывается синхронно в теле эффекта.
  useEffect(() => {
    if (!isVisible) return undefined;
    if (!triggerRef.current) {
      const raf = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isVisible, setVisible]);

  // Обработчики событий
  const handleMouseEnter = useCallback(() => {
    if (activeTrigger === 'hover' && !disabled) {
      debouncedShow();
    }
  }, [activeTrigger, disabled, debouncedShow]);

  const handleMouseLeave = useCallback(() => {
    if (activeTrigger === 'hover' && !disabled) {
      debouncedHide();
    }
  }, [activeTrigger, disabled, debouncedHide]);

  const handleFocus = useCallback(() => {
    if (activeTrigger === 'focus' && !disabled) {
      setVisible(true);
    }
  }, [activeTrigger, disabled, setVisible]);

  const handleBlur = useCallback(() => {
    if (activeTrigger === 'focus' && !disabled) {
      setVisible(false);
    }
  }, [activeTrigger, disabled, setVisible]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTrigger === 'click' && !disabled) {
        // stopPropagation нужен только для click-триггера (toggle),
        // иначе клики на hover/focus тултипах глотаются у родителей.
        e.stopPropagation();
        setVisible((prev) => !prev);
      }
    },
    [activeTrigger, disabled, setVisible]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (activeTrigger === 'click' && (e.key === 'Enter' || e.key === ' ') && !disabled) {
        // Клавиатурная активация click-триггера (span с role="button"
        // не активируется нативно, как button/a)
        e.preventDefault();
        setVisible((prev) => !prev);
      }
    },
    [activeTrigger, disabled, setVisible]
  );

  // Escape закрывает тултип с любого места (не только при фокусе на триггере)
  useEffect(() => {
    if (!isVisible) return undefined;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, setVisible]);

  // Click outside для click триггера — через общий хук useClickOutside
  // (capture-фаза: закрывает даже если вложенный компонент вызвал
  // stopPropagation на mousedown). excludeRefs — триггер и сам тултип.
  useClickOutside(
    () => {
      setVisible(false);
    },
    {
      enabled: activeTrigger === 'click' && isVisible,
      event: 'mousedown',
      excludeRefs: [triggerRef, tooltipRef],
    }
  );

  // Memoize handlers object to prevent recreation on every render
  const handlers = useMemo(
    () => ({
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleClick,
      handleKeyDown,
    }),
    [handleMouseEnter, handleMouseLeave, handleFocus, handleBlur, handleClick, handleKeyDown]
  );

  return {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    positioned,
    triggerRef,
    tooltipRef,
    tooltipId,
    activeTrigger,
    disabled,
    handlers,
    isVisibleEnabled: isVisible && !disabled,
  };
};
