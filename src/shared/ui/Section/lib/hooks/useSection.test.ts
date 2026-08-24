// src/shared/ui/Section/lib/hooks/useSection.test.ts

import { renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useSection } from './useSection';
import type { SectionHookProps } from '../../model/types';

const createDefaultProps = (overrides: Partial<SectionHookProps> = {}): SectionHookProps => ({
  size: 'md',
  className: '',
  as: 'section',
  ...overrides,
});

describe('useSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('className computation', () => {
    it('should return className with size class for size="md"', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({ size: 'md' })));
      expect(result.current.sectionClassName).toContain('md');
    });

    it('should return className with size class for size="lg"', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({ size: 'lg' })));
      expect(result.current.sectionClassName).toContain('lg');
    });

    it('should return className with size class for size="xxl"', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({ size: 'xxl' })));
      expect(result.current.sectionClassName).toContain('xxl');
    });

    it('should include user className', () => {
      const { result } = renderHook(() =>
        useSection(createDefaultProps({ className: 'my-custom-class' }))
      );
      expect(result.current.sectionClassName).toContain('my-custom-class');
    });
  });

  describe('data attributes', () => {
    it('should return data-size attribute', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({ size: 'xl' })));
      expect(result.current.dataAttrs['data-size']).toBe('xl');
    });

    it('should return data-as attribute', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({ as: 'article' })));
      expect(result.current.dataAttrs['data-as']).toBe('article');
    });

    it('should return both data attributes simultaneously', () => {
      const { result } = renderHook(() =>
        useSection(createDefaultProps({ size: 'sm', as: 'main' }))
      );
      expect(result.current.dataAttrs).toEqual({
        'data-size': 'sm',
        'data-as': 'main',
      });
    });
  });

  describe('default values', () => {
    it('should use size="md" by default', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({})));
      expect(result.current.dataAttrs['data-size']).toBe('md');
    });

    it('should use as="section" by default', () => {
      const { result } = renderHook(() => useSection(createDefaultProps({})));
      expect(result.current.dataAttrs['data-as']).toBe('section');
    });
  });
});
