import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import { cloneElement, isValidElement, memo } from 'react';
import { useModalRoot } from '../../model/useModalRoot';
// eslint-disable-next-line react-refresh/only-export-components
export { resetOpenCount } from '../../model/useModalRoot';
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
    handleOverlayClick,
    isClosing,
    forceMount,
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
    ...(scroll === 'body' ? { 'data-scroll-body': '' } : {}),
  } as Record<string, unknown>;

  return (
    <Portal>
      {effectiveOverlay && (
        <Overlay
          onClick={handleOverlayClick}
          blur={false}
          dark={true}
          className={styles.overlay}
          aria-hidden="true"
        />
      )}

      <div className={styles.modalContainer} role="presentation">
        {asChild && isValidElement(children) ? (
          cloneElement(children, rootProps)
        ) : (
          <Tag {...rootProps}>{children}</Tag>
        )}
      </div>
    </Portal>
  );
});

ModalRoot.displayName = 'ModalRoot';
