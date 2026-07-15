import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Paragraph } from './Paragraph';
import cls from './Paragraph.module.scss';

describe('Paragraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендерить children текст', () => {
      render(<Paragraph>Текст параграфа</Paragraph>);

      expect(screen.getByText('Текст параграфа')).toBeInTheDocument();
    });

    it('должен рендерить JSX children', () => {
      render(
        <Paragraph>
          <strong>Bold</strong> и <em>italic</em>
        </Paragraph>
      );

      expect(screen.getByText('Bold')).toHaveTextContent('Bold');
      expect(screen.getByText('italic')).toHaveTextContent('italic');
    });

    it('должен применять paragraph класс', () => {
      const { container } = render(<Paragraph>Text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.paragraph);
    });

    it('должен применять custom className', () => {
      const { container } = render(<Paragraph className="custom-class">Text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass('custom-class');
    });

    it('должен использовать data-testid по умолчанию', () => {
      render(<Paragraph>Text</Paragraph>);

      expect(screen.getByTestId('Paragraph')).toBeInTheDocument();
    });

    it('должен принимать кастомный data-testid', () => {
      render(<Paragraph data-testid="custom-paragraph">Text</Paragraph>);

      expect(screen.getByTestId('custom-paragraph')).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('должен применять xs размер', () => {
      const { container } = render(<Paragraph size="xs">Extra Small</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.xs);
    });

    it('должен применять s размер', () => {
      const { container } = render(<Paragraph size="s">Small</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.s);
    });

    it('должен применять m размер по умолчанию', () => {
      const { container } = render(<Paragraph>Medium</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.m);
    });

    it('должен применять l размер', () => {
      const { container } = render(<Paragraph size="l">Large</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.l);
    });

    it('должен применять xl размер', () => {
      const { container } = render(<Paragraph size="xl">Extra Large</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.xl);
    });

    it('должен применять 2xl размер', () => {
      const { container } = render(<Paragraph size="2xl">2XL</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls['size-2xl']);
    });
  });

  describe('Theme Variants', () => {
    it('должен применять primary тему', () => {
      const { container } = render(<Paragraph theme="primary">Primary</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.primary);
    });

    it('должен применять muted тему', () => {
      const { container } = render(<Paragraph theme="muted">Muted</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.muted);
    });

    it('должен применять inverted тему', () => {
      const { container } = render(<Paragraph theme="inverted">Inverted</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.inverted);
    });

    it('должен применять error тему', () => {
      const { container } = render(<Paragraph theme="error">Error</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.error);
    });

    it('должен применять success тему', () => {
      const { container } = render(<Paragraph theme="success">Success</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.success);
    });

    it('должен применять warning тему', () => {
      const { container } = render(<Paragraph theme="warning">Warning</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.warning);
    });

    it('должен применять gradient тему', () => {
      const { container } = render(<Paragraph theme="gradient">Gradient</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.gradient);
    });
  });

  describe('Alignment', () => {
    it('должен применять left выравнивание по умолчанию', () => {
      const { container } = render(<Paragraph>Left</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.left);
    });

    it('должен применять center выравнивание', () => {
      const { container } = render(<Paragraph align="center">Center</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.center);
    });

    it('должен применять right выравнивание', () => {
      const { container } = render(<Paragraph align="right">Right</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.right);
    });
  });

  describe('Line Clamp', () => {
    it('должен применять line-clamp-2 класс', () => {
      const { container } = render(<Paragraph lineClamp={2}>Long text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls['line-clamp-2']);
    });

    it('должен применять line-clamp-3 класс', () => {
      const { container } = render(<Paragraph lineClamp={3}>Long text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls['line-clamp-3']);
    });

    it('должен применять line-clamp-4 класс', () => {
      const { container } = render(<Paragraph lineClamp={4}>Long text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls['line-clamp-4']);
    });

    it('должен применять line-clamp-5 класс', () => {
      const { container } = render(<Paragraph lineClamp={5}>Long text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls['line-clamp-5']);
    });

    it('должен предупреждать о невалидном lineClamp в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Paragraph lineClamp={7 as any}>Text</Paragraph>);

      expect(warnSpy).toHaveBeenCalledWith(
        'Paragraph: lineClamp должен быть от 2 до 5, получено: 7'
      );

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('не должен применять line-clamp класс при невалидном значении', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { container } = render(<Paragraph lineClamp={1 as any}>Text</Paragraph>);

      expect(container.querySelector('p')).not.toHaveClass(cls['line-clamp-1']);
    });

    it('не должен предупреждать в production режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Paragraph lineClamp={7 as any}>Text</Paragraph>);

      expect(warnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('не должен предупреждать при lineClamp={0} (falsy значение)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Paragraph lineClamp={0 as any}>Text</Paragraph>);

      expect(warnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('не должен предупреждать при lineClamp={6} (невалидное значение)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<Paragraph lineClamp={6 as any}>Text</Paragraph>);

      expect(warnSpy).toHaveBeenCalledWith(
        'Paragraph: lineClamp должен быть от 2 до 5, получено: 6'
      );

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('должен пробрасывать ref на p элемент', () => {
      const ref = vi.fn();
      render(<Paragraph ref={ref as unknown as React.Ref<HTMLParagraphElement>}>Text</Paragraph>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLParagraphElement));
    });

    it('должен использовать семантический тег p', () => {
      const { container } = render(<Paragraph>Text</Paragraph>);

      expect(container.querySelector('p')).toBeInTheDocument();
    });
  });

  describe('Default Props', () => {
    it('должен использовать m размер по умолчанию', () => {
      const { container } = render(<Paragraph>Text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.m);
    });

    it('должен использовать primary тему по умолчанию', () => {
      const { container } = render(<Paragraph>Text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.primary);
    });

    it('должен использовать left выравнивание по умолчанию', () => {
      const { container } = render(<Paragraph>Text</Paragraph>);

      expect(container.querySelector('p')).toHaveClass(cls.left);
    });

    it('должен использовать Paragraph data-testid по умолчанию', () => {
      render(<Paragraph>Text</Paragraph>);

      expect(screen.getByTestId('Paragraph')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('должен иметь displayName', () => {
      expect(Paragraph.displayName).toBe('Paragraph');
    });
  });
});
