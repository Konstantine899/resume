import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS, getFeaturedProjects } from '@/entities/Project';
import { MyWork } from './MyWork';

// Identity i18n + language 'en' (existing repo pattern).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key, language: 'en' }),
}));
vi.mock('@/shared/ui/AnimatedSection', () => ({
  AnimatedSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="animated-section">{children}</div>
  ),
}));

describe('MyWork: featured projects only (recruiter audit P1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders exactly the featured projects from the entity', () => {
    render(<MyWork />);

    const featured = getFeaturedProjects(PROJECTS);
    expect(featured).toHaveLength(4);
    for (const project of featured) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });

  it('does NOT surface the non-featured projects', () => {
    render(<MyWork />);

    const hidden = PROJECTS.filter((project) => !project.featured);
    expect(hidden.length).toBeGreaterThan(0);
    for (const project of hidden) {
      expect(screen.queryByText(project.title)).not.toBeInTheDocument();
    }
  });

  it('shows the honest role + year on the cards (no invented metrics)', () => {
    render(<MyWork />);

    // Dragonfly is frontend-only in its real stack — role stays honest.
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    // All four featured cards share the grounded year.
    expect(screen.getAllByText('2023')).toHaveLength(4);
    // No metrics data exists → no metric chips rendered.
    expect(screen.queryByText('1M+ users')).not.toBeInTheDocument();
  });
});

// Projects CRUD WU-3 (plan §11, case 4): Design C — the vitrina is still
// store-free; an explicit EMPTY content must win over the seed fallback
// and the empty state must be the i18n key (identity t-mock), not a
// hardcoded English sentence (R-7).
describe('MyWork: empty state through the content prop (WU-3)', () => {
  it('renders the noProjectsYet key when content=[] (no seed fallback)', () => {
    render(<MyWork content={[]} />);

    expect(screen.getByText('noProjectsYet')).toBeInTheDocument();
    // The seed must NOT leak through when the caller passed an empty list.
    for (const project of getFeaturedProjects(PROJECTS)) {
      expect(screen.queryByText(project.title)).not.toBeInTheDocument();
    }
  });
});
