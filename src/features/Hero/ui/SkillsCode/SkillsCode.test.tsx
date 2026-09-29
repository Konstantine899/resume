import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PROFILE_STACK } from '@/entities/Developer';
import { Code } from '@/shared/ui/Code';
import SkillsCode from './SkillsCode';

// `Code` (CodeBlockUi) reads its labels through i18n — identity keys are fine
// here, the assertions below are about the snippet, not the chrome.
vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

const ROLE = 'Senior Full-Stack Developer';
const FOCUS = 'Accessible, tested and maintainable web applications';

describe('SkillsCode: selling-oriented developer.ts (recruiter audit P0/P1)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the role + focus passed in as props — no age, no personal data', () => {
    const { container } = render(<SkillsCode role={ROLE} focus={FOCUS} />);
    const text = container.textContent ?? '';

    expect(text).toContain(ROLE);
    expect(text).toContain(FOCUS);
    // Audit P0: the old age/yearsOfExperience fields are gone for good.
    expect(text).not.toContain('age');
    expect(text).not.toContain('yearsOfExperience');
    expect(text).not.toContain('36');
  });

  it('keeps the stack array in sync with the shared PROFILE_STACK (single source)', () => {
    const { container } = render(<SkillsCode role={ROLE} focus={FOCUS} />);
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
    const { container } = render(<SkillsCode role={ROLE} focus={FOCUS} />);
    const text = container.textContent ?? '';

    expect(text).toContain('const');
    expect(text).toContain('developer');
    expect(text).toContain('role');
    expect(text).toContain('focus');
  });
});

/**
 * Regression guard for the `Code` ↔ `SkillsCode` seam.
 *
 * `Code` derives the clipboard text with `useCopyCode`, which runs
 * `extractTextFromNode(children)` inside a `useMemo`. That helper calls a
 * function component as a plain function — so if `SkillsCode` uses a hook, the
 * hook is invoked from inside another hook's callback. React throws "Do not
 * call Hooks inside useMemo", the half-registered hook corrupts the hook list,
 * and the ENTIRE app unmounts (blank page). Production builds skip the dev-only
 * guard, so this is invisible until you open dev mode.
 *
 * `Hero.test.tsx` mocks both `Code` and `SkillsCode`, so nothing else in the
 * suite ever exercises this pair — this block is the only place it runs for real.
 */
describe('SkillsCode: the Code seam', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders inside a real copyable Code block without a hooks violation', () => {
    const { container } = render(
      <Code variant="block" language="TypeScript" copyable showLineNumbers>
        <SkillsCode role={ROLE} focus={FOCUS} />
      </Code>
    );

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(container.textContent).toContain('const developer');
  });

  it('copies the real snippet text — extraction works through the component', async () => {
    render(
      <Code variant="block" language="TypeScript" copyable showLineNumbers>
        <SkillsCode role={ROLE} focus={FOCUS} />
      </Code>
    );

    // fireEvent, not userEvent: userEvent.setup() installs its own
    // navigator.clipboard stub and would replace the spy installed above.
    fireEvent.click(screen.getByTestId('code-copy-button'));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    const copied = writeText.mock.calls[0]?.[0] as string;

    // The clipboard must get the CODE, not an empty string: extractTextFromNode
    // walks the rendered component, so every highlighted token has to survive.
    expect(copied).toContain('const developer');
    expect(copied).toContain(ROLE);
    expect(copied).toContain(FOCUS);
    for (const tech of PROFILE_STACK) {
      expect(copied).toContain(`'${tech}'`);
    }
  });
});

/**
 * Source-level guard: `SkillsCode` must stay hook-free.
 *
 * A runtime test cannot see this. `Code` builds its clipboard text with
 * `useCopyCode`, which calls `extractTextFromNode(children)` inside a
 * `useMemo`; that helper executes a function component as a plain function.
 * A hook in `SkillsCode` is therefore invoked from inside another hook's
 * callback, React throws "Do not call Hooks inside useMemo", the
 * half-registered hook corrupts the hook list, and the ENTIRE app unmounts —
 * a blank page. Production builds skip the dev-only guard, so it looks fine
 * in `vite preview` and Storybook and only breaks in dev.
 *
 * The seam test above mocks `@/shared/lib/i18n/hooks` (as `Code` needs
 * labels), and a mocked `useLanguage` is a plain function call, not a hook —
 * so an injected `useLanguage()` would NOT fail it. Verified: the seam test
 * stays green with the hook back in place. Reading the source is the only
 * faithful guard, matching the theme-tokens/keyframes precedent.
 */
describe('SkillsCode: hook-free source guard', () => {
  const SRC = readFileSync(join(__dirname, 'SkillsCode.tsx'), 'utf-8');

  /** Drop comments — prose like "`useLanguage` here" must not count as a call. */
  function stripComments(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  }

  function hookCalls(source: string): string[] {
    return [...stripComments(source).matchAll(/\buse[A-Z]\w*\s*\(/g)].map((m) => m[0]);
  }

  it('contains no React hook call', () => {
    expect(hookCalls(SRC)).toEqual([]);
  });

  // Non-vacuous guard: proves the matcher actually discriminates, so an empty
  // result above means "no hooks" rather than "detector never matches".
  it('detects a hook call in a sample (matcher is not vacuous)', () => {
    expect(hookCalls('const A = () => { useMemo(() => 1, []); };')).toHaveLength(1);
    expect(hookCalls('const B = () => { const user = 1; return user; };')).toHaveLength(0);
  });
});
