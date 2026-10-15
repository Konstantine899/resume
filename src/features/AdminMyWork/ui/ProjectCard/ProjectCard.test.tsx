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

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Project } from '@/entities/Project';
import { ProjectCard } from './ProjectCard';

// Deterministic labels: t(key) => key — assertions target raw i18n keys.
// Rendered options as `${key}:${value}` (expand/collapse/field-tooltip
// aria-labels stay addressable).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: Record<string, string>) =>
      options ? `${key}:${Object.values(options)[0]}` : key,
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    isTransitioning: false,
  }),
}));

// Redux/persist/toast seam for the field-action handlers (rev.3 WU-4) —
// JobCard parity: the card dispatches metric/clear actions itself.
const { holder, dispatched, persistMock, addToastMock } = vi.hoisted(() => ({
  holder: { projects: [] as Project[] },
  dispatched: [] as Array<{ type: string; payload: unknown }>,
  persistMock: vi.fn(() => true),
  addToastMock: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => (action: { type: string; payload: unknown }) => dispatched.push(action),
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ myWork: holder.projects }),
}));

vi.mock('../../model/services/storage', () => ({
  persistProjects: (projects: unknown[]) => persistMock(projects),
}));

vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: addToastMock }),
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

  // ---- R-A1: row-level actions on the COLLAPSED caption (issue #242) ----

  it('shows edit + delete buttons on the collapsed caption (every row carries actions)', () => {
    renderCard();

    // Collapsed: no expand needed — the actions live beside the caption.
    expect(screen.getByRole('button', { name: 'projectEdit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'projectDelete' })).toBeInTheDocument();
  });

  it('invokes onEdit/onDelete from the collapsed caption without expanding', () => {
    const { onEdit, onDelete } = renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'projectEdit' }));
    expect(onEdit).toHaveBeenCalledWith(PROJECT);

    fireEvent.click(screen.getByRole('button', { name: 'projectDelete' }));
    expect(onDelete).toHaveBeenCalledWith(PROJECT.id);
    // The card stayed collapsed (no table leak from an action click).
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('reveals action tooltips on hover (A14: kit Tooltip is hover-only)', async () => {
    renderCard();

    const edit = screen.getByRole('button', { name: 'projectEdit' });
    fireEvent.mouseEnter(edit);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('projectEdit');
    fireEvent.mouseLeave(edit);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
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

// ---- rev.3 (mywork-field-actions): per-row actions in the detail table ----

describe('ProjectCard field actions (rev.3)', () => {
  beforeEach(() => {
    holder.projects = [PROJECT];
    dispatched.length = 0;
    persistMock.mockClear();
    persistMock.mockImplementation(() => true);
    addToastMock.mockClear();
  });

  const actionsCell = (rowKey: string) =>
    document.querySelector(`[data-testid="project-field-actions-p1-${rowKey}"]`);

  const metricActionsCell = (index: number) =>
    document.querySelector(`[data-testid="project-metric-actions-p1-${index}"]`);

  it('scalar rows carry a Pencil wired to onEditField with the row key', () => {
    const onEditField = vi.fn();
    renderCard(PROJECT, { onEditField });
    expandCard();

    const cell = actionsCell('title');
    expect(cell).not.toBeNull();
    const pencil = within(cell as HTMLElement).getByRole('button', {
      name: 'adminMyWorkEditFieldTitle:projectFieldTitle',
    });
    fireEvent.click(pencil);
    expect(onEditField).toHaveBeenCalledWith(PROJECT, 'title');

    const yearCell = actionsCell('year');
    expect(yearCell).not.toBeNull();
    fireEvent.click(
      within(yearCell as HTMLElement).getByRole('button', {
        name: 'adminMyWorkEditFieldTitle:projectFieldYear',
      })
    );
    expect(onEditField).toHaveBeenCalledWith(PROJECT, 'year');
  });

  it('the image row renders NO actions at all (R-B1 exception)', () => {
    renderCard();
    expandCard();

    expect(actionsCell('image')).toBeNull();
  });

  it('clear (Trash2) appears only on contract-clearable rows', () => {
    renderCard();
    expandCard();

    // All editable rows carry actions (9 scalars incl. title etc.); the
    // CLEAR button specifically must exist on year/link/role/featured only.
    for (const rowKey of ['year', 'link', 'role', 'featured']) {
      const cell = actionsCell(rowKey);
      expect(
        within(cell as HTMLElement).getByRole('button', { name: 'adminMyWorkClearField' })
      ).toBeInTheDocument();
    }
    for (const rowKey of ['title', 'category', 'status', 'description', 'techIcons']) {
      const cell = actionsCell(rowKey);
      expect(
        within(cell as HTMLElement).queryByRole('button', { name: 'adminMyWorkClearField' })
      ).toBeNull();
    }
  });

  it('clearing link persists { link: null } FIRST, then dispatches the same patch (§3)', () => {
    renderCard();
    expandCard();

    fireEvent.click(
      within(actionsCell('link') as HTMLElement).getByRole('button', {
        name: 'adminMyWorkClearField',
      })
    );

    expect(persistMock).toHaveBeenCalledTimes(1);
    const persisted = persistMock.mock.calls[0][0] as Project[];
    expect(persisted[0].link).toBeNull();
    expect(typeof persisted[0].updatedAt).toBe('string');
    expect(dispatched).toHaveLength(1);
    const payload = dispatched[0].payload as { id: string; patch: { link: null } };
    expect(payload.id).toBe('p1');
    expect(payload.patch.link).toBeNull();
  });

  it('persist failure keeps the store untouched and toasts projectSaveError', () => {
    persistMock.mockImplementation(() => false);
    renderCard();
    expandCard();

    fireEvent.click(
      within(actionsCell('year') as HTMLElement).getByRole('button', {
        name: 'adminMyWorkClearField',
      })
    );

    expect(dispatched).toHaveLength(0);
    expect(addToastMock).toHaveBeenCalledWith({
      message: 'projectSaveError',
      type: 'error',
    });
  });

  it('metric rows: up/down disabled at the edges', () => {
    renderCard();
    expandCard();

    const first = metricActionsCell(0) as HTMLElement;
    const second = metricActionsCell(1) as HTMLElement;
    expect(within(first).getByRole('button', { name: 'adminMyWorkMetricUp' })).toBeDisabled();
    expect(within(first).getByRole('button', { name: 'adminMyWorkMetricDown' })).toBeEnabled();
    expect(within(second).getByRole('button', { name: 'adminMyWorkMetricDown' })).toBeDisabled();
  });

  it('a single metric disables remove', () => {
    holder.projects = [{ ...PROJECT, metrics: ['Only'] }];
    renderCard({ ...PROJECT, metrics: ['Only'] });
    expandCard();

    expect(
      within(metricActionsCell(0) as HTMLElement).getByRole('button', {
        name: 'adminMyWorkRemoveMetric',
      })
    ).toBeDisabled();
  });

  it('metric pencil opens the field modal with the indexed key', () => {
    const onEditField = vi.fn();
    renderCard(PROJECT, { onEditField });
    expandCard();

    fireEvent.click(
      within(metricActionsCell(1) as HTMLElement).getByRole('button', {
        name: 'adminMyWorkEditFieldTitle:projectFieldMetrics',
      })
    );
    expect(onEditField).toHaveBeenCalledWith(PROJECT, 'metric-1');
  });

  it('move metric down swaps entries through the persist pipeline', () => {
    renderCard();
    expandCard();

    fireEvent.click(
      within(metricActionsCell(0) as HTMLElement).getByRole('button', {
        name: 'adminMyWorkMetricDown',
      })
    );

    const persisted = persistMock.mock.calls[0][0] as Project[];
    expect(persisted[0].metrics).toEqual(['p95 120ms', '1M+ users']);
    const payload = dispatched[0].payload as { patch: { metrics: string[] } };
    expect(payload.patch.metrics).toEqual(['p95 120ms', '1M+ users']);
  });

  it('remove metric drops the entry', () => {
    renderCard();
    expandCard();

    fireEvent.click(
      within(metricActionsCell(0) as HTMLElement).getByRole('button', {
        name: 'adminMyWorkRemoveMetric',
      })
    );

    const persisted = persistMock.mock.calls[0][0] as Project[];
    expect(persisted[0].metrics).toEqual(['p95 120ms']);
  });

  it('the last remaining metric cannot be removed (remove stays disabled)', () => {
    holder.projects = [{ ...PROJECT, metrics: ['Only'] }];
    renderCard({ ...PROJECT, metrics: ['Only'] });
    expandCard();

    fireEvent.click(
      within(metricActionsCell(0) as HTMLElement).getByRole('button', {
        name: 'adminMyWorkRemoveMetric',
      })
    );

    // Disabled button: no persist, no dispatch.
    expect(persistMock).not.toHaveBeenCalled();
    expect(dispatched).toHaveLength(0);
  });
});
