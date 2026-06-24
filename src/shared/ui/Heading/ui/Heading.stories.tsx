import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta = {
  title: 'shared/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
Семантический компонент заголовков с полной поддержкой accessibility.

**Особенности:**
- Семантические теги h1-h6 для SEO
- BEM-именование классов
- Runtime валидация пропсов в development режиме
- Мемоизация для оптимизации производительности
        `,
      },
    },
    a11y: {
      config: {},
      options: {
        runOnly: ['WCAG 2A', 'WCAG 2AA'],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'Уровень заголовка (h1-h6)',
      table: {
        defaultValue: { summary: '2' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'],
      description: 'Визуальный размер заголовка',
      table: {
        defaultValue: { summary: 'm' },
      },
    },
    theme: {
      control: { type: 'select' },
      options: ['primary', 'muted', 'inverted', 'error', 'gradient'],
      description: 'Цветовая тема',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
      description: 'Выравнивание текста',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    children: {
      control: { type: 'text' },
      description: 'Содержимое заголовка (текст или JSX)',
    },
    className: {
      control: { type: 'text' },
      description: 'Дополнительные CSS классы',
    },
    id: {
      control: { type: 'text' },
      description: 'HTML id для якорных ссылок',
    },
    'aria-label': {
      control: { type: 'text' },
      description: 'ARIA label для доступности',
    },
    'aria-labelledby': {
      control: { type: 'text' },
      description: 'ARIA labelledby для связи с другим элементом',
    },
    'data-testid': {
      control: { type: 'text' },
      description: 'Data-testid для тестирования',
      table: {
        defaultValue: { summary: 'Heading' },
      },
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Заголовок по умолчанию',
  },
};

export const AllLevels: Story = {
  args: {
    children: 'Заголовок',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading {...args} level={1} size="5xl">
        Заголовок H1 — Главный на странице
      </Heading>
      <Heading {...args} level={2} size="4xl">
        Заголовок H2 — Секция
      </Heading>
      <Heading {...args} level={3} size="3xl">
        Заголовок H3 — Подсекция
      </Heading>
      <Heading {...args} level={4} size="2xl">
        Заголовок H4 — Группа
      </Heading>
      <Heading {...args} level={5} size="xl">
        Заголовок H5 — Элемент
      </Heading>
      <Heading {...args} level={6} size="l">
        Заголовок H6 — Деталь
      </Heading>
    </div>
  ),
};

export const AllSizes: Story = {
  args: {
    children: 'Размер',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading {...args} size="xs">
        xs — Extra Small (12px)
      </Heading>
      <Heading {...args} size="s">
        s — Small (14px)
      </Heading>
      <Heading {...args} size="m">
        m — Medium (16px)
      </Heading>
      <Heading {...args} size="l">
        l — Large (18px)
      </Heading>
      <Heading {...args} size="xl">
        xl — Extra Large (20px)
      </Heading>
      <Heading {...args} size="2xl">
        2xl — 2X Large (24px)
      </Heading>
      <Heading {...args} size="3xl">
        3xl — 3X Large (30px)
      </Heading>
      <Heading {...args} size="4xl">
        4xl — 4X Large (36px)
      </Heading>
      <Heading {...args} size="5xl">
        5xl — 5X Large (48px)
      </Heading>
    </div>
  ),
};

export const AllThemes: Story = {
  args: {
    children: 'Тема',
    level: 2,
    size: '3xl',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading {...args} theme="primary">
        primary — Основной цвет
      </Heading>
      <Heading {...args} theme="muted">
        muted — Приглушённый цвет
      </Heading>
      <div style={{ background: 'var(--foreground)', padding: '16px' }}>
        <Heading {...args} theme="inverted">
          inverted — Инвертированный (белый)
        </Heading>
      </div>
      <Heading {...args} theme="error">
        error — Цвет ошибки
      </Heading>
      <Heading {...args} theme="gradient">
        gradient — Градиентный текст
      </Heading>
    </div>
  ),
};

export const AllAligns: Story = {
  args: {
    children: 'Выравнивание',
    level: 2,
    size: '3xl',
  },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading {...args} align="left">
        left — По левому краю (default)
      </Heading>
      <Heading {...args} align="center">
        center — По центру
      </Heading>
      <Heading {...args} align="right">
        right — По правому краю
      </Heading>
    </div>
  ),
};

export const GradientTheme: Story = {
  args: {
    level: 1,
    size: '5xl',
    theme: 'gradient',
    children: 'Градиентный заголовок',
  },
};

export const Accessibility: Story = {
  args: {
    level: 2,
    id: 'projects-section',
    'aria-label': 'Projects Section',
    size: '3xl',
    children: 'Мои проекты',
  },
};

export const HeroSection: Story = {
  args: {
    level: 1,
    size: '5xl',
    theme: 'gradient',
    align: 'center',
    children: 'Frontend Developer',
  },
};

export const SectionTitle: Story = {
  args: {
    level: 2,
    size: '3xl',
    theme: 'primary',
    children: 'Обо мне',
  },
};

export const SubsectionTitle: Story = {
  args: {
    level: 3,
    size: 'xl',
    theme: 'muted',
    children: 'Технические навыки',
  },
};

export const ErrorState: Story = {
  args: {
    level: 4,
    size: 'l',
    theme: 'error',
    children: 'Ошибка загрузки данных',
  },
};
