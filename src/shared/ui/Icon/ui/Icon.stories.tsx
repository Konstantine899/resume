import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertCircle, Check, Code, Globe, Heart, Home, Mail, Moon, Sun, X } from 'lucide-react';
import React from 'react';
import { Icon } from './Icon';

const meta = {
  title: 'Shared/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Icon** — типизированная обёртка над lucide-react иконками.

## Возможности:
- Любая иконка из lucide-react
- Предопределённые размеры (xs/sm/md/lg/xl) или custom number (например, size={48})
- Предопределённые цвета (primary/secondary/accent/etc.) или любой CSS color
- Контроль толщины линий (1, 1.5, 2, 2.5, 3)
- Accessibility (aria-label, role="img", keyboard support)
- Интерактивность (onClick, disabled, focus-visible, isPressed для toggle)

## Размеры:
- **preset:** xs (12px), sm (16px), md (20px), lg (24px), xl (32px)
- **custom:** любое число в пикселях (например, size={48})

## Цвета:
- **preset:** primary, secondary, accent, success, danger, warning
- **system:** foreground, foreground-muted, inherit
- **custom:** любой CSS color (например, "#ff5733", "rgb(255,0,0)")

## Примеры:
\`\`\`tsx
<Icon name={Home} size={24} color="primary" />
<Icon name={Mail} size="md" color="accent" strokeWidth={2.5} />
<Icon name={Check} size="lg" color="success" onClick={handleClick} ariaLabel="Confirm" />
<Icon name={Moon} size="md" isPressed={true} onClick={toggleTheme} ariaLabel="Toggle theme" />
<Icon name={Heart} size={48} color="#ff5733" />
\`\`\`
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
    name: { control: false, description: 'Иконка из lucide-react' },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
      description: 'Размер иконки (preset) или custom number',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'accent',
        'success',
        'danger',
        'warning',
        'foreground',
        'foreground-muted',
        'inherit',
      ],
      defaultValue: 'foreground',
      description: 'Цвет иконки (preset) или любой CSS color',
    },
    strokeWidth: {
      control: 'number',
      min: 1,
      max: 3,
      step: 0.5,
      defaultValue: 2,
      description: 'Толщина линий (1-3)',
    },
    ariaLabel: { control: 'text', description: 'Текст для скринридеров' },
    decorative: { control: 'boolean', description: 'Декоративная иконка (скрыть от скринридеров)' },
    disabled: { control: 'boolean', description: 'Отключить интерактивность' },
    onClick: { control: false, description: 'Обработчик клика (добавляет keyboard support)' },
    isPressed: { control: 'boolean', description: 'Состояние нажатия для toggle иконок' },
    className: { control: 'text', description: 'Дополнительный CSS класс' },
    id: { control: 'text', description: 'HTML id для якорных ссылок' },
  },
  args: {
    name: Home,
    size: 'md',
    color: 'foreground',
    strokeWidth: 2,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const ThemeContainer = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      backgroundColor: 'var(--background)',
      padding: '24px',
      borderRadius: '12px',
      minWidth: '200px',
    }}
  >
    {children}
  </div>
);

const Grid = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '16px',
      alignItems: 'center',
    }}
  >
    {children}
  </div>
);

// ============================================
// Basic Stories
// ============================================

export const Default: Story = {
  render: () => (
    <ThemeContainer>
      <Icon name={Home} size="md" color="foreground" ariaLabel="Home" />
    </ThemeContainer>
  ),
};

export const WithLabel: Story = {
  args: {
    name: Mail,
    size: 'md',
    color: 'primary',
    ariaLabel: 'Отправить письмо',
  },
};

export const Decorative: Story = {
  args: {
    name: Sun,
    size: 'md',
    decorative: true,
  },
};

// ============================================
// Size Variants
// ============================================

export const AllSizes: Story = {
  render: () => (
    <ThemeContainer>
      <Grid>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <Icon name={Home} size={size} color="foreground" ariaLabel={size} />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {size.toUpperCase()} (
              {size === 'xs'
                ? '12'
                : size === 'sm'
                  ? '16'
                  : size === 'md'
                    ? '20'
                    : size === 'lg'
                      ? '24'
                      : '32'}
              px)
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

export const CustomSize: Story = {
  args: {
    name: Home,
    size: 48,
    color: 'primary',
    ariaLabel: 'Custom size icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Демонстрация custom numeric size (48px вместо preset)',
      },
    },
  },
};

// ============================================
// Color Variants
// ============================================

export const AllColors: Story = {
  render: () => (
    <ThemeContainer>
      <Grid>
        {[
          { color: 'primary', icon: Check },
          { color: 'secondary', icon: Check },
          { color: 'accent', icon: Check },
          { color: 'success', icon: Check },
          { color: 'danger', icon: X },
          { color: 'warning', icon: AlertCircle },
          { color: 'foreground', icon: Home },
          { color: 'foreground-muted', icon: Home },
          { color: 'inherit', icon: Home },
        ].map(({ color, icon }) => (
          <div key={color} style={{ textAlign: 'center' }}>
            <Icon name={icon} size="md" color={color} ariaLabel={color} />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {color}
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

export const CustomColor: Story = {
  args: {
    name: Heart,
    size: 'lg',
    color: '#ff5733',
    ariaLabel: 'Custom color icon',
  },
  parameters: {
    docs: {
      description: {
        story: 'Демонстрация custom CSS color (#ff5733)',
      },
    },
  },
};

// ============================================
// Stroke Width Variants
// ============================================

export const StrokeWidths: Story = {
  render: () => (
    <ThemeContainer>
      <Grid>
        {([1, 1.5, 2, 2.5, 3] as const).map((width) => (
          <div key={width} style={{ textAlign: 'center' }}>
            <Icon
              name={Home}
              size="lg"
              strokeWidth={width}
              color="foreground"
              ariaLabel={`Stroke width ${width}`}
            />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {width}
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

// ============================================
// Interactive States
// ============================================

export const Clickable: Story = {
  args: {
    name: Mail,
    size: 'md',
    color: 'primary',
    onClick: () => alert('Icon clicked!'),
    ariaLabel: 'Отправить письмо',
  },
  parameters: {
    docs: {
      description: {
        story:
          '**Keyboard support:** Icon поддерживает клавиатурную навигацию. Используйте Enter или Space для активации.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    name: Home,
    size: 'md',
    disabled: true,
  },
};

export const ToggleState: Story = {
  args: {
    name: Moon,
    size: 'md',
    color: 'primary',
    isPressed: true,
    onClick: () => console.log('Toggle theme'),
    ariaLabel: 'Toggle theme',
  },
  parameters: {
    docs: {
      description: {
        story:
          '**isPressed** prop добавляет aria-pressed для toggle иконок (например, переключатель темы).',
      },
    },
  },
};

export const HoverStates: Story = {
  render: () => (
    <ThemeContainer>
      <Grid>
        {[
          { state: 'Default', onClick: undefined },
          { state: 'Hover (наведите)', onClick: () => {} },
          { state: 'Active (клик)', onClick: () => {} },
        ].map(({ state, onClick }) => (
          <div key={state} style={{ textAlign: 'center' }}>
            <Icon name={Home} size="lg" color="primary" onClick={onClick} ariaLabel={state} />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {state}
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

export const FocusStates: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '16px', color: 'var(--foreground-muted)' }}>
          Нажмите Tab для фокуса
        </p>
        <Icon name={Mail} size="lg" color="primary" onClick={() => {}} ariaLabel="Focus test" />
        <p style={{ fontSize: '10px', marginTop: '8px', color: 'var(--foreground-muted)' }}>
          focus-visible outline
        </p>
      </div>
    </ThemeContainer>
  ),
};

// ============================================
// Custom Styling
// ============================================

export const CustomStyling: Story = {
  args: {
    name: Home,
    size: 'lg',
    color: 'primary',
    className: 'custom-icon-class',
    ariaLabel: 'Custom styled icon',
  },
  parameters: {
    docs: {
      description: {
        story: '**className** prop добавляет дополнительные CSS классы для кастомизации.',
      },
    },
  },
};

// ============================================
// Accessibility
// ============================================

export const AnchorLinks: Story = {
  render: () => (
    <ThemeContainer>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Icon
          name={Home}
          size="md"
          color="primary"
          id="home-link"
          ariaLabel="Navigate to home"
          onClick={() => console.log('Navigate home')}
        />
        <p style={{ fontSize: '12px', color: 'var(--foreground-muted)' }}>
          Icon с id="home-link" для якорных ссылок
        </p>
      </nav>
    </ThemeContainer>
  ),
};

// ============================================
// Real-world Examples
// ============================================

export const NavigationIcons: Story = {
  render: () => (
    <ThemeContainer>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { icon: Home, label: 'Главная' },
          { icon: Code, label: 'Проекты' },
          { icon: Mail, label: 'Контакты' },
        ].map(({ icon, label }) => (
          <a
            key={label}
            href="#"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--foreground)',
              textDecoration: 'none',
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <Icon name={icon} size="sm" color="inherit" ariaLabel={label} />
            <span>{label}</span>
          </a>
        ))}
      </nav>
    </ThemeContainer>
  ),
};

export const ThemeIcons: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Icon name={Moon} size="md" color="primary" ariaLabel="Тёмная тема" />
        <Icon name={Sun} size="md" color="primary" ariaLabel="Светлая тема" />
        <Icon name={Globe} size="md" color="accent" ariaLabel="Язык" />
      </div>
    </ThemeContainer>
  ),
};

export const ContactExample: Story = {
  render: () => (
    <ThemeContainer>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Icon name={Mail} size="md" color="primary" ariaLabel="Email" />
        <span style={{ color: 'var(--foreground)' }}>konstantin.atroshchenko@example.com</span>
      </div>
    </ThemeContainer>
  ),
};

// ============================================
// Combined Props
// ============================================

export const AllPropsCombined: Story = {
  args: {
    name: Home,
    size: 'lg',
    color: 'primary',
    strokeWidth: 2.5,
    className: 'combined-example',
    ariaLabel: 'Combined props example',
    id: 'combined-icon',
    onClick: () => console.log('Clicked combined icon'),
    isPressed: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Пример использования всех props вместе.',
      },
    },
  },
};

// ============================================
// Theme Comparison (Fixed)
// ============================================

export const ThemeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          padding: '32px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          border: '1px solid var(--card-border)',
        }}
      >
        <div>
          <Icon name={Home} size="xl" color="primary" ariaLabel="Home" />
          <p style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
            Light Theme (var)
          </p>
        </div>
      </div>
      <div
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          padding: '32px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          border: '1px solid #333',
        }}
      >
        <div>
          <Icon name={Home} size="xl" color="primary" ariaLabel="Home" />
          <p style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center' }}>
            Dark Theme (hardcoded)
          </p>
        </div>
      </div>
    </div>
  ),
};
