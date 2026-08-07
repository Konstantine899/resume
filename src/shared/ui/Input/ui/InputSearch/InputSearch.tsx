import React from 'react';
import { Search } from 'lucide-react';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '../Input';
import type { InputSize, InputVariant } from '../../model/types';

export interface InputSearchProps {
  variant?: InputVariant;
  size?: InputSize;
  className?: string;
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  skeleton?: boolean;
  fullWidth?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

export const InputSearch = React.memo(
  React.forwardRef<HTMLInputElement, InputSearchProps>(
    ({ placeholder = 'Search...', ...props }, ref) => {
      return (
        <Input
          ref={ref}
          icon={<Icon name={Search} color="inherit" decorative />}
          clearable
          placeholder={placeholder}
          role="searchbox"
          {...props}
        />
      );
    }
  )
);

InputSearch.displayName = 'InputSearch';
