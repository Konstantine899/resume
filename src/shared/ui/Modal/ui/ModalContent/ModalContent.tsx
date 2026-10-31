// ============================================
// Modal Content Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils';
import type { ModalContentProps } from '../../model/types';
import styles from './ModalContent.module.scss';

/**
 * ModalContent — контент модального окна
 *
 * @example
 * ```tsx
 * <Modal.Content>
 *   <p>Some content here</p>
 * </Modal.Content>
 * ```
 */
export const ModalContent = memo((props: ModalContentProps) => {
  const { children, className = '' } = props;

  const contentClasses = classNames(styles.content, className);

  // `data-slot` is the semantic hook used by keyboard and scroll tests;
  // it does not add layout or accessibility behavior on its own.
  return (
    <div data-slot="content" className={contentClasses}>
      {children}
    </div>
  );
});

ModalContent.displayName = 'ModalContent';
