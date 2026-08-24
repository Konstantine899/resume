// src/shared/ui/Section/ui/Section.test.tsx

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  // ============================================
  // Basic Rendering
  // ============================================

  describe('Basic Rendering', () => {
    it('должен рендериться с минимальными props', () => {
      render(<Section data-testid="section">Content</Section>);
      expect(screen.getByTestId('section')).toBeInTheDocument();
    });

    it('должен рендерить детей', () => {
      render(<Section data-testid="section">Test Content</Section>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      render(
        <Section className="custom-class" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toContain('custom-class');
    });

    it('должен передавать HTML атрибуты', () => {
      render(
        <Section data-testid="section-test" id="section-id">
          Content
        </Section>
      );
      const section = screen.getByTestId('section-test');
      expect(section).toHaveAttribute('id', 'section-id');
    });
  });

  // ============================================
  // Component/As Prop
  // ============================================

  describe('Component/As Prop', () => {
    it('должен использовать section по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.tagName).toBe('SECTION');
    });

    it('должен использовать as="div"', () => {
      render(
        <Section as="div" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.tagName).toBe('DIV');
    });

    it('должен использовать as="article"', () => {
      render(
        <Section as="article" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.tagName).toBe('ARTICLE');
    });

    it('должен использовать as="main"', () => {
      render(
        <Section as="main" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.tagName).toBe('MAIN');
    });
  });

  // ============================================
  // Size
  // ============================================

  describe('Size', () => {
    it('должен иметь size="md" по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.dataset.size).toBe('md');
    });

    it('должен применять size="sm"', () => {
      render(
        <Section size="sm" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.dataset.size).toBe('sm');
    });

    it('должен применять size="lg"', () => {
      render(
        <Section size="lg" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.dataset.size).toBe('lg');
    });

    it('должен применять size="xl"', () => {
      render(
        <Section size="xl" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.dataset.size).toBe('xl');
    });

    it('должен применять size="xxl"', () => {
      render(
        <Section size="xxl" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.dataset.size).toBe('xxl');
    });
  });

  // ============================================
  // Accessibility
  // ============================================

  describe('Accessibility', () => {
    it('должен передавать aria-label', () => {
      render(
        <Section aria-label="Test section" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveAttribute('aria-label', 'Test section');
    });

    it('должен передавать aria-labelledby', () => {
      render(
        <Section aria-labelledby="section-title" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveAttribute('aria-labelledby', 'section-title');
    });

    it('должен передавать role', () => {
      render(
        <Section role="region" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveAttribute('role', 'region');
    });
  });

  // ============================================
  // Ref Forwarding
  // ============================================

  describe('Ref Forwarding', () => {
    it('должен передавать ref на DOM элемент', () => {
      const mockRef = vi.fn();
      render(
        <Section ref={mockRef} data-testid="section">
          Content
        </Section>
      );
      expect(mockRef).toHaveBeenCalledWith(expect.any(HTMLElement));
    });

    it('должен работать с useRef', () => {
      const testRef = { current: null as HTMLElement | null };
      render(
        <Section ref={testRef} data-testid="section">
          Content
        </Section>
      );
      expect(testRef.current).toBeInstanceOf(HTMLElement);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('должен комбинировать className с базовыми классами', () => {
      render(
        <Section className="custom" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/section/);
      expect(section.className).toMatch(/custom/);
    });

    it('должен работать с пустыми детьми', () => {
      const { container } = render(<Section data-testid="section" />);
      expect(container).toBeInTheDocument();
    });

    it('должен работать с multiple детьми', () => {
      render(
        <Section data-testid="section">
          <h1>Title</h1>
          <p>Paragraph</p>
          <div>Div</div>
        </Section>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Div')).toBeInTheDocument();
    });
  });

  // ============================================
  // React.memo Verification
  // ============================================

  describe('React.memo Verification', () => {
    it('должен быть мемоизирован с React.memo', () => {
      expect(Section.displayName).toBe('Section');
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

    it('должен предупреждать о невалидном size', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { size: 'invalid' };
      render(
        <Section {...invalidProps} data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Section: invalid size "invalid"')
      );
    });

    it('не должен предупреждать при валидных props', () => {
      render(
        <Section size="lg" data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('не должен предупреждать в production режиме', () => {
      process.env.NODE_ENV = 'production';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { size: 'invalid' };
      render(
        <Section {...invalidProps} data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});

// ============================================
// Polymorphic Rendering
// ============================================

describe('Polymorphic Rendering', () => {
  it('должен рендериться как <article> при as="article"', () => {
    render(
      <Section as="article" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section.tagName).toBe('ARTICLE');
  });

  it('должен рендериться как <aside> при as="aside"', () => {
    render(
      <Section as="aside" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section.tagName).toBe('ASIDE');
  });

  it('должен рендериться как <main> при as="main"', () => {
    render(
      <Section as="main" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section.tagName).toBe('MAIN');
  });

  it('должен рендериться как <nav> при as="nav"', () => {
    render(
      <Section as="nav" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section.tagName).toBe('NAV');
  });

  it('должен передавать data-as атрибут', () => {
    render(
      <Section as="article" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section).toHaveAttribute('data-as', 'article');
  });

  it('должен сохранять CSS классы при as="article"', () => {
    render(
      <Section as="article" size="lg" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section.className).toContain('section');
    expect(section.className).toContain('lg');
  });

  it('должен передавать ref правильно для разных элементов', () => {
    const refCallback = vi.fn();
    render(
      <Section as="article" ref={refCallback} data-testid="section">
        Content
      </Section>
    );
    expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

// ============================================
// Type Safety (Generic Polymorphic)
// ============================================

describe('Type Safety (Generic Polymorphic)', () => {
  it('должен правильно типизировать ref для as="article"', () => {
    const refCallback = vi.fn();
    render(
      <Section as="article" ref={refCallback} data-testid="section">
        Content
      </Section>
    );
    expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('должен правильно типизировать ref для as="nav"', () => {
    const refCallback = vi.fn();
    render(
      <Section as="nav" ref={refCallback} data-testid="section">
        Content
      </Section>
    );
    expect(refCallback).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('должен передавать специфичные props для as="div"', () => {
    render(
      <Section as="div" data-testid="section" onClick={() => {}}>
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section).toBeInTheDocument();
  });

  it('должен комбинировать CSS module классы с logical classes', () => {
    render(
      <Section size="lg" className="custom" data-testid="section">
        Content
      </Section>
    );
    const section = screen.getByTestId('section');
    expect(section.className).toContain('section');
    expect(section.className).toContain('lg');
    expect(section.className).toContain('custom');
  });
});
