import React from 'react';
import { Search } from 'lucide-react';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '../Input';
import type { InputOwnProps } from '../../model/types';

/**
 * InputSearch props: the full Input contract plus the native attributes
 * a search field needs on top of `InputOwnProps`.
 */
export type InputSearchProps = InputOwnProps & {
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
};

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
