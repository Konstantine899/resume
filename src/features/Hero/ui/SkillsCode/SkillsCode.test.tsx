import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PROFILE_STACK } from '@/entities/Developer';
import SkillsCode from './SkillsCode';

// Identity i18n — assertions prove the i18n KEYS were wired (no literals).
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

describe('SkillsCode: selling-oriented developer.ts (recruiter audit P0/P1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders role + focus via i18n keys — no age, no personal data', () => {
    const { container } = render(<SkillsCode />);
    const text = container.textContent ?? '';

    expect(text).toContain('heroRole');
    expect(text).toContain('heroFocus');
    // Audit P0: the old age/yearsOfExperience fields are gone for good.
    expect(text).not.toContain('age');
    expect(text).not.toContain('yearsOfExperience');
    expect(text).not.toContain('36');
  });

  it('keeps the stack array in sync with the shared PROFILE_STACK (single source)', () => {
    const { container } = render(<SkillsCode />);
    const text = container.textContent ?? '';

    expect(text).toContain('stack');
    for (const tech of PROFILE_STACK) {
      expect(text).toContain(`'${tech}'`);
    }
    // Exactly the profile stack — nothing extra, nothing missing.
    const quoted = text.match(/'[^']+'/g) ?? [];
    const stackEntries = quoted.filter((entry) =>
      (PROFILE_STACK as readonly string[]).includes(entry.slice(1, -1))
    );
    expect(stackEntries).toHaveLength(PROFILE_STACK.length);
  });

  it('exposes the property names as code identifiers (const developer object)', () => {
    const { container } = render(<SkillsCode />);
    const text = container.textContent ?? '';

    expect(text).toContain('const');
    expect(text).toContain('developer');
    expect(text).toContain('role');
    expect(text).toContain('focus');
  });
});
