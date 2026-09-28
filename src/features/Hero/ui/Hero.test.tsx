import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('Hero: renders without the dead resume CTA', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the hero content', () => {
    render(<Hero />);

    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('mock-code')).toBeInTheDocument();
  });

  it('no longer renders the resume CTA link (href="#")', () => {
    render(<Hero />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
