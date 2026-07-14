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
    // Do NOT append to body — element is orphaned

    render(<Portal element={orphanedElement}>Orphaned Content</Portal>);

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Portal]'));

    consoleWarnSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });
});
