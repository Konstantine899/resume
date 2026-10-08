// src/shared/ui/Table/ui/Table/Table.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Code2, Database, Server } from 'lucide-react';
import type { TableProps } from '../../model/types';
import { Table } from './Table';

const meta = {
  title: 'Shared/Table/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Fixtures — modelled on real cells of the app (icon, badge, two-line,
// link, actions) so the API is stress-tested before the first pilot.
// ============================================

type SkillRow = {
  id: string;
  name: string;
  category: string;
  years: number;
  icon: ReactNode;
};

const SKILL_ROWS: SkillRow[] = [
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    years: 6,
    icon: <Code2 size={18} aria-hidden="true" />,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Frontend',
    years: 5,
    icon: <Code2 size={18} aria-hidden="true" />,
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Backend',
    years: 4,
    icon: <Server size={18} aria-hidden="true" />,
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    category: 'Data',
    years: 4,
    icon: <Database size={18} aria-hidden="true" />,
  },
];

const ICONIC_PROPS: TableProps<SkillRow> = {
  caption: 'Technologies',
  getKey: (row) => row.id,
  rows: SKILL_ROWS,
  columns: [
    {
      key: 'name',
      header: 'Technology',
      width: '45%',
      render: (row) => (
        <span style={{ display: 'inline-flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {row.icon}
          {row.name}
        </span>
      ),
    },
    { key: 'category', header: 'Category' },
    { key: 'years', header: 'Years', align: 'right' },
  ],
};

type ProjectRow = {
  id: string;
  name: string;
  status: 'current' | 'featured' | 'published';
  year: string;
};

const PROJECT_ROWS: ProjectRow[] = [
  { id: 'resume', name: 'Portfolio Resume', status: 'current', year: '2026' },
  { id: 'dashboard', name: 'Admin Dashboard', status: 'featured', year: '2025' },
  { id: 'landing', name: 'Landing Page', status: 'published', year: '2024' },
];

const STATUS_LABEL: Record<
  ProjectRow['status'],
  { variant: 'accent' | 'outline' | 'success'; label: string }
> = {
  current: { variant: 'accent', label: 'Current' },
  featured: { variant: 'outline', label: 'Featured' },
  published: { variant: 'success', label: 'Published' },
};

const BADGE_PROPS: TableProps<ProjectRow> = {
  caption: 'Projects',
  getKey: (row) => row.id,
  rows: PROJECT_ROWS,
  columns: [
    { key: 'name', header: 'Project' },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <Badge variant={STATUS_LABEL[row.status].variant} size="sm">
          {STATUS_LABEL[row.status].label}
        </Badge>
      ),
    },
    { key: 'year', header: 'Year', align: 'right' },
  ],
};

type JobRow = {
  id: string;
  company: string;
  position: string;
  period: string;
  current: boolean;
};

const JOB_ROWS: JobRow[] = [
  {
    id: 'acme',
    company: 'Acme Corp',
    position: 'Senior Frontend Engineer',
    period: '2022 — Present',
    current: true,
  },
  {
    id: 'initech',
    company: 'Initech',
    position: 'Frontend Engineer',
    period: '2019 — 2022',
    current: false,
  },
  {
    id: 'globex',
    company: 'Globex',
    position: 'Junior Developer',
    period: '2017 — 2019',
    current: false,
  },
];

const TWO_LINE_PROPS: TableProps<JobRow> = {
  caption: 'Work history',
  getKey: (row) => row.id,
  rows: JOB_ROWS,
  columns: [
    {
      key: 'company',
      header: 'Role',
      render: (row) => (
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{row.company}</strong>
          <span style={{ color: 'var(--color-text-secondary)' }}>{row.position}</span>
        </span>
      ),
    },
    {
      key: 'current',
      header: 'Status',
      align: 'center',
      render: (row) =>
        row.current ? (
          <Badge variant="accent" size="sm">
            Current
          </Badge>
        ) : null,
    },
    { key: 'period', header: 'Period', align: 'right' },
  ],
};

type LinkRow = {
  id: string;
  name: string;
  url: string;
  stack: string;
};

const LINK_ROWS: LinkRow[] = [
  {
    id: 'resume',
    name: 'Live portfolio',
    url: 'https://example.com',
    stack: 'React, Vite, SCSS',
  },
  {
    id: 'dashboard',
    name: 'Case study',
    url: 'https://example.com/dashboard',
    stack: 'React, Redux Toolkit',
  },
  {
    id: 'source',
    name: 'Source code',
    url: 'https://example.com/source',
    stack: 'TypeScript',
  },
];

