// src/shared/ui/DataTable/ui/DataTable/DataTable.tsx

import { Table } from '@/shared/ui/Table';
import { Pagination } from '@/shared/ui/Pagination';
import { PageSizeGroup } from '@/shared/ui/PageSizeGroup';
import type { DataTableProps } from '../../model/types';
import styles from './DataTable.module.scss';

/**
 * Kit data table: kit `Table` + built-in kit `Pagination` +
 * built-in kit `PageSizeGroup` (plan_kit_datatable rev.5, A5 revision).
 *
 * @remarks
 * - Controlled composition (plan A2): the container owns `page`/`pageSize`;
 *   clamp (`safePage`) and windowing are render-time derivations — no
 *   `setState`-in-effect, ready for page⇄URL wiring.
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
}: DataTableProps<T>) {
  const effectivePageSize = Math.max(1, Math.trunc(pageSize) || 1);
  const totalPages = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const windowRows = rows.slice((safePage - 1) * effectivePageSize, safePage * effectivePageSize);

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
        columns={columns}
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
