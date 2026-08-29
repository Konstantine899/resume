import { describe, it, expect, vi } from 'vitest';
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

describe('useCard interactivity (CARD-P0-4)', () => {
  it('plain default card keeps role="group" and no onKeyDown', () => {
    const { result } = renderHook(() => useCard({}));
    expect(result.current.interactivity.role).toBe('group');
    expect(result.current.interactivity.tabIndex).toBeUndefined();
    expect(result.current.interactivity.onKeyDown).toBeUndefined();
    expect(result.current.interactivity.interactive).toBe(false);
  });

  it('onClick on default div acts as button with keyboard handler + tabIndex', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ onClick }));
    expect(result.current.interactivity.role).toBe('button');
    expect(result.current.interactivity.tabIndex).toBe(0);
    expect(result.current.interactivity.onKeyDown).toBeTypeOf('function');
    expect(result.current.interactivity.interactive).toBe(true);
  });

  it('native <button> is a button but does NOT attach onKeyDown (no double-fire)', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ component: 'button', onClick }));
    expect(result.current.interactivity.role).toBe('button');
    expect(result.current.interactivity.tabIndex).toBeUndefined();
    expect(result.current.interactivity.onKeyDown).toBeUndefined();
  });

  it('real <a href> is NOT treated as a button', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ component: 'a', href: '/x', onClick }));
    expect(result.current.interactivity.role).toBeUndefined();
    expect(result.current.interactivity.onKeyDown).toBeUndefined();
  });

  it('<a> without href + onClick acts as button with keyboard handler', () => {
    const onClick = vi.fn();
    const { result } = renderHook(() => useCard({ component: 'a', onClick }));
    expect(result.current.interactivity.role).toBe('button');
    expect(result.current.interactivity.tabIndex).toBe(0);
    expect(result.current.interactivity.onKeyDown).toBeTypeOf('function');
  });

  it('non-interactive polymorphic (section) has no role', () => {
    const { result } = renderHook(() => useCard({ component: 'section' }));
    expect(result.current.interactivity.role).toBeUndefined();
  });
});
