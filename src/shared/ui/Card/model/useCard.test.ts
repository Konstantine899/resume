import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCard } from './useCard';

describe('useCard', () => {
  it('returns default values with no props', () => {
    const { result } = renderHook(() => useCard({}));
    expect(result.current.safeVariant).toBe('default');
    expect(result.current.safeSize).toBe('default');
    expect(result.current.safeRadius).toBe('rounded');
    expect(result.current.cardClasses).toBeTruthy();
  });

  it('returns custom variant', () => {
    const { result } = renderHook(() => useCard({ variant: 'skill' }));
    expect(result.current.safeVariant).toBe('skill');
  });

  it('returns custom size', () => {
    const { result } = renderHook(() => useCard({ size: 'large' }));
    expect(result.current.safeSize).toBe('large');
  });

  it('returns custom radius', () => {
    const { result } = renderHook(() => useCard({ radius: 'rounded2xl' }));
    expect(result.current.safeRadius).toBe('rounded2xl');
  });

  it('includes fullWidth in class name', () => {
    const { result } = renderHook(() => useCard({ fullWidth: true }));
    expect(result.current.cardClasses).toContain('fullWidth');
  });

  it('includes noHover in class name when hoverable is false', () => {
    const { result } = renderHook(() => useCard({ hoverable: false }));
    expect(result.current.cardClasses).toContain('noHover');
  });

  it('includes custom className', () => {
    const { result } = renderHook(() => useCard({ className: 'my-card' }));
    expect(result.current.cardClasses).toContain('my-card');
  });
});
