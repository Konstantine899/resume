// src/shared/ui/Section/ui/Section.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from '@storybook/test';
import { Section } from './Section';

const meta = {
  title: 'UI/Section',
  component: Section,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '**Section** — семантический компонент для разделения контента страницы.\n\n' +
          '## Назначение\n\n' +
          'Section обеспечивает **вертикальное разделение** контента через проп `size`.\n' +
          'Горизонтальный padding и max-width управляются через **Container**.\n\n' +
          'Section НЕ управляет:\n' +
          '- Фоном — используйте `className`\n' +
          '- Горизонтальными отступами — используйте Container\n' +
          '- Цветом текста — используйте CSS-переменные\n\n' +
          '## Размеры:\n\n' +
          '- **sm** — 1.5rem (compact)\n' +
          '- **md** — 2rem (default)\n' +
          '- **lg** — 3rem (spacious)\n' +
          '- **xl** — 4rem\n' +
          '- **2xl** — 6rem (extra spacious)\n\n' +
          '## HTML элементы:\n\n' +
          '- **section** (default) — семантическая секция\n' +
          '- **article** — самостоятельный контент\n' +
          '- **aside** — дополнительный контент\n' +
          '- **main** — основной контент\n' +
          '- **div** — нейтральный контейнер\n' +
          '- **nav** — навигация\n\n' +
          '## Использование:\n\n' +
          '```tsx\n' +
          '<Section>Content</Section>\n' +
          '<Section size="lg">Spacious section</Section>\n' +
          '<Section as="article">Article section</Section>\n' +
          '<Section aria-label="About">Accessible section</Section>\n' +
          '```',
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  argTypes: {
    as: {
      control: 'select',
      options: ['section', 'article', 'aside', 'main', 'div', 'nav'],
      description: 'HTML элемент для рендера',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Размер вертикального отступа (padding top/bottom)',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    children: {
      control: 'text',
      description: 'Содержимое секции',
    },
    'aria-label': {
      control: 'text',
      description: 'Метка для доступности',
    },
    'aria-labelledby': {
      control: 'text',
      description: 'ID элемента с заголовком для доступности',
    },
    role: {
      control: 'select',
      options: ['region', 'banner', 'contentinfo', 'navigation', 'main', 'complementary'],
      description: 'ARIA role',
    },
  },
  args: {
    children: 'Section Content',
    size: 'md',
    as: 'section',
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Default
// ============================================

export const Default: Story = {};

// ============================================
// Sizes
// ============================================

export const SizeSm: Story = {
  args: {
    size: 'sm',
    children: 'Size: sm — 1.5rem vertical padding',
  },
};

export const SizeMd: Story = {
  args: {
    size: 'md',
    children: 'Size: md — 2rem vertical padding (default)',
  },
};

export const SizeLg: Story = {
  args: {
    size: 'lg',
    children: 'Size: lg — 3rem vertical padding',
  },
};

export const SizeXl: Story = {
  args: {
    size: 'xl',
    children: 'Size: xl — 4rem vertical padding',
  },
};

export const Size2xl: Story = {
  args: {
    size: '2xl',
    children: 'Size: 2xl — 6rem vertical padding',
  },
};

// ============================================
// All Sizes Comparison
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Section size="sm">
        <div style={{ background: 'var(--primary)', padding: '8px', color: '#fff' }}>
          sm — 1.5rem
        </div>
      </Section>
      <Section size="md">
        <div style={{ background: 'var(--primary)', padding: '8px', color: '#fff' }}>
          md — 2rem (default)
        </div>
      </Section>
      <Section size="lg">
        <div style={{ background: 'var(--primary)', padding: '8px', color: '#fff' }}>lg — 3rem</div>
      </Section>
      <Section size="xl">
        <div style={{ background: 'var(--primary)', padding: '8px', color: '#fff' }}>xl — 4rem</div>
      </Section>
      <Section size="2xl">
        <div style={{ background: 'var(--primary)', padding: '8px', color: '#fff' }}>
          2xl — 6rem
        </div>
      </Section>
    </div>
  ),
};

// ============================================
// HTML Elements
// ============================================

export const AsArticle: Story = {
  args: {
    as: 'article',
    children: 'Rendered as &lt;article&gt;',
  },
};

export const AsDiv: Story = {
  args: {
    as: 'div',
    children: 'Rendered as &lt;div&gt;',
  },
};

export const AsMain: Story = {
  args: {
    as: 'main',
    children: 'Rendered as &lt;main&gt;',
  },
};

export const AsAside: Story = {
  args: {
    as: 'aside',
    children: 'Rendered as &lt;aside&gt;',
  },
};

export const AsNav: Story = {
  args: {
    as: 'nav',
    children: 'Rendered as &lt;nav&gt;',
  },
};

// ============================================
// Accessibility
// ============================================

export const WithAriaLabel: Story = {
  args: {
    'aria-label': 'About me section',
    children: 'Section with aria-label',
  },
};

export const WithAriaLabelledBy: Story = {
  args: {
    'aria-labelledby': 'section-title',
    children: (
      <>
        <h2 id="section-title">Section Title</h2>
        <p>Section content referenced by aria-labelledby</p>
      </>
    ),
  },
};

export const WithRole: Story = {
  args: {
    role: 'region',
    children: 'Section with role="region"',
  },
};

// ============================================
// Composition Examples
// ============================================

export const WithHeading: Story = {
  args: {
    children: (
      <>
        <h2>Section Heading</h2>
        <p>Section content with a heading</p>
      </>
    ),
  },
};

export const WithMultipleChildren: Story = {
  args: {
    children: (
      <>
        <h2>Section Title</h2>
        <p>First paragraph of content.</p>
        <p>Second paragraph of content.</p>
        <button type="button">Action</button>
      </>
    ),
  },
};

// ============================================
// Interaction Tests
// ============================================

export const Interactive: Story = {
  render: (args) => (
    <Section {...args} data-testid="section-interactive">
      Interactive Section
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const section = canvas.getByTestId('section-interactive');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
    expect(section).toHaveAttribute('data-size', 'md');
    expect(section).toHaveTextContent('Interactive Section');
  },
};
