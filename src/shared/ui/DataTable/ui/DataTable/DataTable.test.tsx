// src/shared/ui/DataTable/ui/DataTable/DataTable.test.tsx

import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Column } from '@/shared/ui/Table';
import type { DataTableColumn, DataTableProps, SortState } from '../../model/types';
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

  // ---- Sorting (WU-5, plan verdict 2026-10-10: controlled + sortValue) ----
  describe('sorting (WU-5)', () => {
    type Item = { id: string; name: string; score: number };
    const ITEMS: Item[] = [
      { id: 'i1', name: 'Charlie', score: 3 },
      { id: 'i2', name: 'alice', score: 10 },
      { id: 'i3', name: 'Bob', score: 9 },
    ];
    const itemKey = (row: Item) => row.id;
    const ITEM_COLUMNS: DataTableColumn<Item>[] = [
      { key: 'name', header: 'Name', sortable: true },
      { key: 'score', header: 'Score', sortable: true, sortValue: (row) => row.score },
      { key: 'role', header: 'Role' },
    ];
    const itemProps = (props: Partial<DataTableProps<Item>> = {}): DataTableProps<Item> => ({
      columns: ITEM_COLUMNS,
      rows: ITEMS,
      getKey: itemKey,
      caption: 'People',
      page: 1,
      pageSize: 10,
      onPageChange: vi.fn(),
      ...props,
    });
    const renderItems = (props: Partial<DataTableProps<Item>> = {}) =>
      render(<DataTable<Item> {...itemProps(props)} />);
    /** Visible row order by the first cell of each body row. */
    const visibleNames = () =>
      Array.from(document.querySelectorAll('tbody tr')).map(
        (row) => row.querySelector('td')?.textContent ?? ''
      );

    it('renders a sort toggle button only for sortable columns with a handler', () => {
      const { unmount } = renderItems({ onSortChange: vi.fn() });

      const headers = screen.getAllByRole('columnheader');
      const nameHeader = headers[0] as HTMLElement;
      const scoreHeader = headers[1] as HTMLElement;
      const roleHeader = headers[2] as HTMLElement;
      expect(within(nameHeader).getByRole('button', { name: 'Name' })).toBeInTheDocument();
      expect(within(scoreHeader).getByRole('button', { name: 'Score' })).toBeInTheDocument();
      // Non-sortable column keeps plain text — no button.
      expect(within(roleHeader).queryByRole('button')).toBeNull();
      unmount();

      // sortable without onSortChange → plain header (an inert button would be
      // an a11y trap: interactive but unresponsive).
      renderItems();
      for (const header of screen.getAllByRole('columnheader')) {
        expect(within(header).queryByRole('button')).toBeNull();
      }
    });

    it('cycle: null → asc → desc → null for the same column (parent echoes each emission)', () => {
      const onSortChange = vi.fn();
      let sort: SortState | null = null;
      const view = render(<DataTable<Item> {...itemProps({ sort, onSortChange })} />);
      const clickName = () => fireEvent.click(screen.getByRole('button', { name: 'Name' }));

      clickName();
      expect(onSortChange).toHaveBeenLastCalledWith({ key: 'name', direction: 'asc' });

      // The parent stores the emission (sort⇄state) — the kit stays controlled,
      // it never reorders on its own (covered by the «follows ONLY the prop» test).
      sort = { key: 'name', direction: 'asc' };
      view.rerender(<DataTable<Item> {...itemProps({ sort, onSortChange })} />);
      clickName();
      expect(onSortChange).toHaveBeenLastCalledWith({ key: 'name', direction: 'desc' });

      sort = { key: 'name', direction: 'desc' };
      view.rerender(<DataTable<Item> {...itemProps({ sort, onSortChange })} />);
      clickName();
      expect(onSortChange).toHaveBeenLastCalledWith(null);
    });

    it('switching to another column always starts at asc', () => {
      const onSortChange = vi.fn();
      renderItems({ sort: { key: 'name', direction: 'desc' }, onSortChange });

      fireEvent.click(screen.getByRole('button', { name: 'Score' }));

      expect(onSortChange).toHaveBeenCalledWith({ key: 'score', direction: 'asc' });
    });

    it('follows ONLY the sort prop — a click without a prop change does not reorder (controlled)', () => {
      const onSortChange = vi.fn();
      renderItems({ sort: null, onSortChange });

      fireEvent.click(screen.getByRole('button', { name: 'Name' }));
      // Prop still null → original order, no internal state.
      expect(visibleNames()).toEqual(['Charlie', 'alice', 'Bob']);
      expect(onSortChange).toHaveBeenCalledTimes(1);
    });

    it('sorts strings case-insensitively via localeCompare when sortValue is absent', () => {
      const { unmount } = renderItems({ sort: { key: 'name', direction: 'asc' } });
      expect(visibleNames()).toEqual(['alice', 'Bob', 'Charlie']);
      unmount();

      renderItems({ sort: { key: 'name', direction: 'desc' } });
      expect(visibleNames()).toEqual(['Charlie', 'Bob', 'alice']);
    });

    it('sorts numerically through sortValue — 10 ranks after 9, not between 1 and 3', () => {
      const { unmount } = renderItems({ sort: { key: 'score', direction: 'asc' } });
      expect(visibleNames()).toEqual(['Charlie', 'Bob', 'alice']); // 3, 9, 10
      unmount();

      renderItems({ sort: { key: 'score', direction: 'desc' } });
      expect(visibleNames()).toEqual(['alice', 'Bob', 'Charlie']); // 10, 9, 3
    });

    it('applies sorting BEFORE the pagination window (page 2 of sorted data)', () => {
      const many = Array.from({ length: 7 }, (_, index) => ({
        id: `x${index + 1}`,
        name: `Name ${index + 1}`,
        score: index,
      }));
      // Reverse-sorted desc → row order 7..1; page 2 (size 5) must show 6..7 of THAT order.
      render(
        <DataTable<Item>
          columns={ITEM_COLUMNS}
          rows={many}
          getKey={(row) => row.id}
          caption="People"
          page={2}
          pageSize={5}
          onPageChange={vi.fn()}
          sort={{ key: 'name', direction: 'desc' }}
        />
      );

      expect(visibleNames()).toEqual(['Name 2', 'Name 1']);
    });

    it('exposes aria-sort on the active column header only (APG)', () => {
      const { unmount } = renderItems({ sort: { key: 'score', direction: 'desc' } });

      const headers = screen.getAllByRole('columnheader');
      expect(headers[1]).toHaveAttribute('aria-sort', 'descending');
      expect(headers[0]).not.toHaveAttribute('aria-sort');
      expect(headers[2]).not.toHaveAttribute('aria-sort');
      unmount();

      renderItems({ sort: { key: 'name', direction: 'asc' } });
      const [first] = screen.getAllByRole('columnheader');
      expect(first).toHaveAttribute('aria-sort', 'ascending');
    });

    it('sorting does not touch pagination: no onPageChange/onPageSizeChange from a sort click', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      renderItems({
        sort: null,
        onSortChange: vi.fn(),
        onPageChange,
        pageSizeOptions: [5, 10],
        onPageSizeChange,
      });

      fireEvent.click(screen.getByRole('button', { name: 'Name' }));

      expect(onPageChange).not.toHaveBeenCalled();
      expect(onPageSizeChange).not.toHaveBeenCalled();
    });

    it('sorting does not interfere with empty rows or loading', () => {
      const { unmount } = renderItems({
        rows: [],
        sort: { key: 'name', direction: 'asc' },
        emptyState: <p>Nothing</p>,
      });
      expect(screen.getByText('Nothing')).toBeInTheDocument();
      unmount();

      renderItems({ loading: true, sort: { key: 'name', direction: 'asc' } });
      expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    });
  });
});
