// src/shared/ui/DataTable/ui/DataTable/DataTable.tsx

import { Table } from '@/shared/ui/Table';
import { Pagination } from '@/shared/ui/Pagination';
import { PageSizeGroup } from '@/shared/ui/PageSizeGroup';
import type { Column } from '@/shared/ui/Table';
import type { DataTableColumn, DataTableProps, SortState } from '../../model/types';
import styles from './DataTable.module.scss';

/**
 * Next step of the sort cycle for the SAME key: `null → asc → desc → null`.
 * Any other key restarts at `asc` (verdict 2026-10-10, SPEC WU-5).
 */
function nextSort(current: SortState | null | undefined, key: string): SortState | null {
  if (!current || current.key !== key) return { key, direction: 'asc' };
  if (current.direction === 'asc') return { key, direction: 'desc' };
  return null;
}

/**
 * Comparator for one column (plan A3): `sortValue` when present (numbers and
 * dates compare as their value), otherwise `String(row[key])` + `localeCompare`.
 */
function compareRows<T>(column: DataTableColumn<T>, a: T, b: T): number {
  if (column.sortValue) {
    const left = column.sortValue(a);
    const right = column.sortValue(b);
    if (typeof left === 'number' && typeof right === 'number') return left - right;
    return String(left).localeCompare(String(right));
  }
  const rawA = String((a as Record<string, unknown>)[column.key]);
  const rawB = String((b as Record<string, unknown>)[column.key]);
  return rawA.localeCompare(rawB);
}

/**
 * Decorates columns for Table: wraps a sortable header in a toggle button
 * (only when `onSortChange` is wired — an inert button would be an a11y
 * trap) and computes `aria-sort` for the active column (APG).
 */
function decorateColumns<T>(
  columns: DataTableColumn<T>[],
  sort: SortState | null | undefined,
  onSortChange?: (next: SortState | null) => void
): Column<T>[] {
  return columns.map((column) => {
    const isSorted = sort?.key === column.key;
    const ariaSort =
      isSorted && sort ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined;

    if (!column.sortable || !onSortChange) return { ...column, ariaSort };

    return {
      ...column,
      ariaSort,
      header: (
        <button
          type="button"
          className={styles.sortButton}
          onClick={() => onSortChange(nextSort(sort, column.key))}
        >
          {column.header}
        </button>
      ),
    };
  });
}

/**
 * Kit data table: kit `Table` + built-in kit `Pagination` +
 * built-in kit `PageSizeGroup` (plan_kit_datatable rev.5, A5 revision).
 *
 * @remarks
 * - Controlled composition (plan A2): the container owns `page`/`pageSize`
 *   AND `sort`; clamp (`safePage`), windowing and sorting are render-time
 *   derivations — no `setState`-in-effect, ready for page⇄URL / sort⇄URL.
 * - Sorting (WU-5, verdict 2026-10-10): single controlled axis, client-side
 *   (A3). Sort is applied BEFORE the pagination window. The kit never
 *   reorders on its own — a click only emits `onSortChange(next)`.
 * - Controls follow the owner directive 2026-10-09 «не должны исчезать»:
 *   visible whenever `rows.length > 0`, including a single page
 *   (kit Pagination renders the `‹ 1 ›` row at `totalPages = 1`).
 *   An empty list renders the `emptyState` pass-through with no controls.
 * - Layout mirrors the approved MyWork arrangement: size group above the
 *   table, right-aligned; navigation below, centered (plan rev.5 OPEN-6).
 * - The size group renders only when BOTH `pageSizeOptions` and
 *   `onPageSizeChange` are provided.
 *
 * Note: `check:axe:stories` currently reports the advisory `region`
 * (best-practice) rule against div-root kit components repo-wide
 * (Card/Badge/Paragraph/Heading — 26+ pre-existing scans; the script is
 * not CI-wired). DataTable matches that status quo; a repo-level fix is
 * tracked separately.
 *
 * @example
 * ```tsx
 * <DataTable
 *   caption="Skills"
 *   columns={columns}
 *   rows={rows}
 *   getKey={(row) => row.id}
 *   page={page}
 *   pageSize={pageSize}
 *   onPageChange={setPage}
 *   pageSizeOptions={[5, 10, 20]}
 *   onPageSizeChange={setPageSize}
 *   sort={sort}
 *   onSortChange={setSort}
 *   emptyState={<EmptyState />}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  rows,
  getKey,
  caption,
  loading,
  emptyState,
  className,
  page,
  pageSize,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  const effectivePageSize = Math.max(1, Math.trunc(pageSize) || 1);
  const totalPages = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // Sorting happens BEFORE windowing: page 2 must show rows 6–7 of the
  // sorted order, not of the source array.
  const activeColumn = sort ? columns.find((column) => column.key === sort.key) : undefined;
  const sortedRows =
    sort && activeColumn
      ? [...rows].sort((a, b) => {
          const result = compareRows(activeColumn, a, b);
          return sort.direction === 'asc' ? result : -result;
        })
      : rows;

  const windowRows = sortedRows.slice(
    (safePage - 1) * effectivePageSize,
    safePage * effectivePageSize
  );

  const showControls = rows.length > 0;
  const showSizeGroup =
    showControls && pageSizeOptions !== undefined && onPageSizeChange !== undefined;

  return (
    <>
      {showSizeGroup && (
        <div className={styles.sizeRow}>
          <PageSizeGroup
            sizes={pageSizeOptions}
            value={effectivePageSize}
            onChange={onPageSizeChange}
          />
        </div>
      )}
      <Table
        columns={decorateColumns(columns, sort, onSortChange)}
        rows={windowRows}
        getKey={getKey}
        caption={caption}
        loading={loading}
        emptyState={emptyState}
        className={className}
      />
      {showControls && (
        <div className={styles.paginationRow}>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </>
  );
}
