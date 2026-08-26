import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeBlockUi } from './CodeBlock';
import styles from './CodeBlock.module.scss';

vi.mock('@/shared/lib/i18n/hooks', () => ({
  useLanguage: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        copy: 'Copy',
        copied: 'Copied!',
        copyCode: 'Copy code',
        clickToCopy: 'Click to copy code',
        codeBlock: 'Code block',
        codeBlockWithTitle: 'Code block: {{title}}',
      };
      let value = map[key] ?? key;
      if (opts) {
        for (const [k, val] of Object.entries(opts)) {
          value = value.replace(new RegExp(`{{${k}}}`, 'g'), String(val));
        }
      }
      return value;
    },
  }),
}));

describe('CodeBlockUi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('должен рендерить базовую структуру: container с pre/code', () => {
      const { container } = render(<CodeBlockUi>const x = 10;</CodeBlockUi>);

      const blockContainer = container.querySelector(`.${styles.blockContainer}`);
      expect(blockContainer).toBeInTheDocument();
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
    });

    it('должен рендерить header с title и language', () => {
      render(
        <CodeBlockUi title="test.ts" language="TypeScript">
          const x = 10;
        </CodeBlockUi>
      );

      expect(screen.getByText('test.ts')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });

    it('должен применять кастомный className', () => {
      const { container } = render(
        <CodeBlockUi className="custom-class">const x = 10;</CodeBlockUi>
      );

      const blockContainer = container.querySelector(`.${styles.blockContainer}`);
      expect(blockContainer).toHaveClass('custom-class');
    });

    it('должен иметь data-testid="code-block"', () => {
      render(<CodeBlockUi>const x = 10;</CodeBlockUi>);

      expect(screen.getByTestId('code-block')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('должен иметь tabIndex={0} на контейнере для фокусировки', () => {
      render(<CodeBlockUi>const x = 10;</CodeBlockUi>);

      const block = screen.getByTestId('code-block');
      expect(block).toHaveAttribute('tabIndex', '0');
    });

    it('должен иметь role="region" на контейнере', () => {
      render(<CodeBlockUi>const x = 10;</CodeBlockUi>);

      const block = screen.getByTestId('code-block');
      expect(block).toHaveAttribute('role', 'region');
    });

    it('должен принимать aria-label', () => {
      render(<CodeBlockUi ariaLabel="Code block: test.ts">const x = 10;</CodeBlockUi>);

      const block = screen.getByTestId('code-block');
      expect(block).toHaveAttribute('aria-label', 'Code block: test.ts');
    });
  });

  describe('Line Numbers', () => {
    const multiLineCode = (
      <>
        <span>line 1</span>
        {'\n'}
        <span>line 2</span>
        {'\n'}
        <span>line 3</span>
      </>
    );

    it('должен показывать line numbers при showLineNumbers=true и мульти-лайн коде', () => {
      const { container } = render(<CodeBlockUi showLineNumbers>{multiLineCode}</CodeBlockUi>);

      const lineNumbers = container.querySelector(`.${styles.lineNumbers}`);
      expect(lineNumbers).toBeInTheDocument();
      expect(lineNumbers).toHaveAttribute('aria-hidden', 'true');
    });

    it('должен показывать номера 1-3 для трёх строк', () => {
      render(<CodeBlockUi showLineNumbers>{multiLineCode}</CodeBlockUi>);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('НЕ должен показывать line numbers для одной строки', () => {
      const { container } = render(<CodeBlockUi showLineNumbers>const x = 10;</CodeBlockUi>);

      const lineNumbers = container.querySelector(`.${styles.lineNumbers}`);
      expect(lineNumbers).not.toBeInTheDocument();
    });

    it('НЕ должен показывать line numbers при showLineNumbers=false', () => {
      const { container } = render(
        <CodeBlockUi showLineNumbers={false}>{multiLineCode}</CodeBlockUi>
      );

      const lineNumbers = container.querySelector(`.${styles.lineNumbers}`);
      expect(lineNumbers).not.toBeInTheDocument();
    });
  });

  describe('Copy Button', () => {
    it('должен показывать copy button при copyable=true', () => {
      render(<CodeBlockUi copyable>const x = 10;</CodeBlockUi>);

      expect(screen.getByTestId('code-copy-button')).toBeInTheDocument();
    });

    it('НЕ должен показывать copy button при copyable=false', () => {
      render(<CodeBlockUi copyable={false}>const x = 10;</CodeBlockUi>);

      expect(screen.queryByTestId('code-copy-button')).not.toBeInTheDocument();
    });

    it('НЕ должен показывать copy button при disabled=true', () => {
      render(
        <CodeBlockUi copyable disabled>
          const x = 10;
        </CodeBlockUi>
      );

      expect(screen.queryByTestId('code-copy-button')).not.toBeInTheDocument();
    });
  });
});
