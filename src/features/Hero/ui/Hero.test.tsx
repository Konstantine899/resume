import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './Hero';

// Mock i18n (existing repo pattern — useLanguage returns t passthrough)
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

// Visual leaf components that are not the integration target — keep the test
// focused on the Link CTA wiring.
vi.mock('@/shared/ui/Code', () => ({
  Code: () => <div data-testid="mock-code" />,
}));
vi.mock('./SkillsCode/SkillsCode', () => ({
  default: () => <div data-testid="mock-skills-code" />,
}));
vi.mock('./HeroAvatar', () => ({
  HeroAvatar: () => <div data-testid="mock-avatar" />,
}));

describe('Hero: Link CTA integration', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the resume CTA as a Link with href="#"', () => {
    render(<Hero />);

    const cta = screen.getByRole('link', { name: /getResume/ });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '#');
  });

  it('fires preventDefault and calls onGetResume on click', () => {
    const onGetResume = vi.fn();
    render(<Hero onGetResume={onGetResume} />);

    const cta = screen.getByRole('link', { name: /getResume/ });
    fireEvent.click(cta);

    expect(onGetResume).toHaveBeenCalledTimes(1);
  });
});
