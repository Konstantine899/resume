import { cn } from '@/shared/lib/utils/classNames';
import { memo } from 'react';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Portal } from '@/shared/ui/Portal';
import { usePopoverContext } from '../../lib/context/PopoverContext';
import { POPOVER_SIZES } from '../../model/constants';
import type { PopoverContentComponent, PopoverContentProps } from '../../model/types';
import styles from '../Popover.module.scss';

/**
 * PopoverContent — попап в Portal вне иерархии.
 *
 * Потребляет состояние из PopoverProvider:
 * - `shouldRender` решает, рендерить ли попап (видим и не отключён)
 * - `calculatedStyle` — вычисленная позиция (top/left)
 * - `adjustedPosition` — класс позиции (top/bottom/left/right/center)
 * - `popoverRef` — ref для позиционирования
 *
 * `overlayStyle` кастомизирует внешний вид, но никогда не перезаписывает
 * вычисленные позиционные ключи (top/left) — защита от случайной
 * поломки позиционирования.
 *
 * @example
 * ```tsx
 * <Popover.Content overlayClassName="custom" overlayStyle={{ color: 'red' }}>
 *   Контент
 * </Popover.Content>
 * ```
 */
const PopoverContentImpl = memo((props: PopoverContentProps) => {
  const { children, overlayClassName, overlayStyle, className, position, size, title, ariaLabel } =
    props;

  const { calculatedStyle, adjustedPosition, shouldRender, popoverRef, handlers } =
    usePopoverContext();

  if (!shouldRender) return null;

  // Защита позиционных ключей: overlayStyle не должен перезаписывать
  // top/left, вычисленные usePopover (иначе можно сломать позиционирование).
  const overlayRest = (() => {
    if (!overlayStyle) return undefined;
    return Object.fromEntries(
      Object.entries(overlayStyle).filter(([key]) => key !== 'top' && key !== 'left')
    );
  })();

  const popoverSize = POPOVER_SIZES[size ?? 'md'];
  const resolvedPosition = position ?? adjustedPosition;

  return (
    <Portal>
      <div
        ref={popoverRef}
        className={cn(
          styles.popover,
          styles[resolvedPosition],
          styles[size ?? 'md'],
          shouldRender && styles.visible,
          overlayClassName,
          className
        )}
        style={{
          ...calculatedStyle,
          ...overlayRest,
          width: popoverSize === 'auto' ? undefined : `${popoverSize}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          handlers.handleContentClick();
        }}
        // aria-modal="true" — СОЗНАТЕЛЬНО сохранённый контракт (тесты Popover.test
        // требуют его). Фокус не трапится внутри — управление фокусом
        // (initial focus + Tab-cycle) вынесено отдельной задачей; при
        // использовании с реальным потребителем следить за a11y-рассинхроном.
        role="dialog"
        aria-modal="true"
        {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
        data-testid="popover-content"
        data-position={resolvedPosition}
      >
        {title && (
          <Paragraph weight="semibold" className={styles.title}>
            {title}
          </Paragraph>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </Portal>
  );
});

PopoverContentImpl.displayName = 'PopoverContent';

/**
 * PopoverContent — попап в Portal.
 */
export const PopoverContent = PopoverContentImpl as unknown as PopoverContentComponent;
