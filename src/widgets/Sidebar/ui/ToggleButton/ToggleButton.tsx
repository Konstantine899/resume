import { ChevronRight } from 'lucide-react';
import React from 'react';
import styles from './ToggleButton.module.scss';

export interface ToggleButtonProps {
  isCollapsed: boolean;
  isHoverExpanded?: boolean;
  onToggle: () => void;
  t?: (key: string) => string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  isCollapsed,
  isHoverExpanded = false,
  onToggle,
  t = (key: string) => key,
}) => {
  const isExpanded = isCollapsed ? false : isHoverExpanded;
  const isRotated = isExpanded;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
    if (e.key === 'Escape' && isExpanded) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={styles.toggleButton}
      aria-expanded={isExpanded}
      aria-label={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
      type="button"
    >
      <ChevronRight
        className={`${styles.expandIcon} ${isRotated ? styles.rotated : ''}`}
        aria-hidden="true"
      />
    </button>
  );
};
