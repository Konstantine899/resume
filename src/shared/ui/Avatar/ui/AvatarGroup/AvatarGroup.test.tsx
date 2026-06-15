import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarGroup } from './AvatarGroup';
import { Avatar } from '../Avatar/Avatar';

describe('AvatarGroup', () => {
  const renderAvatars = (count: number) => {
    const avatars = Array.from({ length: count }, (_, i) => (
      <Avatar key={i} alt={`User ${i + 1}`} />
    ));
    return render(<AvatarGroup>{avatars}</AvatarGroup>);
  };

  it('renders single avatar', () => {
    renderAvatars(1);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders multiple avatars', () => {
    renderAvatars(3);
    const avatars = screen.getAllByText('U');
    expect(avatars).toHaveLength(3);
  });

  it('respects max prop', () => {
    renderAvatars(5);
    const avatars = screen.getAllByText('U');
    expect(avatars).toHaveLength(4);
  });

  it('shows remaining count when max exceeded', () => {
    renderAvatars(6);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not show remaining when count <= max', () => {
    renderAvatars(3);
    expect(screen.queryByText(/\+\d+/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AvatarGroup className="custom-group">
        <Avatar alt="Test" />
      </AvatarGroup>
    );
    expect(screen.getByRole('generic')).toHaveClass('custom-group');
  });

  it('uses size prop for children', () => {
    render(
      <AvatarGroup size="lg">
        <Avatar alt="Test" />
      </AvatarGroup>
    );
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('uses variant prop for children', () => {
    render(
      <AvatarGroup variant="square">
        <Avatar alt="Test" />
      </AvatarGroup>
    );
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('applies correct spacing between avatars', () => {
    render(
      <AvatarGroup>
        <Avatar alt="User 1" />
        <Avatar alt="User 2" />
      </AvatarGroup>
    );
    const wrappers = screen.getAllByRole('generic');
    expect(wrappers).toHaveLength(2);
  });

  it('handles empty children', () => {
    render(
      <AvatarGroup>
        <></>
      </AvatarGroup>
    );
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('applies zIndex in reverse order', () => {
    renderAvatars(3);
    const wrappers = screen.getAllByRole('generic');
    expect(wrappers[0]).toHaveStyle('z-index: 3');
    expect(wrappers[1]).toHaveStyle('z-index: 2');
    expect(wrappers[2]).toHaveStyle('z-index: 1');
  });
});
