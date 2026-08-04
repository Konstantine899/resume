// ============================================
// Code Component — Storybook Stories
// ============================================
//
// CSF3 (Component Story Format 3) с interaction tests.
//
// Группы:
//   Inline  (3): Default, Sizes, Copyable
//   Block   (5): Default, With Line Numbers, Copy, Copy Error, SkillsCode
//   Skeleton (2): Inline, Block
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from '@storybook/test';
import { ToastProvider } from '@/shared/lib/contexts/ToastContext';
import { Code } from './Code';

// ============================================
// Sample data
// ============================================

/** Многострочный код с подсветкой синтаксиса */
const sampleCode = (
  <>
    <span className="keyword">function</span> <span className="property">greet</span>(
    <span className="property">name</span>: <span className="keyword">string</span>):{' '}
    <span className="keyword">string</span> {'{'}
    {'\n'}
    {'  '}
    <span className="keyword">return</span>{' '}
    <span className="string">
      `Hello, ${'{'}name{'}'}!`
    </span>
    ;{'\n'}
    {'}'}
    {'\n\n'}
    <span className="keyword">const</span> <span className="property">message</span> ={' '}
    <span className="property">greet</span>(<span className="string">'World'</span>);
    {'\n'}
    <span className="property">console</span>.<span className="property">log</span>(
    <span className="property">message</span>);
  </>
);

/**
 * Локальный аналог SkillsCode (из features/Hero) — разметка «developer object»,
 * чтобы не нарушать FSD: shared/ui/Code не может импортировать features/Hero.
 */
const skillsCodeContent = (
  <>
    <span className="keyword">const</span> <span className="property">developer</span> ={' '}
    <span className="punctuation">{'{'}</span>
    {'\n'}
    {'  '}
    <span className="property">fullName</span>:{' '}
    <span className="string">&apos;Konstantin&apos;</span>,{'\n'}
    {'  '}
    <span className="property">profession</span>:{' '}
    <span className="string">&apos;Full Stack Developer&apos;</span>,{'\n'}
    {'  '}
    <span className="property">yearsOfExperience</span>: <span className="number">7</span>,{'\n'}
    {'  '}
    <span className="property">skills</span>: <span className="punctuation">{'['}</span>
    {'\n'}
    {'    '}
    <span className="string">&apos;TypeScript&apos;</span>,{'\n'}
    {'    '}
    <span className="string">&apos;React&apos;</span>,{'\n'}
    {'    '}
    <span className="string">&apos;Node.js&apos;</span>,{'\n'}
    {'  '}
    <span className="punctuation">{']'}</span>,{'\n'}
    <span className="punctuation">{'}'}</span>;
  </>
);

// ============================================
// Meta — общая конфигурация
// ============================================

const meta = {
  title: 'Shared/Code',
  component: Code,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['inline', 'block'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    language: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    copyable: {
      control: 'boolean',
    },
    showLineNumbers: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    maxHeight: {
      control: 'text',
    },
  },
  // Все истории обёрнуты в ToastProvider — useToast() обязателен для copyable-режима
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Helpers — моки Clipboard API
// ============================================

function mockClipboardSuccess() {
  const originalClipboard = navigator.clipboard;
  const mockWriteText = fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
  return () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  };
}

function mockClipboardError() {
  const originalClipboard = navigator.clipboard;
  const mockWriteText = fn().mockRejectedValue(new Error('Clipboard permission denied'));
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText },
    configurable: true,
    writable: true,
  });
  return () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      configurable: true,
      writable: true,
    });
  };
}

// ============================================
// 1. Inline / Default
// ============================================

export const InlineDefault: Story = {
  name: 'Inline / Default',
  args: {
    children: 'npm install @storybook/react',
    variant: 'inline',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const codeEl = canvas.getByTestId('code-inline');
    expect(codeEl).toBeInTheDocument();
    expect(codeEl.tagName).toBe('CODE');
    expect(codeEl).toHaveTextContent('npm install @storybook/react');
    // Убеждаемся, что это inline — нет pre-обёртки
    expect(codeEl.closest('pre')).toBeNull();
    expect(codeEl).toHaveAttribute('data-size', 'md');
  },
};

