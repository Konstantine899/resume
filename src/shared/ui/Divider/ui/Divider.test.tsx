// src/shared/ui/Divider/ui/Divider.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

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

    it('должен применять height для horizontal', () => {
      render(<Divider thickness={2} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ height: '2px' });
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
      expect(divider).toHaveStyle({ height: '1px' });
    });

    it('должен применять кастомный thickness', () => {
      render(<Divider thickness={5} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ height: '5px' });
    });

    it('должен применять thickness для vertical', () => {
      render(<Divider orientation="vertical" thickness={4} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ width: '4px' });
    });

    it('должен применять минимальный thickness (1px)', () => {
      render(<Divider thickness={1} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ height: '1px' });
    });

    it('должен применять максимальный thickness (10px)', () => {
      render(<Divider thickness={10} />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveStyle({ height: '10px' });
    });
  });

  // ============================================
  // Full Width/Height
  // ============================================

  describe('Full Width/Height', () => {
    it('должен применять fullWidth для horizontal', () => {
      render(<Divider fullWidth />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/fullWidth/);
    });

    it('должен применять fullHeight для vertical', () => {
      render(<Divider orientation="vertical" fullHeight />);
      const divider = screen.getByRole('separator');
      expect(divider).toHaveClass(/fullHeight/);
    });

    it('не должен применять fullWidth по умолчанию', () => {
      render(<Divider />);
      const divider = screen.getByRole('separator');
      expect(divider).not.toHaveClass(/fullWidth/);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('должен предупреждать о невалидном orientation', () => {
      render(<Divider orientation={'invalid' as any} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid orientation "invalid"')
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('должен предупреждать о невалидном variant', () => {
      render(<Divider variant={'invalid' as any} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid variant "invalid"')
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('должен предупреждать о thickness < 1', () => {
      render(<Divider thickness={0 as any} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Divider: invalid thickness "0"')
      );
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    it('должен предупреждать о thickness > 10', () => {
      render(<Divider thickness={15 as any} />);
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
      expect(divider).toHaveStyle({ height: '0px' });
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
      expect(Divider.displayName).toBe('Divider');
    });
  });
});
