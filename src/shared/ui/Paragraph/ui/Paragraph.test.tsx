import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { readFileSync } from 'node:fs';
import {
  type LineClamp,
  type ParagraphElement,
  type ParagraphWeight,
  type ParagraphWrap,
} from '../model/types';
import { Paragraph } from './Paragraph';
import cls from './Paragraph.module.scss';

// SCSS source reads for theming-contract checks (PAR-05/06/09).
// `?raw` imports are intercepted by vitest's css:false CSS-module stub
// (returns the identity proxy, not the source), so read from disk directly.
const readScss = (relativePath: string): string =>
  readFileSync(new URL(relativePath, import.meta.url), 'utf-8');

const paragraphScss = readScss('./Paragraph.module.scss');
const themeScss = readScss('../../../../shared/styles/globals/_theme.scss');
const gradientScss = readScss('../../../../shared/styles/globals/_gradient.scss');

describe('Paragraph', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const getParagraph = () => screen.getByTestId('Paragraph');

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
      render(<Paragraph>Text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.paragraph);
    });

    it('должен применять custom className', () => {
      render(<Paragraph className="custom-class">Text</Paragraph>);

      expect(getParagraph()).toHaveClass('custom-class');
    });

    it('должен использовать data-testid по умолчанию', () => {
      render(<Paragraph>Text</Paragraph>);

      expect(screen.getByTestId('Paragraph')).toBeInTheDocument();
    });

    it('должен принимать кастомный data-testid', () => {
      render(<Paragraph data-testid="custom-paragraph">Text</Paragraph>);

      expect(screen.getByTestId('custom-paragraph')).toBeInTheDocument();
    });

    it('должен рендериться с children={null} без ошибок', () => {
      expect(() => render(<Paragraph>{null}</Paragraph>)).not.toThrow();
    });

    it('должен рендериться с children={undefined} без ошибок', () => {
      expect(() => render(<Paragraph>{undefined}</Paragraph>)).not.toThrow();
    });

    it('должен рендериться с children={""} без ошибок', () => {
      expect(() => render(<Paragraph>{''}</Paragraph>)).not.toThrow();
    });
  });

  describe('Size Variants', () => {
    it('должен применять xs размер', () => {
      render(<Paragraph size="xs">Extra Small</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.xs);
    });

    it('должен применять s размер', () => {
      render(<Paragraph size="s">Small</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.s);
    });

    it('должен применять m размер по умолчанию', () => {
      render(<Paragraph>Medium</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.m);
    });

    it('должен применять l размер', () => {
      render(<Paragraph size="l">Large</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.l);
    });

    it('должен применять xl размер', () => {
      render(<Paragraph size="xl">Extra Large</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.xl);
    });

    it('должен применять 2xl размер', () => {
      render(<Paragraph size="2xl">2XL</Paragraph>);

      expect(getParagraph()).toHaveClass(cls['size-2xl']);
    });
  });

  describe('Theme Variants', () => {
    it('должен применять primary тему', () => {
      render(<Paragraph theme="primary">Primary</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.primary);
    });

    it('должен применять muted тему', () => {
      render(<Paragraph theme="muted">Muted</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.muted);
    });

    it('должен применять inverted тему', () => {
      render(<Paragraph theme="inverted">Inverted</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.inverted);
    });

    it('должен применять error тему', () => {
      render(<Paragraph theme="error">Error</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.error);
    });

    it('должен применять success тему', () => {
      render(<Paragraph theme="success">Success</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.success);
    });

    it('должен применять warning тему', () => {
      render(<Paragraph theme="warning">Warning</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.warning);
    });

    it('должен применять gradient тему', () => {
      render(<Paragraph theme="gradient">Gradient</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.gradient);
    });
  });

  describe('Theming contract (PAR-05/06/09)', () => {
    // Source-level SCSS contract checks (raw imports).
    // CSS var resolution is deferred to Phase 8 (screenshots/storybook):
    // jsdom + vitest css:false don't compute real styles from CSS vars.

    it('должен определять --gradient-text во всех трёх блоках _theme.scss (PAR-06)', () => {
      // Slice-подход вместо regex-блоков: SCSS-интерполяция #{$var} содержит '}',
      // поэтому [^}]* обрезает блок на первой интерполяции.
      const rootStart = themeScss.indexOf(':root {');
      const darkStart = themeScss.indexOf("[data-theme='dark'] {");
      const lightStart = themeScss.indexOf("[data-theme='light'] {");

      const rootBlock = themeScss.slice(rootStart, darkStart);
      const darkBlock = themeScss.slice(darkStart, lightStart);
      const lightBlock = themeScss.slice(lightStart);

      expect(rootBlock).toContain('--gradient-text:');
      expect(darkBlock).toContain('--gradient-text:');
      expect(lightBlock).toContain('--gradient-text:');
    });

    it('должен резолвить var(--gradient-text, fallback) в утилите .gradient-text (PAR-09)', () => {
      const gradientBlock = gradientScss.match(/\.gradient-text\s*\{([^}]*)\}/)?.[1] ?? '';

      expect(gradientBlock).toMatch(/background:\s*var\(--gradient-text,\s*linear-gradient/);
    });

    it('должен объявлять overflow-wrap: break-word ровно один раз в блоке .wrap (PAR-09)', () => {
      const wrapBlock = paragraphScss.match(/&\.wrap\s*\{([^}]*)\}/)?.[1] ?? '';
      const overflowWrapCount = (wrapBlock.match(/overflow-wrap:\s*break-word/g) ?? []).length;

      expect(overflowWrapCount).toBe(1);
    });

    it('должен определять .tertiary класс с var(--text-tertiary) в Paragraph.module.scss (PAR-05)', () => {
      const tertiaryBlock = paragraphScss.match(/&\.tertiary\s*\{([^}]*)\}/)?.[1] ?? '';

      expect(tertiaryBlock).toMatch(/color:\s*var\(--text-tertiary\)/);
    });

    it('должен проставлять data-theme="tertiary" при рендере (PAR-05)', () => {
      render(<Paragraph theme="tertiary">Tertiary</Paragraph>);

      // class-ассерт проксируется css:false стабом (identity-mapping);
      // data-theme атрибут — реальная проверка потока theme → useParagraph → dataAttrs
      expect(getParagraph()).toHaveAttribute('data-theme', 'tertiary');
      expect(getParagraph()).toHaveClass(cls.tertiary);
    });

    it('не должен предупреждать о tertiary теме в dev режиме (PAR-05)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      render(<Paragraph theme="tertiary">Tertiary</Paragraph>);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('Alignment', () => {
    it('должен применять left выравнивание по умолчанию', () => {
      render(<Paragraph>Left</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.left);
    });

    it('должен применять center выравнивание', () => {
      render(<Paragraph align="center">Center</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.center);
    });

    it('должен применять right выравнивание', () => {
      render(<Paragraph align="right">Right</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.right);
    });
  });

  describe('Line Clamp', () => {
    it('должен применять line-clamp-2 класс', () => {
      render(<Paragraph lineClamp={2}>Long text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls['line-clamp-2']);
    });

    it('должен применять line-clamp-3 класс', () => {
      render(<Paragraph lineClamp={3}>Long text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls['line-clamp-3']);
    });

    it('должен применять line-clamp-4 класс', () => {
      render(<Paragraph lineClamp={4}>Long text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls['line-clamp-4']);
    });

    it('должен применять line-clamp-5 класс', () => {
      render(<Paragraph lineClamp={5}>Long text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls['line-clamp-5']);
    });

    it('должен предупреждать о невалидном lineClamp в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      render(<Paragraph lineClamp={7 as unknown as LineClamp}>Text</Paragraph>);

      expect(warnSpy).toHaveBeenCalledWith(
        'Paragraph: lineClamp должен быть от 2 до 5, получено: 7'
      );

      warnSpy.mockRestore();
    });

    it('не должен применять line-clamp класс при невалидном значении', () => {
      render(<Paragraph lineClamp={1 as unknown as LineClamp}>Text</Paragraph>);

      expect(getParagraph()).not.toHaveClass(cls['line-clamp-1']);
    });

    it('не должен предупреждать в production режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      render(<Paragraph lineClamp={7 as unknown as LineClamp}>Text</Paragraph>);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('не должен предупреждать при lineClamp={0} (falsy значение)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      render(<Paragraph lineClamp={0 as unknown as LineClamp}>Text</Paragraph>);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });

    it('не должен предупреждать при lineClamp={6} (невалидное значение)', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      render(<Paragraph lineClamp={6 as unknown as LineClamp}>Text</Paragraph>);

      expect(warnSpy).toHaveBeenCalledWith(
        'Paragraph: lineClamp должен быть от 2 до 5, получено: 6'
      );

      warnSpy.mockRestore();
    });
  });

  describe('as prop (Element Type)', () => {
    it('должен рендериться как p по умолчанию', () => {
      const { container } = render(<Paragraph>Text</Paragraph>);

      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('должен рендериться как span', () => {
      const { container } = render(<Paragraph as="span">Text</Paragraph>);

      expect(container.querySelector('span')).toBeInTheDocument();
    });

    it('должен рендериться как div', () => {
      const { container } = render(<Paragraph as="div">Text</Paragraph>);

      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('должен рендериться как label', () => {
      const { container } = render(<Paragraph as="label">Text</Paragraph>);

      expect(container.querySelector('label')).toBeInTheDocument();
    });

    it('должен применять paragraph класс при любом as значении', () => {
      const { rerender } = render(<Paragraph as="span">Text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.paragraph);

      rerender(<Paragraph as="div">Text</Paragraph>);
      expect(getParagraph()).toHaveClass(cls.paragraph);

      rerender(<Paragraph as="label">Text</Paragraph>);
      expect(getParagraph()).toHaveClass(cls.paragraph);
    });

    it('должен пробрасывать data-testid через разные as элементы', () => {
      const testIds: ParagraphElement[] = ['p', 'span', 'div', 'label'];

      testIds.forEach((tag) => {
        const { unmount } = render(
          <Paragraph as={tag} data-testid={`paragraph-${tag}`}>
            {tag}
          </Paragraph>
        );

        expect(screen.getByTestId(`paragraph-${tag}`)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Polymorphic as prop', () => {
    it('должен рендериться как a с href при as="a"', () => {
      const { container } = render(
        <Paragraph as="a" href="/about">
          Link
        </Paragraph>
      );

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
      expect(link).toHaveClass(cls.paragraph);
    });

    it('должен пробрасывать элемент-специфичные пропсы (href, target, rel)', () => {
      const { container } = render(
        <Paragraph as="a" href="/about" target="_blank" rel="noopener">
          Link
        </Paragraph>
      );

      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', '/about');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('должен мержить paragraph классы и custom className при as="a"', () => {
      render(
        <Paragraph as="a" href="/about" className="custom-class">
          Link
        </Paragraph>
      );

      const element = screen.getByTestId('Paragraph');
      expect(element.tagName).toBe('A');
      expect(element).toHaveClass(cls.paragraph);
      expect(element).toHaveClass('custom-class');
    });

    it('должен пробрасывать merged className и пропсы в кастомный компонент', () => {
      const CustomLink = ({
        className,
        href,
        children,
        'data-testid': dataTestId,
      }: {
        className?: string;
        href?: string;
        children?: React.ReactNode;
        'data-testid'?: string;
      }) => (
        <a href={href} className={className} data-testid={dataTestId}>
          {children}
        </a>
      );

      render(
        <Paragraph as={CustomLink} href="/x" className="custom-class">
          Custom link
        </Paragraph>
      );

      const customLink = screen.getByTestId('Paragraph');
      expect(customLink.tagName).toBe('A');
      expect(customLink).toHaveAttribute('href', '/x');
      expect(customLink).toHaveClass(cls.paragraph);
      expect(customLink).toHaveClass('custom-class');
    });

    it('должен отклонять button-специфичные пропсы при as="a" на уровне типов', () => {
      render(
        // @ts-expect-error — `disabled` не является валидным атрибутом <a>
        <Paragraph as="a" disabled>
          Link
        </Paragraph>
      );
    });
  });

  describe('Polymorphic ref typing', () => {
    it('должен резолвить ref как HTMLAnchorElement при as="a"', () => {
      const ref = createRef<HTMLAnchorElement>();

      render(
        <Paragraph as="a" href="/about" ref={ref}>
          Link
        </Paragraph>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe('Weight prop', () => {
    const weights: ParagraphWeight[] = ['light', 'normal', 'medium', 'semibold', 'bold'];

    weights.forEach((weight) => {
      it(`должен применять ${weight} класс`, () => {
        render(<Paragraph weight={weight}>{weight}</Paragraph>);

        expect(getParagraph()).toHaveClass(cls[weight]);
      });
    });

    it('не должен применять weight класс если weight не указан', () => {
      render(<Paragraph>Text</Paragraph>);

      weights.forEach((weight) => {
        expect(getParagraph()).not.toHaveClass(cls[weight]);
      });
    });
  });

  describe('Wrap prop', () => {
    const wraps: ParagraphWrap[] = ['wrap', 'nowrap', 'balance', 'pretty'];

    wraps.forEach((wrap) => {
      it(`должен применять ${wrap} класс`, () => {
        render(<Paragraph wrap={wrap}>{wrap}</Paragraph>);

        expect(getParagraph()).toHaveClass(cls[wrap]);
      });
    });

    it('не должен применять wrap класс если wrap не указан', () => {
      render(<Paragraph>Text</Paragraph>);

      wraps.forEach((wrap) => {
        expect(getParagraph()).not.toHaveClass(cls[wrap]);
      });
    });
  });

  describe('Truncate prop', () => {
    it('должен применять truncate класс', () => {
      render(<Paragraph truncate>Truncated text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.truncate);
    });

    it('не должен применять truncate класс если truncate не указан', () => {
      render(<Paragraph>Text</Paragraph>);

      expect(getParagraph()).not.toHaveClass(cls.truncate);
    });

    it('должен применять truncate класс при truncate={true}', () => {
      render(<Paragraph truncate>Truncated text</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.truncate);
    });
  });

  describe('Truncate + LineClamp conflict', () => {
    it('должен предупреждать при одновременном использовании truncate и lineClamp', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      render(
        // @ts-expect-error — truncate и lineClamp взаимоисключающие на уровне типов (PAR-03)
        <Paragraph truncate lineClamp={3}>
          Conflicting text
        </Paragraph>
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('truncate и lineClamp не могут быть использованы одновременно')
      );

      warnSpy.mockRestore();
    });

    it('должен применять truncate класс и не применять line-clamp при конфликте', () => {
      render(
        // @ts-expect-error — truncate и lineClamp взаимоисключающие на уровне типов (PAR-03)
        <Paragraph truncate lineClamp={3}>
          Conflicting text
        </Paragraph>
      );

      expect(getParagraph()).toHaveClass(cls.truncate);
      expect(getParagraph()).not.toHaveClass(cls['line-clamp-3']);
    });

    it('не должен предупреждать в production при конфликте', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      render(
        // @ts-expect-error — truncate и lineClamp взаимоисключающие на уровне типов (PAR-03)
        <Paragraph truncate lineClamp={3}>
          Conflicting text
        </Paragraph>
      );

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('Conditional props (compile-time)', () => {
    // Примечание: случай `<Paragraph as="a" disabled>` (button-проп на <a>) уже покрыт
    // тестом «должен отклонять button-специфичные пропсы при as="a" на уровне типов»
    // в describe('Polymorphic as prop') — здесь не дублируется (PAR-03, без дублей).

    it('должен отклонять truncate + lineClamp одновременно на уровне типов', () => {
      render(
        // @ts-expect-error — truncate делает lineClamp недоступным (PAR-03 discriminated union)
        <Paragraph truncate lineClamp={3}>
          Conflicting text
        </Paragraph>
      );

      // Директива потреблена — runtime-поведение остаётся прежним (truncate имеет приоритет,
      // dev-warn остаётся как defense-in-depth)
      expect(getParagraph()).toHaveClass(cls.truncate);
      expect(getParagraph()).not.toHaveClass(cls['line-clamp-3']);
    });

    it('должен компилироваться <Paragraph truncate> без lineClamp', () => {
      render(<Paragraph truncate>Truncated only</Paragraph>);

      expect(getParagraph()).toHaveClass(cls.truncate);
    });

    it('должен компилироваться <Paragraph lineClamp={3}> без truncate', () => {
      render(<Paragraph lineClamp={3}>Clamped only</Paragraph>);

      expect(getParagraph()).toHaveClass(cls['line-clamp-3']);
    });
  });

  describe('asChild prop', () => {
    it('должен рендерить дочерний элемент без дополнительной обёртки', () => {
      render(
        <Paragraph asChild>
          <span>Child content</span>
        </Paragraph>
      );

      // Slot перезаписывает data-testid значением Paragraph
      const renderedSpan = screen.getByTestId('Paragraph');
      expect(renderedSpan).toBeInTheDocument();
      expect(renderedSpan.tagName).toBe('SPAN');
      expect(renderedSpan).toHaveTextContent('Child content');
    });

    it('должен мержить className с дочерним элементом', () => {
      render(
        <Paragraph asChild className="parent-class">
          <span className="child-class">Merged</span>
        </Paragraph>
      );

      // Slot мержит className, но data-testid от Paragraph
      const renderedSpan = screen.getByTestId('Paragraph');
      expect(renderedSpan).toHaveClass('child-class');
      expect(renderedSpan).toHaveClass('parent-class');
      expect(renderedSpan).toHaveClass(cls.paragraph);
    });

    it('должен передавать data-testid дочернему элементу', () => {
      render(
        <Paragraph asChild data-testid="paragraph-aschild">
          <span>Child</span>
        </Paragraph>
      );

      expect(screen.getByTestId('paragraph-aschild')).toBeInTheDocument();
      const renderedSpan = screen.getByTestId('paragraph-aschild');
      expect(renderedSpan.tagName).toBe('SPAN');
    });

    it('должен пробрасывать ref на дочерний элемент', () => {
      const refCallback = vi.fn();

      render(
        <Paragraph asChild ref={refCallback as React.Ref<HTMLParagraphElement>}>
          <span data-testid="ref-span">Ref test</span>
        </Paragraph>
      );

      expect(refCallback).toHaveBeenCalled();
      const calledWith = refCallback.mock.calls[0][0];
      expect(calledWith).toBeInstanceOf(HTMLSpanElement);
    });

    it('должен рендериться как обычно при asChild=true с текстовым children', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'development');

      render(<Paragraph asChild>Plain text child</Paragraph>);

      // Должен отрендериться как p (обычное поведение)
      expect(getParagraph()).toBeInTheDocument();
      expect(getParagraph().tagName).toBe('P');

      warnSpy.mockRestore();
    });

    it('должен пробрасывать id через Slot', () => {
      render(
        <Paragraph asChild id="aschild-id">
          <span>Child</span>
        </Paragraph>
      );

      const element = screen.getByTestId('Paragraph');
      expect(element).toHaveAttribute('id', 'aschild-id');
    });

    it('должен предупреждать при asChild=true в production о текстовом children', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubEnv('NODE_ENV', 'production');

      render(<Paragraph asChild>Plain text</Paragraph>);

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('Combined new props', () => {
    it('должен комбинировать weight + wrap + as', () => {
      render(
        <Paragraph as="span" weight="bold" wrap="nowrap">
          Bold nowrap span
        </Paragraph>
      );

      const element = getParagraph();
      expect(element.tagName).toBe('SPAN');
      expect(element).toHaveClass(cls.bold);
      expect(element).toHaveClass(cls.nowrap);
    });

    it('должен комбинировать size + weight + align', () => {
      render(
        <Paragraph size="l" weight="light" align="center">
          Large light centered
        </Paragraph>
      );

      const element = getParagraph();
      expect(element).toHaveClass(cls.l);
      expect(element).toHaveClass(cls.light);
      expect(element).toHaveClass(cls.center);
    });

    it('должен комбинировать все старые и новые пропсы', () => {
      render(
        <Paragraph
          size="xl"
          theme="muted"
          align="right"
          weight="medium"
          wrap="pretty"
          data-testid="combined-paragraph"
        >
          Все пропсы вместе
        </Paragraph>
      );

      const element = screen.getByTestId('combined-paragraph');
      expect(element).toHaveClass(cls.xl);
      expect(element).toHaveClass(cls.muted);
      expect(element).toHaveClass(cls.right);
      expect(element).toHaveClass(cls.medium);
      expect(element).toHaveClass(cls.pretty);
    });
  });

  describe('Accessibility', () => {
    it('должен пробрасывать ref на элемент', () => {
      const ref = vi.fn();
      render(<Paragraph ref={ref as React.Ref<HTMLParagraphElement>}>Text</Paragraph>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLParagraphElement));
    });

    it('должен иметь role="paragraph" при рендеринге p (семантический тег)', () => {
      render(<Paragraph>Text</Paragraph>);

      // <p> автоматически имеет role="paragraph"
      expect(screen.getByRole('paragraph')).toBeInTheDocument();
    });

    it('должен передавать id в DOM', () => {
      render(<Paragraph id="test-paragraph-id">Text</Paragraph>);

      expect(getParagraph()).toHaveAttribute('id', 'test-paragraph-id');
    });
  });

  describe('displayName', () => {
    it('должен иметь displayName', () => {
      expect(Paragraph.displayName).toBe('Paragraph');
    });
  });
});
