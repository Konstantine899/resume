// ============================================
// Modal Header Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils';
import type { ModalHeaderProps } from '../../model/types';
import { Heading } from '@/shared/ui/Heading';
import { ModalCloseButton } from '../ModalCloseButton/ModalCloseButton';
import { Paragraph } from '@/shared/ui/Paragraph';
import styles from './ModalHeader.module.scss';

/**
 * ModalHeader — заголовок модального окна (title + subtitle + close button)
 *
 * @example
 * ```tsx
 * <Modal.Header
 *   title="Settings"
 *   subtitle="Manage your account settings"
 *   onClose={handleClose}
 * />
 * ```
 */
export const ModalHeader = memo((props: ModalHeaderProps) => {
  const {
    title,
    subtitle,
    showCloseButton = true,
    onClose,
    titleId,
    subtitleId,
    closeIcon,
  } = props;

  const headerClasses = classNames(styles.header, {
    [styles.headerWithoutTitle ?? '']: !title && showCloseButton,
  });

  return (
    <header className={headerClasses}>
      {title && (
        <div className={styles.headerContent}>
          <Heading level={2} size="xl" id={titleId}>
            {title}
          </Heading>
          {subtitle && (
            <Paragraph size="s" theme="muted" id={subtitleId}>
              {subtitle}
            </Paragraph>
          )}
        </div>
      )}

      {showCloseButton && <ModalCloseButton onClose={onClose} closeIcon={closeIcon} />}
    </header>
  );
});

ModalHeader.displayName = 'ModalHeader';
