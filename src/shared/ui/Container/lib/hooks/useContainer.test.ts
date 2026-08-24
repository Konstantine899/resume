import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useContainer } from './useContainer';
import type { ContainerHookProps } from '../../model/types';

const createDefaultProps = (overrides: Partial<ContainerHookProps> = {}): ContainerHookProps => ({
  size: 'lg',
  centered: true,
  className: '',
  fullWidth: false,
  padding: 'md',
  ...overrides,
});

describe('useContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('className computation', () => {
    it('should return className with size class for size="lg"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ size: 'lg' })));

      expect(result.current.containerClassName).toContain('lg');
    });

    it('should return className with size class for size="sm"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ size: 'sm' })));

      expect(result.current.containerClassName).toContain('sm');
    });

    it('should return className with padding class for padding="md"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ padding: 'md' })));

      expect(result.current.containerClassName).toContain('padding-md');
    });

    it('should return className with padding class for padding="lg"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ padding: 'lg' })));

      expect(result.current.containerClassName).toContain('padding-lg');
    });

    it('should include "centered" when centered=true', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ centered: true })));

      expect(result.current.containerClassName).toContain('centered');
    });

    it('should NOT include "centered" when centered=false', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ centered: false })));

      expect(result.current.containerClassName).not.toContain('centered');
    });

    it('should include "fullWidth" when fullWidth=true', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ fullWidth: true })));

      expect(result.current.containerClassName).toContain('fullWidth');
    });

    it('should NOT include "fullWidth" when fullWidth=false', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ fullWidth: false })));

      expect(result.current.containerClassName).not.toContain('fullWidth');
    });

    it('should include user className', () => {
      const { result } = renderHook(() =>
        useContainer(createDefaultProps({ className: 'my-custom-class' }))
      );

      expect(result.current.containerClassName).toContain('my-custom-class');
    });

    it('should handle centered+fullWidth conflict: fullWidth wins', () => {
      const { result } = renderHook(() =>
        useContainer(createDefaultProps({ centered: true, fullWidth: true }))
      );

      expect(result.current.containerClassName).toContain('fullWidth');
      // centered may still be present (visual precedence is handled by CSS)
      // The key requirement: fullWidth class IS present even when centered is also true
    });
  });

  describe('data attributes', () => {
    it('should return data-size attribute', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ size: 'xl' })));

      expect(result.current.dataAttrs['data-size']).toBe('xl');
    });

    it('should return data-padding attribute', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ padding: 'none' })));

      expect(result.current.dataAttrs['data-padding']).toBe('none');
    });

    it('should return both data attributes simultaneously', () => {
      const { result } = renderHook(() =>
        useContainer(createDefaultProps({ size: 'sm', padding: 'lg' }))
      );

      expect(result.current.dataAttrs).toEqual({
        'data-size': 'sm',
        'data-padding': 'lg',
      });
    });
  });

  describe('CSS custom properties style', () => {
    it('should return --container-max-width for size="xl"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ size: 'xl' })));

      expect(result.current.style['--container-max-width']).toBe('1280px');
    });

    it('should return --container-max-width for size="sm"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ size: 'sm' })));

      expect(result.current.style['--container-max-width']).toBe('640px');
    });

    it('should return --container-padding for padding="lg"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ padding: 'lg' })));

      expect(result.current.style['--container-padding']).toBe('2rem');
    });

    it('should return --container-padding for padding="xl"', () => {
      const { result } = renderHook(() => useContainer(createDefaultProps({ padding: 'xl' })));

      expect(result.current.style['--container-padding']).toBe('3rem');
    });
  });
});
