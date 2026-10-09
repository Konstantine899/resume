import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '@/entities/Project';
import { MyWork } from './MyWork';

// Identity i18n + language 'en' (existing repo pattern). Interpolated
// options pass through so kit aria-labels stay distinguishable:
// t('paginationPage', { number: 2 }) -> 'paginationPage:2'.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, options?: { number?: number }) =>
      options?.number !== undefined ? `${key}:${options.number}` : key,
    language: 'en',
  }),
}));
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));

// Owner decision (2026-10-08, spec src/features/MyWork): the vitrina
// surfaces ALL projects — windowed by the pagination controls, the
// featured flag no longer gates visibility.
describe('MyWork: pagination window (spec features/MyWork)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the first window of 5 and hides the rest on page 1', () => {
    render(<MyWork />);

    expect(PROJECTS).toHaveLength(7);
    for (const project of PROJECTS.slice(0, 5)) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
    for (const project of PROJECTS.slice(5)) {
      expect(screen.queryByText(project.title)).not.toBeInTheDocument();
    }
    expect(screen.getByRole('group', { name: 'perPageLabel' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('switches to page 2 with exactly the remaining 2 cards', () => {
    render(<MyWork />);

    fireEvent.click(screen.getByRole('button', { name: 'paginationPage:2' }));

    for (const project of PROJECTS.slice(5)) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
    for (const project of PROJECTS.slice(0, 5)) {
      expect(screen.queryByText(project.title)).not.toBeInTheDocument();
    }

    // Directive (2026-10-09): a pagination click must not hide the controls.
    expect(screen.getByRole('group', { name: 'perPageLabel' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('keeps both controls when the list fits one page (owner directive 2026-10-09)', () => {
    render(<MyWork content={PROJECTS.slice(0, 5)} />);

    // 5 <= 5 -> one page, yet BOTH controls stay: hiding them strands the
    // user with no way to pick another size (the exact trap the owner hit).
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'perPageLabel' })).toBeInTheDocument();
  });

  it('keeps controls hidden for the empty list (empty state only)', () => {
    render(<MyWork content={[]} />);

    expect(screen.getByText('noProjectsYet')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('exposes the size group with aria-pressed state (5 default)', () => {
    render(<MyWork />);

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    expect(within(group).getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(group).getByRole('button', { name: '10' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(within(group).getByRole('button', { name: '20' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    // Owner directive (2026-10-09): the old third size 50 is gone.
    expect(within(group).queryByRole('button', { name: '50' })).not.toBeInTheDocument();
  });

  // Owner layout directive (2026-10-09): the size selector sits under the
  // section heading (above the cards), pagination stays at the bottom.
  it('places the size group above the cards and the pagination below them', () => {
    render(<MyWork />);

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    const nav = screen.getByRole('navigation');
    // Seed has 7 items (asserted in the first test); the default keeps tsc
    // happy under noUncheckedIndexedAccess without a banned `!` assertion.
    const [firstProject = { title: '' }] = PROJECTS;
    const firstCardTitle = screen.getByText(firstProject.title);

    // Size group precedes the grid (DOM order: heading -> group -> cards).
    expect(
      group.compareDocumentPosition(firstCardTitle) & Node.DOCUMENT_POSITION_FOLLOWING
    ).not.toBe(0);
    // Pagination follows the cards (bottom of the section).
    expect(firstCardTitle.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(
      0
    );
  });

  // Owner directive (2026-10-09): switching pages returns the viewport to
  // the section top — same target (#work) and CSS offsets as clicking the
  // Nav anchor link.
  it('scrolls to the section top on page switch (nav anchor parity)', () => {
    render(<MyWork />);

    const section = document.getElementById('work');
    if (!section) throw new Error('section #work missing');
    const scrollSpy = vi.spyOn(section, 'scrollIntoView');

    fireEvent.click(screen.getByRole('button', { name: 'paginationPage:2' }));

    expect(scrollSpy).toHaveBeenCalledWith({ block: 'start' });
  });

  it('resets to page 1 on size change (no empty page)', () => {
    render(<MyWork />);

    fireEvent.click(screen.getByRole('button', { name: 'paginationPage:2' }));
    expect(screen.getByText('COVID-19 Tracker')).toBeInTheDocument();

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    fireEvent.click(within(group).getByRole('button', { name: '10' }));

    // 7 <= 10 -> one page: every card back, page clamped to 1; controls STAY
    // (owner directive 2026-10-09) — otherwise size 5 would be unreachable.
    for (const project of PROJECTS) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole('group', { name: 'perPageLabel' })).getByRole('button', {
        name: '10',
      })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});

// Card data honesty: role/year/no invented metrics — a fixed featured subset
// keeps this independent of the pagination window.
describe('MyWork: honest card data', () => {
  it('shows the honest role + year on the cards (no invented metrics)', () => {
    render(<MyWork content={PROJECTS.filter((project) => project.featured)} />);

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getAllByText('2023')).toHaveLength(4);
    expect(screen.queryByText('1M+ users')).not.toBeInTheDocument();
  });
});

// Projects CRUD WU-3: Design C — `content` is the single source of truth.
// An explicit empty list must render the empty state, NOT the seed.
describe('MyWork: empty state through the content prop (WU-3)', () => {
  it('renders the noProjectsYet key when content=[] (no seed fallback)', () => {
    render(<MyWork content={[]} />);

    expect(screen.getByText('noProjectsYet')).toBeInTheDocument();

    // The seed must NOT leak through when the caller passed an empty list.
    for (const project of PROJECTS) {
      expect(screen.queryByText(project.title)).not.toBeInTheDocument();
    }
  });
});
