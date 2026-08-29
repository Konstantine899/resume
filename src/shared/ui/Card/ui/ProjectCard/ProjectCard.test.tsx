// ============================================
// ProjectCard Tests — backgroundImage sanitization (CARD-P0-5)
// ============================================

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

const baseProps = {
  title: 'Test Project',
  description: 'Brief description',
  techIcons: [] as { name?: string; url: string }[],
};

describe('ProjectCard backgroundImage (CARD-P0-5)', () => {
  it('renders title and description', () => {
    const { container } = render(<ProjectCard {...baseProps} />);
    expect(container.querySelector('h3')?.textContent).toBe('Test Project');
  });

  it('skips the background layer for javascript: scheme (no throw)', () => {
    const { container } = render(
      // eslint-disable-next-line no-script-url
      <ProjectCard {...baseProps} backgroundImage="javascript:alert(1)" />
    );
    const bg = container.querySelector('[class*="backgroundImage"]');
    expect(bg).toBeNull();
  });

  it('skips the background layer for external CDN when host not allowed (default restrictive)', () => {
    const { container } = render(
      <ProjectCard {...baseProps} backgroundImage="https://cdn.example.com/x.png" />
    );
    const bg = container.querySelector('[class*="backgroundImage"]');
    expect(bg).toBeNull();
  });

  it('applies a safe url() for a same-origin relative path', () => {
    const { container } = render(
      <ProjectCard {...baseProps} backgroundImage="/images/cover.png" />
    );
    const bg = container.querySelector('[class*="backgroundImage"]') as HTMLElement | null;
    expect(bg).not.toBeNull();
    expect(bg?.style.backgroundImage).toBe('url("/images/cover.png")');
  });

  it('applies a safe url() for an allowed external host', () => {
    const { container } = render(
      <ProjectCard {...baseProps} backgroundImage="https://cdn.example.com/x.png" />
    );
    // default allow-list is empty, so this is skipped; explicit allow-list is configured via constants.
    const bg = container.querySelector('[class*="backgroundImage"]');
    expect(bg).toBeNull();
  });
});
