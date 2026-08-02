import type { ReactNode } from 'react';

export interface SlotProps {
  /**
   * Единственный дочерний ReactElement
   */
  children: ReactNode;

  /**
   * Дополнительные CSS классы (мержатся с классами children)
   */
  className?: string;

  /**
   * ID элемента
   */
  id?: string;

  /**
   * Data-testid для тестирования
   */
  'data-testid'?: string;

  /**
   * Произвольные data-атрибуты, мержатся в дочерний элемент
   */
  dataAttrs?: Record<string, string>;
}
