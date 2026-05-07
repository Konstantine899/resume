import { cn } from '@/shared/lib/utils';
import { Portal } from '@/shared/ui/Portal';
import { usePopover } from '../lib/hooks/usePopover';
import { POPOVER_CONSTANTS, POPOVER_SIZES } from '../model/constants';
import type { PopoverProps } from '../model/types';
import styles from './Popover.module.scss';

export const Popover: React.FC<PopoverProps> = ({
  content,
  position = POPOVER_CONSTANTS.DEFAULT_POSITION,
  size = POPOVER_CONSTANTS.DEFAULT_SIZE,
  children,
  className,
  disabled = false,
  closeOnContentClick = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  offset = POPOVER_CONSTANTS.DEFAULT_OFFSET,
  autoAdjust = true,
  title,
  ariaLabel,
}) => {
  const {
    isVisible,
    calculatedStyle,
    adjustedPosition,
    triggerRef,
    popoverRef,
    handlers,
    shouldRender,
  } = usePopover({
    position,
    offset,
    autoAdjust,
    disabled,
    closeOnContentClick,
    closeOnClickOutside,
    closeOnEsc,
  });

  const popoverSize = POPOVER_SIZES[size];

  return (
    <>
      {/* Trigger */}
      <span
        ref={triggerRef}
        className={styles.trigger}
        onClick={handlers.handleClick}
        onKeyDown={handlers.handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isVisible}
        aria-label={ariaLabel}
        data-testid="popover-trigger"
      >
        {children}
      </span>

      {/* Popover */}
      {shouldRender && (
        <Portal>
          <div
            ref={popoverRef}
            className={cn(
              styles.popover,
              styles[adjustedPosition],
              styles[size],
              isVisible && styles.visible,
              className
            )}
            style={{
              ...calculatedStyle,
              width: popoverSize === 'auto' ? undefined : `${popoverSize}px`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlers.handleContentClick();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            data-testid="popover-content"
            data-position={adjustedPosition}
          >
            {title && <div className={styles.title}>{title}</div>}
            <div className={styles.content}>{content}</div>
          </div>
        </Portal>
      )}
    </>
  );
};
