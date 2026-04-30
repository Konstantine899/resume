import { LanguageSwitch } from '@/features/LanguageSwitch';
import { ThemeSwitch } from '@/features/ThemeSwitch';
import { useLanguage } from '@/shared/lib/i18n/hooks';
import { X } from 'lucide-react';
import React from 'react';
import type { NavItem as NavItemType } from '../../model/types';
import { NavItem } from '../NavItem';
import { SidebarHeader } from '../SidebarHeader';
import styles from './MobileMenu.module.scss';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItemType[];
  activeSection: string;
  onNavClick: (href: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  activeSection,
  onNavClick,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div className={styles.panel}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close menu"
          type="button"
          tabIndex={isOpen ? 0 : -1}
        >
          <X className={styles.closeIcon} />
        </button>

        {/* Header */}
        <SidebarHeader variant="mobile" isCollapsed={false} />

        {/* Navigation */}
        <nav className={styles.navigation} role="navigation" aria-label="Main navigation">
          {items.map((item, index) => (
            <NavItem
              key={`${item.href}-${index}`}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={activeSection === item.href}
              onClick={onNavClick}
              variant="mobile"
            />
          ))}
        </nav>

        <div className={styles.controls}>
          <ThemeSwitch variant="mobile" />
          <LanguageSwitch variant="mobile" />
          <p className={styles.footerText}>{t('footerTitle')}</p>
        </div>
      </div>
    </div>
  );
};
