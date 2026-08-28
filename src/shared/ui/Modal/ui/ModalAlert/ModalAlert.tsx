import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { Button } from '@/shared/ui/Button';
import { Modal } from '../Modal/Modal';
import type { ModalAlertProps } from '../../model/types';
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

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
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
