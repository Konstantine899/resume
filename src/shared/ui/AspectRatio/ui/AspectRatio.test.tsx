// src/shared/ui/AspectRatio/ui/AspectRatio.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { AspectRatio } from './AspectRatio';
import { useAspectRatio } from '../lib/hooks/useAspectRatio';
import { validateAspectRatioProps } from '../lib/utils/validateAspectRatioProps';
import { DEFAULT_RATIO } from '../model/constants';
import type { AspectRatioString } from '../model/types';

describe('AspectRatio', () => {
  // ============================================
  // Ratio style (AR-03)
  // ============================================

  describe('Ratio style', () => {
    it('applies the canonicalized aspect-ratio inline style', () => {
      render(<AspectRatio ratio="4/3" data-testid="aspect-ratio" />);
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveStyle({ aspectRatio: '4 / 3' });
    });

    it('falls back to DEFAULT_RATIO when ratio is missing at runtime', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const missingRatio: any = {};
      render(<AspectRatio {...missingRatio} data-testid="aspect-ratio" />);
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveStyle({ aspectRatio: '16 / 9' });
      expect(box).toHaveAttribute('data-aspect-ratio', DEFAULT_RATIO);
    });
  });

  // ============================================
  // Polymorphic rendering (AR-01)
  // ============================================

  describe('Polymorphic rendering', () => {
    it('renders a div by default with the box class', () => {
      const { container } = render(<AspectRatio ratio="16/9" />);
      const box = container.querySelector('[data-aspect-ratio="16/9"]');
      expect(box).not.toBeNull();
      expect(box?.tagName).toBe('DIV');
    });

    it('renders as an allowed element and forwards element props', () => {
      render(<AspectRatio ratio="4/3" as="article" title="Ratio box" />);
      const article = screen.getByTitle('Ratio box');
      expect(article.tagName).toBe('ARTICLE');
      expect(article).toHaveClass(/box/);
      expect(article).toHaveAttribute('data-as', 'article');
    });

    it('passes merged className and props to a custom component', () => {
      const CustomBox = (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div data-custom-box="true" {...props} />
      );
      render(
        <AspectRatio ratio="1/1" as={CustomBox} className="custom" data-testid="aspect-ratio" />
      );
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveAttribute('data-custom-box', 'true');
      expect(box).toHaveClass(/box/);
      expect(box).toHaveClass('custom');
    });
  });

  // ============================================
  // Refs (AR-02)
  // ============================================

  describe('Refs', () => {
    it('resolves the default ref to an HTMLDivElement', () => {
      const ref = { current: null };
      render(<AspectRatio ratio="16/9" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('resolves the ref to the per-as element', () => {
      const ref = { current: null };
      render(<AspectRatio ratio="16/9" as="article" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect((ref.current as unknown as HTMLElement).tagName).toBe('ARTICLE');
    });
  });

  // ============================================
  // Data attributes (AR-05)
  // ============================================

  describe('Data attributes', () => {
    it('emits data-aspect-ratio with the raw (unspaced) value', () => {
      render(<AspectRatio ratio="21/9" data-testid="aspect-ratio" />);
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveAttribute('data-aspect-ratio', '21/9');
    });

    it('does not emit data-as on the default div', () => {
      render(<AspectRatio ratio="16/9" data-testid="aspect-ratio" />);
      const box = screen.getByTestId('aspect-ratio');
      expect(box).not.toHaveAttribute('data-as');
    });

    it('emits data-as only for string as values', () => {
      render(<AspectRatio ratio="16/9" as="aside" data-testid="aspect-ratio" />);
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveAttribute('data-as', 'aside');
    });
  });

  // ============================================
  // className merge (AR-01/D2)
  // ============================================

  describe('className merge', () => {
    it('merges the consumer className after the box class', () => {
      render(<AspectRatio ratio="16/9" className="custom-class" data-testid="aspect-ratio" />);
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveClass(/box/);
      expect(box).toHaveClass('custom-class');
      expect(box.className.split(/\s+/).pop()).toBe('custom-class');
    });

    it('keeps the consumer style with the ratio (consumer wins on conflict)', () => {
      render(
        <AspectRatio
          ratio="4/3"
          style={{ maxWidth: 480, aspectRatio: '1 / 1' }}
          data-testid="aspect-ratio"
        />
      );
      const box = screen.getByTestId('aspect-ratio');
      expect(box).toHaveStyle({ maxWidth: '480px' });
      expect(box).toHaveStyle({ aspectRatio: '1 / 1' });
    });
  });

  // ============================================
  // Content fill layer (AR-06)
  // ============================================

  describe('Content fill layer', () => {
    it('wraps children inside the absolute fill layer', () => {
      render(
        <AspectRatio ratio="16/9" data-testid="aspect-ratio">
          <span data-testid="fill-child">content</span>
        </AspectRatio>
      );
      const box = screen.getByTestId('aspect-ratio');
      const child = screen.getByTestId('fill-child');
      expect(box).toContainElement(child);
      // The fill layer is a span with the content class, positioned inside the box.
      expect(child.parentElement).toHaveClass(/content/);
    });
  });

  // ============================================
  // useAspectRatio hook (AR-04)
  // ============================================

  describe('useAspectRatio hook', () => {
    it('returns ratioStyle, boxClassName, and dataAttrs', () => {
      const { result } = renderHook(() => useAspectRatio({ ratio: '16/9', className: 'custom' }));
      expect(result.current.ratioStyle).toEqual({ aspectRatio: '16 / 9' });
      expect(result.current.boxClassName).toContain('custom');
      expect(result.current.dataAttrs).toEqual({
        'data-aspect-ratio': '16/9',
      });
    });
  });

  // ============================================
  // Validator (AR-07)
  // ============================================

  describe('validateAspectRatioProps', () => {
    const originalEnv = process.env.NODE_ENV;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      consoleWarnSpy.mockRestore();
    });

    it('warns on an invalid ratio format in development', () => {
      validateAspectRatioProps({ ratio: 'abc' as AspectRatioString });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AspectRatio: invalid ratio "abc"')
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining(DEFAULT_RATIO));
    });

    it('rejects non-integer ratio formats via regex', () => {
      validateAspectRatioProps({ ratio: '1.5/2' as AspectRatioString });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AspectRatio: invalid ratio "1.5/2"')
      );
    });

    it('does not warn in production', () => {
      process.env.NODE_ENV = 'production';
      validateAspectRatioProps({ ratio: 'abc' as AspectRatioString });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn on a valid ratio', () => {
      validateAspectRatioProps({ ratio: '16/9' });
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Polymorphic typing (compile-time, AR-01)
  // ============================================

  describe('Polymorphic typing', () => {
    it('@ts-expect-error: href is not a valid prop for the default div', () => {
      // @ts-expect-error href - свойство anchor, не div
      render(<AspectRatio ratio="16/9" as="div" href="/x" />);
    });
  });
});
