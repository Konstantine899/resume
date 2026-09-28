// src/shared/ui/Form/model/types.ts

import type { FormHTMLAttributes, ReactNode } from 'react';

/**
 * Вертикальный отступ между полями формы.
 * @description Задаёт gap через CSS-переменную `--form-gap`.
 * @group Constants
 */
export type FormGap = 'sm' | 'md' | 'lg';

/**
 * Props, которыми владеет Form.
 * @description Неконфликтующие с нативными атрибутами `<form>` пропсы.
 * Нативные атрибуты (onSubmit, action, method, acceptCharset и т.д.)
 * проксируются через HTML-атрибуты.
 * @group Base
 */
export interface FormOwnProps {
  /**
   * Вертикальный отступ между полями.
   * @default 'md'
   * @description Если не передан, gap остаётся управляемым снаружи через
   * CSS-переменную `--form-gap` (см. Form.module.scss), т.е. стилизующий
   * слой может переопределить ритм без борьбы специфичностей.
   */
  gap?: FormGap;
  /**
   * Отключить браузерную валидацию (своя — в обработчике).
   * @default true
   */
  noValidate?: boolean;
  /** Содержимое формы */
  children?: ReactNode;
}

/**
 * Итоговые props компонента Form.
 * @description Наследует все нативные атрибуты `<form>`, кроме
 * `noValidate` (управляется компонентом) и других owned-пропсов.
 */
export type FormProps = FormOwnProps &
  Omit<FormHTMLAttributes<HTMLFormElement>, keyof FormOwnProps>;
