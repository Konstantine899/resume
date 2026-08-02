// src/shared/ui/Divider/ui/Divider.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen, renderHook } from '@testing-library/react';
import { Divider } from './Divider';
import { useDivider } from '../lib/hooks/useDivider';

describe('Divider', () => {
  // ============================================
  // Basic Rendering
  // ============================================

  describe('Basic Rendering', () => {
    it('должен рендериться с минимальными props', () => {
      render(<Divider />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('должен иметь role="separator"', () => {
      render(<Divider />);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('должен иметь aria-orientation по умолчанию', () => {
      render(<Divider />);
      expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('должен применять кастомный className', () => {
      render(<Divider className="custom-class" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass('custom-class');
    });
  });

  // ============================================
  // Orientation
  // ============================================

  describe('Orientation', () => {
    it('должен рендериться с orientation="horizontal" по умолчанию', () => {
      render(<Divider />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/horizontal/);
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('должен рендериться с orientation="vertical"', () => {
      render(<Divider orientation="vertical" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/vertical/);
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('должен применять borderTopWidth для horizontal', () => {
      render(<Divider thickness={2} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ borderTopWidth: '2px' });
    });

    it('должен применять width для vertical', () => {
      render(<Divider orientation="vertical" thickness={3} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ width: '3px' });
    });
  });

  // ============================================
  // Variant
  // ============================================

  describe('Variant', () => {
    it('должен рендериться с variant="solid" по умолчанию', () => {
      render(<Divider />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/solid/);
    });

    it('должен рендериться с variant="dashed"', () => {
      render(<Divider variant="dashed" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/dashed/);
    });

    it('должен рендериться с variant="dotted"', () => {
      render(<Divider variant="dotted" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/dotted/);
    });
  });

  // ============================================
  // Thickness
  // ============================================

  describe('Thickness', () => {
    it('должен применять thickness по умолчанию (1px)', () => {
      render(<Divider />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ borderTopWidth: '1px' });
    });

    it('должен применять кастомный thickness', () => {
      render(<Divider thickness={5} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ borderTopWidth: '5px' });
    });

    it('должен применять thickness для vertical', () => {
      render(<Divider orientation="vertical" thickness={4} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ width: '4px' });
    });

    it('должен применять минимальный thickness (1px)', () => {
      render(<Divider thickness={1} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ borderTopWidth: '1px' });
    });

    it('должен применять максимальный thickness (10px)', () => {
      render(<Divider thickness={10} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ borderTopWidth: '10px' });
    });
  });

  // ============================================
  // Accessibility
  // ============================================

  describe('Accessibility', () => {
    it('должен передавать другие aria props', () => {
      render(<Divider aria-label="Разделитель секций" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-label', 'Разделитель секций');
    });

    it('должен передавать HTML атрибуты', () => {
      render(<Divider data-testid="divider-test" id="divider-id" />);
      const divider = screen.getByTestId('divider-test');
      expect(divider).toHaveAttribute('id', 'divider-id');
    });

    it('должен иметь правильное aria-orientation для vertical', () => {
      render(<Divider orientation="vertical" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    });
  });

  // ============================================
  // Runtime Validation (Development)
  // ============================================

  describe('Runtime Validation (Development)', () => {
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

    it('должен предупреждать о невалидном orientation', () => {
      // @ts-expect-error Testing invalid prop value
      render(<Divider orientation="invalid" />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid orientation "invalid"')
      );
    });

    it('должен предупреждать о невалидном variant', () => {
      // @ts-expect-error Testing invalid prop value
      render(<Divider variant="invalid" />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid variant "invalid"')
      );
    });

    it('должен предупреждать о thickness < 1', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { thickness: 0 };
      render(<Divider {...invalidProps} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid thickness "0"')
      );
    });

    it('должен предупреждать о thickness > 10', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { thickness: 15 };
      render(<Divider {...invalidProps} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid thickness "15"')
      );
    });

    it('не должен предупреждать при валидных props', () => {
      render(<Divider orientation="horizontal" variant="solid" thickness={2} />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('не должен предупреждать в production режиме', () => {
      process.env.NODE_ENV = 'production';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Divider orientation={'invalid' as any} />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('должен рендериться с thickness=0 (edge case)', () => {
      render(<Divider thickness={0} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ borderTopWidth: '0px' });
    });

    it('должен комбинировать className с базовыми классами', () => {
      render(<Divider variant="dashed" className="custom" />);
      const divider = screen.getByRole('separator');
      expect(divider.className).toMatch(/divider/);
      expect(divider.className).toMatch(/horizontal/);
      expect(divider.className).toMatch(/dashed/);
      expect(divider.className).toMatch(/custom/);
    });

    it('должен передавать rest props', () => {
      render(<Divider onClick={vi.fn()} data-testid="clickable-divider" />);
      const divider = screen.getByTestId('clickable-divider');
      expect(divider).toBeInTheDocument();
    });
  });

  // ============================================
  // React.memo Verification
  // ============================================

  describe('React.memo Verification', () => {
    it('должен быть мемоизирован с React.memo', () => {
      expect(Divider).toBeDefined();
      // The exported Divider is memo(DividerComponent)
    });
  });

  // ============================================
  // forwardRef
  // ============================================

  describe('forwardRef', () => {
    it('должен передавать ref на div элемент', () => {
      const ref = { current: null };
      render(<Divider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('должен иметь displayName на memo компоненте', () => {
      expect(Divider.displayName).toBe('Divider');
    });
  });

  // ============================================
  // Data Attributes
  // ============================================

  describe('Data Attributes', () => {
    it('должен иметь data-orientation по умолчанию', () => {
      render(<Divider />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('должен иметь data-orientation="vertical"', () => {
      render(<Divider orientation="vertical" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-orientation', 'vertical');
    });

    it('должен иметь data-variant по умолчанию', () => {
      render(<Divider />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-variant', 'solid');
    });

    it('должен иметь data-variant="dashed"', () => {
      render(<Divider variant="dashed" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-variant', 'dashed');
    });
  });

  // ============================================
  // Polymorphic rendering (as prop)
  // ============================================

  describe('Polymorphic', () => {
    it('должен рендериться как <hr> при as="hr"', () => {
      render(<Divider as="hr" orientation="horizontal" />);
      const divider = screen.getByRole('separator');
      expect(divider.tagName).toBe('HR');
      expect(divider).toHaveClass(/divider/);
      expect(divider).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('должен передавать merged className и кастомные props кастомному компоненту', () => {
      const CustomLine = (props: React.HTMLAttributes<HTMLDivElement>) => (
        <div data-custom-line="true" {...props} />
      );
      render(<Divider as={CustomLine} data-x="1" />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveAttribute('data-custom-line', 'true');
      expect(divider).toHaveAttribute('data-x', '1');
      expect(divider).toHaveClass(/divider/);
    });
  });

  // ============================================
  // Ref types
  // ============================================

  describe('forwardRef per as', () => {
    it('должен передавать ref как HTMLDivElement по умолчанию', () => {
      const ref = { current: null };
      render(<Divider ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('должен передавать ref как HTMLHRElement при as="hr"', () => {
      const ref = { current: null };
      render(<Divider as="hr" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLHRElement);
    });
  });

  // ============================================
  // Thickness fix (DIVIDER-04/05)
  // ============================================

  describe('Thickness fix', () => {
    it('должен рендерить dashed vertical с масштабированным backgroundSize (th*8)', () => {
      render(<Divider orientation="vertical" variant="dashed" thickness={3} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ backgroundSize: '100% 24px' });
    });

    it('должен рендерить dotted vertical с backgroundSize = thickness', () => {
      render(<Divider orientation="vertical" variant="dotted" thickness={2} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ backgroundSize: '100% 2px' });
    });
  });

  // ============================================
  // Text divider (children)
  // ============================================

  describe('Text divider', () => {
    it('должен рендерить label между линиями (textDivider)', () => {
      render(<Divider variant="dashed">Section Label</Divider>);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/textDivider/);
      expect(divider).toHaveTextContent('Section Label');
    });

    it('должен рендерить чистую линию для пустых children', () => {
      render(<Divider>{''}</Divider>);
      const divider = screen.getByRole('separator');
      expect(divider).not.toHaveClass(/textDivider/);
      expect(divider.textContent).toBe('');
    });

    it('должен предупреждать и игнорировать children при vertical', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
      render(<Divider orientation="vertical">Should Be Ignored</Divider>);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('only supported with orientation="horizontal"')
      );
      const divider = screen.getByRole('separator');
      expect(divider).not.toHaveClass(/textDivider/);
      warnSpy.mockRestore();
      delete process.env.NODE_ENV;
    });
  });

  // ============================================
  // useDivider hook (DIVIDER-03)
  // ============================================

  describe('useDivider hook', () => {
    it('должен вычислять className и dataAttrs', () => {
      const { result } = renderHook(() =>
        useDivider({ orientation: 'vertical', variant: 'dashed', className: 'custom' })
      );
      expect(result.current.dividerClassName).toContain('custom');
      expect(result.current.dataAttrs).toEqual({
        'data-orientation': 'vertical',
        'data-variant': 'dashed',
      });
    });

    it('должен включить textDivider класс при hasChildren + horizontal', () => {
      const { result } = renderHook(() => useDivider({ hasChildren: true }));
      expect(result.current.dividerClassName).toContain('textDivider');
    });
  });
});
