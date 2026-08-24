// ============================================
// Toast Props Validator (Dev-Only)
// ============================================

import type { ToastOptions } from '@/shared/ui/Toast/model/types';
import { TOAST_TYPES } from '@/shared/ui/Toast/model/constants';

export interface ToastValidationProps {
  message?: ToastOptions['message'];
  type?: ToastOptions['type'];
  duration?: number;
  id?: string;
}

/**
 * Dev-only validator for toast options.
 * Self-guarded: returns immediately in production/test environments.
 *
 * @param props - Toast options to validate
 *
 * @example
 * ```ts
 * validateToastProps({ message: 'Success', type: 'success', duration: 5000 });
 * ```
 */
export const validateToastProps = (props: ToastValidationProps): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { message, type, duration, id } = props;

  // Validate message: must be non-empty string or i18n object with key
  if (message !== undefined) {
    const isString = typeof message === 'string';
    const isI18n =
      typeof message === 'object' &&
      message !== null &&
      'key' in message &&
      typeof (message as { key: string }).key === 'string';

    if (!isString && !isI18n) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Toast] Invalid message: must be a non-empty string or i18n object with { key, values? }',
        { message }
      );
    } else if (isString && message.trim() === '') {
      // eslint-disable-next-line no-console
      console.warn('[Toast] Empty message is not recommended', { message });
    }
  }

  // Validate type: must be valid ToastType (including 'loading')
  if (type !== undefined) {
    const allValidTypes = [...TOAST_TYPES, 'loading' as const];
    if (!allValidTypes.includes(type)) {
      // eslint-disable-next-line no-console
      console.warn(`[Toast] Invalid type "${type}". Valid types: ${allValidTypes.join(', ')}`, {
        type,
      });
    }
  }

  // Validate duration: must be >= 0
  if (duration !== undefined && duration < 0) {
    // eslint-disable-next-line no-console
    console.warn('[Toast] Duration must be >= 0 (0 = no auto-close)', { duration });
  }

  // Validate id: if provided, must be non-empty string
  if (id !== undefined && (typeof id !== 'string' || id.trim() === '')) {
    // eslint-disable-next-line no-console
    console.warn('[Toast] ID must be a non-empty string', { id });
  }
};
