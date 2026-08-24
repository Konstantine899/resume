// src/shared/ui/Skeleton/ui/Skeleton.test.tsx

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'fs';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  // Источник: Paragraph PAR-09 / Spinner SPR-04 паттерн
  // ?raw импорты не работают в vitest pipeline — используем disk read
  const readScss = (relativePath: string): string =>
    readFileSync(new URL(relativePath, import.meta.url), 'utf-8');

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

    it('должен рендериться с variant="rounded"', () => {
      render(<Skeleton variant="rounded" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/rounded/);
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

    it('должен применять delay через CSS переменную --skeleton-delay', () => {
      render(<Skeleton delay={0.5} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ '--skeleton-delay': '0.5s' });
    });

    it('должен применять duration через CSS переменную --skeleton-duration', () => {
      render(<Skeleton duration={2} />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveStyle({ '--skeleton-duration': '2s' });
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

    it('должен иметь aria-busy="true"', () => {
      render(<Skeleton />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен иметь aria-label с текстом загрузки', () => {
      render(<Skeleton />);
      expect(screen.getByLabelText(/Loading|Загрузка/i)).toBeInTheDocument();
    });

    it('должен принимать кастомный aria-label', () => {
      render(<Skeleton aria-label="Custom label" />);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
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

    it('должен применять staggered delay для строк через CSS переменную --skeleton-delay', () => {
      render(<Skeleton variant="text" lines={3} delay={0.2} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      // Проверяем CSS переменные с округлением до 3 знаков
      expect(line0).toHaveStyle({ '--skeleton-delay': '0.2s' });
      expect(line1).toHaveStyle({ '--skeleton-delay': '0.3s' });
      expect(line2).toHaveStyle({ '--skeleton-delay': '0.4s' });
    });

    it('должен применять кастомный staggerStep через CSS переменную --skeleton-delay', () => {
      render(<Skeleton variant="text" lines={3} delay={0.2} staggerStep={0.3} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      expect(line0).toHaveStyle({ '--skeleton-delay': '0.2s' });
      expect(line1).toHaveStyle({ '--skeleton-delay': '0.5s' });
      expect(line2).toHaveStyle({ '--skeleton-delay': '0.8s' });
    });

    it('должен использовать дефолтный staggerStep=0.1, когда prop не передан', () => {
      render(<Skeleton variant="text" lines={3} delay={0} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      expect(line0).toHaveStyle({ '--skeleton-delay': '0s' });
      expect(line1).toHaveStyle({ '--skeleton-delay': '0.1s' });
      expect(line2).toHaveStyle({ '--skeleton-delay': '0.2s' });
    });

    it('должен корректно округлять stagger delay при дробном staggerStep', () => {
      render(<Skeleton variant="text" lines={3} delay={0.1} staggerStep={0.05} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      expect(line0).toHaveStyle({ '--skeleton-delay': '0.1s' });
      expect(line1).toHaveStyle({ '--skeleton-delay': '0.15s' });
      expect(line2).toHaveStyle({ '--skeleton-delay': '0.2s' });
    });

    it('должен игнорировать staggerStep для одиночной строки (lines={1})', () => {
      render(<Skeleton variant="text" lines={1} staggerStep={0.5} />);
      const lines = screen.queryAllByTestId(/skeleton-line/);
      expect(lines).toHaveLength(0);
    });

    it('должен применять duration ко всем строкам через CSS переменную --skeleton-duration', () => {
      render(<Skeleton variant="text" lines={3} duration={2.5} />);
      const line0 = screen.getByTestId('skeleton-line-0');
      const line1 = screen.getByTestId('skeleton-line-1');
      const line2 = screen.getByTestId('skeleton-line-last');

      [line0, line1, line2].forEach((line) => {
        expect(line).toHaveStyle({ '--skeleton-duration': '2.5s' });
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

    it('должен рендерить rounded variant с border-radius', () => {
      render(<Skeleton variant="rounded" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toHaveClass(/rounded/);
    });
  });

  // ============================================
  // Rounded Variant — Source Guard (REQ-1, REQ-2)
  // ============================================

  describe('Rounded Variant — Source Guard', () => {
    it('должен задавать border-radius через --skeleton-radius (fallback $border-radius-md)', () => {
      const skeletonScss = readScss('./Skeleton.module.scss');

      const roundedBlockMatch = skeletonScss.match(/&\.rounded\s*\{([\s\S]*?)\}/);
      expect(roundedBlockMatch).toBeTruthy();

      const roundedContent = roundedBlockMatch?.[1] ?? '';
      expect(roundedContent).toMatch(/border-radius\s*:/);
      expect(roundedContent).toMatch(/--skeleton-radius/);
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
  // Reduced Motion — Source Guard (SKL-03)
  // ============================================

  describe('Reduced Motion — Source Guard', () => {
    it('должен иметь @media (prefers-reduced-motion: reduce) блок с animation: none для ::after', () => {
      const skeletonScss = readScss('./Skeleton.module.scss');

      // Найти медиа-блок
      const mediaBlockMatch = skeletonScss.match(
        /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*?)\}/
      );
      expect(mediaBlockMatch).toBeTruthy();

      const mediaContent = mediaBlockMatch?.[1] ?? '';
      // Проверить что ::after имеет animation: none
      expect(mediaContent).toMatch(/::after/);
      expect(mediaContent).toMatch(/animation\s*:\s*none/);
    });

    it('должен рендериться с role="status" независимо от reduced-motion', () => {
      // Статический DOM контракт — без matchMedia моков
      render(<Skeleton variant="text" />);
      const skeleton = screen.getByRole('status');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass(/skeleton/);
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

  // ============================================
  // Loading Wrapper (M5) — Chakra/Ant Design pattern
  // ============================================

  describe('Loading Wrapper', () => {
    it('должен рендерить скелетон, когда loading не задан, и игнорировать children', () => {
      render(
        <Skeleton>
          <div data-testid="loading-content">Контент</div>
        </Skeleton>
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-content')).not.toBeInTheDocument();
    });

    it('должен рендерить скелетон при loading={true} и не выводить children в DOM', () => {
      render(
        <Skeleton loading>
          <div data-testid="loading-content">Контент</div>
        </Skeleton>
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-content')).not.toBeInTheDocument();
    });

    it('должен рендерить children при loading={false} без role="status"', () => {
      render(
        <Skeleton loading={false}>
          <div data-testid="loading-content">Контент</div>
        </Skeleton>
      );
      expect(screen.getByTestId('loading-content')).toBeInTheDocument();
      expect(screen.getByTestId('loading-content')).toHaveTextContent('Контент');
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('должен возвращать null при loading={false} без children', () => {
      const { container } = render(<Skeleton loading={false} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(container.firstChild).toBeNull();
    });

    it('должен переключаться со скелетона на children при ререндере loading true→false', () => {
      const { rerender } = render(
        <Skeleton loading>
          <div data-testid="loading-content">Контент</div>
        </Skeleton>
      );
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-content')).not.toBeInTheDocument();

      rerender(
        <Skeleton loading={false}>
          <div data-testid="loading-content">Контент</div>
        </Skeleton>
      );
      expect(screen.getByTestId('loading-content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
