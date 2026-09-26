// ============================================
// Modal Header Component
// ============================================

import { memo, useContext } from 'react';
import { classNames } from '@/shared/lib/utils';
import type { ModalHeaderProps } from '../../model/types';
import { Heading } from '@/shared/ui/Heading';
import { ModalCloseButton } from '../ModalCloseButton/ModalCloseButton';
import { Paragraph } from '@/shared/ui/Paragraph';
import { ModalContext } from '../../lib/modalContext';
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

  // Non-throwing context read: the header also works standalone (Storybook,
  // tests). Inside <Modal.Root> the ids fall back to the root's useId values,
  // so the dialog's aria-labelledby/aria-describedby actually resolve (M1).
  const ctx = useContext(ModalContext);
  const resolvedTitleId = titleId ?? ctx?.titleId;
  const resolvedSubtitleId = subtitleId ?? ctx?.subtitleId;

  const headerClasses = classNames(styles.header ?? '', {
    [styles.headerWithoutTitle ?? '']: !title && showCloseButton,
  });

  return (
    <header className={headerClasses}>
      {title && (
        <div className={styles.headerContent ?? ''}>
          <Heading level={2} size="xl" id={resolvedTitleId}>
            {title}
          </Heading>
          {subtitle && (
            <Paragraph size="s" theme="muted" id={resolvedSubtitleId}>
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
