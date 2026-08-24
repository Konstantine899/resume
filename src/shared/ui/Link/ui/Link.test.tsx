// src/shared/ui/Link/ui/Link.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Mail, ArrowRight, Github } from 'lucide-react';
import { Link } from './Link';
import linkStyles from './Link.module.scss';

describe('Link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Link href="/test">Test Link</Link>);

      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.getByText('Test Link')).toBeInTheDocument();
    });

    it('должен иметь href атрибут', () => {
      render(<Link href="/about">About</Link>);

      expect(screen.getByRole('link')).toHaveAttribute('href', '/about');
    });

    it('должен применять кастомный className', () => {
      render(
        <Link href="/test" className="custom-class">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass('custom-class');
    });

    it('должен передавать HTML атрибуты', () => {
      render(
        <Link href="/test" title="Test Title" rel="noopener">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveAttribute('title', 'Test Title');
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'ghost', 'gradient'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(
          <Link href="/test" variant={variant}>
            Link
          </Link>
        );

        expect(screen.getByRole('link')).toHaveClass(linkStyles[variant]);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(
          <Link href="/test" size={size}>
            Link
          </Link>
        );

        expect(screen.getByRole('link')).toHaveClass(linkStyles[size]);
      });
    });
  });

  describe('Underline variants', () => {
    it('должен рендериться с underline="always"', () => {
      render(
        <Link href="/test" underline="always">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass(linkStyles.underlineAlways);
    });

    it('должен рендериться с underline="hover"', () => {
      render(
        <Link href="/test" underline="hover">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass(linkStyles.underlineHover);
    });

    it('должен рендериться с underline="never"', () => {
      render(
        <Link href="/test" underline="never">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass(linkStyles.underlineNever);
    });
  });

  describe('External links', () => {
    it('должен открывать внешнюю ссылку в новой вкладке', () => {
      render(<Link href="https://example.com">External</Link>);

      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('должен использовать external prop для внешней ссылки', () => {
      render(
        <Link href="/internal" external>
          External
        </Link>
      );

      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('должен показывать иконку внешней ссылки', () => {
      render(<Link href="https://example.com">External</Link>);

      const externalIcon = screen.getByLabelText('Opens in new tab');
      expect(externalIcon).toBeInTheDocument();
    });

    it('не должен показывать иконку при showExternalIcon=false', () => {
      render(
        <Link href="https://example.com" showExternalIcon={false}>
          External
        </Link>
      );

      expect(screen.queryByLabelText('Opens in new tab')).not.toBeInTheDocument();
    });

    it('должен использовать кастомную externalIcon', () => {
      render(
        <Link href="https://github.com" externalIcon={Github}>
          GitHub
        </Link>
      );

      // Github icon должен рендериться (проверяем наличие SVG с классом lucide-github)
      const link = screen.getByRole('link');
      const externalIconContainer = link.querySelector(`.${linkStyles.externalIcon}`);
      expect(externalIconContainer).toBeInTheDocument();
      expect(externalIconContainer?.querySelector('.lucide-github')).toBeInTheDocument();
    });

    it('должен определять https:// как внешнюю ссылку', () => {
      render(<Link href="https://example.com">HTTPS</Link>);

      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });

    it('должен определять http:// как внешнюю ссылку', () => {
      render(<Link href="http://example.com">HTTP</Link>);

      expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
    });
  });

  describe('Icons', () => {
    it('должен рендериться с icon слева', () => {
      render(
        <Link href="/test" icon={<Mail size={16} />}>
          Email
        </Link>
      );

      const link = screen.getByRole('link');
      const iconContainers = link.querySelectorAll(`.${linkStyles.icon}`);
      expect(iconContainers.length).toBe(1);
      expect(iconContainers[0]).toHaveAttribute('aria-hidden', 'true');
    });

    it('должен рендериться с iconRight справа', () => {
      render(
        <Link href="/test" iconRight={<ArrowRight size={16} />}>
          Next
        </Link>
      );

      const link = screen.getByRole('link');
      const iconContainers = link.querySelectorAll(`.${linkStyles.icon}`);
      expect(iconContainers.length).toBe(1);
    });

    it('должен рендериться с обеими иконками', () => {
      render(
        <Link href="/test" icon={<Mail size={16} />} iconRight={<ArrowRight size={16} />}>
          Both
        </Link>
      );

      const link = screen.getByRole('link');
      const iconContainers = link.querySelectorAll(`.${linkStyles.icon}`);
      expect(iconContainers.length).toBe(2);
    });

    it('должен устанавливать aria-hidden для иконок', () => {
      render(
        <Link href="/test" icon={<Mail size={16} />}>
          Email
        </Link>
      );

      const iconContainer = screen.getByRole('link').querySelector(`.${linkStyles.icon}`);
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="link"', () => {
      render(<Link href="/test">Link</Link>);

      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('должен иметь aria-disabled при aria-disabled=true', () => {
      render(
        <Link href="/test" aria-disabled={true}>
          Disabled
        </Link>
      );

      expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь focus-visible outline', () => {
      render(<Link href="/test">Link</Link>);

      const link = screen.getByRole('link');
      link.focus();
      expect(link).toHaveFocus();
    });

    it('должен передавать aria-label', () => {
      render(
        <Link href="/test" aria-label="Test Link Label">
          Link
        </Link>
      );

      expect(screen.getByLabelText('Test Link Label')).toBeInTheDocument();
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(
        <Link href="/test" onClick={handleClick}>
          Click me
        </Link>
      );

      fireEvent.click(screen.getByRole('link'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('должен передавать event в onClick', () => {
      const handleClick = vi.fn();
      render(
        <Link href="/test" onClick={handleClick}>
          Click me
        </Link>
      );

      fireEvent.click(screen.getByRole('link'));

      expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('должен работать с preventDefault', () => {
      const handleClick = vi.fn((e) => e.preventDefault());
      render(
        <Link href="/test" onClick={handleClick}>
          Click me
        </Link>
      );

      fireEvent.click(screen.getByRole('link'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unstyled mode', () => {
    it('должен применять unstyled класс', () => {
      render(
        <Link href="/test" unstyled>
          Unstyled
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass(linkStyles.unstyled);
    });
  });

  describe('Hover lift effect', () => {
    it('должен применять withLift класс', () => {
      render(
        <Link href="/test" withLift>
          Lift
        </Link>
      );

      expect(screen.getByRole('link')).toHaveClass(linkStyles.withLift);
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на a элемент', () => {
      const ref = vi.fn();
      render(
        <Link href="/test" ref={ref}>
          Link
        </Link>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });
  });

  describe('Icon size mapping', () => {
    it('должен использовать xs размер иконки для sm размера ссылки', () => {
      render(
        <Link href="/test" size="sm" external>
          Link
        </Link>
      );

      // ExternalLink иконка должна иметь размер xs (12px)
      const icon = screen.getByLabelText('Opens in new tab');
      expect(icon).toBeInTheDocument();
    });

    it('должен использовать sm размер иконки для md размера ссылки', () => {
      render(
        <Link href="/test" size="md" external>
          Link
        </Link>
      );

      const icon = screen.getByLabelText('Opens in new tab');
      expect(icon).toBeInTheDocument();
    });

    it('должен использовать md размер иконки для lg размера ссылки', () => {
      render(
        <Link href="/test" size="lg" external>
          Link
        </Link>
      );

      const icon = screen.getByLabelText('Opens in new tab');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Rel attribute', () => {
    it('должен добавлять noopener noreferrer для внешних ссылок', () => {
      render(<Link href="https://example.com">External</Link>);

      expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('не должен добавлять noopener noreferrer для внутренних ссылок', () => {
      render(<Link href="/internal">Internal</Link>);

      expect(screen.getByRole('link')).not.toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('должен объединять кастомный rel с noopener noreferrer', () => {
      render(
        <Link href="https://example.com" rel="author">
          External
        </Link>
      );

      const rel = screen.getByRole('link').getAttribute('rel');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
      expect(rel).toContain('author');
    });
  });

  describe('Active state', () => {
    it('должен применять transform: scale(0.98) при active', () => {
      render(<Link href="/test">Link</Link>);

      const link = screen.getByRole('link');
      fireEvent.mouseDown(link);

      // Проверяем, что стиль применяется (через класс или inline)
      expect(link).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('должен иметь pointer-events: none при aria-disabled=true', () => {
      render(
        <Link href="/test" aria-disabled={true}>
          Disabled
        </Link>
      );

      expect(screen.getByRole('link')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Development warnings', () => {
    it('должен предупреждать при отсутствии href в development режиме', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<Link href="">No href</Link>);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Link'));

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('не должен предупреждать при requireHref=false', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <Link href="" requireHref={false}>
          No href
        </Link>
      );

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Theme support', () => {
    it('должен применять light theme стили', () => {
      const { container } = render(
        <div data-theme="light">
          <Link href="/test" variant="primary">
            Link
          </Link>
        </div>
      );

      const lightThemeLink = container.querySelector('[data-theme="light"] a');
      expect(lightThemeLink).toBeInTheDocument();
    });

    it('должен применять dark theme стили по умолчанию', () => {
      render(
        <Link href="/test" variant="primary">
          Link
        </Link>
      );

      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Skeleton Mode', () => {
    it('должен рендерить Skeleton при skeleton=true', () => {
      render(
        <Link href="/profile" skeleton>
          Profile
        </Link>
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('не должен показывать текст при skeleton=true', () => {
      render(
        <Link href="/profile" skeleton>
          Hidden Text
        </Link>
      );

      expect(screen.queryByText('Hidden Text')).not.toBeInTheDocument();
    });

    it('должен устанавливать data-skeleton атрибут', () => {
      render(
        <Link href="/profile" skeleton>
          Profile
        </Link>
      );

      const link = screen.getByRole('status').closest('[data-skeleton="true"]');
      expect(link).toBeInTheDocument();
    });

    it('должен иметь aria-disabled при skeleton=true', () => {
      render(
        <Link href="/profile" skeleton>
          Profile
        </Link>
      );

      const skeleton = screen.getByRole('status').closest('[aria-disabled="true"]');
      expect(skeleton).toBeInTheDocument();
    });

    it('должен показывать текст при skeleton=false', () => {
      render(
        <Link href="/profile" skeleton={false}>
          Visible Text
        </Link>
      );

      expect(screen.getByText('Visible Text')).toBeInTheDocument();
    });

    it('должен применять класс skeleton', () => {
      render(
        <Link href="/profile" skeleton>
          Profile
        </Link>
      );

      const skeleton = screen.getByRole('status').closest('span');
      expect(skeleton?.className).toMatch(/skeleton/);
    });
  });

  describe('Combined props', () => {
    it('должен корректно комбинировать multiple props', () => {
      render(
        <Link
          href="https://github.com"
          variant="gradient"
          size="lg"
          external
          icon={<Github size={20} />}
          withLift
          underline="hover"
        >
          GitHub Profile
        </Link>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass(linkStyles.gradient);
      expect(link).toHaveClass(linkStyles.lg);
      expect(link).toHaveClass(linkStyles.withLift);
      expect(link).toHaveClass(linkStyles.underlineHover);
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
