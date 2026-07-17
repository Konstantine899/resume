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

  it('warns in development when element is not connected to the DOM', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const orphanedElement = document.createElement('div');

    render(<Portal element={orphanedElement}>Orphaned Content</Portal>);

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Portal]'));

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
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

  it('does not warn in production mode when element is not connected', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const orphanedElement = document.createElement('div');

    render(<Portal element={orphanedElement}>Production Content</Portal>);

    expect(consoleWarnSpy).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
