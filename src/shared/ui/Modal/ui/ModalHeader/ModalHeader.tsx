// ============================================
// Modal Header Component
// ============================================

import { memo } from 'react';
import type { ModalHeaderProps } from '../../model/types';
import { ModalCloseButton } from '../ModalCloseButton';
import styles from '../../Modal.module.scss';

export const ModalHeader = memo((props: ModalHeaderProps) => {
  const { title, subtitle, showCloseButton = true, onClose, titleId, subtitleId } = props;

  return (
    <header className={styles.header}>
      {title && (
        <div className={styles.headerContent}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {subtitle && (
            <p id={subtitleId} className={styles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {showCloseButton && <ModalCloseButton onClose={onClose} />}
    </header>
  );
});

ModalHeader.displayName = 'ModalHeader';

export default ModalHeader;
