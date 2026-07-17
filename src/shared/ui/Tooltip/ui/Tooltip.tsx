import { cn } from '@/shared/lib/utils/classNames';
import { useMergeRefs } from '@/shared/lib/utils/mergeRefs';
import { Portal } from '@/shared/ui/Portal';
import { forwardRef, memo } from 'react';
import { useTooltip } from '../lib/useTooltip';
import type { TooltipProps } from '../model/types';
import styles from './Tooltip.module.scss';

/**
 * Tooltip — всплывающая подсказка для предоставления дополнительной информации
 * при наведении, фокусе или клике.
 *
 * @example
 * ```tsx
 * <Tooltip content="Подсказка" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip = memo(
  forwardRef<HTMLSpanElement, TooltipProps>(
    ({ content, children, className, ariaLabel, ...props }, ref) => {
      const {
        isVisible,
        calculatedStyle,
        adjustedPosition,
        triggerRef,
        tooltipRef,
        handlers,
        shouldRender,
        tooltipId,
      } = useTooltip(props);

      const triggerRefCallback = useMergeRefs(ref, triggerRef);

      return (
        <>
          <span
            ref={triggerRefCallback}
            className={cn(styles.trigger, className)}
            onMouseEnter={handlers.handleMouseEnter}
            onMouseLeave={handlers.handleMouseLeave}
            onFocus={handlers.handleFocus}
            onBlur={handlers.handleBlur}
            onClick={handlers.handleClick}
            onKeyDown={handlers.handleKeyDown}
            tabIndex={props.trigger === 'click' || props.trigger === 'focus' ? 0 : undefined}
            aria-describedby={isVisible ? tooltipId : undefined}
            aria-label={ariaLabel}
            role={props.trigger === 'click' || props.trigger === 'focus' ? 'button' : undefined}
            data-tooltip-visible={isVisible}
            data-tooltip-position={adjustedPosition}
            data-tooltip-trigger={props.trigger || 'hover'}
            data-tooltip-disabled={Boolean(props.disabled)}
            {...(props.skeleton ? { 'data-skeleton': 'true' } : {})}
          >
            {children}
          </span>

          {shouldRender && (
            <Portal>
              <div
                ref={tooltipRef}
                id={tooltipId}
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
    }
  )
);

Tooltip.displayName = 'Tooltip';
