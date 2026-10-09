// src/shared/ui/DataTable/model/types.ts

import type { ReactNode } from 'react';
import type { TableProps } from '@/shared/ui/Table';

/**
 * Props of the kit data table (plan_kit_datatable rev.5, A5 revision).
 *
 * @remarks
 * Controlled composition over kit `Table` + kit `Pagination` +
 * kit `PageSizeGroup`: the container owns `page`/`pageSize` (plan A2 —
 * state outside, ready for page⇄URL); clamp and windowing are render-time
 * derivations, never effects.
 */
export interface DataTableProps<T> extends Omit<TableProps<T>, 'emptyState'> {
  /** Pass-through: rendered instead of the body when `rows` is empty. */
  emptyState?: ReactNode;
  /** Controlled 1-based page index. */
  page: number;
  /** Controlled window size; clamped to `>= 1` at render time. */
  pageSize: number;
  /** Called with the requested next page (already bounded by Pagination). */
  onPageChange: (page: number) => void;
  /**
   * Sizes for the kit `PageSizeGroup` (e.g. `[5, 10, 20]`). The group
   * renders only when BOTH this and `onPageSizeChange` are provided.
   */
  pageSizeOptions?: readonly number[];
  /** Called with the clicked size — required in practice alongside `pageSizeOptions`. */
  onPageSizeChange?: (size: number) => void;
}
