/* eslint-disable react-refresh/only-export-components */

import { memo, useMemo } from 'react';
import type { ModalProps, ModalRootProps } from '../../model/types';
import { ModalRoot } from '../ModalRoot/ModalRoot';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { ModalContent } from '../ModalContent/ModalContent';
import { ModalFooter } from '../ModalFooter/ModalFooter';
import { ModalCloseButton } from '../ModalCloseButton/ModalCloseButton';
import { ModalAlert } from '../ModalAlert/ModalAlert';
import { ModalDrawer } from '../ModalDrawer/ModalDrawer';
import { ModalForm } from '../ModalForm/ModalForm';

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
    return (
      <ModalRoot {...(rootProps as ModalRootProps)}>
        {(title || showCloseButton) && (
          <ModalHeader
            title={title}
            subtitle={subtitle}
            showCloseButton={showCloseButton}
            onClose={onClose}
            closeIcon={closeIcon}
          />
        )}
        <ModalContent>{children}</ModalContent>
        {footer && <ModalFooter>{footer}</ModalFooter>}
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
  Alert: ModalAlert,
  Drawer: ModalDrawer,
  Form: ModalForm,
});
