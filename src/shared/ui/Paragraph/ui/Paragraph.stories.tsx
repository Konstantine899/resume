import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type {
  ParagraphSize,
  ParagraphTheme,
  ParagraphWeight,
  ParagraphElement,
} from '../model/types';
import { Container } from '@/shared/ui/Container';
import { Section } from '@/shared/ui/Section';
import { Card } from '@/shared/ui/Card';
import { ModalContent } from '@/shared/ui/Modal';
import { Heading } from '@/shared/ui/Heading';
import { Paragraph } from './Paragraph';
import styles from './Paragraph.module.scss';

const SIZE_LABELS: Record<ParagraphSize, string> = {
  xs: '12px',
  s: '14px',
  m: '16px',
  l: '18px',
  xl: '20px',
  '2xl': '24px',
};

/**
 * ## Paragraph Component
 *
 * Компонент для основного текста с поддержкой тем, размеров, ограничения строк,
 * насыщенности шрифта, режимов переноса и смены HTML-тега.
 *
 * ### Особенности:
 * - Поддержка всех тем проекта (включая gradient)
 * - Ограничение количества строк (lineClamp)
 * - Однострочное обрезание (truncate)
 * - Различные размеры текста
 * - Насыщенность шрифта (weight)
 * - Режимы переноса (wrap)
 * - Смена HTML тега (as)
 * - Slot-рендеринг (asChild)
 * - Доступность (семантический тег `<p>`)
 *
 * ### Использование:
 * ```tsx
 * <Paragraph size="l" theme="muted">Текст абзаца</Paragraph>
 * <Paragraph lineClamp={3}>Длинный текст с ограничением</Paragraph>
 * <Paragraph as="span" weight="semibold">Текст в span</Paragraph>
 * <Paragraph truncate>Однострочное обрезание</Paragraph>
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
        <Paragraph key={size} size={size} data-testid={`paragraph-${size}`}>
          Размер: {size} - {SIZE_LABELS[size]}
        </Paragraph>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sizeClasses: Array<[string, string]> = [
      ['xs', styles.xs ?? ''],
      ['s', styles.s ?? ''],
      ['m', styles.m ?? ''],
      ['l', styles.l ?? ''],
      ['xl', styles.xl ?? ''],
      ['2xl', styles.size2Xl ?? ''],
    ];
    for (const [size, cls] of sizeClasses) {
      await expect(canvas.getByTestId(`paragraph-${size}`)).toHaveClass(cls);
    }
  },
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
          'tertiary',
          'gradient',
        ] as ParagraphTheme[]
      ).map((theme) => (
        <Paragraph key={theme} theme={theme} data-testid={`paragraph-${theme}`}>
          Тема: {theme}
        </Paragraph>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const themeClasses: Array<[string, string]> = [
      ['primary', styles.primary ?? ''],
      ['muted', styles.muted ?? ''],
      ['inverted', styles.inverted ?? ''],
      ['error', styles.error ?? ''],
      ['success', styles.success ?? ''],
      ['warning', styles.warning ?? ''],
      ['tertiary', styles.tertiary ?? ''],
      ['gradient', styles.gradient ?? ''],
    ];
    for (const [theme, cls] of themeClasses) {
      await expect(canvas.getByTestId(`paragraph-${theme}`)).toHaveClass(cls);
    }
  },
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

export const LineClamp4: Story = {
  args: {
    lineClamp: 4,
    children:
      'Это очень длинный текст для демонстрации ограничения строк. Он содержит много информации о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить количество видимых строк.',
  },
};

export const LineClamp5: Story = {
  args: {
    lineClamp: 5,
    children:
      'Это очень длинный текст для демонстрации ограничения строк. Он содержит много информации о проекте, технологиях, опыте работы и других деталях. Такой текст может занимать несколько строк и даже абзацев. В реальном использовании мы часто хотим ограничить количество видимых строк.',
  },
};

// ============================================
// HTML-теги (as prop)
// ============================================

/**
 * Рендеринг в разных HTML-тегах
 */
