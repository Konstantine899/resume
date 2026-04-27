import { Button } from '@/shared/ui/Button';
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

  return (
    <Button
      icon={<ChevronRight />}
      aria-label={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
      onClick={handleClick}
      rotation={isRotated ? 180 : 0}
      size="md"
      variant="ghost"
      className={styles.toggleButton}
      fullWidth
    />
  );
};
