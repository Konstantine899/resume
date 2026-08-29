import { Children, cloneElement, forwardRef, memo, useCallback } from 'react';
import { mergeRefs } from '@/shared/lib/utils/mergeRefs';
import { Overlay } from '@/shared/ui/Overlay';
import { Portal } from '@/shared/ui/Portal';
import { useModalRoot } from '../../model/useModalRoot';
// eslint-disable-next-line react-refresh/only-export-components
export { resetOpenCount } from '../../model/useModalRoot';
import type { ModalRootProps } from '../../model/types';
import styles from './ModalRoot.module.scss';

type RootProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
  'data-state'?: string;
  'data-scroll-body'?: string;
};

export const ModalRoot = memo(
  forwardRef<HTMLElement, ModalRootProps>((props, ref) => {
    const { children, subtitle, scroll, asChild, title, ariaLabel } = props;

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
    } = useModalRoot(props as ModalRootProps);

    const handleOverlayClickForward = useCallback(
      (e: React.MouseEvent) => handleOverlayClick(e.nativeEvent),
      [handleOverlayClick]
    );

    if (!effectiveIsOpen && !(isClosing && forceMount)) return null;

    const mergedRef = mergeRefs(ref, modalRef);

    const rootProps: RootProps = {
      ref: mergedRef as React.Ref<HTMLElement>,
      className: modalClassName,
      role: 'dialog',
      'aria-modal': effectiveModal ? 'true' : 'false',
      // R1: name the dialog by its visible title; fall back to aria-label when no title.
      'aria-labelledby': title ? titleId : undefined,
      'aria-label': title ? undefined : (ariaLabel ?? 'Modal dialog'),
      'aria-describedby': title && subtitle ? subtitleId : undefined,
      tabIndex: 0,
      'data-state': dataState,
      ...(scroll === 'body' ? { 'data-scroll-body': '' } : {}),
    };

    return (
      <Portal>
        {effectiveOverlay && (
          <Overlay
            onClick={handleOverlayClickForward}
            blur={false}
            dark={true}
            className={styles.overlay}
            aria-hidden="true"
          />
        )}

        <div className={styles.modalContainer} role="presentation">
          {asChild && children ? (
            (() => {
              const child = Children.only(children) as React.ReactElement;
              const childRef = (child as { ref?: React.Ref<HTMLElement> }).ref ?? null;
              const childClassName = (child.props as { className?: string }).className;
              const mergedChildRef = mergeRefs(ref, childRef, modalRef);
              const mergedClassName = childClassName
                ? `${childClassName} ${modalClassName}`
                : modalClassName;
              return cloneElement(child, {
                ...rootProps,
                ref: mergedChildRef as React.Ref<HTMLElement>,
                className: mergedClassName,
              } as Partial<React.HTMLAttributes<HTMLElement>>);
            })()
          ) : (
            <Tag {...rootProps}>{children}</Tag>
          )}
        </div>
      </Portal>
    );
  })
);

ModalRoot.displayName = 'ModalRoot';
