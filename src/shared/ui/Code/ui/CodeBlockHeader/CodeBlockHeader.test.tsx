import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockHeader } from './CodeBlockHeader';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string) =>
      ({
        copy: 'Copy',
        copied: 'Copied!',
        copyCode: 'Copy code',
        clickToCopy: 'Click to copy code',
      })[key] ?? key,
  }),
}));

describe('CodeBlockHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендерить terminal dots', () => {
      const { container } = render(<CodeBlockHeader />);

      // Все три точки (red, yellow, green) рендерятся в terminalDots
      const dots = container.querySelectorAll('[class*="dot"]');
      expect(dots.length).toBeGreaterThanOrEqual(3);
    });

    it('должен рендерить title и language', () => {
      render(<CodeBlockHeader title="test.ts" language="TypeScript" />);

      expect(screen.getByText('test.ts')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('должен рендерить кнопку Copy при copyable=true', () => {
      render(<CodeBlockHeader copyable />);

      const button = screen.getByTestId('code-copy-button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });

    it('НЕ должен рендерить кнопку при copyable=false', () => {
      render(<CodeBlockHeader copyable={false} />);

      expect(screen.queryByTestId('code-copy-button')).not.toBeInTheDocument();
    });

    it('НЕ должен рендерить кнопку при disabled=true', () => {
      render(<CodeBlockHeader copyable disabled />);

      expect(screen.queryByTestId('code-copy-button')).not.toBeInTheDocument();
    });
  });

  describe('Copy States', () => {
    it('должен показывать иконку Copy и текст "Copy" в idle состоянии', () => {
      render(<CodeBlockHeader copyable isCopied={false} />);

      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByTestId('code-copy-button').querySelector('svg')).toBeInTheDocument();
    });

    it('должен показывать иконку Check и текст "Copied!" при isCopied=true', () => {
      render(<CodeBlockHeader copyable isCopied />);

      expect(screen.getByText('Copied!')).toBeInTheDocument();
      expect(screen.getByTestId('code-copy-button').querySelector('svg')).toBeInTheDocument();
    });

    it('должен вызывать onCopy при клике на кнопку', () => {
      const handleCopy = vi.fn();
      render(<CodeBlockHeader copyable onCopy={handleCopy} />);

      fireEvent.click(screen.getByTestId('code-copy-button'));
      expect(handleCopy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('должен иметь aria-label="Copy code" в idle состоянии', () => {
      render(<CodeBlockHeader copyable isCopied={false} />);

      expect(screen.getByTestId('code-copy-button')).toHaveAttribute('aria-label', 'Copy code');
    });

    it('должен иметь aria-label="Copied!" при isCopied=true', () => {
      render(<CodeBlockHeader copyable isCopied />);

      expect(screen.getByTestId('code-copy-button')).toHaveAttribute('aria-label', 'Copied!');
    });
  });

  describe('Custom Icons', () => {
    it('должен использовать кастомную иконку copy', () => {
      const CustomCopyIcon = () => <span data-testid="custom-copy">Custom Copy</span>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<CodeBlockHeader copyable icons={{ copy: CustomCopyIcon as any }} />);

      expect(screen.getByTestId('custom-copy')).toBeInTheDocument();
    });

    it('должен использовать кастомную иконку copied', () => {
      const CustomCopiedIcon = () => <span data-testid="custom-copied">Custom Copied</span>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render(<CodeBlockHeader copyable isCopied icons={{ copied: CustomCopiedIcon as any }} />);

      expect(screen.getByTestId('custom-copied')).toBeInTheDocument();
    });
  });
});
