import { Overlay } from '@/shared/ui/Overlay';
import { OVERLAY_CONSTANTS } from '@/shared/ui/Overlay/model/constants';
import { Portal } from '@/shared/ui/Portal';
import { Children, cloneElement, memo } from 'react';
import { useModalRoot } from '../../lib/hooks/useModalRoot';
import { ModalContext } from '../../lib/modalContext';
// eslint-disable-next-line react-refresh/only-export-components
export { resetOpenCount } from '../../lib/hooks/useModalRoot';
import type { ModalRootProps } from '../../model/types';
import styles from './ModalRoot.module.scss';

export const ModalRoot = memo((props: ModalRootProps) => {
  const { children, subtitle, scroll, asChild } = props;

  const {
    Tag,
    modalRef,
    titleId,
    subtitleId,
    effectiveIsOpen,
    effectiveOverlay,
    effectiveModal,
    dataState,
    modalClassName,
    handleOverlayPointerDown,
    isClosing,
    forceMount,
    isTop,
    overlayZIndex,
    modalZIndex,
    requestClose,
  } = useModalRoot(props);

  if (!effectiveIsOpen && !(isClosing && forceMount)) return null;

  const rootProps = {
    ref: modalRef as React.RefObject<HTMLDivElement>,
    className: modalClassName,
    role: 'dialog',
    'aria-modal': effectiveModal ? 'true' : 'false',
    'aria-labelledby': titleId,
    'aria-describedby': subtitle ? subtitleId : undefined,
    tabIndex: 0,
    'data-state': dataState,
    // Non-topmost layers are hidden from a11y tree + focus (M7).
    ...(isTop ? {} : { 'aria-hidden': 'true' as const, inert: true }),
    ...(scroll === 'body' ? { 'data-scroll-body': '' } : {}),
    ...(modalZIndex !== undefined ? { style: { zIndex: modalZIndex } } : {}),
  } as Record<string, unknown>;

  return (
    <Portal>
      {/* M1: titleId/subtitleId reach ModalHeader so aria-labelledby resolves;
          M2: requestClose reaches every dismissal control inside the dialog. */}
      <ModalContext.Provider value={{ titleId, subtitleId, requestClose }}>
        {effectiveOverlay && (
          <Overlay
            onPointerDown={handleOverlayPointerDown}
            blur={false}
            dark={true}
            className={styles.overlay}
            aria-hidden="true"
            zIndex={overlayZIndex ?? OVERLAY_CONSTANTS.DEFAULT_Z_INDEX}
          />
        )}

        <div className={styles.modalContainer} role="presentation">
          {asChild && children ? (
            cloneElement(Children.only(children) as React.ReactElement, rootProps)
          ) : (
            <Tag {...rootProps}>{children}</Tag>
          )}
        </div>
      </ModalContext.Provider>
    </Portal>
  );
});

ModalRoot.displayName = 'ModalRoot';
