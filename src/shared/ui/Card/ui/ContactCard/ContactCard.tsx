import React from 'react';
import styles from './ContactCard.module.scss';

export interface ContactCardProps {
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  title,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={`${styles.contactCard} ${className}`}>
      <div className={styles.centeredContent}>
        {icon && <div className={styles.iconWrapper}>{icon}</div>}
        {title && <h3 className={styles.title}>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

ContactCard.displayName = 'ContactCard';
