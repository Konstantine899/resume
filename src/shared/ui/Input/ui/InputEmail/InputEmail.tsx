// ============================================
// InputEmail Component
// ============================================

import React from 'react';
import { Input } from '../Input';
import type { InputOwnProps } from '../../model/types';
import { Mail } from 'lucide-react';
import { Icon } from '@/shared/ui/Icon';

/**
 * InputEmail props: the full Input contract plus the native attributes
 * an email field needs on top of `InputOwnProps`.
 */
export type InputEmailProps = InputOwnProps & {
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  autoComplete?: string;
  /** Form field name — required for form serialization (e.g. EmailJS sendForm). */
  name?: string;
};

/**
 * InputEmail — специализированный input для email адресов.
 *
 * @description
 * Рендерится как `<input type="email">` с autocomplete="email" и иконкой почты.
 *
 * @example
 * ```tsx
 * <InputEmail label="Email" placeholder="your@email.com" />
 * <InputEmail label="Email" required error="Invalid email" />
 * ```
 */
export const InputEmail = React.memo(
  React.forwardRef<HTMLInputElement, InputEmailProps>(
    ({ placeholder = 'your@email.com', autoComplete = 'email', ...props }, ref) => {
      return (
        <Input
          ref={ref}
          type="email"
          icon={<Icon name={Mail} color="inherit" decorative />}
          placeholder={placeholder}
          autoComplete={autoComplete}
          data-testid="input-email"
          {...props}
        />
      );
    }
  )
);

InputEmail.displayName = 'InputEmail';
