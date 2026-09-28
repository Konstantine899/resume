// Disable no-script-url: dangerous javascript: values are intentional
// test fixtures for sanitizeHref — asserting they are REJECTED.
/* eslint-disable no-script-url */

import { fireEvent, render, screen } from '@testing-library/react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveCssModuleKey } from '@/shared/lib/utils';
import { Button } from './Button';
import buttonStyles from './Button.module.scss';

describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендериться с базовыми пропсами', () => {
      render(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      render(<Button className="custom-class">Button</Button>);

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('должен иметь type="button" по умолчанию', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('должен принимать кастомный type', () => {
      render(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
  });

  describe('Variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'sidebar'] as const;

    variants.forEach((variant) => {
      it(`должен рендериться с variant="${variant}"`, () => {
        render(<Button variant={variant}>Button</Button>);

        expect(screen.getByRole('button')).toHaveClass(buttonStyles[variant] ?? '');
      });
    });

    it('variant="danger" маппится в primary + colorSchemeDanger', () => {
      render(<Button variant="danger">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(buttonStyles.primary ?? '');
      expect(button).toHaveClass(resolveCssModuleKey(buttonStyles, 'color-scheme-danger'));
    });
  });

  describe('Sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach((size) => {
      it(`должен рендериться с size="${size}"`, () => {
        render(<Button size={size}>Button</Button>);

        expect(screen.getByRole('button')).toHaveClass(buttonStyles[size] ?? '');
      });
    });
  });

  describe('States', () => {
    it('должен быть disabled при disabled=true', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен ставить native disabled при loading=true', () => {
      render(<Button loading>Loading</Button>);

      // Loading must NOT set the native disabled attribute: the button stays focusable so
      // aria-busy/aria-disabled are announced; activation is blocked by handleClick instead.
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByRole('button')).toHaveAttribute('data-state', 'loading');
    });

    it('должен иметь aria-busy при loading=true', () => {
      render(<Button loading>Loading</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    it('должен применять fullWidth класс', () => {
      render(<Button fullWidth>Full Width</Button>);

      expect(screen.getByRole('button')).toHaveClass(buttonStyles.fullWidth ?? '');
    });
  });

  describe('Loading variants', () => {
    it('должен показывать spinner при loadingVariant="spinner"', () => {
      render(
        <Button loading loadingVariant="spinner">
          Loading
        </Button>
      );

      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('должен показывать skeleton при loadingVariant="skeleton"', () => {
      render(
        <Button loading loadingVariant="skeleton">
          Loading
        </Button>
      );

      expect(screen.getByRole('button')).toHaveClass(buttonStyles.loading ?? '');
    });

    it('должен скрывать контент при loading через CSS-mixin (без класса hidden)', () => {
      render(<Button loading>Loading</Button>);

      const root = screen.getByRole('button');
      const content = root.querySelector(`.${buttonStyles.content ?? ''}`);

      // Content is hidden by the `button-loading` mixin on the root element — no `.hidden`
      // class exists in any Button SCSS module, so it must never be applied to the content
      // (in vitest a CSS-module proxy returns a hashed value for ANY key, so the guard is
      // on the rendered class list, not on the styles object).
      expect(root).toHaveClass(buttonStyles.loading ?? '');
      expect(root).toHaveAttribute('data-state', 'loading');
      expect(content).toBeInTheDocument();
      expect(content?.className).not.toContain('hidden');
    });
  });

  describe('Click handling', () => {
    it('должен вызывать onClick при клике', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен вызывать onClick при disabled=true', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вызывать onClick при loading=true', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="button"', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('должен иметь aria-disabled при disabled', () => {
      render(<Button disabled>Disabled</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен иметь data-testid', () => {
      render(<Button>Button</Button>);

      expect(screen.getByTestId('button')).toBeInTheDocument();
    });
  });

  describe('Forward Ref', () => {
    it('должен передавать ref на button элемент', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
    });
  });

  describe('Polymorphic (component prop)', () => {
    it('должен рендериться как <a> при component="a"', () => {
      render(
        <Button component="a" href="/about">
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/about');
    });

    it('должен рендериться как <button> по умолчанию', () => {
      render(<Button>Button</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('должен сохранять стили button при component="a"', () => {
      render(
        <Button component="a" href="/test" variant="primary" size="lg">
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toHaveClass(buttonStyles.button ?? '');
      expect(link).toHaveClass(buttonStyles.primary ?? '');
      expect(link).toHaveClass(buttonStyles.lg ?? '');
    });

    it('должен иметь aria-disabled при disabled=true и component="a"', () => {
      render(
        <Button component="a" href="/test" disabled>
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен передавать rest props на элемент при component="a"', () => {
      render(
        <Button component="a" href="/about" target="_blank" rel="noopener">
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener');
    });

    it('не должен иметь disabled атрибута при component="a"', () => {
      render(
        <Button component="a" href="/test" disabled>
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).not.toHaveAttribute('disabled');
    });

    it('не должен вызывать onClick при disabled=true и component="a"', () => {
      const handleClick = vi.fn();
      render(
        <Button component="a" href="/test" disabled onClick={handleClick}>
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      fireEvent.click(link);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('должен рендериться как <div> при component="div"', () => {
      render(<Button component="div">Div Button</Button>);

      const div = screen.getByRole('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveAttribute('role', 'button');
    });

    it('должен иметь aria-disabled при disabled=true и component="div"', () => {
      render(
        <Button component="div" disabled>
          Div Button
        </Button>
      );

      const div = screen.getByRole('button');
      expect(div).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен вызывать onClick при loading=true и component="a"', () => {
      const handleClick = vi.fn();
      render(
        <Button component="a" href="/test" loading onClick={handleClick}>
          Link
        </Button>
      );

      const link = screen.getByTestId('button');
      fireEvent.click(link);

      expect(handleClick).not.toHaveBeenCalled();
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('должен передавать ref на anchor элемент при component="a"', () => {
      const ref = vi.fn();
      render(
        <Button component="a" href="/about" ref={ref}>
          Link
        </Button>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });
  });

  describe('asChild', () => {
    it('должен рендериться как <a> при asChild', () => {
      render(
        <Button asChild>
          <a href="/about">Link</a>
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/about');
    });

    it('должен сохранять стили button при asChild', () => {
      render(
        <Button asChild variant="primary" size="lg">
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toHaveClass(buttonStyles.button ?? '');
      expect(link).toHaveClass(buttonStyles.primary ?? '');
      expect(link).toHaveClass(buttonStyles.lg ?? '');
    });

    it('должен иметь aria-disabled при disabled=true и asChild', () => {
      render(
        <Button asChild disabled>
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен вызывать onClick при disabled=true и asChild', () => {
      const handleClick = vi.fn();
      render(
        <Button asChild disabled onClick={handleClick}>
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByTestId('button');
      fireEvent.click(link);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('должен рендериться как <div> при asChild', () => {
      render(
        <Button asChild>
          <div>Div Button</div>
        </Button>
      );

      const div = screen.getByTestId('button');
      expect(div.tagName).toBe('DIV');
      expect(div).toHaveTextContent('Div Button');
    });

    it('должен иметь aria-busy при loading=true и asChild', () => {
      render(
        <Button asChild loading>
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByTestId('button');
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен вызывать onClick при loading=true и asChild', () => {
      const handleClick = vi.fn();
      render(
        <Button asChild loading onClick={handleClick}>
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByTestId('button');
      fireEvent.click(link);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('должен передавать ref на anchor элемент при asChild', () => {
      const ref = vi.fn();
      render(
        <Button asChild ref={ref}>
          <a href="/about">Link</a>
        </Button>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
    });
  });

  describe('colorScheme', () => {
    it('должен рендериться с colorScheme="danger" без variant="danger"', () => {
      render(<Button colorScheme="danger">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(resolveCssModuleKey(buttonStyles, 'color-scheme-danger'));
    });

    it('должен иметь variant="primary" классы при colorScheme="success"', () => {
      render(<Button colorScheme="success">Success</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(buttonStyles.primary ?? '');
    });

    it('variant="danger" должен давать colorSchemeDanger класс', () => {
      render(<Button variant="danger">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(resolveCssModuleKey(buttonStyles, 'color-scheme-danger'));
    });
  });

  describe('Keyboard activation', () => {
    it('должен активировать component="div" по Enter', () => {
      const handleClick = vi.fn();
      render(
        <Button component="div" onClick={handleClick}>
          Div
        </Button>
      );

      fireEvent.keyDown(screen.getByTestId('button'), { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('должен активировать component="div" по Space', () => {
      const handleClick = vi.fn();
      render(
        <Button component="div" onClick={handleClick}>
          Div
        </Button>
      );

      fireEvent.keyDown(screen.getByTestId('button'), { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('должен активировать component="a" по Enter', () => {
      const handleClick = vi.fn();
      render(
        <Button component="a" href="/test" onClick={handleClick}>
          Link
        </Button>
      );

      fireEvent.keyDown(screen.getByTestId('button'), { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('не должен активировать по другой клавише', () => {
      const handleClick = vi.fn();
      render(
        <Button component="div" onClick={handleClick}>
          Div
        </Button>
      );

      fireEvent.keyDown(screen.getByTestId('button'), { key: 'ArrowDown' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('должен вызывать пользовательский onKeyDown и отменять активацию при preventDefault', () => {
      const handleClick = vi.fn();
      const onKeyDown = vi.fn((event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault());
      render(
        <Button component="div" onClick={handleClick} onKeyDown={onKeyDown}>
          Div
        </Button>
      );

      fireEvent.keyDown(screen.getByTestId('button'), { key: 'Enter' });

      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('не должен вешать обработчик активации на нативную кнопку', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Native</Button>);

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });

      // jsdom не эмулирует нативную активацию по Enter: если бы компонент вешал свой
      // handleKeyDown, click() вызвался бы здесь — в браузере это был бы двойной вызов.
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Focusability', () => {
    it('должен иметь tabIndex=0 при component="div"', () => {
      render(<Button component="div">Div</Button>);

      expect(screen.getByTestId('button')).toHaveAttribute('tabindex', '0');
    });

    it('должен иметь tabIndex=0 при component="a"', () => {
      render(
        <Button component="a" href="/test">
          Link
        </Button>
      );

      expect(screen.getByTestId('button')).toHaveAttribute('tabindex', '0');
    });

    it('не должен добавлять tabIndex на нативную кнопку', () => {
      render(<Button>Native</Button>);

      expect(screen.getByRole('button')).not.toHaveAttribute('tabindex');
    });
  });

  describe('Role semantics', () => {
    it('должен сохранять роль ссылки при component="a"', () => {
      render(
        <Button component="a" href="/about">
          Link
        </Button>
      );

      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('должен иметь role="button" при component="div"', () => {
      render(<Button component="div">Div</Button>);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('не должен переопределять роль <a> при asChild', () => {
      render(
        <Button asChild>
          <a href="/about">Link</a>
        </Button>
      );

      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('href sanitization', () => {
    it('не должен рендерить опасный href при component="a"', () => {
      render(
        <Button component="a" href="javascript:alert(1)">
          XSS
        </Button>
      );

      expect(screen.getByTestId('button')).not.toHaveAttribute('href');
    });

    it('должен санитизировать href при asChild (href кнопки перекрывает href ребёнка)', () => {
      render(
        <Button component="a" asChild href="javascript:alert(1)">
          <a href="/safe">Link</a>
        </Button>
      );

      expect(screen.getByTestId('button')).not.toHaveAttribute('href');
    });

    it('должен сохранять безопасный href ребёнка при asChild', () => {
      render(
        <Button asChild>
          <a href="/child">Link</a>
        </Button>
      );

      expect(screen.getByTestId('button')).toHaveAttribute('href', '/child');
    });
  });
});
