import React from 'react';
import type { NavItem as NavItemType } from '../../model/types';
import { NavItem } from '../NavItem';
import styles from './Navigation.module.scss';

export interface NavigationProps {
  items: NavItemType[];
  activeSection: string;
  isCollapsed: boolean;
  isHoverExpanded?: boolean;
  onNavClick: (href: string) => void;
  onKeyDown: (e: React.KeyboardEvent, index: number, total: number) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeSection,
  isCollapsed,
  isHoverExpanded = false,
  onNavClick,
  onKeyDown,
}) => {
  return (
    <nav className={styles.navigation} role="menubar" aria-label="Main navigation">
      {items.map((item, index) => (
        <NavItem
          key={`${item.href}-${index}`}
          icon={item.icon}
          label={item.label}
          href={item.href}
          isActive={activeSection === item.href}
          isCollapsed={isCollapsed}
          isHoverExpanded={isHoverExpanded}
          onClick={onNavClick}
          onKeyDown={(e) => onKeyDown(e, index, items.length)}
          variant="desktop"
        />
      ))}
    </nav>
  );
};
