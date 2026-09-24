// src/shared/ui/Form/ui/Form.tsx

import { forwardRef } from 'react';
import { classNames } from '@/shared/lib/utils/classNames';
import { resolveCssModuleKey } from '@/shared/lib/utils/resolveCssModuleKey';
import { FORM_DEFAULTS } from '../model/constants';
import type { FormProps } from '../model/types';
import styles from './Form.module.scss';

/**
 * Form — минимальная обёртка над семантическим `<form>`.
 *
 * @description
 * Собирает поля в вертикальный flex-стек с управляемым вертикальным
 * ритмом. Браузерная валидация по умолчанию выключена (`noValidate`),
 * чтобы единственным источником ошибок была своя валидация в
 * обработчике формы.
 *
 * - Вертикальный gap задаётся CSS-переменной `--form-gap`
 *   (по умолчанию `var(--space-4)`). Консьюмер может переопределить
 *   ритм через собственный класс или через prop `gap`.
 * - Атрибут `noValidate` по умолчанию `true`, отключается явно.
 * - Наследует все нативные атрибуты `<form>` (action, method, onSubmit…).
 *
 * @group UI Components
 *
 * @example
 * ```tsx
 * <Form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
 *   <Input label="Name" />
 *   <Textarea label="Message" />
 *   <Button type="submit">Send</Button>
 * </Form>
 * ```
 */
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form(
  { gap, noValidate = FORM_DEFAULTS.noValidate, className, children, ...props },
  ref
) {
  const gapClass = gap ? resolveCssModuleKey(styles, `gap-${gap}`) : undefined;

  return (
    <form
      ref={ref}
      noValidate={noValidate}
      className={classNames(styles.form, gapClass, className)}
      {...props}
    >
      {children}
    </form>
  );
});

Form.displayName = 'Form';
