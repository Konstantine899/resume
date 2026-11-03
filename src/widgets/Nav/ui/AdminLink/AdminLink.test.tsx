// ============================================
// Nav Widget - AdminLink tests (T5, decisions R3/R5)
// ============================================
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ADMIN_HREF } from '../../model/constants';
import { AdminLink } from './AdminLink';

// Identity i18n: t(key) => key (same mock as CtaButton.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('AdminLink: admin placeholder (T5, decisions R3/R5)', () => {
  it('renders a plain link to ADMIN_HREF with an i18n aria-label (R3)', () => {
    render(<AdminLink />);

    const link = screen.getByRole('link', { name: 'navAdmin' });
    expect(link).toHaveAttribute('href', ADMIN_HREF);
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