// ============================================
// 2. Inline / Sizes (sm, md, lg)
// ============================================

export const InlineSizes: Story = {
  name: 'Inline / Sizes (sm, md, lg)',
  args: {
    variant: 'inline',
    children: 'npm install @storybook/react',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Code {...args} size="sm">
        npm install @storybook/react
      </Code>
      <Code {...args} size="md">
        npm install @storybook/react
      </Code>
      <Code {...args} size="lg">
        npm install @storybook/react
      </Code>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const codeElements = canvas.getAllByTestId('code-inline');
    expect(codeElements).toHaveLength(3);
    expect(codeElements[0]).toHaveAttribute('data-size', 'sm');
    expect(codeElements[1]).toHaveAttribute('data-size', 'md');
    expect(codeElements[2]).toHaveAttribute('data-size', 'lg');
  },
};

// ============================================
// 3. Inline / Copyable
// ============================================

export const InlineCopyable: Story = {
  name: 'Inline / Copyable',
  args: {
    children: 'npm install @storybook/react',
    variant: 'inline',
    copyable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreClipboard = mockClipboardSuccess();
    try {
      const codeEl = canvas.getByTestId('code-inline');
      expect(codeEl).toHaveAttribute('role', 'button');
      expect(codeEl).toHaveAttribute('tabindex', '0');

      // Клик по inline-коду — копирование
      await userEvent.click(codeEl);
      await waitFor(() => {
        expect(codeEl.className).toMatch(/copied/);
      });
    } finally {
      restoreClipboard();
    }
  },
};

// ============================================
// 4. Block / Default
// ============================================

export const BlockDefault: Story = {
  name: 'Block / Default',
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'example.ts',
    language: 'TypeScript',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const block = canvas.getByTestId('code-block');
    expect(block).toBeInTheDocument();
    expect(canvas.getByText('example.ts')).toBeInTheDocument();
    expect(canvas.getByText('TypeScript')).toBeInTheDocument();
    expect(block).toHaveAttribute('data-variant', 'block');
  },
};

// ============================================
// 5. Block / With Line Numbers
// ============================================

export const BlockWithLineNumbers: Story = {
  name: 'Block / With Line Numbers',
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TS',
    showLineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const block = canvas.getByTestId('code-block');
    expect(canvas.getByText('greet.ts')).toBeInTheDocument();
    expect(canvas.getByText('TS')).toBeInTheDocument();
    // Проверяем line numbers
    const lineNumbers = block.querySelectorAll('[class*="lineNumber"]');
    expect(lineNumbers.length).toBeGreaterThan(1);
    expect(lineNumbers[0]).toHaveTextContent('1');
  },
};

// ============================================
// 6. Block / Copy (Idle → Copied → Reset)
// ============================================

