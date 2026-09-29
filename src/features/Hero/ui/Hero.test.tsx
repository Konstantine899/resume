import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SOCIAL_LINKS } from '@/entities/Developer';
import { Hero } from './Hero';

// Mock i18n (existing repo pattern — useLanguage returns t passthrough)
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Code теперь decoupled от Toast; Hero подключает тост через useToast — даём no-op
vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: vi.fn() }),
}));

// Visual leaf components that are not the integration target — keep the test
// focused on Hero content rendering.
vi.mock('@/shared/ui/Code', () => ({
  Code: () => <div data-testid="mock-code" />,
}));
vi.mock('./SkillsCode/SkillsCode', () => ({
  default: () => <div data-testid="mock-skills-code" />,
}));
vi.mock('./HeroAvatar', () => ({
  HeroAvatar: () => <div data-testid="mock-avatar" />,
}));

describe('Hero: recruiter-audit P0/P1 content', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the hero content', () => {
    render(<Hero />);

    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('mock-code')).toBeInTheDocument();
  });

  it('renders the role + experience line via i18n keys (NO age)', () => {
    render(<Hero />);

    const roleLine = screen.getByTestId('hero-role-line');
    expect(roleLine).toHaveTextContent('heroRole');
    expect(roleLine).toHaveTextContent('heroExperience');
    // Audit P0: age and the old yearsOfExperience key are gone for good.
    expect(roleLine).not.toHaveTextContent('age');
    expect(screen.queryByText('yearsOfExperience')).toBeNull();
    expect(screen.queryByText('age')).toBeNull();
  });

  it('renders the stack badges from the shared PROFILE_STACK', () => {
    render(<Hero />);

    const badges = screen.getByTestId('hero-stack-badges');
    for (const tech of ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker']) {
      expect(within(badges).getByText(tech)).toBeInTheDocument();
    }
  });

  it('renders the CTA pair pointing at #contact (no fake PDF link)', () => {
    render(<Hero />);

    const actions = screen.getByTestId('hero-actions');
    const links = within(actions).getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['#contact', '#contact']);
    // i18n-first: labels are the keys, never literals.
    expect(links[0]).toHaveTextContent('downloadResume');
    expect(links[1]).toHaveTextContent('getInTouch');
  });

  it('renders the social profile links with i18n aria-labels', () => {
    render(<Hero />);

    const socials = screen.getByTestId('hero-socials');
    const links = within(socials).getAllByRole('link');
    expect(links).toHaveLength(SOCIAL_LINKS.length);
    SOCIAL_LINKS.forEach((link) => {
      const anchor = within(socials).getByRole('link', { name: link.labelKey });
      expect(anchor).toHaveAttribute('href', link.href);
    });
  });

  it('does NOT link anywhere fake: every Hero link resolves to #contact or a real profile', () => {
    render(<Hero />);

    const hero = screen.getByTestId('hero');
    const hrefs = within(hero)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href === '#contact' || SOCIAL_LINKS.some((s) => s.href === href)).toBe(true);
    }
  });
});
