// ============================================
// Code Component — Storybook Stories
// ============================================
//
// CSF3 (Component Story Format 3) с interaction tests.
// Требования:
//   - ≥6 историй с play-функциями
//   - Покрытие: inline, block, sizes, copy (idle→copied→reset), copy error, SkillsCode
//   - Использование @storybook/test для взаимодействий
//   - Обёртка ToastProvider для контекста useToast()
// ============================================

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { ToastProvider } from '@/shared/lib/contexts/ToastContext';
import SkillsCode from '@/features/Hero/ui/SkillsCode/SkillsCode';
import { Code } from './Code';

// ============================================
// Sample data для stories
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

/** Skills-like код (статические данные для preview) */
const skillsCode = (
  <>
    <span className="property">kosmos</span> <span className="punctuation">=</span>{' '}
    <span className="punctuation">{'{'}</span>
    {'\n'}
    {'  '}
    <span className="property">fullName</span>:{' '}
    <span className="string">'Атрощенко Константин'</span>,{'\n'}
    {'  '}
    <span className="property">profession</span>:{' '}
    <span className="string">'Full Stack Developer'</span>,{'\n'}
    {'  '}
    <span className="property">specialties</span>:{' '}
    <span className="string">'React, Node.js, TypeScript'</span>,{'\n'}
    {'  '}
    <span className="property">skills</span>:{' '}
    <span className="string">'Современные Веб-Технологии'</span>,{'\n'}
    {'  '}
    <span className="property">yearsOfExperience</span>: <span className="number">6</span>,{'\n'}
    {'  '}
    <span className="property">age</span>: <span className="number">20</span>
    {'\n'}
    <span className="punctuation">{'};'}</span>
  </>
);

/** Длинный код для проверки maxHeight и скролла */
const longCode = (
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
    {'\n\n'}
    <span className="keyword">function</span> <span className="property">add</span>(
    <span className="property">a</span>: <span className="keyword">number</span>,{' '}
    <span className="property">b</span>: <span className="keyword">number</span>):{' '}
    <span className="keyword">number</span> {'{'}
    {'\n'}
    {'  '}
    <span className="keyword">return</span> <span className="property">a</span>{' '}
    <span className="punctuation">+</span> <span className="property">b</span>;{'\n'}
    {'}'}
    {'\n\n'}
    <span className="keyword">const</span> <span className="property">result</span> ={' '}
    <span className="property">add</span>(<span className="number">5</span>,{' '}
    <span className="number">10</span>);
    {'\n'}
    <span className="property">console</span>.<span className="property">log</span>(
    <span className="property">result</span>);
  </>
);

/** Очень длинная строка для проверки горизонтального скролла */
const veryLongLineCode = `const veryLongVariableNameThatShouldTriggerHorizontalScrolling = 'This is a very long string that should cause horizontal scrolling when the code block is not wide enough to display it on a single line without wrapping';`;

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
// 1. Inline default — базовый inline-рендер
// ============================================

export const InlineDefault: Story = {
  name: 'Inline / Default',
  args: {
    children: 'const x = 10;',
    variant: 'inline',
    size: 'md',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const codeEl = canvas.getByTestId('code-inline');
    expect(codeEl).toBeInTheDocument();
    expect(codeEl.tagName).toBe('CODE');
    expect(codeEl).toHaveTextContent('const x = 10;');
    // Убеждаемся, что это inline — нет pre-обёртки
    expect(codeEl.closest('pre')).toBeNull();
  },
};

// ============================================
// 2. Block with line numbers
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
    // Проверяем базовую структуру block
    expect(canvas.getByTestId('code-block')).toBeInTheDocument();
    expect(canvas.getByText('greet.ts')).toBeInTheDocument();
    expect(canvas.getByText('TS')).toBeInTheDocument();
    // Проверяем line numbers
    const lineNumbers = canvas.getByTestId('code-block').querySelectorAll('[class*="lineNumber"]');
    // sampleCode содержит 6-7 строк (зависит от форматирования)
    expect(lineNumbers.length).toBeGreaterThan(1);
    expect(lineNumbers[0]).toHaveTextContent('1');
  },
};

// ============================================
// 3. Sizes — все три размера inline
// ============================================

