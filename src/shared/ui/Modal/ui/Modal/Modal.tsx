// ============================================
// Modal Component (Compound Pattern)
// ============================================

import { memo, useMemo } from 'react';
import type { ModalProps } from '../../model/types';
import { ModalRoot } from '../ModalRoot/ModalRoot';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { ModalContent } from '../ModalContent/ModalContent';
import { ModalFooter } from '../ModalFooter/ModalFooter';
import { ModalCloseButton } from '../ModalCloseButton/ModalCloseButton';

/**
 * Modal Component — Compound Pattern для модальных окон
 *
 * @example
 * // Simple usage
 * ```tsx
 * <Modal isOpen={true} onClose={close} title="Title">
 *   Content here
 * </Modal>
 * ```
 *
 * @example
 * // Advanced usage with sub-components
 * ```tsx
 * <Modal isOpen={true} onClose={close}>
 *   <Modal.Header title="Title" subtitle="Subtitle" onClose={close} />
 *   <Modal.Content>
 *     <CustomContent />
 *   </Modal.Content>
 *   <Modal.Footer>
 *     <CustomButtons />
 *   </Modal.Footer>
 * </Modal>
 * ```
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
    scroll,
    overlay,
    closeOnOverlayClick,
    closeOnEsc,
    blockScroll,
    className,
    showCloseButton = true,
    disableAnimation,
    forceMount,
    onOpened,
    onClosed,
    canClose,
    autoFocus,
    restoreFocus,
    trapFocus,
    onEscapeKeyDown,
    onPointerDownOutside,
    finalFocusRef,
    defaultOpen,
    modal,
  } = props;

  // Simple API: автоматический рендеринг header/footer
  const shouldRenderWrapper = title || footer || showCloseButton;

  // Stable props reference для ModalRoot (memoized)
  const rootProps = useMemo(
    () => ({
      isOpen,
      onClose,
      size,
      scroll,
      overlay,
      closeOnOverlayClick,
      closeOnEsc,
      blockScroll,
      className,
      subtitle,
      disableAnimation,
      forceMount,
      onOpened,
      onClosed,
      canClose,
      autoFocus,
      restoreFocus,
      trapFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      finalFocusRef,
      defaultOpen,
      modal,
    }),
    [
      isOpen,
      onClose,
      size,
      scroll,
      overlay,
      closeOnOverlayClick,
      closeOnEsc,
      blockScroll,
      className,
      subtitle,
      disableAnimation,
      forceMount,
      onOpened,
      onClosed,
      canClose,
      autoFocus,
      restoreFocus,
      trapFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      finalFocusRef,
      defaultOpen,
      modal,
    ]
  );

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

  // Advanced API: children как есть (user предоставляет sub-components)
  return <ModalRoot {...rootProps}>{children}</ModalRoot>;
});

ModalComponent.displayName = 'Modal';

// Compound components pattern using Object.assign
// eslint-disable-next-line react-refresh/only-export-components
export const Modal = Object.assign(ModalComponent, {
  Root: ModalRoot,
  Header: ModalHeader,
  Content: ModalContent,
  Footer: ModalFooter,
  CloseButton: ModalCloseButton,
});

export default Modal;
