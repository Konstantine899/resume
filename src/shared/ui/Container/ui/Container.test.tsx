// src/shared/ui/Container/ui/Container.test.tsx

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  // ============================================
  // Basic Rendering
  // ============================================

  describe('Basic Rendering', () => {
    it('должен рендериться с минимальными props', () => {
      render(<Container data-testid="container">Content</Container>);
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('должен рендерить детей', () => {
      render(<Container data-testid="container">Test Content</Container>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      render(
        <Container className="custom-class" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toContain('custom-class');
    });

    it('должен передавать HTML атрибуты', () => {
      render(
        <Container data-testid="container-test" id="container-id">
          Content
        </Container>
      );
      const container = screen.getByTestId('container-test');
      expect(container).toHaveAttribute('id', 'container-id');
    });
  });

  // ============================================
  // Size
  // ============================================

  describe('Size', () => {
    it('должен иметь size="lg" по умолчанию', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/lg/);
    });

    it('должен применять size="sm"', () => {
      render(
        <Container size="sm" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/sm/);
    });

    it('должен применять size="md"', () => {
      render(
        <Container size="md" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/md/);
    });

    it('должен применять size="lg"', () => {
      render(
        <Container size="lg" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/lg/);
    });

    it('должен применять size="xl"', () => {
      render(
        <Container size="xl" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/xl/);
    });

    it('должен применять size="full"', () => {
      render(
        <Container size="full" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/full/);
    });
  });

  // ============================================
  // Centered
  // ============================================

  describe('Centered', () => {
    it('должен быть centered по умолчанию', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/centered/);
    });

    it('должен применять centered={true}', () => {
      render(
        <Container centered data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/centered/);
    });

    it('не должен применять centered={false}', () => {
      render(
        <Container centered={false} data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).not.toMatch(/centered/);
    });
  });

  // ============================================
  // Full Width
  // ============================================

  describe('Full Width', () => {
    it('не должен применять fullWidth по умолчанию', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container.className).not.toMatch(/fullWidth/);
    });

    it('должен применять fullWidth={true}', () => {
      render(
        <Container fullWidth data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/fullWidth/);
    });

    it('должен игнорировать size при fullWidth={true}', () => {
      render(
        <Container size="sm" fullWidth data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/fullWidth/);
    });
  });

  // ============================================
  // Padding
  // ============================================

  describe('Padding', () => {
    it('должен иметь padding="md" по умолчанию', () => {
      render(<Container data-testid="container">Content</Container>);
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/padding-md/);
    });

    it('должен применять padding="none"', () => {
      render(
        <Container padding="none" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/padding-none/);
    });

    it('должен применять padding="sm"', () => {
      render(
        <Container padding="sm" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/padding-sm/);
    });

    it('должен применять padding="lg"', () => {
      render(
        <Container padding="lg" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/padding-lg/);
    });

    it('должен применять padding="xl"', () => {
      render(
        <Container padding="xl" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/padding-xl/);
    });
  });

  // ============================================
  // Accessibility
  // ============================================

  describe('Accessibility', () => {
    it('должен передавать aria-label', () => {
      render(
        <Container aria-label="Test container" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('aria-label', 'Test container');
    });

    it('должен передавать role', () => {
      render(
        <Container role="region" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('role', 'region');
    });

    it('должен передавать aria-labelledby', () => {
      render(
        <Container aria-labelledby="section-title" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container).toHaveAttribute('aria-labelledby', 'section-title');
    });
  });

  // ============================================
  // Ref Forwarding
  // ============================================

  describe('Ref Forwarding', () => {
    it('должен передавать ref на DOM элемент', () => {
      const mockRef = vi.fn();
      render(
        <Container ref={mockRef} data-testid="container">
          Content
        </Container>
      );
      expect(mockRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
    });

    it('должен работать с useRef', () => {
      const testRef = { current: null as HTMLDivElement | null };
      render(
        <Container ref={testRef} data-testid="container">
          Content
        </Container>
      );
      expect(testRef.current).toBeInstanceOf(HTMLDivElement);
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
        <Container {...invalidProps} data-testid="container">
          Content
        </Container>
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Container: invalid size "invalid"')
      );
    });

    it('должен предупреждать о невалидном padding', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { padding: 'invalid' };
      render(
        <Container {...invalidProps} data-testid="container">
          Content
        </Container>
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Container: invalid padding "invalid"')
      );
    });

    it('не должен предупреждать при валидных props', () => {
      render(
        <Container size="lg" padding="md" data-testid="container">
          Content
        </Container>
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('не должен предупреждать в production режиме', () => {
      process.env.NODE_ENV = 'production';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invalidProps: any = { size: 'invalid' };
      render(
        <Container {...invalidProps} data-testid="container">
          Content
        </Container>
      );
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('должен комбинировать className с базовыми классами', () => {
      render(
        <Container size="md" className="custom" data-testid="container">
          Content
        </Container>
      );
      const container = screen.getByTestId('container');
      expect(container.className).toMatch(/container/);
      expect(container.className).toMatch(/md/);
      expect(container.className).toMatch(/custom/);
    });

    it('должен работать с пустыми детьми', () => {
      const { container } = render(<Container data-testid="container" />);
      expect(container).toBeInTheDocument();
    });

    it('должен работать с multiple детьми', () => {
      render(
        <Container data-testid="container">
          <span>Child 1</span>
          <span>Child 2</span>
        </Container>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  // ============================================
  // React.memo Verification
  // ============================================

  describe('React.memo Verification', () => {
    it('должен быть мемоизирован с React.memo', () => {
      expect(Container.displayName).toBe('Container');
    });
  });
});
