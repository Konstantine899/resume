import { memo, forwardRef, useCallback, useId, useMemo } from 'react';
import type { ModalProps } from '../../model/types';
import { ModalRoot } from '../ModalRoot/ModalRoot';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { ModalContent } from '../ModalContent/ModalContent';
import { ModalFooter } from '../ModalFooter/ModalFooter';

// eslint-disable-next-line react-refresh/only-export-components
const ModalComponent = memo(
  forwardRef<HTMLElement, ModalProps>((props, ref) => {
    const {
      component,
      children,
      isOpen,
      onClose,
      title,
      subtitle,
      footer,
      size = 'md',
      scroll = 'paper',
      overlay = true,
      closeOnOverlayClick = true,
      closeOnEsc = true,
      blockScroll = true,
      className,
      showCloseButton = true,
      ariaLabel,
      disableAnimation,
      onOpened,
      onClosed,
      canClose = true,
      autoFocus,
      restoreFocus,
      trapFocus,
      onEscapeKeyDown,
      onPointerDownOutside,
      finalFocusRef,
      initialFocusRef,
      defaultOpen,
      forceMount,
      modal = true,
      closeIcon,
    } = props;

    const generatedTitleId = useId();
    const generatedSubtitleId = useId();

    // R2/R3-1/R4-1: the X button (and any close trigger) must honour canClose.
    const requestClose = useCallback(() => {
      const allowed = typeof canClose === 'function' ? canClose() : canClose;
      if (allowed) onClose();
    }, [canClose, onClose]);

    const rootProps = useMemo(
      () => ({
        component,
        isOpen,
        onClose: requestClose,
        size,
        scroll,
        overlay,
        closeOnOverlayClick,
        closeOnEsc,
        blockScroll,
        className,
        showCloseButton,
        disableAnimation,
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
        forceMount,
        modal,
        title,
        subtitle,
        ariaLabel,
        titleId: generatedTitleId,
        subtitleId: generatedSubtitleId,
      }),
      [
        component,
        isOpen,
        requestClose,
        size,
        scroll,
        overlay,
        closeOnOverlayClick,
        closeOnEsc,
        blockScroll,
        className,
        showCloseButton,
        disableAnimation,
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
        forceMount,
        modal,
        title,
        subtitle,
        ariaLabel,
        generatedTitleId,
        generatedSubtitleId,
      ]
    );

    const shouldRenderWrapper = title || footer || showCloseButton;

    return (
      <ModalRoot {...rootProps} ref={ref}>
        {shouldRenderWrapper && (
          <>
            {title && (
              <ModalHeader
                title={title}
                subtitle={subtitle}
                showCloseButton={showCloseButton}
                onClose={requestClose}
                titleId={generatedTitleId}
                subtitleId={generatedSubtitleId}
                closeIcon={closeIcon}
              />
            )}
            <ModalContent>{children}</ModalContent>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </>
        )}
        {!shouldRenderWrapper && children}
      </ModalRoot>
    );
  })
);

ModalComponent.displayName = 'Modal';

export const Modal = Object.assign(ModalComponent, {
  Root: ModalRoot,
  Header: ModalHeader,
  Content: ModalContent,
  Footer: ModalFooter,
});