export const AllElements: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['p', 'span', 'div', 'label'] as ParagraphElement[]).map((tag) => (
        <Paragraph key={tag} as={tag}>
          Рендерится как {'<' + tag + '>'} — семантически правильный тег
        </Paragraph>
      ))}
    </div>
  ),
};

export const AsSpan: Story = {
  args: {
    as: 'span',
    children: 'Рендерится как span — для инлайн-текста без семантики абзаца',
  },
};

export const AsDiv: Story = {
  args: {
    as: 'div',
    children: 'Рендерится как div — для блочного контента',
  },
};

export const AsLabel: Story = {
  args: {
    as: 'label',
    children: 'Рендерится как label — для доступных форм',
  },
};

export const AsP: Story = {
  args: {
    as: 'p',
    children: 'Рендерится как p — семантический параграф (по умолчанию)',
  },
};

// ============================================
// Насыщенность шрифта (Weight)
// ============================================

/**
 * Все варианты насыщенности шрифта
 */
export const AllWeights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {(['light', 'normal', 'medium', 'semibold', 'bold'] as ParagraphWeight[]).map((weight) => (
        <Paragraph key={weight} weight={weight} size="l">
          {weight} — насыщенность шрифта
        </Paragraph>
      ))}
    </div>
  ),
};

export const WeightLight: Story = {
  args: {
    weight: 'light',
    children: 'Light (300) — тонкое начертание для декоративного текста',
  },
};

export const WeightNormal: Story = {
  args: {
    weight: 'normal',
    children: 'Normal (400) — стандартное начертание',
  },
};

export const WeightMedium: Story = {
  args: {
    weight: 'medium',
    children: 'Medium (500) — средняя насыщенность для акцентов',
  },
};

export const WeightSemibold: Story = {
  args: {
    weight: 'semibold',
    children: 'Semibold (600) — полужирное начертание для подзаголовков',
  },
};

export const WeightBold: Story = {
  args: {
    weight: 'bold',
    children: 'Bold (700) — жирное начертание для сильных акцентов',
  },
};

// ============================================
// Режимы переноса (Wrap)
// ============================================

/**
 * Все режимы переноса текста
 */
export const AllWraps: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <Paragraph wrap="wrap">
        <strong>wrap:</strong> Текст переносится по словам по умолчанию.
        Оченьдлинноесловокотороеможетразорватьстроку.
      </Paragraph>
      <Paragraph wrap="nowrap">
        <strong>nowrap:</strong> Текст не переносится на новую строку.
        Оченьдлинноесловокотороеможетразорватьстроку.
      </Paragraph>
      <Paragraph wrap="balance">
        <strong>balance:</strong> Браузер балансирует длину строк для красивого результата.
      </Paragraph>
      <Paragraph wrap="pretty">
        <strong>pretty:</strong> Браузер оптимизирует перенос, избегая «висячих» строк.
      </Paragraph>
    </div>
  ),
};

export const WrapWrap: Story = {
  args: {
    wrap: 'wrap',
    children: 'Wrap — стандартный перенос текста',
  },
};

export const WrapNowrap: Story = {
  args: {
    wrap: 'nowrap',
    children: 'Nowrap — текст не переносится, выходит за пределы контейнера если нужно',
  },
};

export const WrapBalance: Story = {
  args: {
    wrap: 'balance',
    children: 'Balance — браузер автоматически балансирует длину строк для равномерного вида',
  },
};

export const WrapPretty: Story = {
  args: {
    wrap: 'pretty',
    children: 'Pretty — браузер оптимизирует перенос, уменьшая количество коротких строк в конце',
  },
};

// ============================================
// Truncate (однострочное обрезание)
// ============================================

export const Truncate: Story = {
  args: {
    truncate: true,
    children:
      'Это очень длинный текст, который будет обрезан с многоточием после первой строки. Он содержит много информации о проекте, технологиях, опыте работы и других деталях.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Truncate обрезает текст после первой строки с добавлением многоточия. Не может быть использован одновременно с lineClamp.',
      },
    },
  },
};

