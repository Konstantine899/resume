// ============================================
// Modal Close Button Component
// ============================================

import { X } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '@/shared/lib/i18n/config/i18n';
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
 * <ModalCloseButton onClose={handleClose} ariaLabel="Custom label" />
 * ```
 */
export const ModalCloseButton = memo((props: ModalCloseButtonProps) => {
  const { t } = useTranslation();
  const { onClose, ariaLabel, closeIcon } = props;

  const handleClick = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <button
      type="button"
      className={styles.closeButton}
      onClick={handleClick}
      aria-label={ariaLabel ?? t('modal.close')}
    >
      {closeIcon ?? (
        <Icon name={X} size={MODAL_CONSTANTS.CLOSE_ICON_SIZE} color="inherit" decorative />
      )}
    </button>
  );
});

ModalCloseButton.displayName = 'ModalCloseButton';
