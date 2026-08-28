import type { HTMLAttributes, ReactNode } from 'react';

export interface SlotProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Единственный дочерний ReactElement
   */
  children: ReactNode;

  /**
   * Data-testid для тестирования (переопределяет дочерний)
   */
  'data-testid'?: string;

  /**
   * Произвольные data-атрибуты, мержатся в дочерний элемент
   */
  dataAttrs?: Record<string, string>;
}