// ============================================
// asChild (Slot-рендеринг)
// ============================================

export const AsChild: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Paragraph>Обычный параграф для сравнения:</Paragraph>
      <Paragraph asChild>
        <span>
          Этот текст рендерится как <strong>span</strong> через Slot — стили Paragraph применяются,
          но DOM-узел — оригинальный дочерний элемент.
        </span>
      </Paragraph>
    </div>
  ),
};

export const AsChildWithButton: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Paragraph>Стилизованный button через asChild:</Paragraph>
      <Paragraph asChild>
        <button
          style={{
            padding: '8px 16px',
            border: '2px solid var(--primary)',
            borderRadius: '8px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Текст кнопки со стилями Paragraph
        </button>
      </Paragraph>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await expect(button).toHaveClass(styles.paragraph ?? '');
    await expect(button).toHaveTextContent('Текст кнопки со стилями Paragraph');
  },
};

export const AsChildWithDiv: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Paragraph>Обычный параграф для сравнения:</Paragraph>
      <Paragraph asChild>
        <div>
          Этот текст рендерится как <strong>div</strong> через Slot — стили Paragraph применяются к
          блочному элементу.
        </div>
      </Paragraph>
    </div>
  ),
};

// ============================================
// Комбинации
// ============================================

export const WeightAndElement: Story = {
  args: {
    as: 'span',
    weight: 'semibold',
    children: 'Semibold span — для акцентного инлайн-текста',
  },
};

/**
 * lineClamp — ограничение количества строк.
 * truncate и lineClamp взаимоисключающие на уровне типов (PAR-03),
 * поэтому story демонстрирует только lineClamp.
 */
export const LineClamp3Only: Story = {
  render: () => (
    <Paragraph lineClamp={3} data-testid="paragraph-line-clamp-3">
      Этот текст ограничен lineClamp=3 — после третьей строки появится многоточие. В dev-режиме
      предупреждения не будет, так как truncate не передан.
    </Paragraph>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'lineClamp ограничивает текст тремя строками с многоточием. Одновременная передача truncate и lineClamp запрещена на уровне типов (PAR-03).',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('paragraph-line-clamp-3');
    await expect(el).toHaveClass(styles.lineClamp3 ?? '');
    await expect(el).not.toHaveClass(styles.truncate ?? '');
  },
};

