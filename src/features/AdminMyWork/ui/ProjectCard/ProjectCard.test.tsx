// ============================================
// ProjectCard tests (mywork-detail-table WU-1, SPEC R-1..R-4)
// ============================================
//
// RED-first contract: default collapsed (caption outside the Card, no
// table in the DOM), expand/collapse ARA roundtrip (stable contentId,
// aria-controls ONLY on the collapse button), the read-only detail
// table (scalar rows + data-gated optional rows), header badges, and
// the header action callbacks. Pure props component — no redux/toast
// mocks: ProjectCard never dispatches (persist-THEN-dispatch lives in
// MyWorkEditorList, R-3).

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Project } from '@/entities/Project';
import { ProjectCard } from './ProjectCard';

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// The `title` option renders as `${key}:${title}` (expand/collapse
// aria-labels stay addressable).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { title?: string }) =>
      options?.title !== undefined ? `${key}:${options.title}` : key,
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    isTransitioning: false,
  }),
}));

const makeProject = (patch: Partial<Project> = {}): Project => ({
  id: 'p1',
  title: 'Shop',
  description: { en: 'An ecommerce platform', ru: 'Интернет-магазин' },
  techIcons: ['react', 'nextjs'],
  link: 'https://shop.example',
  image: '/images/projects/shop.png',
  category: 'ecommerce',
  status: 'completed',
  featured: true,
  role: { en: 'Lead', ru: 'Тимлид' },
  metrics: ['1M+ users', 'p95 120ms'],
  year: 2024,
  ...patch,
});

const PROJECT = makeProject();

const renderCard = (
  project: Project = PROJECT,
  props: Partial<React.ComponentProps<typeof ProjectCard>> = {}
) => {
  const defaults = { onEdit: vi.fn(), onDelete: vi.fn() };
  const merged = { ...defaults, ...props };
  render(<ProjectCard project={project} {...merged} />);
  return merged;
};

const expandCard = (title = PROJECT.title) =>
  fireEvent.click(screen.getByRole('button', { name: `adminMyWorkExpand:${title}` }));

