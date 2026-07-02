// ============================================
// Modal Footer Component
// ============================================

import { memo } from 'react';
import type { ModalFooterProps } from '../../model/types';
import styles from '../../Modal.module.scss';

export const ModalFooter = memo((props: ModalFooterProps) => {
  const { children, className = '' } = props;

  return <footer className={`${styles.footer} ${className}`}>{children}</footer>;
});

ModalFooter.displayName = 'ModalFooter';

export default ModalFooter;
