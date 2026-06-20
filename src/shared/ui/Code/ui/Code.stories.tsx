import type { Meta, StoryObj } from '@storybook/react-vite';
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
    language: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Code>;

export default meta;
type Story = StoryObj<typeof meta>;

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

const veryLongLineCode = `const veryLongVariableNameThatShouldTriggerHorizontalScrolling = 'This is a very long string that should cause horizontal scrolling when the code block is not wide enough to display it on a single line without wrapping';`;

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
    variant: 'inline',
    children: 'const x = 10;',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Code {...args} size="sm">
        const x = 10;
      </Code>
      <Code {...args} size="md">
        const x = 10;
      </Code>
      <Code {...args} size="lg">
        const x = 10;
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

/** Block код с заголовком и terminal dots */
export const BlockWithTitle: Story = {
  args: {
    children: sampleCode,
    variant: 'block',
    title: 'greet.ts',
    language: 'TypeScript',
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

/** Block с копированием */
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

/** Block с навыками (как в Hero) с подсветкой синтаксиса */
export const BlockWithSkills: Story = {
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

/** Block с длинной строкой (горизонтальный скролл) */
export const BlockWithLongLine: Story = {
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

/** Все варианты использования */
export const AllVariants: Story = {
  args: {
    variant: 'block',
    children: sampleCode,
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
