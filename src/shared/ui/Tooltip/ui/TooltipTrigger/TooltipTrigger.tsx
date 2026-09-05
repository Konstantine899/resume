import { cn } from '@/shared/lib/utils/classNames';
import { mergeRefs, useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { Children, cloneElement, isValidElement, memo } from 'react';
import type {
  ComponentRef,
  ElementType,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
} from 'react';
import { useTooltipContext } from '../../lib/context/TooltipContext';
import type { TooltipTriggerComponent, TooltipTriggerProps } from '../../model/types';
import styles from '../Tooltip.module.scss';

/**
 * TooltipTrigger — полиморфный триггер тултипа.
 *
 * Потребляет состояние из TooltipProvider и подключает к триггеру:
 * - обработчики (mouse/focus/click/keydown)
 * - ref триггера
 * - ARIA (aria-describedby, aria-label, role, tabIndex)
 * - data-атрибуты для тестирования и стилизации
 *
 * `asChild` клонирует единственного дочернего ReactElement (Radix Slot pattern)
 * и МЕРЖИТ пропсы: обработчики вызываются и ребёнка, и тултипа; refs
 * объединяются; role/tabIndex/aria не перезаписывают установленные ребёнком.
 *
 * @example
 * ```tsx
 * <Tooltip.Provider>
 *   <Tooltip.Trigger asChild>
 *     <Button>Hover</Button>
 *   </Tooltip.Trigger>
 *   <Tooltip.Content>Подсказка</Tooltip.Content>
 * </Tooltip.Provider>
 * ```
 */
function TooltipTriggerImpl<C extends ElementType = 'span'>(
  props: TooltipTriggerProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
): ReactElement {
  const {
    ref: forwardedRef,
    as: Component = 'span',
    asChild,
    className,
    ariaLabel,
    children,
    onMouseEnter: userOnMouseEnter,
    onMouseLeave: userOnMouseLeave,
    onFocus: userOnFocus,
    onBlur: userOnBlur,
    onClick: userOnClick,
    onKeyDown: userOnKeyDown,
    role: roleProp,
    ...restProps
  } = props;

  const {
    isVisible,
    adjustedPosition,
    triggerRef,
    tooltipId,
    activeTrigger,
    disabled,
    skeleton,
    handlers,
  } = useTooltipContext();

  const triggerRefCallback = useMergeRefs(forwardedRef as Ref<HTMLElement>, triggerRef);
  const Tag = Component as ElementType;

  const needsKeyboardProps = activeTrigger === 'click' || activeTrigger === 'focus';
  const defaultTriggerRole = needsKeyboardProps ? 'button' : undefined;

  // Базовые пропсы триггера. Обработчики делегируют приоритет user-обработчику.
  const triggerProps = {
    ...restProps,
    ref: triggerRefCallback,
    className: cn(styles.trigger, className),
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      userOnMouseEnter?.(e);
      handlers.handleMouseEnter();
    },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => {
      userOnMouseLeave?.(e);
      handlers.handleMouseLeave();
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      userOnFocus?.(e);
      handlers.handleFocus();
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      userOnBlur?.(e);
      handlers.handleBlur();
    },
    onClick: (e: MouseEvent<HTMLElement>) => {
      userOnClick?.(e);
      handlers.handleClick(e);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      userOnKeyDown?.(e);
      handlers.handleKeyDown(e);
    },
    tabIndex: needsKeyboardProps ? 0 : undefined,
    'aria-describedby': isVisible ? tooltipId : undefined,
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
    role: roleProp ?? defaultTriggerRole,
    'data-tooltip-visible': isVisible,
    'data-tooltip-position': adjustedPosition,
    'data-tooltip-trigger': activeTrigger,
    'data-tooltip-disabled': disabled,
    ...(skeleton ? { 'data-skeleton': 'true' } : {}),
    ...(skeleton ? { 'aria-busy': true } : {}),
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return <>{children}</>;
    }

    const childProps = child.props as Record<string, unknown>;
    // ref может лежать на самом ReactElement (React 19) — извлекаем для слияния.
    // mergeRefs (не хук) — безопасно вызывать в условной ветке asChild.
    const childRef = (child as unknown as { ref?: Ref<unknown> }).ref;
    const mergedRef = mergeRefs(childRef as Ref<HTMLElement> | null, triggerRefCallback);

    const mergedProps = {
      ...childProps,
      // ref объединяем: и дочерний, и тултипный.
      ref: mergedRef,
      className: cn(childProps.className as string | undefined, styles.trigger, className),
      // Роль/таб-индекс ребёнка НЕ перезаписываем: если ребёнок задал явно — сохраняем.
      role: (childProps.role as string | undefined) ?? defaultTriggerRole,
      tabIndex:
        (childProps.tabIndex as number | null | undefined) ?? (needsKeyboardProps ? 0 : undefined),
      'aria-describedby': isVisible ? tooltipId : undefined,
      'data-tooltip-visible': isVisible,
      'data-tooltip-position': adjustedPosition,
      'data-tooltip-trigger': activeTrigger,
      'data-tooltip-disabled': disabled,
      ...(skeleton ? { 'data-skeleton': 'true' } : {}),
      ...(skeleton ? { 'aria-busy': true } : {}),
      // Event-обработчики мержим, а не перезаписываем.
      onMouseEnter: (e: MouseEvent<HTMLElement>) => {
        (childProps.onMouseEnter as ((ev: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
        handlers.handleMouseEnter();
      },
      onMouseLeave: (e: MouseEvent<HTMLElement>) => {
        (childProps.onMouseLeave as ((ev: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
        handlers.handleMouseLeave();
      },
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        (childProps.onFocus as ((ev: React.FocusEvent<HTMLElement>) => void) | undefined)?.(e);
        handlers.handleFocus();
      },
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        (childProps.onBlur as ((ev: React.FocusEvent<HTMLElement>) => void) | undefined)?.(e);
        handlers.handleBlur();
      },
      onClick: (e: MouseEvent<HTMLElement>) => {
        (childProps.onClick as ((ev: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
        userOnClick?.(e);
        handlers.handleClick(e);
      },
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        (childProps.onKeyDown as ((ev: KeyboardEvent<HTMLElement>) => void) | undefined)?.(e);
        userOnKeyDown?.(e);
        handlers.handleKeyDown(e);
      },
    };

    return cloneElement(child, mergedProps as Record<string, unknown>) as ReactElement;
  }

  return <Tag {...triggerProps}>{children}</Tag>;
}

/**
 * React.memo не умеет generic-функции, поэтому оборачиваем через
 * промежуточный НЕ-generic каст (Paragraph/Heading precedent).
 */
const TooltipTriggerMemo = memo(
  TooltipTriggerImpl as unknown as (
    props: TooltipTriggerProps<'span'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

TooltipTriggerMemo.displayName = 'TooltipTrigger';

/**
 * TooltipTrigger — полиморфный триггер тултипа.
 */
export const TooltipTrigger = TooltipTriggerMemo as unknown as TooltipTriggerComponent;
