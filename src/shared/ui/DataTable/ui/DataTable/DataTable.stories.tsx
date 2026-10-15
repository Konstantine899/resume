// src/shared/ui/DataTable/ui/DataTable/DataTable.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import i18n from '@/shared/lib/i18n/config/i18n';
import type { Column } from '@/shared/ui/Table';
import type { DataTableColumn, DataTableProps } from '../../model/types';
import { DataTable } from './DataTable';

const meta = {
  title: 'Shared/DataTable/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Fixtures — a simple people list (2 columns) covering multi-page data,
// the size group, empty and loading states.
// ============================================

type Person = { id: string; name: string; role: string };

const PEOPLE: Person[] = [
  { id: 'p1', name: 'Ada Lovelace', role: 'Analyst' },
  { id: 'p2', name: 'Grace Hopper', role: 'Compiler pioneer' },
  { id: 'p3', name: 'Alan Turing', role: 'Cryptanalyst' },
  { id: 'p4', name: 'Barbara Liskov', role: 'Programming theory' },
  { id: 'p5', name: 'Edsger Dijkstra', role: 'Algorithms' },
  { id: 'p6', name: 'Margaret Hamilton', role: 'Flight software' },
  { id: 'p7', name: 'Donald Knuth', role: 'Literate programming' },
];

const COLUMNS: Column<Person>[] = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
];

const BASE_ARGS: DataTableProps<Person> = {
  caption: 'People',
  columns: COLUMNS,
  rows: PEOPLE,
  getKey: (row) => row.id,
  page: 1,
  pageSize: 5,
  onPageChange: fn(),
};

/**
 * Storybook types a generic component's args as `DataTableProps<unknown>`.
 * The assertion points in the safe direction (same pattern as Table.stories).
 */
function storyArgs<T>(props: DataTableProps<T>): DataTableProps<unknown> {
  return props as DataTableProps<unknown>;
}

export const Default: Story = {
  args: storyArgs(BASE_ARGS),
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Ada Lovelace')).toBeVisible();

    const nav = canvas.getByRole('navigation');
    await user.click(within(nav).getByText('2'));

    await expect(args.onPageChange).toHaveBeenCalledWith(2);
  },
};

export const SecondPage: Story = {
  args: storyArgs({ ...BASE_ARGS, page: 2 }),
};

export const WithSizeGroup: Story = {
  args: storyArgs({
    ...BASE_ARGS,
    pageSizeOptions: [5, 10, 20],
    onPageSizeChange: fn(),
  }),
  play: async ({ canvasElement, args }) => {
    // LanguageDetector reads the browser locale — pin EN before asserting copy.
    await i18n.changeLanguage('en');
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    const group = canvas.getByRole('group', { name: 'Items per page' });
    await user.click(within(group).getByRole('button', { name: '10' }));

    await expect(args.onPageSizeChange).toHaveBeenCalledWith(10);
  },
};

export const Empty: Story = {
  args: storyArgs({
    ...BASE_ARGS,
    rows: [],
    emptyState: <p>No people yet</p>,
  }),
};

export const Loading: Story = {
  args: storyArgs({ ...BASE_ARGS, loading: true }),
};

// ============================================
// Sorting (WU-5) — the kit is controlled: each story renders a `sort` prop
// state and asserts the emitted `onSortChange`, mirroring the unit cycle.
// ============================================

const SORTABLE_COLUMNS: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
];

const SORT_ARGS: DataTableProps<Person> = {
  ...BASE_ARGS,
  columns: SORTABLE_COLUMNS,
  // One page keeps every row visible — the story is about order, not windows.
  pageSize: 10,
  sort: null,
  onSortChange: fn(),
};

export const Sortable: Story = {
  args: storyArgs(SORT_ARGS),
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);

    // Both headers are toggle buttons; no aria-sort until the prop says so.
    await expect(canvas.getByRole('button', { name: 'Name' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Role' })).toBeVisible();
    await expect(canvas.getAllByRole('columnheader')[0]).not.toHaveAttribute('aria-sort');

    await user.click(canvas.getByRole('button', { name: 'Name' }));
    await expect(args.onSortChange).toHaveBeenCalledWith({ key: 'name', direction: 'asc' });
  },
};

export const SortedAsc: Story = {
  args: storyArgs({
    ...SORT_ARGS,
    sort: { key: 'name', direction: 'asc' },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [nameHeader] = canvas.getAllByRole('columnheader');

    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    // localeCompare order: Ada → Alan → Barbara → Donald → Edsger → Grace → Margaret
    await expect(canvas.getByText('Ada Lovelace')).toBeVisible();
  },
};

export const SortedDesc: Story = {
  args: storyArgs({
    ...SORT_ARGS,
    sort: { key: 'name', direction: 'desc' },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [nameHeader] = canvas.getAllByRole('columnheader');

    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    await expect(canvas.getByText('Margaret Hamilton')).toBeVisible();
  },
};

export const SortCycle: Story = {
  args: storyArgs({ ...SORT_ARGS, sort: { key: 'name', direction: 'asc' } }),
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup();
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Name' });

    // asc → desc (the parent would echo it back — covered by unit tests).
    await user.click(button);
    await expect(args.onSortChange).toHaveBeenLastCalledWith({
      key: 'name',
      direction: 'desc',
    });

    // Switching columns always restarts at asc.
    await user.click(canvas.getByRole('button', { name: 'Role' }));
    await expect(args.onSortChange).toHaveBeenLastCalledWith({ key: 'role', direction: 'asc' });
  },
};
