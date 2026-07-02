// ============================================
// Modal Close Button Component
// ============================================

import { X } from 'lucide-react';
import { memo, useCallback } from 'react';
import type { ModalCloseButtonProps } from '../../model/types';
import styles from '../../Modal.module.scss';

export const ModalCloseButton = memo((props: ModalCloseButtonProps) => {
  const { onClose, ariaLabel = 'Закрыть модальное окно' } = props;

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
      <X size={20} />
    </button>
  );
});

ModalCloseButton.displayName = 'ModalCloseButton';

export default ModalCloseButton;