export const WrapAndTruncate: Story = {
  args: {
    wrap: 'nowrap',
    truncate: true,
    children:
      'Очень длинный текст с nowrap и truncate — он не переносится и обрезается многоточием. Подходит для однострочных заголовков и меток.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('Paragraph');
    await expect(el).toHaveClass(styles.nowrap ?? '');
    await expect(el).toHaveClass(styles.truncate ?? '');
    await expect(el).not.toHaveClass(styles.balance ?? '');
  },
};
export const TruncateOnSpan: Story = {
  args: {
    as: 'span',
    truncate: true,
    'data-testid': 'paragraph-truncate-span',
    children:
      'Очень длинный текст внутри span с однострочным обрезанием. Он будет обрезан многоточием после первой строки независимо от длины.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('paragraph-truncate-span');
    await expect(el.tagName).toBe('SPAN');
    await expect(el).toHaveClass(styles.truncate ?? '');
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
    'data-testid': 'gradient-quote',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('gradient-quote');
    await expect(el).toHaveClass(styles.gradient ?? '');
    expect(getComputedStyle(el).backgroundImage).toContain('linear-gradient');
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
    weight: 'medium',
    wrap: 'balance',
    lineClamp: 3,
    children:
      'Это пример параграфа со всеми возможными пропсами: большой размер, основная тема, центрированное выравнивание, средняя насыщенность, сбалансированный перенос и ограничение в 3 строки.',
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

// ============================================
// Композиция (Paragraph внутри других компонентов)
// ============================================

/**
 * Paragraph внутри Container — контейнер ограничивает ширину, Paragraph типизирует текст
 */
export const ParagraphInContainer: Story = {
  render: () => (
    <Container size="md" data-testid="paragraph-container">
      <Paragraph size="m">
        Paragraph внутри Container — контейнер ограничивает ширину и центрирует контент, а
        типографика остаётся за Paragraph.
      </Paragraph>
      <Paragraph size="s" theme="muted">
        Второстепенный текст в том же контейнере — размер s и muted-тема.
      </Paragraph>
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('paragraph-container');
    await expect(container).toBeInTheDocument();
    await expect(container).toHaveAttribute('data-size', 'md');
    await expect(canvas.getByText(/Paragraph внутри Container/)).toBeInTheDocument();
    await expect(canvas.getByText(/Второстепенный текст/)).toBeInTheDocument();
  },
};

/**
 * Paragraph внутри Section — семантическая секция с вертикальными отступами
 */
export const ParagraphInSection: Story = {
  render: () => (
    <Section data-testid="paragraph-section">
      <Heading level={2} size="l">
        Section Title
      </Heading>
      <Paragraph size="m">
        Paragraph внутри Section — секция добавляет вертикальные отступы, заголовок и текст
        сохраняют свою типографику.
      </Paragraph>
    </Section>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('paragraph-section')).toBeInTheDocument();
    await expect(canvas.getByText('Section Title')).toBeInTheDocument();
    await expect(canvas.getByText(/Paragraph внутри Section/)).toBeInTheDocument();
  },
};

/**
 * Paragraph в Card — Card.Description рендерится через Paragraph (size="s" theme="muted"),
 * Card.Meta — через Paragraph (size="xs" theme="tertiary") (PAR-11/12)
 */
export const ParagraphInCard: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Card data-testid="paragraph-card">
        <Card.Title>Card with Paragraph typography</Card.Title>
        <Card.Description>
          Card.Description рендерится через Paragraph (size="s", theme="muted") — PAR-11.
        </Card.Description>
        <Card.Meta>March 2026 · 5 min read</Card.Meta>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('paragraph-card')).toBeInTheDocument();
    const description = canvas.getByText(/Card.Description рендерится через Paragraph/);
    await expect(description.tagName).toBe('P');
    await expect(description).toHaveAttribute('data-size', 's');
    await expect(description).toHaveAttribute('data-theme', 'muted');
    await expect(canvas.getByText('March 2026 · 5 min read')).toBeInTheDocument();
  },
};

/**
 * Paragraph в Modal — body-текст модального окна рендерится через Paragraph
 * (паттерн "Modal body text uses Paragraph", PAR-13)
 */
export const ParagraphInModal: Story = {
  render: () => (
    <ModalContent>
      <Paragraph>Body text inside ModalContent renders via the shared Paragraph.</Paragraph>
      <Paragraph theme="muted">Secondary body text keeps typography consistent.</Paragraph>
    </ModalContent>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Body text inside ModalContent renders via the shared Paragraph.')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Secondary body text keeps typography consistent.')
    ).toBeInTheDocument();
  },
};

// ============================================
// Showcase stories
// ============================================

/**
 * Полная типографическая шкала: Heading 3xl–5xl + Paragraph xs–2xl
 */
export const FullPageTypography: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <Heading level={1} size="5xl">
        Display — 5xl
      </Heading>
      <Heading level={2} size="4xl">
        Page Title — 4xl
      </Heading>
      <Heading level={3} size="3xl">
        Section Title — 3xl
      </Heading>
      <Paragraph size="xl">Paragraph xl — 20px, для акцентного текста.</Paragraph>
      <Paragraph size="l">Paragraph l — 18px, для основного контента.</Paragraph>
      <Paragraph size="m">Paragraph m — 16px, основной текст по умолчанию.</Paragraph>
      <Paragraph size="s">Paragraph s — 14px, для второстепенного текста.</Paragraph>
      <Paragraph size="xs">Paragraph xs — 12px, для подписей и мета-информации.</Paragraph>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Display — 5xl')).toBeInTheDocument();
    await expect(canvas.getByText('Page Title — 4xl')).toBeInTheDocument();
    await expect(canvas.getByText('Section Title — 3xl')).toBeInTheDocument();
    await expect(canvas.getByText(/Paragraph xl/)).toBeInTheDocument();
    await expect(canvas.getByText(/Paragraph xs/)).toBeInTheDocument();
  },
};

