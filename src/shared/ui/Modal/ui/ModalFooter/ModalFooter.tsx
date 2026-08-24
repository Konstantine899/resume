// ============================================
// Modal Footer Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils';
import type { ModalFooterProps } from '../../model/types';
import styles from './ModalFooter.module.scss';

/**
 * ModalFooter — футер модального окна (кнопки действий)
 *
 * @example
 * ```tsx
 * <Modal.Footer>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="primary">Save</Button>
 * </Modal.Footer>
 * ```
 */
export const ModalFooter = memo((props: ModalFooterProps) => {
  const { children, className = '' } = props;

  const footerClasses = classNames(styles.footer, className);

  return <footer className={footerClasses}>{children}</footer>;
});

ModalFooter.displayName = 'ModalFooter';
