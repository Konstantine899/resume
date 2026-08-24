import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, DEFAULT_BOUNDARY_FALLBACK } from './ErrorBoundary';

const Boom = () => {
  throw new Error('child render boom');
};

const noop = () => {};

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

afterEach(() => {
  consoleErrorSpy?.mockRestore();
});

const silenceBoundaryLog = () => {
  // React logs uncaught render errors in dev; the boundary catch is the unit
  // under test — silence the noise so failures are attributable.
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
};

describe('ErrorBoundary (ERB-03/05)', () => {
  it('renders children normally and does not call onError when no error occurs', () => {
    silenceBoundaryLog();
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError} fallback={<p>fallback</p>}>
        <div>child</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('child')).toBeInTheDocument();
    expect(onError).not.toHaveBeenCalled();
  });

  it('renders the fallback and fires onError with the caught error when a child throws in render', () => {
    silenceBoundaryLog();
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError} fallback={<p>fallback</p>}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0]?.[0]?.message).toBe('child render boom');
  });

  it('renders the result of a fallback function receiving (error, errorInfo)', () => {
    silenceBoundaryLog();
    render(
      <ErrorBoundary fallback={(error) => <span>{error.message}</span>}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText('child render boom')).toBeInTheDocument();
  });

  it('renders the minimal default fallback (DEFAULT_BOUNDARY_FALLBACK = null) when no fallback prop is given', () => {
    silenceBoundaryLog();
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    // DEFAULT_BOUNDARY_FALLBACK is a static null — the boundary renders nothing.
    expect(DEFAULT_BOUNDARY_FALLBACK).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('bounds recursion when the fallback itself throws — the self-throw propagates up once, no loop', () => {
    silenceBoundaryLog();
    let fallbackInvocations = 0;
    const throwingFallback = () => {
      fallbackInvocations += 1;
      throw new Error('fallback boom again');
    };
    const outerOnError = vi.fn();

    render(
      <ErrorBoundary onError={outerOnError} fallback={<p>outer caught it</p>}>
        <ErrorBoundary fallback={throwingFallback}>
          <Boom />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // A class boundary cannot catch a throw in its OWN render — the fallback self-throw
    // propagates to the outer boundary (React may retry the inner render once first).
    // The guard is: bounded invocations (no infinite re-entry loop) + outer catch.
    expect(fallbackInvocations).toBeLessThanOrEqual(2);
    expect(outerOnError).toHaveBeenCalledTimes(1);
    expect(screen.getByText('outer caught it')).toBeInTheDocument();
  });

  it('keeps rendering children once the boundary is mounted without an error (named-only export surface compiles)', () => {
    silenceBoundaryLog();
    const { rerender } = render(
      <ErrorBoundary fallback={undefined}>
        <div>stable</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('stable')).toBeInTheDocument();

    rerender(
      <ErrorBoundary onError={noop} fallback={<p>fb</p>}>
        <div>still here</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('still here')).toBeInTheDocument();
  });
});
