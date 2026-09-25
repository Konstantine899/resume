import { memo, useContext, useId } from 'react';
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
    onSubmitError,
    onCancel,
    disableSubmit = false,
    className,
  } = props;

  // M3: unique form id per instance — the old static "modal-form" collided
  // across multiple mounted forms, so the submit button's `form` attribute
  // could point at the WRONG <form>.
  const formId = useId();

  // Close through the gated requestClose when a modal context is available
  // (M2). Replaces the old `handleCancel = onCancel ?? onClose` alias, which
  // skipped onClose entirely when onCancel was set — the form never closed.
  const ctx = useContext(ModalContext);
  const requestClose = ctx?.requestClose ?? onClose;

  const handleCancel = () => {
    onCancel?.();
    requestClose();
  };

  // N7: async onSubmit can REJECT — forward the rejection to onSubmitError so
  // callers can surface it (toast/inline) instead of an unhandled rejection.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const result = onSubmit(event);
    if (result instanceof Promise) {
      void result.catch(onSubmitError ?? (() => undefined));
    }
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
            form={formId}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
});

ModalForm.displayName = 'ModalForm';
