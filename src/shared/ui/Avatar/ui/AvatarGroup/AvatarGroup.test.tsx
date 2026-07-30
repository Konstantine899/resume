import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarGroup } from './AvatarGroup';

describe('AvatarGroup', () => {
  it('renders all children when within max', () => {
    render(
      <AvatarGroup max={5}>
        <div data-testid="avatar-1" />
        <div data-testid="avatar-2" />
        <div data-testid="avatar-3" />
      </AvatarGroup>
    );

    expect(screen.getByTestId('avatar-1')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-2')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-3')).toBeInTheDocument();
  });

  it('limits visible avatars to max prop', () => {
    render(
      <AvatarGroup max={2}>
        <div data-testid="avatar-1" />
        <div data-testid="avatar-2" />
        <div data-testid="avatar-3" />
        <div data-testid="avatar-4" />
      </AvatarGroup>
    );

    expect(screen.getByTestId('avatar-1')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-2')).toBeInTheDocument();
    expect(screen.queryByTestId('avatar-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('avatar-4')).not.toBeInTheDocument();
  });

  it('shows overflow indicator when children exceed max', () => {
    render(
      <AvatarGroup max={2}>
        <div />
        <div />
        <div />
        <div />
      </AvatarGroup>
    );

    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not show overflow when children equal max', () => {
    render(
      <AvatarGroup max={3}>
        <div />
        <div />
        <div />
      </AvatarGroup>
    );

    expect(screen.queryByText('+')).not.toBeInTheDocument();
  });

  it('renders with custom overflow text', () => {
    render(
      <AvatarGroup max={1} overflowText="{{count}} remaining">
        <div />
        <div />
        <div />
      </AvatarGroup>
    );

    expect(screen.getByText('2 remaining')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(
      <AvatarGroup>
        <div />
      </AvatarGroup>
    );

    expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Avatar group');
  });

  it('applies custom className', () => {
    const { container } = render(
      <AvatarGroup className="custom-group">
        <div />
      </AvatarGroup>
    );

    expect(container.firstChild).toHaveClass('custom-group');
  });
});
