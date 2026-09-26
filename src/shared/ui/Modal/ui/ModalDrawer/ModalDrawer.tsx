import { X } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { classNames } from '@/shared/lib/utils/classNames';
import { ModalRoot } from '../ModalRoot/ModalRoot';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { ModalContent } from '../ModalContent/ModalContent';
import type { ModalDrawerProps } from '../../model/types';
import styles from './ModalDrawer.module.scss';

export const ModalDrawer = memo((props: ModalDrawerProps) => {
  const {
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    placement = 'right',
    className = '',
  } = props;

  const rootProps = useMemo(
    () => ({
      isOpen,
      onClose,
      size,
      className: classNames(styles.drawer, styles[placement], className),
      scroll: 'body' as const,
      overlay: false,
      blockScroll: false,
      // M11: a drawer is a non-modal side panel — forcing modal: false keeps
      // aria-modal="false" and skips the focus trap; not configurable on purpose
      // (a toggle would contradict drawer semantics).
      modal: false as const,
    }),
    [isOpen, onClose, size, className, placement]
  );

  return (
    <ModalRoot {...rootProps}>
      <ModalHeader
        title={title}
        onClose={onClose}
        closeIcon={<Icon name={X} size={20} color="inherit" decorative />}
      />
      <ModalContent>
        <div className={styles.content}>{children}</div>
      </ModalContent>
    </ModalRoot>
  );
});

ModalDrawer.displayName = 'ModalDrawer';
