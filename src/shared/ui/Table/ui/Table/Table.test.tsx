// src/shared/ui/Table/ui/Table/Table.test.tsx

import { render, screen } from '@testing-library/react';
import { resolveCssModuleKey } from '@/shared/lib/utils';
import { describe, expect, it } from 'vitest';
import type { Column, TableProps } from '../../model/types';
import { TABLE_CONSTANTS } from '../../model/constants';
import { Table } from './Table';
import styles from './Table.module.scss';

/** CSS-module keys are typed `string | undefined`; the repo helper returns `string`. */
const cls = (key: string): string => resolveCssModuleKey(styles, key);

type Skill = {
  id: string;
  name: string;
  category: string;
  years: number;
};

const CAPTION = 'Technologies';

const COLUMNS: Column<Skill>[] = [
  { key: 'name', header: 'Technology' },
  { key: 'category', header: 'Category' },
  { key: 'years', header: 'Years', align: 'right' },
];

const ROWS: Skill[] = [
  { id: 'react', name: 'React', category: 'Frontend', years: 6 },
  { id: 'node', name: 'Node.js', category: 'Backend', years: 5 },
];

function renderTable(props: Partial<TableProps<Skill>> = {}) {
  return render(
    <Table<Skill>
      caption={CAPTION}
      columns={COLUMNS}
      rows={ROWS}
      getKey={(row) => row.id}
      {...props}
    />
  );
}

describe('Table', () => {
  describe('Semantics (plan A3)', () => {
    it('exposes the table under its caption name', () => {
      renderTable();

      const table = screen.getByRole('table', { name: CAPTION });
      expect(table).toBeInTheDocument();
      expect(table.querySelector('caption')).toHaveTextContent(CAPTION);
    });

    it('keeps the caption visually hidden but present in the a11y tree', () => {
      renderTable();

      const caption = screen.getByRole('table', { name: CAPTION }).querySelector('caption');
      expect(caption).toHaveClass(cls('caption'));
    });

    it('gives every column header scope="col"', () => {
      renderTable();

      for (const header of screen.getAllByRole('columnheader')) {
        expect(header).toHaveAttribute('scope', 'col');
      }
    });

    it('renders a focusable scroll region labelled with the caption (plan A5)', () => {
      renderTable();

      const region = screen.getByRole('region', { name: CAPTION });
      expect(region).toHaveAttribute('tabindex', '0');
    });

    it('merges the incoming className onto the region wrapper', () => {
      renderTable({ className: 'custom-class' });

      expect(screen.getByRole('region', { name: CAPTION })).toHaveClass('custom-class');
    });
  });

  describe('Columns and cells', () => {
    it('renders one column header per column', () => {
      renderTable();

      expect(screen.getAllByRole('columnheader')).toHaveLength(COLUMNS.length);
    });

    it('falls back to String(row[key]) when a column has no render', () => {
      renderTable();

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('applies the align modifier class to header and cells', () => {
      renderTable();

      const headers = screen.getAllByRole('columnheader');
      const yearsHeader = headers[2] as HTMLElement;
      expect(yearsHeader).toHaveClass(cls('alignRight'));

      const yearsCell = screen.getByText('6').closest('td');
      expect(yearsCell).toHaveClass(cls('alignRight'));
      expect(screen.getByText('React').closest('td')).not.toHaveClass(cls('alignRight'));
    });

    it('marks hideOnMobile columns with the hide class (plan A5)', () => {
      const columns: Column<Skill>[] = [
        { key: 'name', header: 'Technology' },
        { key: 'category', header: 'Category', hideOnMobile: true },
        { key: 'years', header: 'Years', align: 'right' },
      ];
      renderTable({ columns });

      const headers = screen.getAllByRole('columnheader');
      expect(headers[1] as HTMLElement).toHaveClass(cls('hideOnMobile'));
      expect(headers[0] as HTMLElement).not.toHaveClass(cls('hideOnMobile'));
      expect(screen.getByText('Frontend').closest('td')).toHaveClass(cls('hideOnMobile'));
    });
  });

  describe('States', () => {
    it('sets aria-busy and swaps rows for Skeletons while loading', () => {
      renderTable({ loading: true });

      const table = screen.getByRole('table', { name: CAPTION });
      expect(table).toHaveAttribute('aria-busy', 'true');
      expect(screen.getAllByRole('status')).toHaveLength(TABLE_CONSTANTS.LOADING_ROWS);
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    it('omits aria-busy when not loading', () => {
      renderTable();

      expect(screen.getByRole('table', { name: CAPTION })).not.toHaveAttribute('aria-busy');
    });

    it('renders the emptyState slot instead of an empty body (plan A3)', () => {
      renderTable({ rows: [], emptyState: <p>No technologies yet</p> });

      expect(screen.getByText('No technologies yet')).toBeInTheDocument();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
      expect(screen.getByRole('table', { name: CAPTION })).toBeInTheDocument();
    });

    it('renders an empty body when rows are empty and no slot is given', () => {
      renderTable({ rows: [] });

      const table = screen.getByRole('table', { name: CAPTION });
      expect(table.querySelectorAll('tbody tr')).toHaveLength(0);
    });
  });

  describe('Content conventions (plan A2/A6)', () => {
    const richColumns: Column<Skill>[] = [
      {
        key: 'name',
        header: 'Technology',
        render: (row) => (
          <strong>
            <a href={`https://example.com/${row.id}`}>{row.name}</a>
          </strong>
        ),
      },
      { key: 'category', header: 'Category' },
      { key: 'years', header: 'Years', align: 'right' },
    ];

    it('never renders a heading element inside the table (plan A6)', () => {
      renderTable({ columns: richColumns });

      const table = screen.getByRole('table', { name: CAPTION });
      expect(table.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
      const link = screen.getByRole('link', { name: 'React' });
      expect(link.closest('strong')).not.toBeNull();
    });

    it('renders no sort buttons, pagination or selection controls (plan A2)', () => {
      renderTable({ columns: richColumns });

      const table = screen.getByRole('table', { name: CAPTION });
      expect(table.querySelectorAll('th button')).toHaveLength(0);
      expect(table.querySelectorAll('input, [role="checkbox"], [aria-sort]')).toHaveLength(0);
      expect(table.querySelector('nav')).toBeNull();
    });

    it('passes ariaSort through to the th as aria-sort, omitting it otherwise (rev.4)', () => {
      renderTable({
        columns: [
          { key: 'name', header: 'Technology' },
          { key: 'category', header: 'Category', ariaSort: 'descending' },
        ],
      });

      const [nameHeader, categoryHeader] = screen.getAllByRole('columnheader');
      expect(nameHeader).not.toHaveAttribute('aria-sort');
      expect(categoryHeader).toHaveAttribute('aria-sort', 'descending');
    });
  });
});
