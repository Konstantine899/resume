import { memo, useId } from 'react';
import type { ModalFormProps } from '../../model/types';
import { Button } from '@/shared/ui/Button';
import { Modal } from '../Modal/Modal';

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

  const handleCancel = onCancel ?? onClose;
  const formId = useId();

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
            form={formId}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit}>
        {children}
      </form>
    </Modal>
  );
});

ModalForm.displayName = 'ModalForm';
