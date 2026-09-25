import { memo, useContext } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Modal } from '../Modal/Modal';
import type { ModalAlertProps } from '../../model/types';
import { ModalContext } from '../../lib/modalContext';
import styles from './ModalAlert.module.scss';

export const ModalAlert = memo((props: ModalAlertProps) => {
  const {
    isOpen,
    onClose,
    title,
    message,
    confirmLabel = 'OK',
    cancelLabel,
    onConfirm,
    onCancel,
    variant = 'alert',
    icon,
    className = '',
  } = props;

  // Dismiss via the gated requestClose when a modal context is available (M2);
  // fall back to the onClose prop otherwise (standalone usage).
  const ctx = useContext(ModalContext);
  const requestClose = ctx?.requestClose ?? onClose;

  const handleConfirm = () => {
    onConfirm?.();
    requestClose();
  };

  const handleCancel = () => {
    onCancel?.();
    requestClose();
  };

  const hasCancel = Boolean(cancelLabel);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      showCloseButton={false}
      size="sm"
      className={classNames(styles.alert, styles[variant], className)}
    >
      <div className={styles.body}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
      </div>
      <div className={styles.actions}>
        {hasCancel && (
          <Button variant="secondary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button variant={variant === 'destructive' ? 'danger' : 'primary'} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
});

ModalAlert.displayName = 'ModalAlert';
