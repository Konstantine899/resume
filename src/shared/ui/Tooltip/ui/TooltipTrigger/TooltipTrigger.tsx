import { cn } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
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
 * `asChild` клонирует единственного дочернего ReactElement и мержит все
 * пропсы триггера в него (Radix Slot pattern) — полезно когда триггер
 * должен быть Button/Input/Icon.
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
    tabIndex: activeTrigger === 'click' || activeTrigger === 'focus' ? 0 : undefined,
    'aria-describedby': isVisible ? tooltipId : undefined,
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
    role:
      roleProp ?? (activeTrigger === 'click' || activeTrigger === 'focus' ? 'button' : undefined),
    'data-tooltip-visible': isVisible,
    'data-tooltip-position': adjustedPosition,
    'data-tooltip-trigger': activeTrigger,
    'data-tooltip-disabled': disabled,
    ...(skeleton ? { 'data-skeleton': 'true' } : {}),
  } as Record<string, unknown>;

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement(child)) {
      return <>{children}</>;
    }

    const childProps = child.props as Record<string, unknown>;
    return cloneElement(child, {
      ...triggerProps,
      className: cn(childProps.className as string | undefined, styles.trigger, className),
    } as Record<string, unknown>) as ReactElement;
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
