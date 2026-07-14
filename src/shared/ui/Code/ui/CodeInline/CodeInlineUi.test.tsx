import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeInlineUi } from './CodeInlineUi';
import styles from './CodeInline.module.scss';

describe('CodeInlineUi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендерить code элемент с children', () => {
      render(<CodeInlineUi>const x = 10;</CodeInlineUi>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toBeInTheDocument();
      expect(codeEl.tagName).toBe('CODE');
      expect(codeEl).toHaveTextContent('const x = 10;');
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;

    sizes.forEach((size) => {
      it(`должен применять класс для size="${size}"`, () => {
        const { container } = render(<CodeInlineUi size={size}>const x = 10;</CodeInlineUi>);

        const codeEl = container.querySelector('code');
        expect(codeEl).toHaveClass(styles[size]);
      });
    });

    it('должен использовать size="md" по умолчанию', () => {
      const { container } = render(<CodeInlineUi>const x = 10;</CodeInlineUi>);

      const codeEl = container.querySelector('code');
      expect(codeEl).toHaveClass(styles.md);
    });
  });

  describe('Copyable UI', () => {
    it('должен иметь класс .copyable при copyable=true', () => {
      const { container } = render(<CodeInlineUi copyable>const x = 10;</CodeInlineUi>);

      const codeEl = container.querySelector('code');
      expect(codeEl).toHaveClass(styles.copyable);
    });

    it('должен иметь класс .copied при isCopied=true', () => {
      const { container } = render(
        <CodeInlineUi copyable isCopied>
          const x = 10;
        </CodeInlineUi>
      );

      const codeEl = container.querySelector('code');
      expect(codeEl).toHaveClass(styles.copied);
    });

    it('НЕ должен иметь класс .copyable при disabled=true', () => {
      const { container } = render(
        <CodeInlineUi copyable disabled>
          const x = 10;
        </CodeInlineUi>
      );

      const codeEl = container.querySelector('code');
      expect(codeEl).not.toHaveClass(styles.copyable);
    });

    it('должен вызывать onCopy при клике', () => {
      const handleCopy = vi.fn();
      render(
        <CodeInlineUi copyable onCopy={handleCopy}>
          const x = 10;
        </CodeInlineUi>
      );

      fireEvent.click(screen.getByTestId('code-inline'));
      expect(handleCopy).toHaveBeenCalledTimes(1);
    });

    it('НЕ должен вызывать onCopy при disabled=true', () => {
      const handleCopy = vi.fn();
      render(
        <CodeInlineUi copyable disabled onCopy={handleCopy}>
          const x = 10;
        </CodeInlineUi>
      );

      fireEvent.click(screen.getByTestId('code-inline'));
      expect(handleCopy).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь tabIndex=0 при copyable=true', () => {
      render(<CodeInlineUi copyable>const x = 10;</CodeInlineUi>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toHaveAttribute('tabIndex', '0');
    });

    it('должен иметь role="button" при copyable=true', () => {
      render(<CodeInlineUi copyable>const x = 10;</CodeInlineUi>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toHaveAttribute('role', 'button');
    });

    it('должен иметь aria-label при copyable=true', () => {
      render(<CodeInlineUi copyable>const x = 10;</CodeInlineUi>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toHaveAttribute('aria-label', 'Click to copy code');
    });

    it('должен использовать переданный ariaLabel', () => {
      render(
        <CodeInlineUi copyable ariaLabel="Copy this command">
          const x = 10;
        </CodeInlineUi>
      );

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toHaveAttribute('aria-label', 'Copy this command');
    });

    it('НЕ должен иметь tabIndex при copyable=false', () => {
      render(<CodeInlineUi copyable={false}>const x = 10;</CodeInlineUi>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).not.toHaveAttribute('tabIndex');
    });

    it('НЕ должен иметь role="button" при copyable=false', () => {
      render(<CodeInlineUi copyable={false}>const x = 10;</CodeInlineUi>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).not.toHaveAttribute('role');
    });
  });

  describe('Keyboard', () => {
    it('должен вызывать onKeyDown при нажатии Enter', () => {
      const handleKeyDown = vi.fn();
      render(
        <CodeInlineUi copyable onKeyDown={handleKeyDown}>
          const x = 10;
        </CodeInlineUi>
      );

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: 'Enter' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: 'Enter' }));
    });

    it('должен вызывать onKeyDown при нажатии Space', () => {
      const handleKeyDown = vi.fn();
      render(
        <CodeInlineUi copyable onKeyDown={handleKeyDown}>
          const x = 10;
        </CodeInlineUi>
      );

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: ' ' });
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
      expect(handleKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: ' ' }));
    });

    it('НЕ должен иметь onKeyDown при copyable=false', () => {
      const { container } = render(<CodeInlineUi copyable={false}>const x = 10;</CodeInlineUi>);

      const codeEl = container.querySelector('code');
      expect(codeEl).not.toHaveAttribute('onKeyDown');
    });

    it('должен применять кастомный className', () => {
      const { container } = render(
        <CodeInlineUi className="custom-class">const x = 10;</CodeInlineUi>
      );

      const codeEl = container.querySelector('code');
      expect(codeEl).toHaveClass('custom-class');
    });
  });
});
