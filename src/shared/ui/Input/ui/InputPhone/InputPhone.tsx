// ============================================
// InputPhone Component
// ============================================

import React from 'react';
import { Input } from '../Input';
import type { InputProps } from '../../model/types';
import { Phone } from 'lucide-react';
import { Icon } from '@/shared/ui/Icon';

export type InputPhoneProps = InputProps;

/**
 * InputPhone — специализированный input для телефонных номеров.
 *
 * @description
 * Рендерится как `<input type="tel">` с autocomplete="tel" и иконкой телефона.
 *
 * @example
 * ```tsx
 * // Default US format
 * <InputPhone label="Phone" />
 *
 * // Custom placeholder for RU locale
 * <InputPhone label="Телефон" placeholder="+7 (999) 000-00-00" />
 *
 * // With i18n
 * const { t } = useTranslation();
 * <InputPhone label={t('form.phone')} placeholder={t('form.phonePlaceholder')} />
 * ```
 */
export const InputPhone = React.memo(
  React.forwardRef<HTMLInputElement, InputPhoneProps>(
    ({ placeholder, autoComplete = 'tel', ...props }, ref) => {
      const defaultPlaceholder = placeholder ?? '+1 (555) 000-0000';

      return (
        <Input
          ref={ref}
          type="tel"
          icon={<Icon name={Phone} color="inherit" decorative />}
          placeholder={defaultPlaceholder}
          autoComplete={autoComplete}
          data-testid="input-phone"
          {...props}
        />
      );
    }
  )
);

InputPhone.displayName = 'InputPhone';
