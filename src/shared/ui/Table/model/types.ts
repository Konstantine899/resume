// src/shared/ui/Table/model/types.ts

import type { ReactNode } from 'react';

/**
 * Horizontal alignment of a column — applied to its header and every cell.
 */
export type TableAlign = 'left' | 'right' | 'center';

/**
 * One column of the table.
 */
export interface Column<T> {
  /** Stable identifier, also used as the cell lookup key. */
  key: string;
  /** Header content. Rendered inside `<th scope="col">`. */
  header: ReactNode;
  /**
   * Cell renderer. Defaults to `String(row[key])` — pass `render` whenever
   * the raw value is not display-ready (default renders "undefined" for a
   * missing key).
   */
  render?: (row: T) => ReactNode;
  /** CSS width of the column (e.g. `'160px'`, `'20%'`). */
  width?: string;
  /** Defaults to the browser's `left`. */
  align?: TableAlign;
  /** Hides the column below the mobile breakpoint (plan A5). */
  hideOnMobile?: boolean;
}

/**
 * Props of the semantic table primitive (plan_kit_table, API rev.2).
 *
 * @remarks
 * Purely presentational: no sorting, no pagination, no selection — that
 * behaviour belongs to the `DataTable` layer built on top (plan A2).
 */
export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** React key per row — `getKey(row)`. */
  getKey: (row: T) => string;
  /**
   * Required accessible name of the table. Rendered in a `<caption>` that is
   * visually hidden (`.visually-hidden` mixin) and reused as the scroll
   * region's `aria-label`.
   */
  caption: string;
  /** Shows `aria-busy="true"` on the table and swaps rows for Skeletons. */
  loading?: boolean;
  /** Slot rendered instead of the (empty) table body when `rows` is empty. */
  emptyState?: ReactNode;
  /** Extra class for the scroll-region wrapper. */
  className?: string;
}
