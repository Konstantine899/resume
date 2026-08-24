import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Portal } from './Portal';

describe('Portal', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders children in document.body by default', () => {
    render(<Portal>Portal Content</Portal>);
    expect(screen.getByText('Portal Content')).toBeInTheDocument();
    expect(document.body.textContent).toContain('Portal Content');
  });

  it('renders children inside a custom element', () => {
    const customElement = document.createElement('div');
    customElement.setAttribute('data-testid', 'custom-container');
    document.body.appendChild(customElement);

    render(<Portal element={customElement}>Custom Element Content</Portal>);

    expect(customElement.textContent).toBe('Custom Element Content');
    expect(screen.getByText('Custom Element Content')).toBeInTheDocument();

    document.body.removeChild(customElement);
  });

  it('removes children from DOM after unmount', () => {
    const { unmount } = render(<Portal>Temporary Content</Portal>);

    expect(screen.getByText('Temporary Content')).toBeInTheDocument();

    unmount();

    expect(screen.queryByText('Temporary Content')).not.toBeInTheDocument();
  });

  it('renders children inline when disablePortal=true', () => {
    const { container } = render(<Portal disablePortal>Inline Content</Portal>);
    expect(screen.getByText('Inline Content')).toBeInTheDocument();
    // Children should be direct children of the container, not teleported to body
    expect(container.textContent).toContain('Inline Content');
  });

  it('renders custom element with disablePortal=true (ignores element prop)', () => {
    const customElement = document.createElement('div');
    customElement.setAttribute('data-testid', 'custom-container');
    document.body.appendChild(customElement);

    const { container } = render(
      <Portal element={customElement} disablePortal>
        Disabled Portal Content
      </Portal>
    );

    // Content should be rendered inline, NOT inside customElement
    expect(container.textContent).toContain('Disabled Portal Content');
    expect(customElement.textContent).toBe('');

    document.body.removeChild(customElement);
  });

  it('renders with null element prop (uses document.body)', () => {
    render(<Portal element={null as unknown as HTMLElement}>Null Container</Portal>);
    expect(screen.getByText('Null Container')).toBeInTheDocument();
  });

  it('renders with undefined element prop (uses document.body)', () => {
    render(<Portal element={undefined}>Undefined Container</Portal>);
    expect(screen.getByText('Undefined Container')).toBeInTheDocument();
  });

  it('renders with empty children (ReactNode)', () => {
    const { container } = render(<Portal>{null}</Portal>);
    expect(container.textContent).toBe('');
  });
});
