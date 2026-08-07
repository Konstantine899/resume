// ============================================
// Modal Close Button Component
// ============================================

import { X } from 'lucide-react';
import { memo, useCallback } from 'react';
import { Icon } from '@/shared/ui/Icon';
import type { ModalCloseButtonProps } from '../../model/types';
import { MODAL_CONSTANTS } from '../../model/constants';
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

  const handleClick = useCallback(() => {
    onClose();
  }, [onClose]);

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
