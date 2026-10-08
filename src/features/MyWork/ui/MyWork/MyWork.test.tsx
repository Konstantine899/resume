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
  });

  it('hides both controls when the list fits one page', () => {
    render(<MyWork content={PROJECTS.slice(0, 5)} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
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
    expect(within(group).getByRole('button', { name: '50' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('resets to page 1 on size change (no empty page)', () => {
    render(<MyWork />);

    fireEvent.click(screen.getByRole('button', { name: 'paginationPage:2' }));
    expect(screen.getByText('COVID-19 Tracker')).toBeInTheDocument();

    const group = screen.getByRole('group', { name: 'perPageLabel' });
    fireEvent.click(within(group).getByRole('button', { name: '10' }));

    // 7 <= 10 -> one page: every card back, controls gone (page did NOT stay at 2).
    for (const project of PROJECTS) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
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
