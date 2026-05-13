import { type Meta, type StoryObj } from '@storybook/react-vite';
import type { ParagraphSize, ParagraphTheme } from '../model/types';
import { Paragraph } from './Paragraph';

/**
 * ## Paragraph Component
 *
 * Компонент для основного текста с поддержкой тем, размеров и ограничения строк.
 *
 * ### Особенности:
 * - Поддержка всех тем проекта (включая gradient)
 * - Ограничение количества строк (lineClamp)
 * - Различные размеры текста
 * - Доступность (семантический тег `<p>`)
 *
 * ### Использование:
 * ```tsx
 * <Paragraph size="l" theme="muted">Текст абзаца</Paragraph>
 * <Paragraph lineClamp={3}>Длинный текст с ограничением</Paragraph>
 * ```
 */
const meta: Meta<typeof Paragraph> = {
  title: 'shared/Paragraph',
  component: Paragraph,
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
        component: 'Компонент для основного текста с поддержкой тем, размеров и ограничения строк',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Paragraph>;

// ============================================
// Базовые примеры
// ============================================

/**
 * Параграф по умолчанию (size=m, theme=primary, align=left)
 */
export const Default: Story = {
  args: {
    children:
      'Это текст параграфа по умолчанию. Используется размер medium, основная тема и выравнивание по левому краю.',
  },
};

/**
 * Параграф с форматированным текстом (JSX дети)
 */
export const WithFormatting: Story = {
  args: {
    children: (
      <>
        Я специализируюсь на <strong>React</strong> и <strong>Node.js</strong>, создавая{' '}
        <em>масштабируемые приложения</em> с отличной <code>производительностью</code>.
      </>
    ),
  },
};

/**
 * Параграф с ссылками
 */
export const WithLinks: Story = {
  args: {
    children: (
      <>
        Посетите мой{' '}
        <a href="https://github.com" style={{ color: 'var(--link-primary)' }}>
          GitHub
        </a>{' '}
        или свяжитесь со мной через{' '}
        <a href="mailto:email@example.com" style={{ color: 'var(--link-primary)' }}>
          email
        </a>
        .
      </>
    ),
  },
};

// ============================================
// Размеры (Sizes)
// ============================================

/**
 * Все доступные размеры текста
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['xs', 's', 'm', 'l', 'xl', '2xl'] as ParagraphSize[]).map((size) => (
        <Paragraph key={size} size={size}>
          Размер: {size} -{' '}
          {size === 'xs'
            ? '12px'
            : size === 's'
              ? '14px'
              : size === 'm'
                ? '16px'
                : size === 'l'
                  ? '18px'
                  : size === 'xl'
                    ? '20px'
                    : '24px'}
        </Paragraph>
      ))}
    </div>
  ),
};

export const SizeXS: Story = {
  args: {
    size: 'xs',
    children: 'Extra Small (12px) - для подписей и мета-информации',
  },
};

export const SizeS: Story = {
  args: {
    size: 's',
    children: 'Small (14px) - для второстепенного текста',
  },
};

export const SizeM: Story = {
  args: {
    size: 'm',
    children: 'Medium (16px) - основной текст по умолчанию',
  },
};

export const SizeL: Story = {
  args: {
    size: 'l',
    children: 'Large (18px) - для основного контента',
  },
};

export const SizeXL: Story = {
  args: {
    size: 'xl',
    children: 'Extra Large (20px) - для акцентного текста',
  },
};

export const Size2XL: Story = {
  args: {
    size: '2xl',
    children: '2XL (24px) - для крупных цитат и выделений',
  },
};

// ============================================
// Темы (Themes)
// ============================================

/**
 * Все доступные темы текста
 */
export const AllThemes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(
        [
          'primary',
          'muted',
          'inverted',
          'error',
          'success',
          'warning',
          'gradient',
        ] as ParagraphTheme[]
      ).map((theme) => (
        <Paragraph key={theme} theme={theme}>
          Тема: {theme}
        </Paragraph>
      ))}
    </div>
  ),
};

export const ThemePrimary: Story = {
  args: {
    theme: 'primary',
    children: 'Primary Theme - основной текст контента',
  },
};

export const ThemeMuted: Story = {
  args: {
    theme: 'muted',
    children: 'Muted Theme - второстепенный текст (даты, подписи, мета-информация)',
  },
};

