// src/shared/ui/AspectRatio/ui/AspectRatio.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { AspectRatio } from './AspectRatio';

const meta = {
  title: 'Shared/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**AspectRatio** — компонент, фиксирующий контент в заданном соотношении сторон.

## Использование:

- **ratio** — обязательное соотношение вида "16/9" (runtime fallback: "16/9")
- **as** — полиморфный корневой элемент (по умолчанию \`div\`)
- **children** — контент внутри absolute fill слоя (.content)

## Доступность:

- \`data-aspect-ratio\` — сырое значение ratio на корневом элементе
- \`data-as\` — только для строковых значений \`as\`

## Примеры:

\`\`\`tsx
<AspectRatio ratio="16/9">{children}</AspectRatio>
<AspectRatio ratio="4/3" as="article">Карточка</AspectRatio>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'text',
      description: 'Соотношение в формате "width/height" (например "16/9")',
    },
    as: {
      control: 'text',
      description: 'Полиморфный корневой элемент',
    },
  },
  args: {
    ratio: '16/9',
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

// С-sizing lives in the preview panel (max-width 480px) so the width-100%
// basis of the box is visible. No global styles, no component-level sizing.
const PreviewPanel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }}>{children}</div>
);

const FillDemo = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--primary, #7c3aed), var(--secondary, #ec4899))',
    }}
  />
);

export const Default: Story = {
  render: (args) => (
    <PreviewPanel>
      <AspectRatio {...args} data-testid="ratio-default">
        <FillDemo />
      </AspectRatio>
    </PreviewPanel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByTestId('ratio-default');
    expect(box.tagName).toBe('DIV');
    expect(box).toHaveAttribute('data-aspect-ratio', '16/9');
    expect(box).toHaveStyle({ aspectRatio: '16 / 9' });
  },
};

export const Polymorphic: Story = {
  render: () => (
    <PreviewPanel>
      <AspectRatio ratio="16/9" as="article" data-testid="ratio-article">
        <FillDemo />
      </AspectRatio>
      <AspectRatio ratio="4/3" as="section" data-testid="ratio-section">
        <FillDemo />
      </AspectRatio>
    </PreviewPanel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByTestId('ratio-article');
    expect(article.tagName).toBe('ARTICLE');
    expect(article).toHaveAttribute('data-as', 'article');
    expect(article).toHaveAttribute('data-aspect-ratio', '16/9');

    const section = canvas.getByTestId('ratio-section');
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveAttribute('data-as', 'section');
    expect(section).toHaveAttribute('data-aspect-ratio', '4/3');
  },
};

export const RatioVariants: Story = {
  render: () => (
    <PreviewPanel>
      <AspectRatio ratio="4/3" data-testid="ratio-4-3">
        <FillDemo />
      </AspectRatio>
      <AspectRatio ratio="1/1" data-testid="ratio-1-1">
        <FillDemo />
      </AspectRatio>
      <AspectRatio ratio="21/9" data-testid="ratio-21-9">
        <FillDemo />
      </AspectRatio>
    </PreviewPanel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('ratio-4-3')).toHaveAttribute('data-aspect-ratio', '4/3');
    expect(canvas.getByTestId('ratio-1-1')).toHaveAttribute('data-aspect-ratio', '1/1');
    expect(canvas.getByTestId('ratio-21-9')).toHaveAttribute('data-aspect-ratio', '21/9');
    expect(canvas.getByTestId('ratio-4-3')).toHaveStyle({ aspectRatio: '4 / 3' });
  },
};

export const ContentFill: Story = {
  render: () => (
    <PreviewPanel>
      <AspectRatio ratio="16/9" data-testid="ratio-fill">
        <div data-testid="fill-content" style={{ width: '100%', height: '100%' }}>
          <FillDemo />
        </div>
      </AspectRatio>
    </PreviewPanel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByTestId('ratio-fill');
    const content = canvas.getByTestId('fill-content');
    // Children are hosted inside the absolute fill layer (.content).
    expect(box).toContainElement(content);
    expect(content.parentElement).toHaveClass(/content/);
  },
};
