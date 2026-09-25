import { memo, useContext } from 'react';
import type { ModalFormProps } from '../../model/types';
import { Button } from '@/shared/ui/Button';
import { Modal } from '../Modal/Modal';
import { ModalContext } from '../../lib/modalContext';

export const ModalForm = memo((props: ModalFormProps) => {
  const {
    isOpen,
    onClose,
    title,
    children,
    size,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    loading = false,
    onSubmit,
    onCancel,
    disableSubmit = false,
    className,
  } = props;

  // Close through the gated requestClose when a modal context is available
  // (M2). Replaces the old `handleCancel = onCancel ?? onClose` alias, which
  // skipped onClose entirely when onCancel was set — the form never closed.
  const ctx = useContext(ModalContext);
  const requestClose = ctx?.requestClose ?? onClose;

  const handleCancel = () => {
    onCancel?.();
    requestClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      className={className}
      footer={
        <>
          <Button variant="secondary" onClick={handleCancel} disabled={loading} type="button">
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            loading={loading}
            disabled={disableSubmit}
            type="submit"
            form="modal-form"
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="modal-form" onSubmit={onSubmit}>
        {children}
      </form>
    </Modal>
  );
});

ModalForm.displayName = 'ModalForm';
