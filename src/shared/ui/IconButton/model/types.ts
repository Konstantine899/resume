import { ReactNode } from 'react';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface IconButtonProps {
  icon: ReactNode;
  children?: ReactNode;
  'aria-label': string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // <-- Изменение
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  rotation?: number;
  fullWidth?: boolean;
  [key: string]: any;
}
