import { X } from 'lucide-react';
import { memo, useMemo } from 'react';
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
    }),
    [isOpen, onClose, size, className, placement]
  );

  return (
    <ModalRoot {...rootProps}>
      <ModalHeader title={title} onClose={onClose} closeIcon={<X size={20} />} />
      <ModalContent>
        <div className={styles.content}>{children}</div>
      </ModalContent>
    </ModalRoot>
  );
});

ModalDrawer.displayName = 'ModalDrawer';
