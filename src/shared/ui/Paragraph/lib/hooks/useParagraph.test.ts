// src/shared/ui/Paragraph/lib/hooks/useParagraph.test.ts

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ParagraphSize, ParagraphTheme } from '../../model/types';
import { useParagraph, type ParagraphHookProps } from './useParagraph';
import cls from '../../ui/Paragraph.module.scss';

const createDefaultProps = (overrides: Partial<ParagraphHookProps> = {}): ParagraphHookProps => ({
  size: 'm',
  theme: 'primary',
  align: 'left',
  as: 'p',
  ...overrides,
});

describe('useParagraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('className computation', () => {
    it('should include the base paragraph class', () => {
      const { result } = renderHook(() => useParagraph(createDefaultProps({})));

      expect(result.current.paragraphClassName).toContain(cls.paragraph);
    });

    it('should map size xl to its SCSS class', () => {
      const { result } = renderHook(() => useParagraph(createDefaultProps({ size: 'xl' })));

      expect(result.current.paragraphClassName).toContain(cls.xl);
    });

    it('should map size 2xl to the size-2xl SCSS class', () => {
      const { result } = renderHook(() => useParagraph(createDefaultProps({ size: '2xl' })));

      expect(result.current.paragraphClassName).toContain(cls['size-2xl']);
    });

    it('should include the muted theme class', () => {
      const { result } = renderHook(() => useParagraph(createDefaultProps({ theme: 'muted' })));

      expect(result.current.paragraphClassName).toContain(cls.muted);
    });

    it('should include the bold weight class', () => {
      const { result } = renderHook(() => useParagraph(createDefaultProps({ weight: 'bold' })));

      expect(result.current.paragraphClassName).toContain(cls.bold);
    });

    it('should include the pretty wrap class', () => {
      const { result } = renderHook(() => useParagraph(createDefaultProps({ wrap: 'pretty' })));

      expect(result.current.paragraphClassName).toContain(cls.pretty);
    });

    it('should include the user className', () => {
      const { result } = renderHook(() =>
        useParagraph(createDefaultProps({ className: 'custom-class' }))
      );

      expect(result.current.paragraphClassName).toContain('custom-class');
    });
  });

  describe('data attributes', () => {
    it('should return data-size, data-theme, data-align and data-as for a string as', () => {
      const { result } = renderHook(() =>
        useParagraph({ size: 's', theme: 'error', align: 'center', as: 'span' })
      );

      expect(result.current.dataAttrs).toEqual({
        'data-size': 's',
        'data-theme': 'error',
        'data-align': 'center',
        'data-as': 'span',
      });
    });

    it('should omit data-as when as is a component', () => {
      const CustomComponent = () => null;
      const { result } = renderHook(() => useParagraph({ as: CustomComponent }));

      expect(result.current.dataAttrs['data-as']).toBeUndefined();
      expect(result.current.dataAttrs['data-size']).toBe('m');
    });
  });

  describe('validation (development only)', () => {
    it('should warn on invalid size in development with valid values in the message', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useParagraph({ size: 'invalid' as unknown as ParagraphSize }));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid size "invalid"'));
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Valid values: xs, s, m, l, xl, 2xl')
      );

      warnSpy.mockRestore();
    });

    it('should warn on invalid theme in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useParagraph({ theme: 'invalid' as unknown as ParagraphTheme }));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid theme "invalid"'));

      warnSpy.mockRestore();
    });

    it('should not warn on invalid props in production', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      renderHook(() => useParagraph({ size: 'invalid' as unknown as ParagraphSize }));

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should warn on truncate + lineClamp conflict in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useParagraph({ truncate: true, lineClamp: 3 }));

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('truncate и lineClamp не могут быть использованы одновременно')
      );

      warnSpy.mockRestore();
    });

    it('should not warn on truncate + lineClamp conflict in production', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      renderHook(() => useParagraph({ truncate: true, lineClamp: 3 }));

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
