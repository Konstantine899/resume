import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Code } from './Code';

// Mock useToast
const mockAddToast = vi.fn();
vi.mock('@/shared/lib/contexts/ToastContext', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// Mock navigator.clipboard
const mockWriteText = vi.fn();
beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
  mockWriteText.mockResolvedValue(undefined);
});

describe('Code (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Inline variant', () => {
    it('должен рендерить CodeInlineUi с code элементом', () => {
      render(<Code variant="inline">const x = 10;</Code>);

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toBeInTheDocument();
      expect(codeEl.tagName).toBe('CODE');
      expect(codeEl).toHaveTextContent('const x = 10;');
    });

    it('должен передавать copyable в CodeInlineUi', () => {
      render(
        <Code variant="inline" copyable>
          const x = 10;
        </Code>
      );

      const codeEl = screen.getByTestId('code-inline');
      expect(codeEl).toHaveAttribute('tabIndex', '0');
      expect(codeEl).toHaveAttribute('role', 'button');
    });
  });

  describe('Block variant', () => {
    it('должен рендерить CodeBlockUi с header и pre/code', () => {
      render(
        <Code variant="block" title="test.ts" language="TypeScript">
          const x = 10;
        </Code>
      );

      expect(screen.getByTestId('code-block')).toBeInTheDocument();
      expect(screen.getByText('test.ts')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByTestId('code-block').querySelector('pre')).toBeInTheDocument();
    });

    it('должен показывать copy button при copyable=true', () => {
      render(
        <Code variant="block" copyable>
          const x = 10;
        </Code>
      );

      expect(screen.getByTestId('code-copy-button')).toBeInTheDocument();
    });

    it('должен иметь tabIndex=0 и role="region" на блоке', () => {
      render(<Code variant="block">const x = 10;</Code>);

      const block = screen.getByTestId('code-block');
      expect(block).toHaveAttribute('tabIndex', '0');
      expect(block).toHaveAttribute('role', 'region');
    });
  });

  describe('Keyboard', () => {
    it('должен вызывать clipboard.writeText при Enter на copyable inline', async () => {
      render(
        <Code variant="inline" copyable>
          npm install test
        </Code>
      );

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: 'Enter' });

      await vi.waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('npm install test');
      });
    });

    it('должен вызывать clipboard.writeText при Space на copyable inline', async () => {
      render(
        <Code variant="inline" copyable>
          npm install test
        </Code>
      );

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: ' ' });

      await vi.waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('npm install test');
      });
    });

    it('НЕ должен вызывать clipboard.writeText при других клавишах на copyable inline', () => {
      render(
        <Code variant="inline" copyable>
          npm install test
        </Code>
      );

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: 'Escape' });

      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('НЕ должен вызывать clipboard.writeText при Enter на disabled copyable inline', () => {
      render(
        <Code variant="inline" copyable disabled>
          npm install test
        </Code>
      );

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: 'Enter' });

      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('НЕ должен вызывать clipboard.writeText при Enter на non-copyable inline', () => {
      render(<Code variant="inline">npm install test</Code>);

      fireEvent.keyDown(screen.getByTestId('code-inline'), { key: 'Enter' });

      expect(mockWriteText).not.toHaveBeenCalled();
    });
  });

  describe('Copy flow', () => {
    it('должен вызывать clipboard.writeText при клике на copyable inline', async () => {
      render(
        <Code variant="inline" copyable>
          npm install test
        </Code>
      );

      fireEvent.click(screen.getByTestId('code-inline'));

      await vi.waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('npm install test');
      });
    });

    it('должен добавлять toast при успешном копировании', async () => {
      mockWriteText.mockResolvedValue(undefined);
      render(
        <Code variant="inline" copyable>
          npm install
        </Code>
      );

      fireEvent.click(screen.getByTestId('code-inline'));

      await vi.waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith('Code copied to clipboard', 'success', 2000);
      });
    });

    it('должен вызывать onCopy при успешном копировании', async () => {
      const handleCopy = vi.fn();
      render(
        <Code variant="inline" copyable onCopy={handleCopy}>
          const x = 10;
        </Code>
      );

      fireEvent.click(screen.getByTestId('code-inline'));

      await vi.waitFor(() => {
        expect(handleCopy).toHaveBeenCalledTimes(1);
      });
    });

    it('должен вызывать clipboard.writeText при клике на copy button в block', async () => {
      const multiLine = (
        <>
          <span>line 1</span>
          {'\n'}
          <span>line 2</span>
        </>
      );
      render(
        <Code variant="block" copyable>
          {multiLine}
        </Code>
      );

      fireEvent.click(screen.getByTestId('code-copy-button'));

      await vi.waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('line 1\nline 2');
      });
    });
  });
});
