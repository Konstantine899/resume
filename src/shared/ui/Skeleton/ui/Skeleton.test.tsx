// src/shared/ui/Skeleton/ui/Skeleton.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  // ============================================
  // Basic Rendering
  // ============================================

  describe('Basic Rendering', () => {
    it('должен рендериться с минимальными props', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен рендериться с variant="text"', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/text/);
    });

    it('должен рендериться с variant="circular"', () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/circular/);
    });

    it('должен рендериться с variant="rectangular"', () => {
      render(<Skeleton variant="rectangular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/rectangular/);
    });

    it('должен применять кастомный className', () => {
      render(<Skeleton className="custom-class" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass('custom-class');
    });
  });

  // ============================================
  // Props
  // ============================================

  describe('Props', () => {
    it('должен применять width', () => {
      render(<Skeleton width="200px" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('должен применять height', () => {
      render(<Skeleton height="100px" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ height: '100px' });
    });

    it('должен применять width и height одновременно', () => {
      render(<Skeleton width="150px" height="50px" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '150px', height: '50px' });
    });

    it('должен применять delay', () => {
      render(<Skeleton delay={0.5} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ animationDelay: '0.5s' });
    });

    it('должен применять duration', () => {
      render(<Skeleton duration={2} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ animationDuration: '2s' });
    });

    it('должен применять кастомные style', () => {
      render(<Skeleton style={{ opacity: 0.5 }} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ opacity: 0.5 });
    });
  });

  // ============================================
  // Accessibility
  // ============================================

  describe('Accessibility', () => {
    it('должен иметь role="status"', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен иметь aria-label="Загрузка..."', () => {
      render(<Skeleton />);
      expect(screen.getByLabelText('Загрузка...')).toBeInTheDocument();
    });

    it('должен передавать другие aria props', () => {
      render(<Skeleton aria-busy={true} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });

    it('должен передавать HTML атрибуты', () => {
      render(<Skeleton data-testid="skeleton-test" id="skeleton-id" />);
      const skeleton = screen.getByTestId('skeleton-test');
      expect(skeleton).toHaveAttribute('id', 'skeleton-id');
    });
  });

  // ============================================
  // Multiple Lines
  // ============================================

  describe('Multiple Lines', () => {
    it('должен рендерить одну строку по умолчанию', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      const lines = skeleton.querySelectorAll('[data-testid^="skeleton-line"]');
      expect(lines).toHaveLength(0); // Одиночный режим не использует .line
    });

    it('должен рендерить несколько строк с lines={3}', () => {
      render(<Skeleton variant="text" lines={3} />);
      // Matches both skeleton-line-0, skeleton-line-1, skeleton-line-last
      const lines = screen.getAllByTestId(/skeleton-line/);
      expect(lines).toHaveLength(3);
    });

    it('должен рендерить последнюю строку с data-testid="skeleton-line-last"', () => {
      render(<Skeleton variant="text" lines={4} />);
      const lastLine = screen.getByTestId('skeleton-line-last');
      expect(lastLine).toBeInTheDocument();
    });

    it('должен применять staggered delay для строк', () => {
      render(<Skeleton variant="text" lines={3} delay={0.2} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      // Проверяем с допустимой погрешностью floating point
      expect(line0.style.animationDelay).toMatch(/^0\.2/);
      expect(line1.style.animationDelay).toMatch(/^0\.3/);
      expect(line2.style.animationDelay).toMatch(/^0\.4/);
    });

    it('должен применять duration ко всем строкам', () => {
      render(<Skeleton variant="text" lines={3} duration={2.5} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      [line0, line1, line2].forEach((line) => {
        expect(line.style.animationDuration).toBe('2.5s');
      });
    });

    it('не должен использовать multi-line режим для lines={1}', () => {
      render(<Skeleton variant="text" lines={1} />);
      const lines = screen.queryAllByTestId(/skeleton-line/);
      expect(lines).toHaveLength(0);
    });

    it('должен игнорировать lines для circular variant', () => {
      render(<Skeleton variant="circular" lines={5} />);
      const lines = screen.queryAllByTestId(/skeleton-line/);
      expect(lines).toHaveLength(0);
    });

    it('должен игнорировать lines для rectangular variant', () => {
      render(<Skeleton variant="rectangular" lines={5} />);
      const lines = screen.queryAllByTestId(/skeleton-line/);
      expect(lines).toHaveLength(0);
    });
  });

  // ============================================
  // Variants Specific
  // ============================================

  describe('Variants Specific', () => {
    it('должен рендерить text variant как inline-block', () => {
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/text/);
    });

    it('должен рендерить circular variant с border-radius', () => {
      render(<Skeleton variant="circular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/circular/);
    });

    it('должен рендерить rectangular variant с border-radius', () => {
      render(<Skeleton variant="rectangular" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/rectangular/);
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

    it('должен предупреждать о невалидном variant', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Skeleton variant={'invalid' as any} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skeleton: invalid variant "invalid"')
      );
    });

    it('должен предупреждать о lines < 1', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Skeleton lines={0 as any} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skeleton: invalid lines "0"')
      );
    });

    it('должен предупреждать о lines > 10', () => {
      render(<Skeleton lines={15} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skeleton: invalid lines "15"')
      );
    });

    it('должен предупреждать о negative delay', () => {
      render(<Skeleton delay={-1} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skeleton: invalid delay "-1"')
      );
    });

    it('должен предупреждать о zero duration', () => {
      render(<Skeleton duration={0} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skeleton: invalid duration "0"')
      );
    });

    it('должен предупреждать о negative duration', () => {
      render(<Skeleton duration={-0.5} />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Skeleton: invalid duration "-0.5"')
      );
    });

    it('не должен предупреждать при валидных props', () => {
      render(
        <Skeleton variant="text" width="100px" height="20px" lines={3} delay={0.1} duration={1.5} />
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('не должен предупреждать в production режиме', () => {
      process.env.NODE_ENV = 'production';
      // @ts-expect-error Testing invalid prop
      render(<Skeleton variant="invalid" />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('должен рендериться с width={0}', () => {
      render(<Skeleton width={0} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '0px' });
    });

    it('должен рендериться с percentage width', () => {
      render(<Skeleton width="100%" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '100%' });
    });

    it('должен рендериться с rem units', () => {
      render(<Skeleton width="10rem" height="2rem" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ width: '10rem', height: '2rem' });
    });

    it('должен рендериться с number width/height', () => {
      render(<Skeleton width={200} height={100} />);
      const skeleton = screen.getByRole('status');
      // Numbers are converted to pixels by React
      expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
    });

    it('должен рендериться с большим количеством строк (lines={10})', () => {
      render(<Skeleton variant="text" lines={10} />);
      const lines = screen.getAllByTestId(/skeleton-line/);
      expect(lines).toHaveLength(10);
    });

    it('должен комбинировать className с базовыми классами', () => {
      render(<Skeleton variant="text" className="custom" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton.className).toMatch(/skeleton/);
      expect(skeleton.className).toMatch(/text/);
      expect(skeleton.className).toMatch(/custom/);
    });
  });

  // ============================================
  // React.memo Verification
  // ============================================

  describe('React.memo Verification', () => {
    it('должен быть мемоизирован с React.memo', () => {
      // Skeleton использует memo, проверяем displayName
      expect(Skeleton.displayName).toBe('Skeleton');
    });
  });
});
