import { fireEvent, render, screen } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';
import { describe, expect, it, vi } from 'vitest';

describe('ProjectCard coverage bridge', () => {
  it('renders tech icons with basename fallback and handles onClick', () => {
    const onClick = vi.fn();
    render(
      <ProjectCard
        title="P"
        description="d"
        techIcons={[{ name: '', url: 'https://example.com/react.svg', invertInDark: true }]}
        onClick={onClick}
      />
    );
    expect(screen.getByAltText('react.svg')).toBeInTheDocument();
    const card = screen.getByText('P').closest('div') as HTMLElement;
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
