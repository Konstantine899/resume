/**
 * Component test template — plan §4.5.5 (rev.4, gate-verified).
 *
 * Explicit `vitest` imports follow the codebase convention (About.test.tsx)
 * even though `globals: true` is on. The second case asserts the merged
 * `className` via `toHaveClass('custom')` (AnimatedSection.test.tsx:64
 * precedent; jest-dom matchers are global through src/tests/setup.ts).
 *
 * @param {{ name: string, kebab: string }} names
 * @returns {string}
 */
export function componentTestTemplate(names) {
  const { name, kebab } = names;
  return `import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders with default testid', () => {
    render(<${name} />);
    expect(screen.getByTestId('${kebab}')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<${name} className="custom" />);
    expect(screen.getByTestId('${kebab}')).toHaveClass('custom');
  });
});
`;
}
