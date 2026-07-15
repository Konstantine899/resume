import { memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Portal } from '@/shared/ui/Portal';
import { usePopover } from '../lib/hooks/usePopover';
import { POPOVER_CONSTANTS, POPOVER_SIZES, VALID_POSITIONS, VALID_SIZES } from '../model/constants';
import type { PopoverProps } from '../model/types';
import styles from './Popover.module.scss';

/**
 * Popover component for displaying contextual content
 *
 * Features:
 * - 5 positions (top, bottom, left, right, center)
 * - 4 sizes (sm, md, lg, auto)
 * - Auto-adjust position when viewport is too small
 * - Close on click outside / ESC / content click
 * - Keyboard navigation (Enter, Space, Escape)
 * - Full accessibility support (ARIA attributes)
 *
 * @example
 * ```tsx
 * <Popover content="Информация о пользователе">
 *   <button>Профиль</button>
 * </Popover>
 * ```
 *
 * @example
 * ```tsx
 * <Popover
 *   title="Настройки"
 *   content={<SettingsMenu />}
 *   position="bottom"
 *   size="lg"
 *   closeOnContentClick={false}
 * >
 *   <SettingsIcon />
 * </Popover>
 * ```
 */
export const Popover = memo(
  ({
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
  }: PopoverProps) => {
    // Валидация position
    if (process.env.NODE_ENV === 'development' && !VALID_POSITIONS.includes(position)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Popover: невалидная позиция "${position}". Доступные: ${VALID_POSITIONS.join(', ')}`
      );
    }

    // Валидация size
    if (process.env.NODE_ENV === 'development' && !VALID_SIZES.includes(size)) {
      // eslint-disable-next-line no-console
      console.warn(`Popover: невалидный размер "${size}". Доступные: ${VALID_SIZES.join(', ')}`);
    }

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
  }
);

Popover.displayName = 'Popover';
