import type { Meta, StoryObj } from '@storybook/react-vite';
import type { HeadingSize, HeadingTheme } from '../model/types';
import { Heading } from './Heading';

/**
 * ## Heading Component
 *
 * Семантический компонент заголовков (h1-h6) с раздельным управлением размером и уровнем.
 *
 * ### Особенности:
 * - Семантическая правильность (уровень заголовка ≠ визуальный размер)
 * - Поддержка всех тем проекта
 * - Градиентные заголовки
 * - Доступность (правильные h1-h6 теги)
 *
 * ### Использование:
 * ```tsx
 * <Heading level={1} size="5xl" theme="gradient">Заголовок</Heading>
 * ```
 */
const meta: Meta<typeof Heading> = {
  title: 'shared/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#292726',
        },
        {
          name: 'light',
          value: '#f5f3f0',
        },
      ],
    },
    docs: {
      description: {
        component: 'Семантический компонент заголовков с поддержкой тем, размеров и выравнивания',
      },
      story: {
        inline: true,
      },
    },
    // Автоматическое обновление фона при смене темы
    chromatic: { disableSnapshot: false },
  },
  decorators: [
    (Story) => (
      <div
        style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    level: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 5, 6],
      description: 'Уровень заголовка (h1-h6)',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'],
      description: 'Визуальный размер',
    },
    theme: {
      control: { type: 'select' },
      options: ['primary', 'muted', 'inverted', 'error', 'gradient'],
      description: 'Цветовая тема',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right'],
      description: 'Выравнивание текста',
    },
    children: {
      control: { type: 'text' },
      description: 'Содержимое заголовка',
    },
    className: {
      control: { type: 'text' },
      description: 'Дополнительные CSS классы',
    },
    'data-testid': {
      control: { type: 'text' },
      description: 'Data-testid для тестов',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Heading>;

// ============================================
// Базовые примеры (Levels)
// ============================================

/**
 * Заголовок уровня h1 - основной заголовок страницы
 */
export const H1: Story = {
  args: {
    level: 1,
    children: 'Заголовок первого уровня (h1)',
  },
};

/**
 * Заголовок уровня h2 - заголовок секции
 */
export const H2: Story = {
  args: {
    level: 2,
    children: 'Заголовок второго уровня (h2)',
  },
};

/**
 * Заголовок уровня h3 - подзаголовок
 */
export const H3: Story = {
  args: {
    level: 3,
    children: 'Заголовок третьего уровня (h3)',
  },
};

/**
 * Заголовок уровня h4 - малый заголовок
 */
export const H4: Story = {
  args: {
    level: 4,
    children: 'Заголовок четвертого уровня (h4)',
  },
};

/**
 * Заголовок уровня h5 - минимальный заголовок
 */
export const H5: Story = {
  args: {
    level: 5,
    children: 'Заголовок пятого уровня (h5)',
  },
};

/**
 * Заголовок уровня h6 - самый маленький заголовок
 */
export const H6: Story = {
  args: {
    level: 6,
    children: 'Заголовок шестого уровня (h6)',
  },
};

// ============================================
// Размеры (Sizes)
// ============================================

/**
 * Все доступные размеры заголовков
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl'] as HeadingSize[]).map((size) => (
        <Heading key={size} level={2} size={size}>
          Размер: {size}
        </Heading>
      ))}
    </div>
  ),
};

export const SizeXS: Story = {
  args: {
    level: 3,
    size: 'xs',
    children: 'Extra Small (12px)',
  },
};

export const SizeS: Story = {
  args: {
    level: 3,
    size: 's',
    children: 'Small (14px)',
  },
};

export const SizeM: Story = {
  args: {
    level: 2,
    size: 'm',
    children: 'Medium (16px) - Default',
  },
};

export const SizeL: Story = {
  args: {
    level: 2,
    size: 'l',
    children: 'Large (18px)',
  },
};

export const SizeXL: Story = {
  args: {
    level: 2,
    size: 'xl',
    children: 'Extra Large (20px)',
  },
};

export const Size2XL: Story = {
  args: {
    level: 2,
    size: '2xl',
    children: '2XL (24px)',
  },
};

export const Size3XL: Story = {
  args: {
    level: 1,
    size: '3xl',
    children: '3XL (30px)',
  },
};

export const Size4XL: Story = {
  args: {
    level: 1,
    size: '4xl',
    children: '4XL (36px)',
  },
};

export const Size5XL: Story = {
  args: {
    level: 1,
    size: '5xl',
    children: '5XL (48px)',
  },
};

// ============================================
// Темы (Themes)
// ============================================

/**
 * Все доступные темы заголовков
 */
export const AllThemes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['primary', 'muted', 'inverted', 'error', 'gradient'] as HeadingTheme[]).map((theme) => (
        <Heading key={theme} level={2} size="l" theme={theme}>
          Тема: {theme}
        </Heading>
      ))}
    </div>
  ),
};

