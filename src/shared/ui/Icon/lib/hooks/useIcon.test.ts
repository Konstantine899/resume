// src/shared/ui/Icon/lib/hooks/useIcon.test.ts

import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Home } from 'lucide-react';
import type { IconHookProps } from './useIcon';
import { useIcon } from './useIcon';
import { validateIconProps } from '../utils/validateIconProps';
import type { IconStrokeWidth } from '../../model/types';
import styles from '../../ui/Icon.module.scss';

const createDefaultProps = (overrides: Partial<IconHookProps> = {}): IconHookProps => ({
  name: Home,
  ...overrides,
});

describe('useIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('className computation', () => {
    it('should include the base icon class', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps()));

      expect(result.current.iconClassName).toContain(styles.icon);
    });

    it('should include disabled modifier class', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ disabled: true })));

      expect(result.current.iconClassName).toContain(styles.disabled);
    });

    it('should include clickable modifier class when interactive', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ onClick: vi.fn() })));

      expect(result.current.iconClassName).toContain(styles.clickable);
    });

    it('should not include clickable modifier class when disabled', () => {
      const { result } = renderHook(() =>
        useIcon(createDefaultProps({ onClick: vi.fn(), disabled: true }))
      );

      expect(result.current.iconClassName).not.toContain(styles.clickable);
    });

    it('should append the consumer className', () => {
      const { result } = renderHook(() =>
        useIcon(createDefaultProps({ className: 'custom-class' }))
      );

      expect(result.current.iconClassName).toContain('custom-class');
    });
  });

  describe('inline style', () => {
    it('should map preset size to pixels via getSizeInPixels', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ size: 'xl' })));

      expect(result.current.iconStyle).toEqual({
        width: 32,
        height: 32,
        color: 'var(--foreground)',
      });
    });

    it('should keep numeric size as-is', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ size: 48 })));

      expect(result.current.iconStyle.width).toBe(48);
      expect(result.current.iconStyle.height).toBe(48);
    });

    it('should resolve preset color to CSS var via getColorValue', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ color: 'primary' })));

      expect(result.current.iconStyle.color).toBe('var(--primary)');
    });

    it('should keep custom CSS color as-is', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ color: '#ff0000' })));

      expect(result.current.iconStyle.color).toBe('#ff0000');
    });
  });

  describe('data attributes', () => {
    it('should return data-size, data-color and data-interactive', () => {
      const { result } = renderHook(() =>
        useIcon(createDefaultProps({ size: 'sm', color: 'warning' }))
      );

      expect(result.current.dataAttrs).toEqual({
        'data-size': 'sm',
        'data-color': 'warning',
        'data-interactive': 'false',
      });
    });

    it('should serialize data-interactive as the string "false" when not interactive', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps()));

      expect(result.current.dataAttrs['data-interactive']).toBe('false');
    });

    it('should serialize data-interactive as the string "true" when interactive', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ onClick: vi.fn() })));

      expect(result.current.dataAttrs['data-interactive']).toBe('true');
    });

    it('should include data-as when component is a string', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ component: 'a' })));

      expect(result.current.dataAttrs['data-as']).toBe('a');
    });

    it('should omit data-as when component is a component', () => {
      const CustomComp = () => null;
      const { result } = renderHook(() => useIcon(createDefaultProps({ component: CustomComp })));

      expect(result.current.dataAttrs['data-as']).toBeUndefined();
    });
  });

  describe('aria props', () => {
    it('should return aria-hidden for decorative icons', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ decorative: true })));

      expect(result.current.ariaProps).toEqual({ 'aria-hidden': true });
    });

    it('should return aria-label when provided', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ ariaLabel: 'Home icon' })));

      expect(result.current.ariaProps).toEqual({ 'aria-label': 'Home icon' });
    });
  });

  describe('isInteractive', () => {
    it('should be true when onClick is provided', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps({ onClick: vi.fn() })));

      expect(result.current.isInteractive).toBe(true);
    });

    it('should be false when onClick is missing', () => {
      const { result } = renderHook(() => useIcon(createDefaultProps()));

      expect(result.current.isInteractive).toBe(false);
    });

    it('should be false when disabled', () => {
      const { result } = renderHook(() =>
        useIcon(createDefaultProps({ onClick: vi.fn(), disabled: true }))
      );

      expect(result.current.isInteractive).toBe(false);
    });
  });

  describe('validation (development only)', () => {
    it('should warn on invalid size in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useIcon(createDefaultProps({ size: 0 })));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('size'));

      warnSpy.mockRestore();
    });

    it('should not warn on invalid size in production', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      renderHook(() => useIcon(createDefaultProps({ size: 0 })));

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('should warn on invalid strokeWidth in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useIcon(createDefaultProps({ strokeWidth: 4 as IconStrokeWidth })));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('strokeWidth'));

      warnSpy.mockRestore();
    });

    it('should warn on invalid color in development', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      renderHook(() => useIcon(createDefaultProps({ color: 'not-a-color' })));

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('color'));

      warnSpy.mockRestore();
    });

    it('should warn when name is not a lucide component', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      validateIconProps({ name: 'Home' as never });

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('name'));

      warnSpy.mockRestore();
    });

    it('should not warn in production even with invalid values', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      validateIconProps({ size: 0, color: 'not-a-color', strokeWidth: 4 as never });

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });
});
