import React from 'react';
import { Search } from 'lucide-react';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '../Input';
import type { InputProps } from '../../model/types';

export type InputSearchProps = InputProps;

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
