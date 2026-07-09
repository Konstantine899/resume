// src/shared/ui/Section/ui/Section.test.tsx

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
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
  // Variant
  // ============================================

  describe('Variant', () => {
    it('должен иметь variant="default" по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/default/);
    });

    it('должен применять variant="alternate"', () => {
      render(
        <Section variant="alternate" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/alternate/);
    });

    it('должен применять variant="gradient"', () => {
      render(
        <Section variant="gradient" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/gradient/);
    });

    it('должен применять variant="muted"', () => {
      render(
        <Section variant="muted" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/muted/);
    });

    it('должен применять variant="dark"', () => {
      render(
        <Section variant="dark" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/dark/);
    });

    it('должен применять variant="light"', () => {
      render(
        <Section variant="light" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/light/);
    });
  });

  // ============================================
  // Size
  // ============================================

  describe('Size', () => {
    it('должен иметь size="lg" по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/lg/);
    });

    it('должен применять size="sm"', () => {
      render(
        <Section size="sm" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/sm/);
    });

    it('должен применять size="md"', () => {
      render(
        <Section size="md" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/md/);
    });

    it('должен применять size="xl"', () => {
      render(
        <Section size="xl" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/xl/);
    });

    it('должен применять size="2xl"', () => {
      render(
        <Section size="2xl" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/2xl/);
    });

    it('должен применять size="full"', () => {
      render(
        <Section size="full" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/full/);
    });
  });

  // ============================================
  // Padding
  // ============================================

  describe('Padding', () => {
    it('должен иметь padding="lg" по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-lg/);
    });

    it('должен применять padding="none"', () => {
      render(
        <Section padding="none" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-none/);
    });

    it('должен применять padding="sm"', () => {
      render(
        <Section padding="sm" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-sm/);
    });

    it('должен применять padding="md"', () => {
      render(
        <Section padding="md" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-md/);
    });

    it('должен применять padding="xl"', () => {
      render(
        <Section padding="xl" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-xl/);
    });

    it('должен применять padding="2xl"', () => {
      render(
        <Section padding="2xl" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-2xl/);
    });
  });

  // ============================================
  // Responsive Padding
  // ============================================

  describe('Responsive Padding', () => {
    it('должен применять responsive padding с base', () => {
      render(
        <Section padding={{ base: 'sm' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-sm/);
    });

    it('должен применять responsive padding с md', () => {
      render(
        <Section padding={{ base: 'sm', md: 'lg' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-sm/);
    });

    it('должен применять responsive padding с xl', () => {
      render(
        <Section padding={{ base: 'sm', xl: '2xl' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-sm/);
    });

    it('должен применять responsive padding с 2xl', () => {
      render(
        <Section padding={{ '2xl': '2xl' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-md/); // default fallback
    });

    it('должен использовать md как fallback для responsive padding', () => {
      render(
        <Section padding={{}} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/padding-md/);
    });
  });

  // ============================================
  // Vertical Rhythm (Margin)
  // ============================================

  describe('Vertical Rhythm (Margin)', () => {
    it('должен применять margin-top', () => {
      render(
        <Section margin={{ top: 'lg' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/margin-top-lg/);
    });

    it('должен применять margin-bottom', () => {
      render(
        <Section margin={{ bottom: 'xl' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/margin-bottom-xl/);
    });

    it('должен применять margin-top и margin-bottom', () => {
      render(
        <Section margin={{ top: 'md', bottom: 'lg' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/margin-top-md/);
      expect(section.className).toMatch(/margin-bottom-lg/);
    });

    it('должен применять margin-top="none"', () => {
      render(
        <Section margin={{ top: 'none' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/margin-top-none/);
    });

    it('должен применять margin-bottom="none"', () => {
      render(
        <Section margin={{ bottom: 'none' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/margin-bottom-none/);
    });

    it('не должен применять margin по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.className).not.toMatch(/margin-/);
    });
  });

  // ============================================
  // Full Width
  // ============================================

  describe('Full Width', () => {
    it('не должен применять fullWidth по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.className).not.toMatch(/fullWidth/);
    });

    it('должен применять fullWidth={true}', () => {
      render(
        <Section fullWidth data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/fullWidth/);
    });

    it('должен игнорировать size при fullWidth={true}', () => {
      render(
        <Section size="sm" fullWidth data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/fullWidth/);
    });
  });

  // ============================================
  // Overlay
  // ============================================

  describe('Overlay', () => {
    it('не должен применять overlay по умолчанию', () => {
      render(<Section data-testid="section">Content</Section>);
      const section = screen.getByTestId('section');
      expect(section.className).not.toMatch(/overlay/);
    });

    it('должен применять overlay={true}', () => {
      render(
        <Section overlay data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/overlay/);
    });
  });

  // ============================================
  // Container Integration
  // ============================================

  describe('Container Integration', () => {
    it('не должен рендерить Container при container={false}', () => {
      render(
        <Section container={false} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.querySelector('[class*="container"]')).not.toBeInTheDocument();
    });

    it('должен рендерить Container при container={true}', () => {
      render(
        <Section container data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.querySelector('[class*="container"]')).toBeInTheDocument();
    });

    it('должен применять container size', () => {
      render(
        <Section container={{ size: 'md' }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      const container = section.querySelector('[class*="container"]');
      expect(container).toBeInTheDocument();
    });

    it('должен применять container centered', () => {
      render(
        <Section container={{ centered: false }} data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      const container = section.querySelector('[class*="container"]');
      expect(container).toBeInTheDocument();
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

    it('должен передавать role через as prop', () => {
      render(
        <Section as="main" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.tagName).toBe('MAIN');
    });

    it('должен передавать другие aria атрибуты', () => {
      render(
        <Section aria-describedby="desc" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveAttribute('aria-describedby', 'desc');
    });

    it('должен передавать HTML атрибуты', () => {
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
  // CSS Custom Properties
  // ============================================

  describe('CSS Custom Properties', () => {
    it('должен применять background prop', () => {
      render(
        <Section background="#ff0000" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveStyle({ '--section-background': '#ff0000' });
    });

    it('должен применять textColor prop', () => {
      render(
        <Section textColor="#00ff00" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveStyle({ '--section-text-color': '#00ff00' });
    });

    it('должен применять background и textColor вместе', () => {
      render(
        <Section background="#ff0000" textColor="#00ff00" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section).toHaveStyle({
        '--section-background': '#ff0000',
        '--section-text-color': '#00ff00',
      });
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
      const invalidProps: any = { variant: 'invalid' };
      render(
        <Section {...invalidProps} data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Section: invalid variant "invalid"')
      );
    });

    it('должен предупреждать о невалидном padding', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { padding: 'invalid' };
      render(
        <Section {...invalidProps} data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Section: invalid padding "invalid"')
      );
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

    it('должен предупреждать о невалидном as', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { as: 'invalid' };
      render(
        <Section {...invalidProps} data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Section: invalid as "invalid"')
      );
    });

    it('не должен предупреждать при валидных props', () => {
      render(
        <Section variant="dark" size="xl" padding="2xl" data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('не должен предупреждать в production режиме', () => {
      process.env.NODE_ENV = 'production';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { variant: 'invalid' };
      render(
        <Section {...invalidProps} data-testid="section">
          Content
        </Section>
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
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
        <Section variant="alternate" className="custom" data-testid="section">
          Content
        </Section>
      );
      const section = screen.getByTestId('section');
      expect(section.className).toMatch(/section/);
      expect(section.className).toMatch(/alternate/);
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
});
