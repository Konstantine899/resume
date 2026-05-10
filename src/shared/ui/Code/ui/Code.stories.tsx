import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, Copy, Terminal } from 'lucide-react';
import type { CodeProps } from '../model/types';
import { Code } from './Code';

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
    copyButtonSize: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    children: {
      control: 'text',
    },
    language: {
      control: 'text',
    },
    icons: {
      control: 'object',
    },
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

// Пример кода
const sampleCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`;

// ============================================
// Inline Stories
// ============================================

/** Inline код по умолчанию */
export const Inline: Story = {
  args: {
    children: 'const x = 10;',
    variant: 'inline',
    size: 'md',
  },
};

/** Inline с разными размерами */
export const InlineSizes: Story = {
  args: {
    children: 'const x = 10;',
    variant: 'inline',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Code {...args} size="sm">
        const x = 10; // Small
      </Code>
      <Code {...args} size="md">
        const x = 10; // Medium
      </Code>
      <Code {...args} size="lg">
        const x = 10; // Large
      </Code>
    </div>
  ),
};

/** Inline с копированием */
export const InlineCopyable: Story = {
  args: {
    children: 'npm install @storybook/react',
    variant: 'inline',
    copyable: true,
  },
};

// ============================================
// Block Stories
// ============================================

/** Block код с заголовком */
export const BlockWithTitle: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TypeScript',
    size: 'md',
  },
};

/** Block с нумерацией строк */
export const BlockWithLineNumbers: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TS',
    showLineNumbers: true,
  },
};

/** Block с копированием (Button) */
export const BlockCopyable: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
  },
};

/** Block с разным размером кнопки копирования */
export const BlockCopyButtonSizes: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'button-sizes.ts',
    language: 'TypeScript',
    copyable: true,
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Code {...args} copyButtonSize="sm">
        {sampleCode}
        {/* Кнопка копирования - Small */}
      </Code>
      <Code {...args} copyButtonSize="md">
        {sampleCode}
        {/* Кнопка копирования - Medium */}
      </Code>
      <Code {...args} copyButtonSize="lg">
        {sampleCode}
        {/* Кнопка копирования - Large */}
      </Code>
    </div>
  ),
};

/** Block с ограничением высоты */
export const BlockWithMaxHeight: Story = {
  args: {
    children: Array(20).fill(sampleCode).join('\n\n'),
    variant: 'block',
    title: 'Long file.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
    maxHeight: '300px',
  },
};

/** Disabled состояние */
export const Disabled: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    copyable: true,
    disabled: true,
  },
};

// ============================================
// Custom Icons Stories
// ============================================

/** Block с кастомными иконками */
export const BlockWithCustomIcons: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'custom-icons.tsx',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
    icons: {
      copy: Copy,
      copied: Check,
    },
  },
};

/** Block с тематической иконкой (Terminal для CLI команд) */
export const BlockWithTerminalIcon: Story = {
  args: {
    children: 'npm run build && npm run deploy',
    variant: 'block',
    title: 'bash',
    language: 'Bash',
    copyable: true,
    icons: {
      copy: Terminal,
      copied: Check,
    },
  },
};

// ============================================
// All Types Demo
// ============================================

/** Все варианты использования */
export const AllVariants: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'demo.ts',
    language: 'TypeScript',
    copyable: true,
    showLineNumbers: true,
    copyButtonSize: 'sm',
  },
  render: (args: CodeProps) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h3 style={{ marginBottom: '8px' }}>Inline Variants</h3>
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

      <h3 style={{ marginBottom: '8px' }}>Block Variants</h3>
      <Code {...args} title="Basic Block" />
      <Code {...args} title="With Line Numbers" showLineNumbers />
      <Code {...args} title="With Max Height" maxHeight="200px" />
    </div>
  ),
};
