// ============================================
// Nav Widget - AdminLink tests (T5, decisions R3/R5)
// ============================================
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_HREF } from '../../model/constants';
import { AdminLink } from './AdminLink';

// Identity i18n: t(key) => key (same mock as CtaButton.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('AdminLink: admin placeholder (T5, decisions R3/R5)', () => {
  it('renders an icon-only link to ADMIN_HREF with an i18n aria-label (R3)', () => {
    render(<AdminLink />);

    const link = screen.getByRole('link', { name: 'navAdmin' });
    expect(link).toHaveAttribute('href', ADMIN_HREF);
  });

  // Triangulation: different input (hover) exercises the OTHER behavior —
  // the shared Tooltip surfaces the i18n hint for sighted users (R5).
  it('shows the i18n tooltip on hover (R5)', async () => {
    render(<AdminLink />);

    const link = screen.getByRole('link', { name: 'navAdmin' });
    fireEvent.mouseEnter(link);

    // Real 200ms showDelay — waitFor (1000ms default) observes it.
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('navAdmin');
    });
  });

  // Source guard: the HREF must come from ADMIN_HREF — the '#/admin' literal
  // may NOT appear inside the component (decision R3 single-source).
  it("imports ADMIN_HREF — never the '#/admin' literal (R3)", () => {
    const source = readFileSync(resolve(__dirname, './AdminLink.tsx'), 'utf8');

    expect(source).toContain('ADMIN_HREF');
    // Quoted-literal form: catches a copied href="#/admin" but not prose mentions.
    expect(source).not.toContain("'#/admin'");
    expect(source).not.toContain('"#/admin"');
  });
});
