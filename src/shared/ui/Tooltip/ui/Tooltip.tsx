import { cn } from '@/shared/lib/utils/classNames';
import { Portal } from '@/shared/ui/Portal';
import { useTooltip } from '../lib/useTooltip';
import type { TooltipProps } from '../model/types';
import styles from './Tooltip.module.scss';

/**
 * Tooltip компонент
 *
 * @example
 * ```tsx
 * <Tooltip content="Подсказка">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip = ({
  content,
  children,
  className,
  ariaLabel,
  disabled = false,
  ...props
}: TooltipProps) => {
  const {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    triggerRef,
    tooltipRef,
    handlers,
    shouldRender,
  } = useTooltip(props);

  // Если disabled, рендерим только children
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(styles.trigger, className)}
        onMouseEnter={handlers.handleMouseEnter}
        onMouseLeave={handlers.handleMouseLeave}
        onFocus={handlers.handleFocus}
        onBlur={handlers.handleBlur}
        onClick={handlers.handleClick}
        onKeyDown={handlers.handleKeyDown}
        tabIndex={props.trigger === 'click' || props.trigger === 'focus' ? 0 : undefined}
        aria-describedby={isVisible ? 'tooltip-content' : undefined}
        aria-label={ariaLabel}
        role={props.trigger === 'click' || props.trigger === 'focus' ? 'button' : undefined}
      >
        {children}
      </span>

      {shouldRender && (
        <Portal>
          <div
            ref={tooltipRef}
            id="tooltip-content"
            role="tooltip"
            className={cn(styles.tooltip, styles[adjustedPosition], styles.visible)}
            style={calculatedStyle}
            onMouseEnter={props.trigger === 'hover' ? handlers.handleMouseEnter : undefined}
            onMouseLeave={props.trigger === 'hover' ? handlers.handleMouseLeave : undefined}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