describe('ProjectCard', () => {
  // ---- R-1: collapse chrome ----

  it('is collapsed by default: caption outside the Card, no table in the document', () => {
    renderCard();

    expect(screen.getByText(PROJECT.title)).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
    expect(
      screen.getByRole('button', { name: `adminMyWorkExpand:${PROJECT.title}` })
    ).toHaveAttribute('aria-expanded', 'true');
    // Skills ARA gotcha: expanded state carries NO aria-controls (the
    // target is unmounted — a dangling idref fails axe 4.13).
    expect(
      screen.getByRole('button', { name: `adminMyWorkExpand:${PROJECT.title}` })
    ).not.toHaveAttribute('aria-controls');
  });

  it('expands into the detail table with a stable content id, and collapses back', () => {
    renderCard();

    expandCard();

    const collapse = screen.getByRole('button', {
      name: `adminMyWorkCollapse:${PROJECT.title}`,
    });
    expect(collapse).toHaveAttribute('aria-expanded', 'false');
    const contentId = collapse.getAttribute('aria-controls');
    expect(contentId).toBeTruthy();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(document.getElementById(contentId as string)).not.toBeNull();

    fireEvent.click(collapse);

    expect(screen.queryByRole('table')).toBeNull();
    const expand = screen.getByRole('button', {
      name: `adminMyWorkExpand:${PROJECT.title}`,
    });
    expect(expand).toHaveAttribute('aria-expanded', 'true');
    expect(expand).not.toHaveAttribute('aria-controls');
  });

  // ---- R-2: header ----

  it('renders the expanded header with the title and status/featured badges', () => {
    renderCard();
    expandCard();

    // Scoped to the heading: the status string ALSO lives in the table
    // cell below (getByText would be ambiguous).
    const header = screen.getByRole('heading', { level: 3, name: /Shop/ });
    expect(header).toBeInTheDocument();
    expect(within(header).getByText('completed')).toBeInTheDocument();
    expect(within(header).getByText('projectFieldFeatured')).toBeInTheDocument();
  });

  it('omits the featured badge when the record is not featured', () => {
    renderCard(makeProject({ featured: false }));
    expandCard();

    expect(screen.queryByText('projectFieldFeatured')).toBeNull();
  });

  // ---- R-2: header actions (D2 parity) ----

  it('invokes onEdit with the project and onDelete with the id from the header actions', () => {
    const { onEdit, onDelete } = renderCard();
    expandCard();

    fireEvent.click(screen.getByRole('button', { name: 'projectEdit' }));
    expect(onEdit).toHaveBeenCalledWith(PROJECT);

    fireEvent.click(screen.getByRole('button', { name: 'projectDelete' }));
    expect(onDelete).toHaveBeenCalledWith(PROJECT.id);
  });

  it('exposes the header actions row under a stable per-record test id', () => {
    renderCard();
    expandCard();

    expect(screen.getByTestId(`project-card-actions-${PROJECT.id}`)).toBeInTheDocument();
  });

  // ---- R-4: honest data (field rows) ----

  it('renders scalar field rows for the full record', () => {
    renderCard();
    expandCard();

    expect(screen.getByText('projectFieldTitle')).toBeInTheDocument();
    // Scoped: the title ALSO lives in the h3 header.
    expect(within(screen.getByRole('table')).getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('projectFieldCategory')).toBeInTheDocument();
    expect(screen.getByText('ecommerce')).toBeInTheDocument();
    expect(screen.getByText('projectFieldStatus')).toBeInTheDocument();
    expect(screen.getByText('projectFieldYear')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('projectFieldLink')).toBeInTheDocument();
    expect(screen.getByText('https://shop.example')).toBeInTheDocument();
    expect(screen.getByText('projectFieldRole')).toBeInTheDocument();
    expect(screen.getByText('EN: Lead')).toBeInTheDocument();
    expect(screen.getByText('projectFieldTechIcons')).toBeInTheDocument();
    expect(screen.getByText('react, nextjs')).toBeInTheDocument();
    expect(screen.getByText('projectFieldImage')).toBeInTheDocument();
    expect(screen.getByText('/images/projects/shop.png')).toBeInTheDocument();
  });

  it('renders the description row with both locale lines', () => {
    renderCard();
    expandCard();

    expect(screen.getByText('projectFieldDescription')).toBeInTheDocument();
    expect(screen.getByText('EN: An ecommerce platform')).toBeInTheDocument();
    expect(screen.getByText('RU: Интернет-магазин')).toBeInTheDocument();
  });

  it('renders one row per metric with the label riding the first row', () => {
    renderCard();
    expandCard();

    expect(screen.getByText('projectFieldMetrics')).toBeInTheDocument();
    expect(screen.getByText('1M+ users')).toBeInTheDocument();
    expect(screen.getByText('p95 120ms')).toBeInTheDocument();
  });

  it('omits rows for absent optional fields (honest data)', () => {
    renderCard(
      makeProject({
        link: null,
        year: undefined,
        role: undefined,
        metrics: undefined,
        techIcons: [],
        image: '',
        description: { en: '', ru: '' },
        featured: false,
      })
    );
    expandCard();

    expect(screen.queryByText('projectFieldLink')).toBeNull();
    expect(screen.queryByText('projectFieldYear')).toBeNull();
    expect(screen.queryByText('projectFieldRole')).toBeNull();
    expect(screen.queryByText('projectFieldTechIcons')).toBeNull();
    expect(screen.queryByText('projectFieldMetrics')).toBeNull();
    expect(screen.queryByText('projectFieldImage')).toBeNull();
    expect(screen.queryByText('projectFieldDescription')).toBeNull();
    expect(screen.queryByText('projectFieldFeatured')).toBeNull();
    // Core fields survive the empty fixture.
    expect(screen.getByText('projectFieldTitle')).toBeInTheDocument();
    expect(screen.getByText('projectFieldStatus')).toBeInTheDocument();
  });

  it('renders only the non-empty locale line of the description', () => {
    renderCard(makeProject({ description: { en: 'Only english', ru: '' } }));
    expandCard();

    expect(screen.getByText('EN: Only english')).toBeInTheDocument();
    // Anchored to THIS fixture's ru string: the role row also carries a
    // `RU: …` line (Тимлид) — a bare /^RU:/ would match it too.
    expect(screen.queryByText(/^RU: Интернет/)).toBeNull();
  });

  // ---- data-testid contract (page-test harness) ----

  it('accepts a root test id pass-through', () => {
    renderCard(PROJECT, { testId: 'my-root' });

    expect(screen.getByTestId('my-root')).toBeInTheDocument();
  });
});
