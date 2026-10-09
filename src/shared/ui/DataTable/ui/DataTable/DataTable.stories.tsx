// src/shared/ui/DataTable/ui/DataTable/DataTable.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import i18n from '@/shared/lib/i18n/config/i18n';
import type { Column } from '@/shared/ui/Table';
import type { DataTableProps } from '../../model/types';
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
