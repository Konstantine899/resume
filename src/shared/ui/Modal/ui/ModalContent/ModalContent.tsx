// ============================================
// Modal Content Component
// ============================================

import { memo } from 'react';
import type { ModalContentProps } from '../../model/types';
import styles from '../../Modal.module.scss';

export const ModalContent = memo((props: ModalContentProps) => {
  const { children, className = '' } = props;

  return <div className={`${styles.content} ${className}`}>{children}</div>;
});

ModalContent.displayName = 'ModalContent';

export default ModalContent;
