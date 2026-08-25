// src/shared/ui/Spinner/ui/Spinner.stories.tsx

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Button } from '@/shared/ui/Button';
import { Spinner } from './Spinner';

const meta = {
  title: 'Shared/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Spinner** — компонент вращающегося индикатора загрузки.

## Варианты:
- **spinner** (default) — классическое крутящееся кольцо
- **double-ring** — два вращающихся кольца (внешнее по часовой, внутреннее против)

## Размеры:
- **xs** (12px), **sm** (24px), **md** (32px), **lg** (48px), **xl** (64px), **xxl** (96px)
- **числовой** — произвольный размер в пикселях (\`size={48}\` → \`--spinner-size: 48px\`)

## Цвета:
- **primary** (основной), **secondary** (вторичный), **accent** (акцентный), **orange** (оранжевый)

## Кастомизация:
- **speed** — slow / normal / fast (канонический проп)
- **thickness** — thin / normal / thick (канонический проп)
- **trackColor** — цвет фоновой части кольца
- **delay** — задержка появления в мс (пока таймер не сработал, компонент ничего не рендерит)
- **animationDuration** — алиас \`speed\` → \`--spinner-speed\`
- **borderWidth** — алиас \`thickness\` → \`--spinner-thickness\`

## Accessibility:
- \`role="status"\` — объявляет состояние загрузки скринридерам
- \`aria-busy="true"\` — указывает на активный процесс
- \`aria-label\` — текстовое описание
- \`prefers-reduced-motion\` — автоматическое отключение анимации
        `,
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['spinner', 'double-ring'],
      description: 'Вариант спиннера',
    },
    size: {
      control: 'radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
      description: 'Размер спиннера — пресет или число пикселей (size={48})',
    },
    color: {
      control: 'radio',
      options: ['primary', 'secondary', 'accent', 'orange'],
      description: 'Цвет спиннера',
    },
    speed: {
      control: 'radio',
      options: ['slow', 'normal', 'fast'],
      description: 'Скорость анимации (канонический проп)',
    },
    thickness: {
      control: 'radio',
      options: ['thin', 'normal', 'thick'],
      description: 'Толщина линии (канонический проп)',
    },
    trackColor: {
      control: 'color',
      description: 'Цвет трека (фоновой части кольца)',
    },
    label: {
      control: 'text',
      description: 'Текст для screen readers',
    },
    delay: {
      control: 'number',
      description: 'Задержка появления в мс (AntD semantics)',
    },
    animationDuration: {
      control: 'radio',
      options: ['slow', 'normal', 'fast'],
      description: 'Алиас speed → --spinner-speed (канонический speed побеждает)',
    },
    borderWidth: {
      control: 'radio',
      options: ['thin', 'normal', 'thick'],
      description: 'Алиас thickness → --spinner-thickness (канонический thickness побеждает)',
    },
  },
  args: {
    variant: 'spinner',
    size: 'md',
    color: 'primary',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: 'var(--background)',
          padding: '24px',
          borderRadius: '12px',
          minWidth: '200px',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

// ============================================
// Play Helper — asserts a11y contract + data attrs
// ============================================

function assertSpinnerAttrs(canvasElement: HTMLElement, expected: Record<string, string>) {
  const spinner = canvasElement.querySelector('[role="status"]');
  expect(spinner).toBeInTheDocument();
  expect(spinner?.getAttribute('aria-busy')).toBe('true');
  Object.entries(expected).forEach(([attr, value]) => {
    expect(spinner?.getAttribute(attr)).toBe(value);
  });
}

// ============================================
// Basic Variants
// ============================================

export const SingleSpinner: Story = {
  args: { variant: 'spinner', size: 'md', color: 'primary' },
  parameters: {
    docs: {
      description: {
        story: 'Классический крутящийся индикатор. Используется в Button, Input, Textarea, Image.',
      },
    },
  },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'primary',
    });
  },
};

export const DoubleRing: Story = {
  args: { variant: 'double-ring', size: 'md', color: 'primary' },
  parameters: {
    docs: {
      description: {
        story:
          'Два вращающихся кольца — внешний по часовой стрелке, внутренний против. ' +
          'Подходит для Avatar, Hero и крупных зон загрузки.',
      },
    },
  },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'double-ring',
      'data-size': 'md',
      'data-color': 'primary',
    });
    const canvas = within(canvasElement);
    const spinner = canvas.getByRole('status');
    expect(spinner.querySelector('[class*="outerRing"]')).toBeTruthy();
    expect(spinner.querySelector('[class*="innerRing"]')).toBeTruthy();
  },
};

// ============================================
// Colors
// ============================================

export const Primary: Story = {
  args: { color: 'primary' },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'primary',
    });
  },
};

export const Secondary: Story = {
  args: { color: 'secondary' },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'secondary',
    });
  },
};

export const Accent: Story = {
  args: { color: 'accent' },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'accent',
    });
  },
};

export const Orange: Story = {
  args: { color: 'orange' },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'orange',
    });
  },
};

// ============================================
// Customization (single-instance demos)
// ============================================

export const SlowSpeed: Story = {
  args: { speed: 'slow' },
  parameters: {
    docs: {
      description: {
        story:
          'Одиночный демо-инстанс с speed="slow" (1.2s). Сравнение трёх скоростей доступно в Controls.',
      },
    },
  },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'primary',
      'data-speed': 'slow',
    });
  },
};

export const InlineWithText: Story = {
  args: { size: 'sm' },
  parameters: {
    docs: {
      description: {
        story: 'Инлайн-спиннер рядом с текстом — компактный size="sm".',
      },
    },
  },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'sm',
      'data-color': 'primary',
    });
  },
};

