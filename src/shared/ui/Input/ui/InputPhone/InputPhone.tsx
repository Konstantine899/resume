// ============================================
// InputPhone Component
// ============================================

import React from 'react';
import { Input } from '../Input';
import type { InputSize, InputVariant } from '../../model/types';
import { Phone } from 'lucide-react';

export interface InputPhoneProps {
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
  autoComplete?: string;
}

/**
 * InputPhone — специализированный input для телефонных номеров.
 *
 * @description
 * Рендерится как `<input type="tel">` с autocomplete="tel" и иконкой телефона.
 *
 * @example
 * ```tsx
 * <InputPhone label="Phone" placeholder="+1 (555) 000-0000" />
 * <InputPhone label="Phone" required error="Invalid phone number" />
 * ```
 */
export const InputPhone = React.memo(
  React.forwardRef<HTMLInputElement, InputPhoneProps>(
    ({ placeholder = '+1 (555) 000-0000', autoComplete = 'tel', ...props }, ref) => {
      return (
        <Input
          ref={ref}
          type="tel"
          icon={<Phone size={18} />}
          placeholder={placeholder}
          autoComplete={autoComplete}
          role="tel"
          data-testid="input-phone"
          {...props}
        />
      );
    }
  )
);

InputPhone.displayName = 'InputPhone';
