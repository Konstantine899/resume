// ============================================
// ContactCard Component
// ============================================

import { memo } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { CardTitle } from '../CardTitle';
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
  titleLevel,
  className = '',
  fullWidth,
  style,
}) => {
  return (
    <div
      className={classNames(styles.contactCard, fullWidth && styles.fullWidth, className)}
      style={style}
    >
      <div className={styles.centeredContent}>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
        {title && (
          <CardTitle as={titleLevel} className={styles.title}>
            {title}
          </CardTitle>
        )}
        {children}
      </div>
    </div>
  );
};

ContactCardComponent.displayName = 'ContactCard';

export const ContactCard = memo(ContactCardComponent);
ContactCard.displayName = 'ContactCard';
