import { X } from 'lucide-react';
import { memo, useId, useMemo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { classNames } from '@/shared/lib/utils/classNames';
import { ModalRoot } from '../ModalRoot/ModalRoot';
import { ModalHeader } from '../ModalHeader/ModalHeader';
import { ModalContent } from '../ModalContent/ModalContent';
import { MODAL_CONSTANTS } from '../../model/constants';
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

  const titleId = useId();
  const subtitleId = useId();

  const rootProps = useMemo(
    () => ({
      isOpen,
      onClose,
      size,
      className: classNames(styles.drawer, styles[placement], className),
      scroll: 'body' as const,
      overlay: false,
      blockScroll: false,
      title,
      titleId,
      subtitleId,
    }),
    [isOpen, onClose, size, className, placement, title, titleId, subtitleId]
  );

  return (
    <ModalRoot {...rootProps}>
      <ModalHeader
        title={title}
        onClose={onClose}
        titleId={titleId}
        subtitleId={subtitleId}
        closeIcon={
          <Icon name={X} size={MODAL_CONSTANTS.CLOSE_ICON_SIZE} color="inherit" decorative />
        }
      />
      <ModalContent>
        <div className={styles.content}>{children}</div>
      </ModalContent>
    </ModalRoot>
  );
});

ModalDrawer.displayName = 'ModalDrawer';
