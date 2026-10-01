// ============================================
// StatCard — dashboard metric card (admin-panel plan WU-4)
// ============================================
//
// Identity i18n (t(key) => key): assertions prove the metric's labelKey is
// resolved through t(), never a hardcoded string (i18n-first). The Card is
// MOCKED with a marker element so the test pins the "stat card sits on the
// shared kit Card" criterion structurally, independent of CSS-module hashes.

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mockAdminMetrics } from '../model/mockAdminMetrics';
import type { AdminMetric } from '../model/types';
import { StatCard } from './StatCard';

// Typed access into the shared mock without `!` (no-non-null-assertion).
const pickMetric = (id: string): AdminMetric => {
  const found = mockAdminMetrics.find((metric) => metric.id === id);
  if (!found) throw new Error(`mock metric "${id}" not found`);
  return found;
};

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    toggleLanguage: vi.fn(),
    t: (key: string) => key,
    isTransitioning: false,
  }),
}));

vi.mock('@/shared/ui/Card', () => ({
  Card: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="kit-card">{children}</div>
  ),
}));

describe('StatCard', () => {
  it('renders the metric label as an i18n KEY and the raw value', () => {
    const metric = pickMetric('projects');
    render(<StatCard metric={metric} />);

    expect(screen.getByText(metric.labelKey)).toBeInTheDocument();
    expect(screen.getByText(String(metric.value))).toBeInTheDocument();
  });

  it('sits on the shared kit Card', () => {
    const metric = pickMetric('skills');
    render(<StatCard metric={metric} />);

    const card = screen.getByTestId('kit-card');
    expect(card).toContainElement(screen.getByText(metric.labelKey));
    expect(card).toContainElement(screen.getByText(String(metric.value)));
  });
});