export const BlockCopy: Story = {
  name: 'Block / Copy',
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreClipboard = mockClipboardSuccess();
    try {
      // Начальное состояние — кнопка "Copy"
      const copyButton = canvas.getByTestId('code-copy-button');
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveTextContent('Copy');
      expect(copyButton).toHaveAttribute('aria-label', 'Copy code');

      // Клик по кнопке Copy
      await userEvent.click(copyButton);

      // Переход в состояние "Copied!" — зелёная иконка и текст
      await waitFor(() => {
        expect(canvas.getByText('Copied!')).toBeInTheDocument();
      });
      expect(copyButton).toHaveAttribute('aria-label', 'Copied!');

      // Ожидаем таймаут 2 секунды и проверяем сброс состояния
      await waitFor(
        () => {
          expect(canvas.queryByText('Copied!')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
      expect(copyButton).toHaveTextContent('Copy');
      expect(copyButton).toHaveAttribute('aria-label', 'Copy code');
    } finally {
      restoreClipboard();
    }
  },
};

// ============================================
// 7. Block / Copy Error
// ============================================

export const BlockCopyError: Story = {
  name: 'Block / Copy Error',
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'error.ts',
    language: 'TypeScript',
    copyable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreClipboard = mockClipboardError();
    try {
      // Начальное состояние — кнопка "Copy"
      const copyButton = canvas.getByTestId('code-copy-button');
      expect(copyButton).toHaveTextContent('Copy');

      // Клик по кнопке Copy — clipboard вернёт ошибку
      await userEvent.click(copyButton);

      // После ошибки кнопка НЕ должна переключиться на "Copied!"
      await waitFor(() => {
        expect(copyButton).toHaveTextContent('Copy');
      });
      // Убеждаемся, что "Copied!" не появился
      expect(canvas.queryByText('Copied!')).not.toBeInTheDocument();
    } finally {
      restoreClipboard();
    }
  },
};

// ============================================
// 8. Block / SkillsCode (реальное использование в приложении)
// ============================================

export const BlockSkillsCode: Story = {
  name: 'Block / SkillsCode',
  args: {
    children: skillsCodeContent,
    variant: 'block',
    title: 'developer.ts',
    language: 'TypeScript',
    showLineNumbers: true,
    copyable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restoreClipboard = mockClipboardSuccess();
    try {
      // Проверяем структуру
      expect(canvas.getByTestId('code-block')).toBeInTheDocument();
      expect(canvas.getByText('developer.ts')).toBeInTheDocument();
      expect(canvas.getByText('TypeScript')).toBeInTheDocument();

      // Проверяем, что SkillsCode отрендерился (контент из DEVELOPER_DATA)
      expect(canvas.getAllByText(/fullName|profession|developer/i).length).toBeGreaterThan(0);

      // Проверяем line numbers (SkillsCode содержит много строк)
      const lineNumbers = canvas
        .getByTestId('code-block')
        .querySelectorAll('[class*="lineNumber"]');
      expect(lineNumbers.length).toBeGreaterThan(5);

      // Проверяем копирование с SkillsCode
      const copyButton = canvas.getByTestId('code-copy-button');
      await userEvent.click(copyButton);
      await waitFor(() => {
        expect(canvas.getByText('Copied!')).toBeInTheDocument();
      });
    } finally {
      restoreClipboard();
    }
  },
};

// ============================================
// 9. Inline / Skeleton
// ============================================

export const InlineSkeleton: Story = {
  name: 'Inline / Skeleton',
  args: {
    children: 'npm install @storybook/react',
    variant: 'inline',
    size: 'md',
    skeleton: true,
  },
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector('[data-skeleton="true"]');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('data-skeleton', 'true');
    expect(skeleton).toHaveAttribute('data-variant', 'text');
  },
};

// ============================================
// 10. Block / Skeleton (реальные пропсы из Hero.tsx)
// ============================================

export const BlockSkeleton: Story = {
  name: 'Block / Skeleton',
  args: {
    children: skillsCodeContent,
    variant: 'block',
    title: 'developer.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
    skeleton: true,
  },
  play: async () => {
    const block = screen.getByTestId('code-block');
    expect(block).toBeInTheDocument();
    expect(block).toHaveAttribute('data-skeleton', 'true');
    expect(block).toHaveAttribute('aria-busy', 'true');
    // Header skeleton placeholders instead of real text
    expect(screen.queryByText('developer.ts')).not.toBeInTheDocument();
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument();
    // Skeleton elements — header placeholders + content skeleton carry data-skeleton
    const innerSkeletons = block.querySelectorAll('[data-skeleton="true"]');
    expect(innerSkeletons.length).toBeGreaterThanOrEqual(1);
    // Each skeleton has correct attributes
    innerSkeletons.forEach((s) => {
      expect(s).toHaveAttribute('data-skeleton', 'true');
    });
  },
};