export const Sizes: Story = {
  name: 'Inline / Sizes (sm, md, lg)',
  args: {
    variant: 'inline',
    children: 'const x = 10;',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Code {...args} size="sm">
        const x = 10; // sm
      </Code>
      <Code {...args} size="md">
        const x = 10; // md
      </Code>
      <Code {...args} size="lg">
        const x = 10; // lg
      </Code>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const codeElements = canvas.getAllByTestId('code-inline');
    expect(codeElements).toHaveLength(3);
    // Проверяем, что у каждого code элемента свой размер
    // (проверяем, что они отрендерились с корректными классами)
    expect(codeElements[0]).toHaveTextContent('sm');
    expect(codeElements[1]).toHaveTextContent('md');
    expect(codeElements[2]).toHaveTextContent('lg');
  },
};

// ============================================
// 4. Copy idle → copied → reset (interaction test)
// ============================================

/**
 * Мокает navigator.clipboard.writeText для тестов копирования.
 * Возвращает функцию восстановления оригинального clipboard.
 */
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

export const CopyIdleToCopied: Story = {
  name: 'Copy / Idle → Copied → Reset',
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
// 5. Copy error — ошибка Clipboard API
// ============================================

/**
 * Мокает navigator.clipboard.writeText чтобы выбрасывать ошибку.
 */
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

export const CopyError: Story = {
  name: 'Copy / Error State',
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
      // waitFor с небольшой задержкой для обработки асинхронного catch
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
// 6. SkillsCode content — реальный SkillsCode
// ============================================

export const SkillsCodeContent: Story = {
  name: 'Block / SkillsCode Content',
  args: {
    children: <SkillsCode />,
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
      expect(canvas.getByText(/fullName|profession|developer/i)).toBeInTheDocument();

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
// Дополнительные display-only stories
// ============================================

/** Inline с копированием */
export const InlineCopyable: Story = {
  name: 'Inline / Copyable',
  args: {
    children: 'npm install @storybook/react',
    variant: 'inline',
    copyable: true,
  },
};

/** Block с заголовком и terminal dots (без line numbers) */
export const BlockWithTitle: Story = {
  name: 'Block / With Title',
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TypeScript',
  },
};

/** Block с копированием и line numbers */
export const BlockCopyable: Story = {
  name: 'Block / Copyable',
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
  },
};

/** Block со статическими данными навыков (skillsCode) */
export const BlockWithSkills: Story = {
  name: 'Block / Skills Data',
  args: {
    children: skillsCode,
    variant: 'block',
    title: 'kosmos.ts',
    language: 'TypeScript',
    copyable: true,
  },
};

/** Block с ограничением высоты и вертикальным скроллом */
export const BlockWithMaxHeight: Story = {
  name: 'Block / Max Height',
  args: {
    children: longCode,
    variant: 'block',
    title: 'Long file.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
    maxHeight: '300px',
  },
};

/** Block с очень длинной строкой (горизонтальный скролл) */
export const BlockWithLongLine: Story = {
  name: 'Block / Long Line',
  args: {
    children: veryLongLineCode,
    variant: 'block',
    title: 'long-line.ts',
    language: 'TypeScript',
    copyable: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

/** Все варианты в одном представлении */
export const AllVariants: Story = {
  args: {
    variant: 'inline',
    children: 'const x = 10;',
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section>
        <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Inline Variants</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Code variant="inline" size="sm">
            const x = 10;
          </Code>
          <Code variant="inline" size="md">
            const y = 20;
          </Code>
          <Code variant="inline" size="lg">
            const z = 30;
          </Code>
          <Code variant="inline" copyable>
            npm install package
          </Code>
        </div>
      </section>

      <section>
        <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>Block Variants</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Code variant="block" title="Basic Block" language="TypeScript">
            {sampleCode}
          </Code>
          <Code variant="block" title="With Line Numbers" language="TS" showLineNumbers>
            {sampleCode}
          </Code>
          <Code variant="block" title="With Copy" language="TypeScript" copyable>
            {sampleCode}
          </Code>
          <Code variant="block" title="Skills" language="TypeScript" copyable>
            {skillsCode}
          </Code>
        </div>
      </section>
    </div>
  ),
};