export const FullScreen: Story = {
  args: { size: 'lg' },
  parameters: {
    docs: {
      description: {
        story: 'Крупный спиннер для полноэкранной зоны загрузки (size="lg").',
      },
    },
  },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'lg',
      'data-color': 'primary',
    });
  },
};

export const AvatarLoading: Story = {
  args: { variant: 'double-ring', size: 'lg', label: 'Loading avatar' },
  parameters: {
    docs: {
      description: {
        story:
          'Использование Spinner в Avatar компонентах. Double-ring variant с primary цветом для консистентности с дизайном.',
      },
    },
  },
  play: ({ canvasElement }) => {
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'double-ring',
      'data-size': 'lg',
      'data-color': 'primary',
    });
    expect(canvasElement.querySelector('[role="status"]')?.getAttribute('aria-label')).toBe(
      'Loading avatar'
    );
  },
};

// ============================================
// Reduced Motion Demo (DOM-only play)
// ============================================

export const ReducedMotion: Story = {
  args: { variant: 'spinner', size: 'md', color: 'primary' },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility — при `prefers-reduced-motion` в ОС все анимации отключаются.',
      },
    },
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  play: ({ canvasElement }) => {
    // Статический DOM-контракт: motion проверяется source-guard'ом в unit-тестах (SPR-04)
    assertSpinnerAttrs(canvasElement, {
      'data-variant': 'spinner',
      'data-size': 'md',
      'data-color': 'primary',
    });
  },
};

// ============================================
// All Variants Comparison
// ============================================

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="spinner" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Spinner
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="double-ring" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Double Ring
        </p>
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const variants = Array.from(canvasElement.querySelectorAll('[role="status"]')).map((s) =>
      s.getAttribute('data-variant')
    );
    expect(variants).toEqual(['spinner', 'double-ring']);
  },
};

// ============================================
// All Sizes Comparison
// ============================================

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const).map((s) => (
        <div
          key={s}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}
        >
          <span style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
            {s.toUpperCase()}
          </span>
          <Spinner size={s} color="primary" />
        </div>
      ))}
    </div>
  ),
  play: ({ canvasElement }) => {
    const sizes = Array.from(canvasElement.querySelectorAll('[role="status"]')).map((s) =>
      s.getAttribute('data-size')
    );
    expect(sizes).toEqual(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']);
  },
};

// ============================================
// Theme Comparison
// ============================================

export const ThemeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div
        data-theme="light"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          minWidth: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Spinner color="primary" />
      </div>
      <div
        data-theme="dark"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          minWidth: '200px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Spinner color="primary" />
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const lightBlock = canvasElement.querySelector('[data-theme="light"]');
    const darkBlock = canvasElement.querySelector('[data-theme="dark"]');
    expect(lightBlock?.querySelector('[role="status"]')).toBeTruthy();
    expect(darkBlock?.querySelector('[role="status"]')).toBeTruthy();
    const spinners = canvasElement.querySelectorAll('[role="status"]');
    expect(spinners).toHaveLength(2);
  },
};

// ============================================
// Thickness Options
// ============================================

export const ThicknessOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner thickness="thin" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Thin (1.5px)
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner thickness="normal" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Normal (2px)
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner thickness="thick" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Thick (3px)
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Thickness thin (1.5px) / normal (2px) / thick (3px). Влияет на толщину линии кольца.',
      },
    },
  },
  play: ({ canvasElement }) => {
    const thicknesses = Array.from(canvasElement.querySelectorAll('[role="status"]')).map((s) =>
      s.getAttribute('data-thickness')
    );
    expect(thicknesses).toEqual(['thin', 'normal', 'thick']);
  },
};

// ============================================
// With Track Color
// ============================================

export const WithTrackColor: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner trackColor="#e0e0e0" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Light track
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner trackColor="#50abc5" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Colored track
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner trackColor="transparent" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Transparent (default)
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'trackColor задаёт цвет фоновой части кольца. По умолчанию transparent.',
      },
    },
  },
  play: ({ canvasElement }) => {
    expect(canvasElement.querySelectorAll('[role="status"]')).toHaveLength(3);
  },
};

// ============================================
// Double Ring Speed
// ============================================

export const DoubleRingSpeed: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="double-ring" speed="slow" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>Slow</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="double-ring" speed="normal" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          Normal
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Spinner variant="double-ring" speed="fast" color="primary" />
        <p style={{ fontSize: '12px', marginTop: '8px', color: 'var(--foreground-muted)' }}>Fast</p>
      </div>
    </div>
  ),
  play: ({ canvasElement }) => {
    const speeds = Array.from(canvasElement.querySelectorAll('[role="status"]')).map((s) =>
      s.getAttribute('data-speed')
    );
    expect(speeds).toEqual(['slow', 'normal', 'fast']);
  },
};

// ============================================
// Button Loader Integration (SPR-05)
// ============================================

export const ButtonLoaderIntegration: Story = {
  render: () => (
    <Button loading loadingVariant="spinner">
      Loading
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Реальный потребительский паттерн — спиннер внутри loading-кнопки (ButtonLoader.tsx): ' +
          '<Spinner size="sm" color="secondary">.',
      },
    },
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const spinner = button.querySelector('[role="status"]');
    expect(spinner).toBeTruthy();
    expect(spinner?.getAttribute('data-size')).toBe('sm');
    expect(spinner?.getAttribute('data-color')).toBe('secondary');
  },
};
