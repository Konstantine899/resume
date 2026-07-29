// ============================================
// ContactCard Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import type { ContactCardProps } from '../../model/types';
import styles from './ContactCard.module.scss';

/**
 * ContactCard Component — контактная карточка для секции контактов
 *
 * @example
 * // Basic usage
 * ```tsx
 * <ContactCard title="Контакты" icon={<Mail size={40} />}>
 *   <p>Я всегда открыт для обсуждения новых проектов</p>
 * </ContactCard>
 * ```
 *
 * @example
 * // Minimal usage
 * ```tsx
 * <ContactCard title="Email" icon={<Mail />}>
 *   email@example.com
 * </ContactCard>
 * ```
 */
const ContactCardComponent: React.FC<ContactCardProps> = ({
  title,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={classNames(styles.contactCard, className)}>
      <div className={styles.centeredContent}>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
        {title && <h3 className={styles.title}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

ContactCardComponent.displayName = 'ContactCard';

export const ContactCard = memo(ContactCardComponent);
ContactCard.displayName = 'ContactCard';

export default ContactCard;
