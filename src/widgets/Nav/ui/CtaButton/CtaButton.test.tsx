// ============================================
// Nav Widget - CtaButton tests (T5, decisions R4/R7)
// ============================================
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CTA_HREF } from '../../model/constants';
import { CtaButton } from './CtaButton';

// Identity i18n: t(key) => key — assertions prove the i18n KEY was rendered,
// never a hardcoded literal (i18n-first; same mock as Nav.test.tsx / NavItem.test.tsx).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('CtaButton: resume CTA (T5, decisions R4/R7)', () => {
  it('desktop: renders a link with visible i18n text targeting CTA_HREF (R7)', () => {
    render(<CtaButton variant="desktop" />);

    const link = screen.getByRole('link', { name: 'getResume' });
    expect(link).toHaveAttribute('href', CTA_HREF);
    // Identity-mocked t → the visible label IS the i18n key, never a literal.
    expect(link).toHaveTextContent('getResume');
  });

  // Triangulation: different input (variant="mobile") exercises the OTHER
  // render branch — compact icon-only anchor with an accessible name (R4).
  it('mobile: renders a compact icon-only link with an i18n aria-label (R4)', () => {
    render(<CtaButton variant="mobile" />);

    const link = screen.getByRole('link', { name: 'getResume' });
    expect(link).toHaveAttribute('href', CTA_HREF);
    expect(link).toHaveAttribute('aria-label', 'getResume');
    // Icon-only: no visible text label (the affordance is the icon).
    expect(link).not.toHaveTextContent('getResume');
  });

  // Source guard: the HREF must come from CTA_HREF — the '#contact' literal
  // may NOT appear inside the component (decision R7 single-source).
  it("imports CTA_HREF — never the '#contact' literal (R7)", () => {
    const source = readFileSync(resolve(__dirname, './CtaButton.tsx'), 'utf8');

    expect(source).toContain('CTA_HREF');
    // Quoted-literal form: catches a copied href="#contact" but not prose mentions.
    expect(source).not.toContain("'#contact'");
    expect(source).not.toContain('"#contact"');
  });
});
