/* eslint-disable react-refresh/only-export-components */

import { memo, useMemo } from 'react';
import type { ModalProps, ModalRootProps } from '../../model/types';
import { ModalRoot } from '../ModalRoot/ModalRoot';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { ModalContent } from '../ModalContent/ModalContent';
import { ModalFooter } from '../ModalFooter/ModalFooter';
import { ModalCloseButton } from '../ModalCloseButton/ModalCloseButton';
import { Divider } from '@/shared/ui/Divider';

const ModalComponent = memo((props: ModalProps) => {
  const {
    children,
    component,
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
    initialFocusRef,
    closeIcon,
    defaultOpen,
    modal,
  } = props;

  const shouldRenderWrapper = title || footer || showCloseButton;

  const rootProps = useMemo(
    () => ({
      component,
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
      initialFocusRef,
      defaultOpen,
      modal,
    }),
    [
      component,
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
      initialFocusRef,
      defaultOpen,
      modal,
    ]
  );

  if (shouldRenderWrapper) {
    const renderHeader = Boolean(title || showCloseButton);
    return (
      <ModalRoot {...(rootProps as ModalRootProps)}>
        {renderHeader && (
          <>
            <ModalHeader
              title={title}
              subtitle={subtitle}
              showCloseButton={showCloseButton}
              onClose={onClose}
              closeIcon={closeIcon}
            />
            <Divider />
          </>
        )}
        <ModalContent>{children}</ModalContent>
        {footer && (
          <>
            <Divider />
            <ModalFooter>{footer}</ModalFooter>
          </>
        )}
      </ModalRoot>
    );
  }

  return <ModalRoot {...(rootProps as ModalRootProps)}>{children}</ModalRoot>;
});

ModalComponent.displayName = 'Modal';

export const Modal = Object.assign(ModalComponent, {
  Root: ModalRoot,
  Header: ModalHeader,
  Content: ModalContent,
  Footer: ModalFooter,
  CloseButton: ModalCloseButton,
});

// The Alert/Drawer/Form compound members are assembled in ./index.ts instead
// of here to avoid the circular import Modal <-> ModalAlert/ModalForm (those
// sub-components render <Modal> internally). Reading them eagerly at module-eval
// time throws a TDZ ReferenceError.
