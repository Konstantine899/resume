// src/shared/ui/Table/ui/Table/Table.tsx

import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/utils/classNames';
import type { ReactNode } from 'react';
import { TABLE_CONSTANTS } from '../../model/constants';
import type { TableAlign, TableProps } from '../../model/types';
import styles from './Table.module.scss';

/**
 * Modifier class per `Column.align`. Referenced through these literal
 * property reads only, so the PurgeCSS extractor always sees the tokens.
 */
const ALIGN_CLASS: Record<TableAlign, string | undefined> = {
  left: styles.alignLeft,
  right: styles.alignRight,
  center: styles.alignCenter,
};

/** Column-derived cell chrome shared by `<th>` and `<td>`. */
type CellChrome = { align?: TableAlign; hideOnMobile?: boolean };

function cellClassName({ align, hideOnMobile }: CellChrome): string {
  return classNames(
    styles.cell,
    align ? ALIGN_CLASS[align] : undefined,
    hideOnMobile && styles.hideOnMobile
  );
}

/**
 * Semantic table primitive (plan_kit_table, WU-1).
 *
 * @remarks
 * - Markup only (plan A2): no sorting, pagination or selection — no buttons
 *   in `<th>`, that is `DataTable`'s job.
 * - `<table>` + required `<caption>` (visually hidden via the
 *   `visually-hidden` mixin), `scope="col"` on every header cell.
 * - Outer `<div role="region" aria-label={caption} tabIndex={0}>` with
 *   `overflow-x: auto` keeps horizontally overflowing tables keyboard
 *   reachable (axe `scrollable-region-focusable`, plan A5).
 * - `loading` sets `aria-busy="true"` and swaps body rows for kit Skeletons;
 *   empty `rows` render the `emptyState` slot inside the body (plan A3).
 * - No heading elements inside cells — fixtures use `<strong>`/links, locked
 *   by a test (plan A6).
 *
 * @example
 * ```tsx
 * <Table caption="Technologies" columns={columns} rows={rows} getKey={(r) => r.id} />
 * ```
 */
export function Table<T>({
  columns,
  rows,
  getKey,
  caption,
  loading = false,
  emptyState,
  className,
}: TableProps<T>) {
  let body: ReactNode;

  if (loading) {
    body = Array.from({ length: TABLE_CONSTANTS.LOADING_ROWS }, (_, index) => (
      <tr key={`skeleton-${index}`}>
        <td className={styles.cell} colSpan={columns.length}>
          <Skeleton variant="text" />
        </td>
      </tr>
    ));
  } else if (rows.length > 0) {
    body = rows.map((row) => (
      <tr key={getKey(row)}>
        {columns.map((column) => (
          <td key={column.key} className={cellClassName(column)}>
            {column.render
              ? column.render(row)
              : String((row as Record<string, unknown>)[column.key])}
          </td>
        ))}
      </tr>
    ));
  } else {
    body =
      emptyState === undefined || emptyState === null ? null : (
        <tr>
          <td className={styles.emptyCell} colSpan={columns.length}>
            {emptyState}
          </td>
        </tr>
      );
  }

  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={classNames(styles.region, className)}
    >
      <table className={styles.table} aria-busy={loading || undefined}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cellClassName(column)}
                style={column.width ? { width: column.width } : undefined}
                aria-sort={column.ariaSort}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}
