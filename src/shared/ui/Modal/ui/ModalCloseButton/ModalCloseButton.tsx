// ============================================
// Modal Close Button Component
// ============================================

import { X } from 'lucide-react';
import { memo, useCallback, useContext } from 'react';
import { Icon } from '@/shared/ui/Icon';
import type { ModalCloseButtonProps } from '../../model/types';
import { MODAL_CONSTANTS } from '../../model/constants';
import { ModalContext } from '../../lib/modalContext';
import styles from './ModalCloseButton.module.scss';

/**
 * ModalCloseButton — кнопка закрытия модального окна
 *
 * @example
 * ```tsx
 * <ModalCloseButton onClose={handleClose} />
 * <ModalCloseButton onClose={handleClose} ariaLabel="Close dialog" />
 * ```
 */
export const ModalCloseButton = memo((props: ModalCloseButtonProps) => {
  const { onClose, ariaLabel = 'Close modal', closeIcon } = props;

  // Inside <Modal.Root> close through the gated requestClose (M2: the X button
  // respects canClose like Escape/overlay). Outside a modal fall back to the
  // onClose prop so the standalone API keeps working.
  const ctx = useContext(ModalContext);
  const close = ctx?.requestClose ?? onClose;

  const handleClick = useCallback(() => {
    close?.();
  }, [close]);

  return (
    <button
      type="button"
      className={styles.closeButton}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      {closeIcon ?? (
        <Icon name={X} size={MODAL_CONSTANTS.CLOSE_ICON_SIZE} color="inherit" decorative />
      )}
    </button>
  );
});

ModalCloseButton.displayName = 'ModalCloseButton';
