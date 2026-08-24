import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { Spinner } from './Spinner';
import styles from './Spinner.module.scss';

// SCSS source read для reduced-motion контракта (SPR-04).
// `?raw` импорты перехватываются vitest CSS-module стабом (возвращает identity proxy,
// не исходник) — читаем с диска, паттерн PAR-09 (Paragraph.test.tsx).
const readScss = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf-8');

const spinnerScss = readScss('./Spinner.module.scss');

// Единый matchMedia-мок (4R R2: убирает троекратное дублирование литерала).
// Компонент НЕ вызывает matchMedia (reduced-motion — CSS-only, design Decision 2) —
// мок устанавливает «reduce-окружение» для DOM-контракта.
const createMatchMediaMock = (matchesHandler: (query: string) => boolean) =>
  vi.fn().mockImplementation((query: string) => ({
    matches: matchesHandler(query),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

describe('Spinner', () => {
  describe('Rendering', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText(/Loading|Загрузка/i)).toBeInTheDocument();
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять кастомный className', () => {
      const { container } = render(<Spinner className="custom-class" />);

      expect(container.innerHTML).toContain('custom-class');
    });

    it('должен принимать кастомный label', () => {
      render(<Spinner label="Custom loading" />);

      expect(screen.getByLabelText('Custom loading')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    const variants = ['spinner', 'double-ring'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<Spinner variant={variant} />);

        const element = screen.getByRole('status');
        expect(element).toBeInTheDocument();
      });
    });

    it('должен рендерить spinnerCircle для spinner', () => {
      render(<Spinner variant="spinner" />);

      const circle = screen.getByRole('status').querySelector(`.${styles.spinnerCircle ?? ''}`);
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveClass(styles.spinnerCircle ?? '');
    });

    it('должен рендерить outerRing и innerRing для double-ring', () => {
      render(<Spinner variant="double-ring" />);

      expect(
        screen.getByRole('status').querySelector(`.${styles.outerRing ?? ''}`)
      ).toBeInTheDocument();
      expect(
        screen.getByRole('status').querySelector(`.${styles.innerRing ?? ''}`)
      ).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<Spinner size={size} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Colors', () => {
    const colors = ['primary', 'secondary', 'accent', 'orange'] as const;

    colors.forEach((color) => {
      it(`должен рендериться с color="${color}"`, () => {
        render(<Spinner color={color} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
      });
    });
  });

  describe('Speed', () => {
    const speeds = ['slow', 'normal', 'fast'] as const;

    speeds.forEach((speed) => {
      it(`должен устанавливать --spinner-speed для speed="${speed}"`, () => {
        const { container } = render(<Spinner speed={speed} />);
        const root = container.firstChild as HTMLElement;

        expect(root.style.getPropertyValue('--spinner-speed')).toBeTruthy();
      });
    });

    it('должен устанавливать --double-ring-speed-outer для double-ring + speed', () => {
      const { container } = render(<Spinner variant="double-ring" speed="slow" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--double-ring-speed-outer')).toBe('1.5s');
      expect(root.style.getPropertyValue('--double-ring-speed-inner')).toBe('1.3s');
    });

    it('не должен устанавливать speed vars если speed не передан', () => {
      const { container } = render(<Spinner />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-speed')).toBe('');
    });
  });

  describe('Thickness', () => {
    const thicknesses = ['thin', 'normal', 'thick'] as const;

    thicknesses.forEach((thickness) => {
      it(`должен устанавливать --spinner-thickness для thickness="${thickness}"`, () => {
        const { container } = render(<Spinner thickness={thickness} />);
        const root = container.firstChild as HTMLElement;

        expect(root.style.getPropertyValue('--spinner-thickness')).toBeTruthy();
      });
    });

    it('должен устанавливать --double-ring-thickness для double-ring + thickness', () => {
      const { container } = render(<Spinner variant="double-ring" thickness="thick" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--double-ring-thickness')).toBe('5px');
    });
  });

  describe('Track Color', () => {
    it('должен устанавливать --spinner-track', () => {
      const { container } = render(<Spinner trackColor="#ff0000" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-track')).toBe('#ff0000');
    });

    it('должен устанавливать --spinner-track для double-ring', () => {
      const { container } = render(<Spinner variant="double-ring" trackColor="#00ff00" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-track')).toBe('#00ff00');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="status"', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен иметь aria-label', () => {
      render(<Spinner label="Loading" />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });

    it('должен иметь aria-busy="true"', () => {
      render(<Spinner />);

      expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен иметь aria-busy="true" для всех variants', () => {
      const variants = ['spinner', 'double-ring'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<Spinner variant={variant} />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        unmount();
      });
    });

    it('должен иметь aria-live="polite"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });
  });

  // ============================================
  // Reduced Motion
  // ============================================

  describe('Reduced Motion', () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('должен отключать анимацию при prefers-reduced-motion: reduce', () => {
      window.matchMedia = createMatchMediaMock(
        (query) => query === '(prefers-reduced-motion: reduce)'
      );

      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('должен иметь анимацию по умолчанию (без reduced-motion)', () => {
      window.matchMedia = createMatchMediaMock(() => false);

      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('HTML Attributes', () => {
    it('должен передавать дополнительные HTML атрибуты', () => {
      render(<Spinner data-testid="spinner" id="custom-spinner" />);

      expect(screen.getByTestId('spinner')).toBeInTheDocument();
      expect(screen.getByTestId('spinner')).toHaveAttribute('id', 'custom-spinner');
    });
  });

  // ============================================
  // Numeric size override (SPR-06)
  // ============================================

  describe('Size override (SPR-06)', () => {
    it('должен устанавливать --spinner-size: 48px для size={48}', () => {
      const { container } = render(<Spinner size={48} />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-size')).toBe('48px');
    });

    it('не должен применять preset-класс размера для size={48}', () => {
      const { container } = render(<Spinner size={48} />);
      const root = container.firstChild as HTMLElement;

      const presetClasses = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
      for (const preset of presetClasses) {
        expect(root).not.toHaveClass(styles[preset] ?? '');
      }
    });

    it('не должен устанавливать data-size для числового size', () => {
      render(<Spinner size={48} />);

      expect(screen.getByRole('status')).not.toHaveAttribute('data-size');
    });

    it('должен рендериться byte-identical для size="md" (preset)', () => {
      const { container } = render(<Spinner size="md" />);
      const root = container.firstChild as HTMLElement;

      expect(root).toHaveClass(styles.md ?? '');
      expect(root.style.getPropertyValue('--spinner-size')).toBe('');
      expect(root).toHaveAttribute('data-size', 'md');
    });
  });

  // ============================================
  // CSS-native alias props (SPR-07)
  // ============================================

  describe('Alias props (SPR-07)', () => {
    it('animationDuration="fast" должен устанавливать --spinner-speed как speed="fast"', () => {
      const { container } = render(<Spinner animationDuration="fast" variant="spinner" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-speed')).toBe('0.4s');
    });

    it('borderWidth="thick" должен устанавливать --spinner-thickness как thickness="thick"', () => {
      const { container } = render(<Spinner borderWidth="thick" variant="spinner" />);
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-thickness')).toBe('3px');
    });

    it('канонический speed должен выигрывать у animationDuration', () => {
      const { container } = render(
        <Spinner speed="slow" animationDuration="fast" variant="spinner" />
      );
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-speed')).toBe('1.2s');
    });

    it('канонический thickness должен выигрывать у borderWidth', () => {
      const { container } = render(
        <Spinner thickness="thin" borderWidth="thick" variant="spinner" />
      );
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--spinner-thickness')).toBe('1.5px');
    });

    it('должен устанавливать double-ring vars через алиасы', () => {
      const { container } = render(
        <Spinner variant="double-ring" animationDuration="slow" borderWidth="thin" />
      );
      const root = container.firstChild as HTMLElement;

      expect(root.style.getPropertyValue('--double-ring-speed-outer')).toBe('1.5s');
      expect(root.style.getPropertyValue('--double-ring-speed-inner')).toBe('1.3s');
      expect(root.style.getPropertyValue('--double-ring-thickness')).toBe('3px');
    });

    it('не должен выставлять data-speed/data-thickness от алиасов', () => {
      // 4R R3 INFO: алиасы — CSS-var-only; data-attrs остаются координатами канонических пропов
      const { container } = render(
        <Spinner animationDuration="fast" borderWidth="thick" variant="spinner" />
      );
      const root = container.firstChild as HTMLElement;

      expect(root).not.toHaveAttribute('data-speed');
      expect(root).not.toHaveAttribute('data-thickness');
      // канонические пропы по-прежнему выставляют их
      const canonical = render(<Spinner speed="fast" thickness="thick" variant="spinner" />);
      const canonicalRoot = canonical.container.firstChild as HTMLElement;
      expect(canonicalRoot).toHaveAttribute('data-speed', 'fast');
      expect(canonicalRoot).toHaveAttribute('data-thickness', 'thick');
    });
  });

  // ============================================
  // Compile-time type probes (SPR-06/07)
  // ============================================

  describe('Compile-time type probes (SPR-06/07)', () => {
    it('должен отклонять size="huge" (не preset и не число)', () => {
      // @ts-expect-error — size принимает только SpinnerSize | number
      <Spinner size="huge" />;
    });

    it('должен отклонять невалидное значение animationDuration', () => {
      // @ts-expect-error — animationDuration принимает только SpinnerSpeed
      <Spinner animationDuration="blazing" />;
    });
  });

  // ============================================
  // Delay prop (SPR-03)
  // ============================================

  describe('Delay prop (SPR-03)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('не должен рендерить ничего до истечения delay', () => {
      const { container } = render(<Spinner delay={300} />);

      expect(screen.queryByRole('status')).toBeNull();
      expect(container).toBeEmptyDOMElement();
    });

    it('должен появиться после истечения delay с aria-busy', () => {
      render(<Spinner delay={300} />);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-busy', 'true');
    });

    it('должен отменять таймер при размонтировании', () => {
      const { unmount } = render(<Spinner delay={500} />);
      expect(vi.getTimerCount()).toBeGreaterThan(0);

      unmount();
      act(() => {
        vi.advanceTimersByTime(600);
      });

      // 4R R3: getTimerCount детерминированнее глобального clearTimeout-spy
      // (React scheduler может вызвать clearTimeout и без нашего таймера)
      expect(vi.getTimerCount()).toBe(0);
    });

    it('должен показать спиннер при изменении delay на 0 до срабатывания таймера', () => {
      const { rerender } = render(<Spinner delay={300} />);

      expect(screen.queryByRole('status')).toBeNull();

      rerender(<Spinner delay={0} />);

      // 4R R3: адаптируем footgun delay → 0: спиннер не должен остаться скрытым навсегда
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(vi.getTimerCount()).toBe(0);
    });

    it('delay={0} должен рендериться сразу', () => {
      render(<Spinner delay={0} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('без delay должен рендериться немедленно (byte-identical)', () => {
      const { container } = render(<Spinner />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  // ============================================
  // Reduced motion — source guard (SPR-04)
  // ============================================

  describe('Reduced Motion source guard (SPR-04)', () => {
    it('должен объявлять animation: none для всех трёх motion-классов в reduce-блоке', () => {
      // 4R R3: якорь на литерал маркера + срез до закрывающей скобки — устойчивее к
      // переформатированию SCSS, чем regex на весь блок (не падает от переноса строк).
      const marker = '@media (prefers-reduced-motion: reduce)';
      const markerIndex = spinnerScss.indexOf(marker);

      expect(markerIndex).toBeGreaterThan(-1);

      const blockStart = spinnerScss.indexOf('{', markerIndex);
      const blockEnd = spinnerScss.indexOf('}', blockStart);
      const mediaBlock = spinnerScss.slice(blockStart, blockEnd + 1);

      expect(mediaBlock).toContain('.spinnerCircle');
      expect(mediaBlock).toContain('.outerRing');
      expect(mediaBlock).toContain('.innerRing');
      expect(mediaBlock).toContain('animation: none');
    });
  });

  // ============================================
  // Reduced motion — matchMedia + DOM contract (SPR-04)
  // ============================================

  describe('Reduced Motion matchMedia contract (SPR-04)', () => {
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
      window.matchMedia = createMatchMediaMock(
        (query) => query === '(prefers-reduced-motion: reduce)'
      );
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('должен сохранять статический DOM-контракт под reduce-окружением', () => {
      // 4R R2/R3: тавтологический тест «мок регистрирует запрос» удалён — он проверял
      // vi.fn, а не компонент. Детерминированная гарантия motion — source guard выше.
      render(<Spinner />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-busy', 'true');
      expect(spinner).toHaveAttribute('aria-live', 'polite');
      expect(spinner).toHaveAttribute('data-variant', 'spinner');
      expect(spinner).toHaveAttribute('data-size', 'md');
    });
  });
});
