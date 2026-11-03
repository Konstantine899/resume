// src/shared/ui/DataTable/model/types.ts

import type { ReactNode } from 'react';
import type { Column, TableProps } from '@/shared/ui/Table';

/**
 * Direction of the single controlled sort axis.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Controlled sort descriptor — `null` at the call site means «исходный
 * порядок строк» (plan A2 / verdict 2026-10-10: state lives outside,
 * ready for sort⇄URL wiring).
 */
export interface SortState {
  /** The sorted `column.key`. */
  key: string;
  direction: SortDirection;
}

/**
 * Table column plus sorting metadata (plan_kit_datatable WU-5).
 *
 * @remarks
 * `sortable` opts the column into the header toggle; `sortValue` supplies a
 * comparator for non-string values (dates/numbers — plan A3). Without it the
 * comparator falls back to `String(row[key])` + `localeCompare`.
 */
export interface DataTableColumn<T> extends Column<T> {
  /** Renders the header as a sort toggle button (requires `onSortChange`). */
  sortable?: boolean;
  /** Comparator source for non-string values. */
  sortValue?: (row: T) => string | number;
}

/**
 * Props of the kit data table (plan_kit_datatable rev.5, A5 revision;
 * rev.6 adds controlled sorting — verdict 2026-10-10).
 *
 * @remarks
 * Controlled composition over kit `Table` + kit `Pagination` +
 * kit `PageSizeGroup`: the container owns `page`/`pageSize` AND `sort`
 * (plan A2 — state outside, ready for page⇄URL / sort⇄URL); clamp and
 * windowing are render-time derivations, never effects.
 */
export interface DataTableProps<T> extends Omit<TableProps<T>, 'emptyState' | 'columns'> {
  columns: DataTableColumn<T>[];
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
  /** Controlled sort (`null` = исходный порядок). */
  sort?: SortState | null;
  /**
   * Called with the next cycle step: `null → asc → desc → null` for the
   * same key, any other key → `asc`. The kit never reorders on its own —
   * render follows only the `sort` prop.
   */
  onSortChange?: (next: SortState | null) => void;
}
