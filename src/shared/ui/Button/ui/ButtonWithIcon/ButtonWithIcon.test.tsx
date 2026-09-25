// Disable no-script-url: dangerous javascript: values are intentional
// test fixtures for sanitizeHref — asserting they are REJECTED.
/* eslint-disable no-script-url */

import { fireEvent, render, screen } from '@testing-library/react';
import { ArrowRight, Mail } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveCssModuleKey } from '@/shared/lib/utils';
import { ButtonWithIcon } from './ButtonWithIcon';
import buttonWithIconStyles from './ButtonWithIcon.module.scss';

describe('ButtonWithIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с текстом', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>Click me</ButtonWithIcon>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('должен рендериться с leftIcon', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>With Icon</ButtonWithIcon>);

      const button = screen.getByRole('button');
      expect(button).toContainElement(screen.getByText('With Icon'));
    });

    it('должен рендериться с rightIcon', () => {
      render(<ButtonWithIcon rightIcon={<ArrowRight />}>Next</ButtonWithIcon>);

      const button = screen.getByRole('button');
      expect(button).toContainElement(screen.getByText('Next'));
    });

    it('должен рендериться с обеими иконками', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} rightIcon={<ArrowRight />}>
          Both
        </ButtonWithIcon>
      );

      const button = screen.getByRole('button');
      expect(button).toContainElement(screen.getByText('Both'));
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'sidebar'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(
          <ButtonWithIcon leftIcon={<Mail />} variant={variant}>
            Button
          </ButtonWithIcon>
        );

        expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles[variant] ?? '');
      });
    });

    it('variant="danger" маппится в primary + colorSchemeDanger', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} variant="danger">
          Delete
        </ButtonWithIcon>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(buttonWithIconStyles.primary ?? '');
      expect(button).toHaveClass(resolveCssModuleKey(buttonWithIconStyles, 'color-scheme-danger'));
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(
          <ButtonWithIcon leftIcon={<Mail />} size={size}>
            Button
          </ButtonWithIcon>
        );

        expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles[size] ?? '');
      });
    });
  });

  describe('States', () => {
    it('должен быть disabled при disabled=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} disabled>
          Disabled
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен ставить native disabled при loading=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading>
          Loading
        </ButtonWithIcon>
      );

      // Loading must NOT set the native disabled attribute: the button stays focusable so
      // aria-busy/aria-disabled are announced; activation is blocked by handleClick instead.
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен иметь aria-busy при loading=true', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading>
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять fullWidth класс', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} fullWidth>
          Full Width
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles.fullWidth ?? '');
    });
  });

  describe('Loading variants', () => {
    it('должен показывать spinner при loadingVariant="spinner"', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading loadingVariant="spinner">
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен показывать skeleton при loadingVariant="skeleton"', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading loadingVariant="skeleton">
          Loading
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveClass(buttonWithIconStyles.loading ?? '');
    });

    it('должен скрывать контент при loading через CSS-mixin (без класса hidden)', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading>
          Loading
        </ButtonWithIcon>
      );

      const root = screen.getByRole('button');
      const content = root.querySelector(`.${buttonWithIconStyles.content ?? ''}`);

      // Content is hidden by the `button-loading` mixin on the root element — no `.hidden`
      // class exists in any Button SCSS module, so it must never be applied to the content
      // (in vitest a CSS-module proxy returns a hashed value for ANY key, so the guard is
      // on the rendered class list, not on the styles object).
      expect(root).toHaveClass(buttonWithIconStyles.loading ?? '');
      expect(root).toHaveAttribute('data-state', 'loading');
      expect(content).toBeInTheDocument();
      expect(content?.className).not.toContain('hidden');
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} onClick={handleClick}>
          Click me
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClick при disabled', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} disabled onClick={handleClick}>
          Disabled
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вызывать onClick при loading', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} loading onClick={handleClick}>
          Loading
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="button"', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>Button</ButtonWithIcon>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('должен иметь aria-disabled при disabled', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} disabled>
          Disabled
        </ButtonWithIcon>
      );

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь data-testid', () => {
      render(<ButtonWithIcon leftIcon={<Mail />}>Button</ButtonWithIcon>);

      expect(screen.getByTestId('button-with-icon')).toBeInTheDocument();
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на button элемент', () => {
      const ref = vi.fn();
      render(
        <ButtonWithIcon leftIcon={<Mail />} ref={ref}>
          Button
        </ButtonWithIcon>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Icon size inference', () => {
    it('должен устанавливать размер leftIcon для size="sm"', () => {
      const { container } = render(
        <ButtonWithIcon leftIcon={<Mail />} size="sm">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('должен сохранять ручной размер leftIcon при override', () => {
      const { container } = render(
        <ButtonWithIcon leftIcon={<Mail size={32} />} size="sm">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '32');
    });

    it('должен устанавливать размер rightIcon для size="sm"', () => {
      const { container } = render(
        <ButtonWithIcon rightIcon={<Mail />} size="sm">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '16');
    });

    it('должен сохранять ручной размер rightIcon при override', () => {
      const { container } = render(
        <ButtonWithIcon rightIcon={<Mail size={28} />} size="lg">
          Btn
        </ButtonWithIcon>
      );

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '28');
    });
  });

  describe('Polymorphic (component prop)', () => {
    it('должен рендериться как <a> при component="a"', () => {
      render(
        <ButtonWithIcon component="a" href="/about" leftIcon={<Mail />}>
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('должен сохранять стили при component="a"', () => {
      render(
        <ButtonWithIcon component="a" href="/test" leftIcon={<Mail />} variant="danger">
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toHaveClass(buttonWithIconStyles.button ?? '');
      expect(link).toHaveClass(buttonWithIconStyles.primary ?? '');
      expect(link).toHaveClass(resolveCssModuleKey(buttonWithIconStyles, 'color-scheme-danger'));
    });

    it('должен иметь aria-disabled при disabled=true и component="a"', () => {
      render(
        <ButtonWithIcon component="a" href="/test" leftIcon={<Mail />} disabled>
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен рендериться как <div> при component="div"', () => {
      render(
        <ButtonWithIcon component="div" leftIcon={<Mail />}>
          Div Button
        </ButtonWithIcon>
      );

      const div = screen.getByRole('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('должен иметь aria-disabled при disabled=true и component="div"', () => {
      render(
        <ButtonWithIcon component="div" leftIcon={<Mail />} disabled>
          Div Button
        </ButtonWithIcon>
      );

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен вызывать onClick при loading=true и component="a"', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon
          component="a"
          href="/test"
          leftIcon={<Mail />}
          loading
          onClick={handleClick}
        >
          Link
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      fireEvent.click(link);

      expect(handleClick).not.toHaveBeenCalled();
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен передавать ref на anchor элемент при component="a"', () => {
      const ref = vi.fn();
      render(
        <ButtonWithIcon component="a" href="/about" leftIcon={<Mail />} ref={ref}>
          Link
        </ButtonWithIcon>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });
  });

  describe('colorScheme', () => {
    it('должен рендериться с colorScheme="success"', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} colorScheme="success">
          Approve
        </ButtonWithIcon>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(resolveCssModuleKey(buttonWithIconStyles, 'color-scheme-success'));
    });

    it('variant="danger" должен давать colorSchemeDanger класс', () => {
      render(
        <ButtonWithIcon leftIcon={<Mail />} variant="danger">
          Delete
        </ButtonWithIcon>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass(resolveCssModuleKey(buttonWithIconStyles, 'color-scheme-danger'));
    });
  });

  describe('asChild', () => {
    it('должен рендерить дочерний элемент вместо кнопки', () => {
      render(
        <ButtonWithIcon asChild>
          <a href="/download">Download</a>
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/download');
      expect(link).toHaveTextContent('Download');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('должен сохранять стили кнопки на дочернем элементе', () => {
      render(
        <ButtonWithIcon asChild variant="ghost" size="lg">
          <a href="/download">Download</a>
        </ButtonWithIcon>
      );

      const link = screen.getByRole('link');
      expect(link).toHaveClass(buttonWithIconStyles.button ?? '');
      expect(link).toHaveClass(buttonWithIconStyles.ghost ?? '');
      expect(link).toHaveClass(buttonWithIconStyles.lg ?? '');
    });

    it('должен блокировать onClick при disabled=true и asChild', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon asChild disabled onClick={handleClick}>
          <a href="/download">Download</a>
        </ButtonWithIcon>
      );

      fireEvent.click(screen.getByTestId('button-with-icon'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('должен иметь aria-busy при loading=true и asChild', () => {
      render(
        <ButtonWithIcon asChild loading>
          <a href="/download">Download</a>
        </ButtonWithIcon>
      );

      const link = screen.getByTestId('button-with-icon');
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('data-state', 'loading');
    });

    it('должен активировать неинтерактивный дочерний элемент по Space', () => {
      const handleClick = vi.fn();
      render(
        <ButtonWithIcon asChild onClick={handleClick}>
          <span>Custom</span>
        </ButtonWithIcon>
      );

      const custom = screen.getByTestId('button-with-icon');
      expect(custom).toHaveAttribute('role', 'button');
      expect(custom).toHaveAttribute('tabindex', '0');

      fireEvent.keyDown(custom, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('должен санитизировать опасный href при asChild', () => {
      // `href` is a polymorphic prop: the type system only accepts it on the Button
      // itself with `component="a"`. asChild still renders the cloned child.
      render(
        <ButtonWithIcon asChild component="a" href="javascript:alert(1)">
          <a href="/safe">Download</a>
        </ButtonWithIcon>
      );

      expect(screen.getByTestId('button-with-icon')).not.toHaveAttribute('href');
    });
  });
});
