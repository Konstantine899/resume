import { IconButton } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
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

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <IconButton
      icon={<Icon name={ChevronRight} size={20} color="inherit" decorative />}
      ariaLabel={isExpanded ? t('collapseSidebar') : t('expandSidebar')}
      onClick={handleClick}
      size="md"
      variant="ghost"
      className={styles.toggleButton}
      fullWidth
    />
  );
};