export const ThemeInverted: Story = {
  args: {
    theme: 'inverted',
    children: 'Inverted Theme - белый текст на тёмном фоне',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const ThemeError: Story = {
  args: {
    theme: 'error',
    children: 'Error Theme - сообщения об ошибках',
  },
};

export const ThemeSuccess: Story = {
  args: {
    theme: 'success',
    children: 'Success Theme - сообщения об успехе',
  },
};

export const ThemeWarning: Story = {
  args: {
    theme: 'warning',
    children: 'Warning Theme - предупреждения',
  },
};

export const ThemeGradient: Story = {
  args: {
    theme: 'gradient',
    children: 'Gradient Theme - градиентный текст для акцентов',
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
      <Paragraph align="left">
        Left Align - выравнивание по левому краю (по умолчанию). Подходит для основного контента.
      </Paragraph>
      <Paragraph align="center">
        Center Align - центрированный текст. Подходит для заголовков, цитат, CTA.
      </Paragraph>
      <Paragraph align="right">
        Right Align - выравнивание по правому краю. Подходит для дат, подписей, мета-информации.
      </Paragraph>
    </div>
  ),
};

export const AlignLeft: Story = {
  args: {
    align: 'left',
    children: 'Left Aligned Text',
  },
};

export const AlignCenter: Story = {
  args: {
    align: 'center',
    children: 'Center Aligned Text',
  },
};

export const AlignRight: Story = {
  args: {
    align: 'right',
    children: 'Right Aligned Text',
  },
};

// ============================================
// Line Clamp (ограничение строк)
// ============================================

/**
 * Все варианты lineClamp
 */
export const AllLineClamps: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
          Без ограничения:
        </p>
        <Paragraph>
          Это очень длинный текст, который продолжается и продолжается. Он содержит много информации
          о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать
          несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить
          количество видимых строк.
        </Paragraph>
      </div>

      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
          lineClamp={'{2}'}:
        </p>
        <Paragraph lineClamp={2}>
          Это очень длинный текст, который продолжается и продолжается. Он содержит много информации
          о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать
          несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить
          количество видимых строк.
        </Paragraph>
      </div>

      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
          lineClamp={'{3}'}:
        </p>
        <Paragraph lineClamp={3}>
          Это очень длинный текст, который продолжается и продолжается. Он содержит много информации
          о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать
          несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить
          количество видимых строк.
        </Paragraph>
      </div>

      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
          lineClamp={'{4}'}:
        </p>
        <Paragraph lineClamp={4}>
          Это очень длинный текст, который продолжается и продолжается. Он содержит много информации
          о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать
          несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить
          количество видимых строк.
        </Paragraph>
      </div>

      <div>
        <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
          lineClamp={'{5}'}:
        </p>
        <Paragraph lineClamp={5}>
          Это очень длинный текст, который продолжается и продолжается. Он содержит много информации
          о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать
          несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить
          количество видимых строк.
        </Paragraph>
      </div>
    </div>
  ),
};

export const LineClamp2: Story = {
  args: {
    lineClamp: 2,
    children:
      'Это очень длинный текст для демонстрации ограничения строк. Он содержит много информации о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить количество видимых строк.',
  },
};

export const LineClamp3: Story = {
  args: {
    lineClamp: 3,
    children:
      'Это очень длинный текст для демонстрации ограничения строк. Он содержит много информации о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить количество видимых строк.',
  },
};

// ============================================
// Продвинутые примеры
// ============================================

/**
 * Типичное использование в карточке проекта
 */
export const InProjectCard: Story = {
  render: () => (
    <article
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '400px',
      }}
    >
      <h3 style={{ margin: '0 0 12px', color: 'var(--foreground)' }}>Название проекта</h3>
      <Paragraph size="m" theme="muted" lineClamp={3}>
        Полное описание проекта с деталями реализации, использованными технологиями и ключевыми
        особенностями. Этот текст будет обрезан после трёх строк с добавлением многоточия.
      </Paragraph>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <span
          style={{
            padding: '4px 8px',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          React
        </span>
        <span
          style={{
            padding: '4px 8px',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          TypeScript
        </span>
      </div>
    </article>
  ),
};

/**
 * Сообщение об успехе
 */
export const SuccessMessage: Story = {
  args: {
    theme: 'success',
    size: 'l',
    children: '✅ Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.',
  },
};

/**
 * Сообщение об ошибке
 */
export const ErrorMessage: Story = {
  args: {
    theme: 'error',
    size: 'l',
    children: '❌ Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.',
  },
};

/**
 * Предупреждение
 */
export const WarningMessage: Story = {
  args: {
    theme: 'warning',
    size: 'l',
    children: '⚠️ Внимание: Некоторые данные могут быть недоступны в демо-режиме.',
  },
};

/**
 * Цитата с градиентом
 */
export const GradientQuote: Story = {
  args: {
    theme: 'gradient',
    size: 'xl',
    align: 'center',
    children: '"Код — это поэзия, которую пишут разработчики"',
  },
};

/**
 * Комбинация всех пропсов
 */
export const AllPropsCombined: Story = {
  args: {
    size: 'l',
    theme: 'primary',
    align: 'center',
    lineClamp: 3,
    children:
      'Это пример параграфа со всеми возможными пропсами: большой размер, основная тема, центрированное выравнивание и ограничение в 3 строки. Такой подход позволяет гибко настраивать отображение текста.',
  },
};

/**
 * Тёмная тема (демонстрация работы с темами)
 */
export const DarkTheme: Story = {
  args: {
    children: 'Текст в тёмной теме. Переключите тему в Storybook для проверки работы светлой темы.',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
