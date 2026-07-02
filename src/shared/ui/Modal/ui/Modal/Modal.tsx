// ============================================
// Modal Component (Compound Pattern)
// ============================================

import { memo, useMemo } from 'react';
import type { ModalProps } from '../../model/types';
import { ModalRoot } from '../ModalRoot';
import { ModalHeader } from '../ModalHeader';
import { ModalContent } from '../ModalContent';
import { ModalFooter } from '../ModalFooter';
import { ModalCloseButton } from '../ModalCloseButton';

/**
 * Modal Component — Compound Pattern
 *
 * @example
 * // Simple usage
 * <Modal isOpen={true} onClose={close} title="Title">
 *   Content here
 * </Modal>
 *
 * @example
 * // Advanced usage with sub-components
 * <Modal isOpen={true} onClose={close}>
 *   <Modal.Header title="Title" subtitle="Subtitle" onClose={close} />
 *   <Modal.Content>
 *     <CustomContent />
 *   </Modal.Content>
 *   <Modal.Footer>
 *     <CustomButtons />
 *   </Modal.Footer>
 * </Modal>
 */
const ModalComponent = memo((props: ModalProps) => {
  const {
    children,
    isOpen,
    onClose,
    title,
    subtitle,
    footer,
    size,
    overlay,
    closeOnOverlayClick,
    closeOnEsc,
    blockScroll,
    className,
    showCloseButton = true,
    ariaLabel,
    disableAnimation,
    onOpened,
    onClosed,
    canClose,
    autoFocus,
    restoreFocus,
    trapFocus,
  } = props;

  // Simple API: automatic header/footer rendering
  const shouldRenderWrapper = title || footer || showCloseButton;

  const rootProps = useMemo(
    () => ({
      isOpen,
      onClose,
      size,
      overlay,
      closeOnOverlayClick,
      closeOnEsc,
      blockScroll,
      className,
      ariaLabel,
      disableAnimation,
      onOpened,
      onClosed,
      canClose,
      autoFocus,
      restoreFocus,
      trapFocus,
    }),
    [
      isOpen,
      onClose,
      size,
      overlay,
      closeOnOverlayClick,
      closeOnEsc,
      blockScroll,
      className,
      ariaLabel,
      disableAnimation,
      onOpened,
      onClosed,
      canClose,
      autoFocus,
      restoreFocus,
      trapFocus,
    ]
  );

  if (!isOpen) return null;

  if (shouldRenderWrapper) {
    return (
      <ModalRoot {...rootProps}>
        {(title || showCloseButton) && (
          <ModalHeader
            title={title}
            subtitle={subtitle}
            showCloseButton={showCloseButton}
            onClose={onClose}
          />
        )}
        <ModalContent>{children}</ModalContent>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalRoot>
    );
  }

  // Advanced API: children as is (user provides sub-components)
  return <ModalRoot {...rootProps}>{children}</ModalRoot>;
});

ModalComponent.displayName = 'Modal';

// Compound components pattern using Object.assign
export const Modal = Object.assign(ModalComponent, {
  Root: ModalRoot,
  Header: ModalHeader,
  Content: ModalContent,
  Footer: ModalFooter,
  CloseButton: ModalCloseButton,
});

export default Modal;
