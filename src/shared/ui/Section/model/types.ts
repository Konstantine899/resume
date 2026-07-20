// src/shared/ui/Section/model/types.ts

import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Размер Section (вертикальный padding)
 * @sm - 1.5rem (compact)
 * @md - 2rem (default)
 * @lg - 3rem (spacious)
 * @xl - 4rem
 * @2xl - 6rem (extra spacious)
 */
export type SectionSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Props для компонента Section
 */
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Размер секции (вертикальный padding) */
  size?: SectionSize;

  /** Semantic HTML элемент */
  as?: 'section' | 'div' | 'article' | 'aside' | 'main' | 'nav';

  /** Дочерние элементы */
  children?: ReactNode;
}