/**
 * Сравнение режимов переноса: wrap / nowrap / balance / pretty
 */
export const WrapModesComparison: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <Paragraph wrap="wrap" data-testid="wrap-wrap">
        wrap: текст переносится по словам по умолчанию.
        Оченьдлинноесловокотороеможетразорватьстроку.
      </Paragraph>
      <Paragraph wrap="nowrap" data-testid="wrap-nowrap">
        nowrap: текст не переносится на новую строку. Оченьдлинноесловокотороеможетразорватьстроку.
      </Paragraph>
      <Paragraph wrap="balance" data-testid="wrap-balance">
        balance: браузер балансирует длину строк для красивого результата.
      </Paragraph>
      <Paragraph wrap="pretty" data-testid="wrap-pretty">
        pretty: браузер оптимизирует перенос, избегая «висячих» строк.
      </Paragraph>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('wrap-wrap')).toHaveClass(styles.wrap ?? '');
    await expect(canvas.getByTestId('wrap-nowrap')).toHaveClass(styles.nowrap ?? '');
    await expect(canvas.getByTestId('wrap-balance')).toHaveClass(styles.balance ?? '');
    await expect(canvas.getByTestId('wrap-pretty')).toHaveClass(styles.pretty ?? '');
  },
};

/**
 * Градиентная тема — акцентный градиентный текст в разных размерах
 */
export const GradientTheme: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
      <Paragraph theme="gradient" size="xl" align="center" data-testid="gradient-accent">
        Gradient accent — крупный акцентный текст
      </Paragraph>
      <Paragraph theme="gradient" size="m" data-testid="gradient-body">
        Gradient body — градиентный текст среднего размера для менее броских акцентов.
      </Paragraph>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const accent = canvas.getByTestId('gradient-accent');
    const body = canvas.getByTestId('gradient-body');
    await expect(accent).toHaveClass(styles.gradient ?? '');
    await expect(body).toHaveClass(styles.gradient ?? '');
    expect(getComputedStyle(accent).backgroundImage).toContain('linear-gradient');
  },
};

// ============================================
// Edge cases
// ============================================

/**
 * Пустые children — Paragraph рендерится без ошибок
 */
export const EmptyChildren: Story = {
  render: () => <Paragraph data-testid="paragraph-empty" children="" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('paragraph-empty');
    await expect(el).toBeInTheDocument();
    await expect(el.tagName).toBe('P');
  },
};

/**
 * Конфликт as + asChild — asChild приоритетнее: рендерится дочерний элемент,
 * `as` игнорируется, ошибки не возникает
 */
export const AsWithAsChildConflict: Story = {
  render: () => (
    <Paragraph as="span" asChild data-testid="paragraph-conflict">
      <span>asChild wins over as — дочерний элемент рендерится со стилями Paragraph.</span>
    </Paragraph>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('paragraph-conflict');
    await expect(el).toBeInTheDocument();
    await expect(el.tagName).toBe('SPAN');
    await expect(el).toHaveClass(styles.paragraph ?? '');
  },
};

/**
 * Длинное неразрывное слово с wrap="nowrap" — текст не переносится и не ломает разметку
 */
export const LongUnbrokenString: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Paragraph wrap="nowrap" data-testid="paragraph-long-nowrap">
        Supercalifragilisticexpialidociousantidisestablishmentarianismfloccinaucinihilipilification
      </Paragraph>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const el = canvas.getByTestId('paragraph-long-nowrap');
    await expect(el).toBeInTheDocument();
    await expect(el).toHaveClass(styles.nowrap ?? '');
  },
};
