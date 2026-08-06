// src/shared/ui/Link/lib/hooks/useLink.test.ts

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import type { LinkHookProps, LinkVariant } from '../../model/types';
import { useLink } from './useLink';
import styles from '../../ui/Link.module.scss';

const createDefaultProps = (overrides: Partial<LinkHookProps> = {}): LinkHookProps => ({
  href: '/about',
  ...overrides,
});

describe('useLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('className computation', () => {
    it('should include the base link class', () => {
      const { result } = renderHook(() => useLink(createDefaultProps()));

      expect(result.current.linkClassName).toContain(styles.link);
    });

    it('should include the variant class', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ variant: 'gradient' })));

      expect(result.current.linkClassName).toContain(styles.gradient);
    });

    it('should include the size class', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ size: 'lg' })));

      expect(result.current.linkClassName).toContain(styles.lg);
    });

    it('should include underline modifier classes', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ underline: 'always' })));

      expect(result.current.linkClassName).toContain(styles.underlineAlways);
    });

    it('should include modifier classes for unstyled, withLift and skeleton', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ unstyled: true, withLift: true, skeleton: true }))
      );

      expect(result.current.linkClassName).toContain(styles.unstyled);
      expect(result.current.linkClassName).toContain(styles.withLift);
      expect(result.current.linkClassName).toContain(styles.skeleton);
    });

    it('should append the consumer className', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ className: 'custom-class' }))
      );

      expect(result.current.linkClassName).toContain('custom-class');
    });
  });

  describe('data attributes', () => {
    it('should return data-variant and data-size', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ variant: 'secondary', size: 'sm' }))
      );

      expect(result.current.dataAttrs).toEqual({
        'data-variant': 'secondary',
        'data-size': 'sm',
      });
    });

    it('should include data-as when component is a string', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ component: 'a' })));

      expect(result.current.dataAttrs['data-as']).toBe('a');
    });

    it('should omit data-as when component is a component', () => {
      const CustomComp = () => null;
      const { result } = renderHook(() => useLink(createDefaultProps({ component: CustomComp })));

      expect(result.current.dataAttrs['data-as']).toBeUndefined();
    });

    it('should add data-external="true" for external links', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ href: 'https://x.dev' })));

      expect(result.current.dataAttrs['data-external']).toBe('true');
    });
  });

  describe('external links', () => {
    it('should detect external href via isExternalLink', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ href: 'https://github.com' }))
      );

      expect(result.current.isExternal).toBe(true);
      expect(result.current.relValue).toBe('noopener noreferrer');
      expect(result.current.targetValue).toBe('_blank');
    });

    it('should treat internal href as non-external', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ href: '/about' })));

      expect(result.current.isExternal).toBe(false);
      expect(result.current.relValue).toBeUndefined();
      expect(result.current.targetValue).toBeUndefined();
    });

    it('should force external via the external prop', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ href: '/internal', external: true }))
      );

      expect(result.current.isExternal).toBe(true);
      expect(result.current.targetValue).toBe('_blank');
    });

    it('should merge caller rel with noopener noreferrer for external links', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ href: 'https://github.com', rel: 'author' }))
      );

      expect(result.current.relValue).toContain('author');
      expect(result.current.relValue).toContain('noopener');
      expect(result.current.relValue).toContain('noreferrer');
    });

    it('should add noopener noreferrer for target="_blank" even on non-external hrefs (R1 tabnabbing)', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ href: '/about', target: '_blank' }))
      );

      expect(result.current.isExternal).toBe(false);
      expect(result.current.targetValue).toBe('_blank');
      expect(result.current.relValue).toContain('noopener');
      expect(result.current.relValue).toContain('noreferrer');
    });

    it('should merge caller rel when target="_blank" on a non-external href', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ href: '/about', target: '_blank', rel: 'author' }))
      );

      expect(result.current.relValue).toContain('author');
      expect(result.current.relValue).toContain('noopener');
      expect(result.current.relValue).toContain('noreferrer');
    });

    it('should keep target="_self" untouched without adding noopener', () => {
      const { result } = renderHook(() =>
        useLink(createDefaultProps({ href: '/about', target: '_self' }))
      );

      expect(result.current.targetValue).toBe('_self');
      expect(result.current.relValue).toBeUndefined();
    });
  });

  describe('icon size inference', () => {
    it('should map sm -> xs', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ size: 'sm' })));

      expect(result.current.iconSize).toBe('xs');
    });

    it('should map md -> sm', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ size: 'md' })));

      expect(result.current.iconSize).toBe('sm');
    });

    it('should map lg -> md', () => {
      const { result } = renderHook(() => useLink(createDefaultProps({ size: 'lg' })));

      expect(result.current.iconSize).toBe('md');
    });
  });

  describe('validation (development only)', () => {
    it('should warn on invalid variant in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useLink(createDefaultProps({ variant: 'invalid' as LinkVariant })));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid variant'));

      warnSpy.mockRestore();
    });

    it('should not warn on invalid props in production', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      renderHook(() => useLink(createDefaultProps({ variant: 'invalid' as LinkVariant })));

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should warn in development when external is true but href is empty (R4)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useLink(createDefaultProps({ href: '', external: true })));

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('external link requires a non-empty href')
      );

      warnSpy.mockRestore();
    });

    it('should not warn on empty external href in production (R4)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      renderHook(() => useLink(createDefaultProps({ href: '', external: true })));

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
