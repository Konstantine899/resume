// src/shared/ui/DataTable/ui/DataTable/DataTable.test.tsx

import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Column } from '@/shared/ui/Table';
import type { DataTableProps } from '../../model/types';
import { DataTable } from './DataTable';

// Deterministic labels: t(key) => key — same contract as Pagination.test.tsx.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

type Row = { id: string; name: string };

const makeRows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `r${index + 1}`,
    name: `Row ${index + 1}`,
  }));

const COLUMNS: Column<Row>[] = [{ key: 'name', header: 'Name' }];
const getKey = (row: Row) => row.id;

const BASE: DataTableProps<Row> = {
  columns: COLUMNS,
  rows: makeRows(7),
  getKey,
  caption: 'People',
  page: 1,
  pageSize: 5,
  onPageChange: vi.fn(),
};

const renderTable = (props: Partial<DataTableProps<Row>> = {}) =>
  render(<DataTable {...BASE} {...props} />);

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('windows the rows: page 1 shows the first five, not the tail', () => {
    renderTable();

    for (const row of makeRows(5)) {
      expect(screen.getByText(row.name)).toBeInTheDocument();
    }
    expect(screen.queryByText('Row 6')).not.toBeInTheDocument();
    expect(screen.queryByText('Row 7')).not.toBeInTheDocument();
  });

  it('renders the tail page (page 2 of 5-of-7)', () => {
    renderTable({ page: 2 });

    expect(screen.getByText('Row 6')).toBeInTheDocument();
    expect(screen.getByText('Row 7')).toBeInTheDocument();
    expect(screen.queryByText('Row 1')).not.toBeInTheDocument();
  });

  it('clamps an out-of-range page to the last page without crashing', () => {
    renderTable({ page: 99 });

    expect(screen.getByText('Row 6')).toBeInTheDocument();
    expect(screen.getByText('Row 7')).toBeInTheDocument();
  });

  it('keeps both controls visible when everything fits one page (owner directive 2026-10-09)', () => {
    renderTable({
      rows: makeRows(3),
      pageSizeOptions: [5, 10, 20],
      onPageSizeChange: vi.fn(),
    });

    expect(screen.getByRole('group', { name: 'perPageLabel' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders emptyState without controls for an empty list', () => {
    renderTable({
      rows: [],
      emptyState: <p>Nothing here</p>,
      pageSizeOptions: [5, 10],
      onPageSizeChange: vi.fn(),
    });

    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('renders the size group when options + handler are given and forwards clicks', () => {
    const onPageSizeChange = vi.fn();
    renderTable({ pageSizeOptions: [5, 10], onPageSizeChange });

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    fireEvent.click(within(group).getByRole('button', { name: '10' }));

    expect(onPageSizeChange).toHaveBeenCalledWith(10);
    expect(onPageSizeChange).toHaveBeenCalledTimes(1);
  });

  it('skips the size group without a handler or without options (navigation still works)', () => {
    const { unmount } = renderTable({ pageSizeOptions: [5, 10] });

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    unmount();

    renderTable({ onPageSizeChange: vi.fn() });

    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('forwards navigation clicks to onPageChange', () => {
    const onPageChange = vi.fn();
    renderTable({ onPageChange });

    // Identity i18n mock drops interpolation: every page button's aria-label
    // is the raw key `paginationPage` — target by the visible number instead
    // (same approach as Pagination.test / kit Pagination stories).
    const nav = screen.getByRole('navigation');
    fireEvent.click(within(nav).getByText('2'));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('passes caption and loading through to Table', () => {
    renderTable({ loading: true });

    const table = screen.getByRole('table', { name: 'People' });
    expect(table).toHaveAttribute('aria-busy', 'true');
  });

  it('places the size group before the table and the navigation after it (DOM order)', () => {
    renderTable({ pageSizeOptions: [5, 10], onPageSizeChange: vi.fn() });

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    const table = screen.getByRole('table');
    const nav = screen.getByRole('navigation');

    expect(group.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(table.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('treats a non-positive pageSize as 1 without crashing', () => {
    renderTable({ pageSize: 0 });

    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.queryByText('Row 2')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
