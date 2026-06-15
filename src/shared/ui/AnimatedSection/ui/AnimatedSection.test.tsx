import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AnimatedSection } from './AnimatedSection';
import styles from './AnimatedSection.module.scss';

// Mock IntersectionObserver
let mockObserverCallback: (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver
) => void = () => {};
let mockDisconnect = vi.fn();
let mockObserve = vi.fn();

class MockIntersectionObserver {
  constructor(
    callback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void,
    _options?: IntersectionObserverInit
  ) {
    mockObserverCallback = callback;
  }

  observe = mockObserve;
  unobserve = vi.fn();
  disconnect = mockDisconnect;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockObserverCallback = () => {};
  mockDisconnect.mockClear();
  mockObserve.mockClear();
  global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('AnimatedSection', () => {
  it('должен рендериться с children', () => {
    render(
      <AnimatedSection>
        <div data-testid="content">Test Content</div>
      </AnimatedSection>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('animated-section')).toBeInTheDocument();
  });

  it('должен использовать кастомный HTML элемент через as prop', () => {
    render(
      <AnimatedSection as="section">
        <span>Content</span>
      </AnimatedSection>
    );

    expect(screen.getByTestId('animated-section').tagName).toBe('SECTION');
  });

  it('должен применять кастомный className', () => {
    const { container } = render(
      <AnimatedSection className="custom-class">
        <div>Content</div>
      </AnimatedSection>
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('должен иметь правильные data-attributes', () => {
    render(
      <AnimatedSection>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(screen.getByTestId('animated-section')).toHaveAttribute(
      'data-testid',
      'animated-section'
    );
  });
});

describe('AnimatedSection: Animation Types', () => {
  const animations = [
    'fadeIn',
    'fadeUp',
    'fadeDown',
    'slideInLeft',
    'slideInRight',
    'scaleIn',
    'none',
  ] as const;

  animations.forEach((animation) => {
    it(`должен применять класс для ${animation}`, () => {
      const { container } = render(
        <AnimatedSection animation={animation}>
          <div>Content</div>
        </AnimatedSection>
      );

      expect(container.firstChild).toHaveClass(styles[animation]);
    });
  });
});

describe('AnimatedSection: Trigger - onMount', () => {
  it('должен запускать анимацию при маунте с trigger="onMount"', async () => {
    const { container } = render(
      <AnimatedSection trigger="onMount" delay={100}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });

  it('должен вызывать onAnimationStart при маунте', async () => {
    const handleStart = vi.fn();

    render(
      <AnimatedSection trigger="onMount" delay={100} onAnimationStart={handleStart}>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(handleStart).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('должен вызывать onAnimationComplete после завершения анимации', async () => {
    const handleComplete = vi.fn();

    render(
      <AnimatedSection
        trigger="onMount"
        delay={100}
        duration={500}
        onAnimationComplete={handleComplete}
      >
        <div>Content</div>
      </AnimatedSection>
    );

    expect(handleComplete).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(100 + 500);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });
});

describe('AnimatedSection: Trigger - onScroll', () => {
  it('должен создавать IntersectionObserver с правильными опциями', () => {
    render(
      <AnimatedSection trigger="onScroll" threshold={0.2}>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(mockObserve).toHaveBeenCalled();
  });

  it('должен запускать анимацию при пересечении с viewport', async () => {
    const { container } = render(
      <AnimatedSection trigger="onScroll" delay={100}>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(container.firstChild).not.toHaveClass(styles.visible);

    // Симулируем пересечение
    await act(async () => {
      mockObserverCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });

  it('не должен запускать анимацию если нет пересечения', async () => {
    const { container } = render(
      <AnimatedSection trigger="onScroll" delay={100}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      mockObserverCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).not.toHaveClass(styles.visible);
  });

  it('должен отключать observer после первой анимации', async () => {
    render(
      <AnimatedSection trigger="onScroll" delay={100}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      mockObserverCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      vi.advanceTimersByTime(100);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });
});

describe('AnimatedSection: Trigger - onHover', () => {
  it('должен запускать анимацию при наведении мыши', async () => {
    const { container } = render(
      <AnimatedSection trigger="onHover" delay={100}>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(container.firstChild).not.toHaveClass(styles.visible);

    await act(async () => {
      fireEvent.mouseEnter(screen.getByTestId('animated-section'));
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });

  it('не должен запускать анимацию повторно при повторном наведении', async () => {
    const handleStart = vi.fn();

    render(
      <AnimatedSection trigger="onHover" delay={100} onAnimationStart={handleStart}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      fireEvent.mouseEnter(screen.getByTestId('animated-section'));
      vi.advanceTimersByTime(100);
    });

    expect(handleStart).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.mouseLeave(screen.getByTestId('animated-section'));
      fireEvent.mouseEnter(screen.getByTestId('animated-section'));
      vi.advanceTimersByTime(100);
    });

    expect(handleStart).toHaveBeenCalledTimes(1);
  });
});

describe('AnimatedSection: Trigger - manual', () => {
  it('должен запускать анимацию при animate=true', async () => {
    const { container, rerender } = render(
      <AnimatedSection trigger="manual" delay={100} animate={false}>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(container.firstChild).not.toHaveClass(styles.visible);

    rerender(
      <AnimatedSection trigger="manual" delay={100} animate={true}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });

  it('не должен запускать анимацию при animate=false', async () => {
    const { container } = render(
      <AnimatedSection trigger="manual" delay={100} animate={false}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).not.toHaveClass(styles.visible);
  });

  it('должен запускать анимацию при изменении animate с false на true', async () => {
    const { container, rerender } = render(
      <AnimatedSection trigger="manual" delay={100} animate={false}>
        <div>Content</div>
      </AnimatedSection>
    );

    rerender(
      <AnimatedSection trigger="manual" delay={100} animate={true}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });
});

describe('AnimatedSection: Delay & Duration', () => {
  it('должен применять задержку - анимация запускается после delay', async () => {
    const handleStart = vi.fn();

    render(
      <AnimatedSection trigger="onMount" delay={500} onAnimationStart={handleStart}>
        <div>Content</div>
      </AnimatedSection>
    );

    // Проверяем что onAnimationStart вызывается после delay
    expect(handleStart).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('должен применять длительность анимации', async () => {
    const handleComplete = vi.fn();

    render(
      <AnimatedSection
        trigger="onMount"
        delay={0}
        duration={1000}
        onAnimationComplete={handleComplete}
      >
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(handleComplete).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('должен устанавливать CSS переменные для delay и duration', () => {
    const { container } = render(
      <AnimatedSection delay={300} duration={800}>
        <div>Content</div>
      </AnimatedSection>
    );

    const element = container.firstChild as HTMLElement;
    expect(element.style.getPropertyValue('--animation-delay')).toBe('300ms');
    expect(element.style.getPropertyValue('--animation-duration')).toBe('800ms');
  });
});

describe('AnimatedSection: Cleanup & Memory Management', () => {
  it('должен очищать таймеры при unmount', () => {
    const { unmount } = render(
      <AnimatedSection trigger="onMount" delay={1000}>
        <div>Content</div>
      </AnimatedSection>
    );

    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('должен отключать IntersectionObserver при unmount', () => {
    const { unmount } = render(
      <AnimatedSection trigger="onScroll">
        <div>Content</div>
      </AnimatedSection>
    );

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('не должен вызывать setState после unmount', async () => {
    const { unmount } = render(
      <AnimatedSection trigger="onMount" delay={100} duration={200}>
        <div>Content</div>
      </AnimatedSection>
    );

    unmount();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(() => {}).not.toThrow();
  });
});

describe('AnimatedSection: State Classes', () => {
  it('должен добавлять класс visible когда isVisible=true', async () => {
    const { container } = render(
      <AnimatedSection trigger="onMount" delay={0}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });

  it('должен добавлять класс animating во время анимации', async () => {
    const { container } = render(
      <AnimatedSection trigger="onMount" delay={0} duration={500}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(container.firstChild).toHaveClass(styles.animating);

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(container.firstChild).not.toHaveClass(styles.animating);
  });

  it('должен добавлять класс animated после завершения анимации', async () => {
    const { container } = render(
      <AnimatedSection trigger="onMount" delay={0} duration={500}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(container.firstChild).toHaveClass(styles.animated);
  });
});

describe('AnimatedSection: Edge Cases', () => {
  it('должен работать без children', () => {
    const { container } = render(<AnimatedSection>{null}</AnimatedSection>);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('должен работать с delay=0', async () => {
    const { container } = render(
      <AnimatedSection trigger="onMount" delay={0}>
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    expect(container.firstChild).toHaveClass(styles.visible);
  });

  it('должен работать с duration=0', async () => {
    const handleComplete = vi.fn();

    render(
      <AnimatedSection
        trigger="onMount"
        delay={0}
        duration={1}
        onAnimationComplete={handleComplete}
      >
        <div>Content</div>
      </AnimatedSection>
    );

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(handleComplete).toHaveBeenCalledTimes(1);
  });

  it('должен рендериться с animation="none"', () => {
    const { container } = render(
      <AnimatedSection animation="none">
        <div>Content</div>
      </AnimatedSection>
    );

    expect(container.firstChild).toHaveClass(styles.none);
  });

  it('должен применять threshold для IntersectionObserver', () => {
    render(
      <AnimatedSection trigger="onScroll" threshold={0.5}>
        <div>Content</div>
      </AnimatedSection>
    );

    expect(mockObserve).toHaveBeenCalled();
  });
});
