import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

/**
 * Minimal ErrorBoundary for fallback render only.
 * Catches render-phase errors in consumer-provided fallback and swaps to minimal fallback.
 */
export class ImageFallbackBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
