import { cn } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { memo } from 'react';
import type {
  ComponentRef,
  ElementType,
  ForwardedRef,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  Ref,
} from 'react';
import { usePopoverContext } from '../../lib/context/PopoverContext';
import type { PopoverTriggerComponent, PopoverTriggerProps } from '../../model/types';
import styles from '../Popover.module.scss';

/**
 * PopoverTrigger — полиморфный триггер попавера.
 *
 * Потребляет состояние из PopoverProvider и подключает к триггеру:
 * - обработчики (click/keydown)
 * - ref триггера
 * - ARIA (role="button", aria-haspopup="dialog", aria-expanded, aria-label)
 * - tabIndex (0, или -1 когда disabled)
 * - data-атрибуты для тестирования и стилизации
 *
 * `as` полиморфный: по умолчанию `<span>`, позволяет рендерить любой
 * элемент или компонент с типобезопасным ref (`as="a"` → `HTMLAnchorElement`).
 *
 * @example
 * ```tsx
 * <Popover.Provider>
 *   <Popover.Trigger as="button">Открыть</Popover.Trigger>
 *   <Popover.Content>Контент</Popover.Content>
 * </Popover.Provider>
 * ```
 */
function PopoverTriggerImpl<C extends ElementType = 'span'>(
  props: PopoverTriggerProps<C> & { ref?: ForwardedRef<ComponentRef<C>> }
): ReactElement {
  const {
    ref: forwardedRef,
    as: Component = 'span',
    className,
    ariaLabel,
    children,
    onClick: userOnClick,
    onKeyDown: userOnKeyDown,
    ...restProps
  } = props;

  const { isVisible, disabled, adjustedPosition, triggerRef, handlers } = usePopoverContext();

  const Tag = Component as ElementType;
  const combinedRef = useMergeRefs<HTMLElement>(
    forwardedRef as Ref<HTMLElement> | null,
    triggerRef
  );
  const { handleClick, handleKeyDown } = handlers;

  return (
    <Tag
      {...restProps}
      ref={combinedRef}
      className={cn(styles.trigger, className)}
      onClick={(e: MouseEvent<HTMLElement>) => {
        userOnClick?.(e);
        handleClick(e);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
        userOnKeyDown?.(e);
        handleKeyDown(e);
      }}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isVisible}
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
      {...(disabled ? { 'aria-disabled': 'true' } : {})}
      data-testid="popover-trigger"
      data-position={adjustedPosition}
      data-disabled={disabled}
    >
      {children}
    </Tag>
  );
}

/**
 * React.memo не умеет generic-функции, поэтому оборачиваем через
 * промежуточный НЕ-generic каст (Paragraph/Heading precedent).
 */
const PopoverTriggerMemo = memo(
  PopoverTriggerImpl as unknown as (
    props: PopoverTriggerProps<'span'> & { ref?: ForwardedRef<HTMLElement> }
  ) => ReactElement
);

PopoverTriggerMemo.displayName = 'PopoverTrigger';

/**
 * PopoverTrigger — полиморфный триггер попавера.
 */
export const PopoverTrigger = PopoverTriggerMemo as unknown as PopoverTriggerComponent;
