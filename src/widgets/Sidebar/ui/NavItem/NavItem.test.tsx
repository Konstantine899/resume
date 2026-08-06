import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Home } from 'lucide-react';
import { NavItem } from './NavItem';

describe('NavItem: Link integration (desktop)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the nav anchor as a Link preserving role="menuitem" and href', () => {
    render(<NavItem icon={Home} label="Home" href="#home" />);

    const item = screen.getByRole('menuitem');
    expect(item).toHaveAttribute('href', '#home');
    expect(item).toBeInTheDocument();
  });

  it('sets aria-current="page" when active', () => {
    render(<NavItem icon={Home} label="Home" href="#home" isActive />);

    expect(screen.getByRole('menuitem')).toHaveAttribute('aria-current', 'page');
  });

  it('calls onClick(href) and stops propagation to the parent on desktop click', () => {
    const onNavClick = vi.fn();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <NavItem icon={Home} label="Home" href="#home" onClick={onNavClick} variant="desktop" />
      </div>
    );

    fireEvent.click(screen.getByRole('menuitem'));

    expect(onNavClick).toHaveBeenCalledWith('#home');
    // stopPropagation on desktop click keeps the event from bubbling to the aside
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