export const ThemePrimary: Story = {
  args: {
    level: 2,
    theme: 'primary',
    children: 'Primary Theme (основной текст)',
  },
};

export const ThemeMuted: Story = {
  args: {
    level: 2,
    theme: 'muted',
    children: 'Muted Theme (второстепенный текст)',
  },
};

export const ThemeInverted: Story = {
  args: {
    level: 2,
    theme: 'inverted',
    children: 'Inverted Theme (белый на тёмном)',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const ThemeError: Story = {
  args: {
    level: 2,
    theme: 'error',
    children: 'Error Theme (сообщение об ошибке)',
  },
};

export const ThemeGradient: Story = {
  args: {
    level: 1,
    size: '4xl',
    theme: 'gradient',
    children: 'Gradient Theme (градиентный текст)',
  },
};

// ============================================
// Выравнивание (Alignment)
// ============================================

/**
 * Все варианты выравнивания
 */
export const AllAlignments: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Heading level={2} size="l" align="left">
        Left Align (по умолчанию)
      </Heading>
      <Heading level={2} size="l" align="center">
        Center Align
      </Heading>
      <Heading level={2} size="l" align="right">
        Right Align
      </Heading>
    </div>
  ),
};

export const AlignLeft: Story = {
  args: {
    level: 2,
    align: 'left',
    children: 'Left Aligned Text',
  },
};

export const AlignCenter: Story = {
  args: {
    level: 2,
    align: 'center',
    children: 'Center Aligned Text',
  },
};

export const AlignRight: Story = {
  args: {
    level: 2,
    align: 'right',
    children: 'Right Aligned Text',
  },
};

// ============================================
// Продвинутые примеры
// ============================================

/**
 * Заголовок с JSX детьми (перенос строки, форматирование)
 */
export const WithJSXChildren: Story = {
  args: {
    level: 1,
    size: '5xl',
    theme: 'gradient',
    children: (
      <>
        Привет, я <br />
        Максим Дэйтон
      </>
    ),
  },
};

/**
 * Разделение уровня и размера (семантический h1, визуально маленький)
 */
export const SemanticVsVisual: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Heading level={1} size="s">
        h1 с маленьким размером (SEO-правильно)
      </Heading>
      <Heading level={3} size="5xl">
        h3 с большим размером (визуально большой)
      </Heading>
    </div>
  ),
};

/**
 * Заголовок в карточке (typical use case)
 */
export const InCard: Story = {
  render: () => (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
      }}
    >
      <Heading level={3} size="xl" theme="primary">
        Название проекта
      </Heading>
      <p style={{ color: 'var(--foreground-muted)', marginTop: '8px' }}>Краткое описание проекта</p>
    </div>
  ),
};

/**
 * Иерархия заголовков (правильная структура)
 */
export const HeadingHierarchy: Story = {
  render: () => (
    <article style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading level={1} size="5xl" theme="gradient">
        Главная страница
      </Heading>

      <section>
        <Heading level={2} size="3xl">
          Секция 1
        </Heading>
        <Heading level={3} size="xl" theme="muted">
          Подсекция 1.1
        </Heading>
      </section>

      <section>
        <Heading level={2} size="3xl">
          Секция 2
        </Heading>
        <Heading level={3} size="xl" theme="muted">
          Подсекция 2.1
        </Heading>
        <Heading level={4} size="l">
          Под-подсекция 2.1.1
        </Heading>
      </section>
    </article>
  ),
};

/**
 * С дополнительным className
 */
export const WithCustomClass: Story = {
  args: {
    level: 2,
    size: 'xl',
    children: 'Заголовок с кастомными стилями',
    className: 'custom-heading',
  },
};