const LINK_PROPS: TableProps<LinkRow> = {
  caption: 'Project links',
  getKey: (row) => row.id,
  rows: LINK_ROWS,
  columns: [
    {
      key: 'name',
      header: 'Resource',
      render: (row) => (
        <a href={row.url} target="_blank" rel="noreferrer">
          {row.name}
        </a>
      ),
    },
    { key: 'stack', header: 'Stack' },
    { key: 'url', header: 'URL', hideOnMobile: true },
  ],
};

const ACTIONS_PROPS: TableProps<JobRow> = {
  caption: 'Manage jobs',
  getKey: (row) => row.id,
  rows: JOB_ROWS,
  columns: [
    { key: 'company', header: 'Company' },
    { key: 'period', header: 'Period', align: 'right', hideOnMobile: true },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <span style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
          <Button size="xs" variant="ghost" type="button" aria-label={`Edit ${row.company}`}>
            Edit
          </Button>
          <Button size="xs" variant="ghost" type="button" aria-label={`Duplicate ${row.company}`}>
            Duplicate
          </Button>
          <Button size="xs" variant="danger" type="button" aria-label={`Delete ${row.company}`}>
            Delete
          </Button>
        </span>
      ),
    },
  ],
};

type DocRow = { id: string; title: string; summary: string; updated: string };

const LONG_ROWS: DocRow[] = [
  {
    id: 'setup',
    title: 'Local setup',
    summary:
      'Clone the repository, install dependencies with npm ci, copy the environment template and run the dev server — the whole walkthrough including common pitfalls on Windows.',
    updated: '2026-09-14',
  },
  {
    id: 'release',
    title: 'Release checklist',
    summary:
      'Run the full validation gate, verify the bundle budget, check axe against the committed baseline, then squash-merge the pull request into dev.',
    updated: '2026-10-02',
  },
];

const LONG_CONTENT_PROPS: TableProps<DocRow> = {
  caption: 'Documentation',
  getKey: (row) => row.id,
  rows: LONG_ROWS,
  columns: [
    { key: 'title', header: 'Article', width: '30%' },
    { key: 'summary', header: 'Summary' },
    { key: 'updated', header: 'Updated', align: 'right', hideOnMobile: true },
  ],
};

type MobileRow = { id: string; name: string; category: string; notes: string; years: number };

const MOBILE_ROWS: MobileRow[] = [
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    notes: 'Core UI library used across the showcase and the admin area.',
    years: 6,
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Backend',
    notes: 'Runtime for tooling scripts and local development servers.',
    years: 4,
  },
];

const HIDE_ON_MOBILE_PROPS: TableProps<MobileRow> = {
  caption: 'Technology inventory',
  getKey: (row) => row.id,
  rows: MOBILE_ROWS,
  columns: [
    { key: 'name', header: 'Technology' },
    { key: 'category', header: 'Category', hideOnMobile: true },
    { key: 'notes', header: 'Notes' },
    { key: 'years', header: 'Years', align: 'right', hideOnMobile: true },
  ],
};

// ============================================
// Stories
// ============================================

/**
 * Storybook types a generic component's args as `TableProps<unknown>`.
 * The assertion points in the safe direction (`TableProps<unknown>` is
 * assignable to every `TableProps<T>`), so fixtures stay strongly typed.
 */
function storyArgs<T>(props: TableProps<T>): TableProps<unknown> {
  return props as TableProps<unknown>;
}

export const Iconic: Story = {
  args: storyArgs(ICONIC_PROPS),
};

export const BadgeCell: Story = {
  args: storyArgs(BADGE_PROPS),
};

export const TwoLineCell: Story = {
  args: storyArgs(TWO_LINE_PROPS),
};

export const LinkCell: Story = {
  args: storyArgs(LINK_PROPS),
};

export const ActionGroup: Story = {
  args: storyArgs(ACTIONS_PROPS),
};

export const Loading: Story = {
  args: storyArgs({ ...ICONIC_PROPS, loading: true }),
};

export const Empty: Story = {
  args: storyArgs({
    ...ICONIC_PROPS,
    rows: [],
    emptyState: <p>No technologies yet. Add the first one from the admin panel.</p>,
  }),
};

export const LongContent: Story = {
  args: storyArgs(LONG_CONTENT_PROPS),
};

export const HideOnMobile: Story = {
  args: storyArgs(HIDE_ON_MOBILE_PROPS),
};
