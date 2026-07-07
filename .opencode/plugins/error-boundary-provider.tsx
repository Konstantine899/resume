/**
 * Error Boundary Provider
 *
 * Global error boundary wrapper for React application:
 * - Catches errors in component tree
 * - Logs to Sentry/analytics
 * - Shows fallback UI
 * - Prevents app crash
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Send to analytics/Sentry
    this.props.onError?.(error, errorInfo);

    // Log to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        extra: {
          componentStack: errorInfo.componentStack,
        },
      });
    }

    // Log to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error', {
        event_category: 'error_boundary',
        event_label: error.message,
        value: errorInfo.componentStack,
      });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Default Fallback UI Component
 */
function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '2rem auto',
        backgroundColor: '#fef2f2',
        border: '1px solid #ef4444',
        borderRadius: '8px',
      }}
    >
      <h2 style={{ color: '#b91c1c', marginBottom: '1rem' }}>⚠️ Something went wrong</h2>

      <details style={{ marginBottom: '1rem' }}>
        <summary style={{ cursor: 'pointer', color: '#7f1d1d' }}>Error Details</summary>
        <pre
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#fee2e2',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem',
            color: '#991b1b',
          }}
        >
          {error.message}
        </pre>
      </details>

      <button
        onClick={resetError}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#b91c1c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Try Again
      </button>
    </div>
  );
}

/**
 * Error Boundary Provider Component
 * Wraps entire app with error boundary
 */
export function ErrorBoundaryProvider({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundaryProvider:', error, errorInfo);
    }

    // Log to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Send to your analytics service
      sendErrorToAnalytics(error, errorInfo);
    }
  };

  return <ErrorBoundary onError={handleError}>{children}</ErrorBoundary>;
}

/**
 * Send error to analytics
 */
function sendErrorToAnalytics(error: Error, errorInfo: ErrorInfo) {
  // Implementation depends on your analytics service
  // Example for Google Analytics:
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'error', {
      event_category: 'application_error',
      event_label: error.message,
      value: errorInfo.componentStack,
    });
  }

  // Example for custom analytics endpoint:
  // fetch('/api/analytics/error', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     message: error.message,
  //     stack: error.stack,
  //     componentStack: errorInfo.componentStack,
  //     timestamp: Date.now(),
  //     url: window.location.href,
  //   }),
  // });
}

/**
 * Hook to use error boundary in functional components
 */
export function useErrorBoundary() {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    setHasError(true);
  }, []);

  const resetError = React.useCallback(() => {
    setHasError(false);
    setError(null);
  }, []);

  return { hasError, error, handleError, resetError };
}

export default ErrorBoundary;
