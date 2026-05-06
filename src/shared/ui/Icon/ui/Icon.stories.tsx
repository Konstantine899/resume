import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertCircle, Check, Code, Globe, Home, Mail, Moon, Sun, X } from 'lucide-react';
import React from 'react';
import { Icon } from './Icon';

const meta = {
  title: 'Shared/UI/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Icon** — типизированная обёртка над lucide-react иконками.

## Возможности:
- Любая иконка из lucide-react
- Предопределённые размеры (xs/sm/md/lg/xl)
- Предопределённые цвета (primary/secondary/accent/etc.)
- Контроль толщины линий (1, 1.5, 2, 2.5, 3)
- Accessibility (aria-label, role="img", keyboard support)
- Интерактивность (onClick, disabled, focus-visible)

## Размеры:
- **xs** (12px), **sm** (16px), **md** (20px), **lg** (24px), **xl** (32px)

## Цвета:
- **primary**, **secondary**, **accent**, **success**, **danger**, **warning**
- **foreground**, **foreground-muted**, **inherit**

## Примеры:
\`\`\`tsx
<Icon name={Home} size={24} color="primary" />
<Icon name={Mail} size="md" color="accent" strokeWidth={2.5} />
<Icon name={Check} size="lg" color="success" onClick={handleClick} ariaLabel="Confirm" />
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
      description: 'Размер иконки',
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
      description: 'Цвет иконки',
    },
    strokeWidth: {
      control: 'number',
      min: 1,
      max: 3,
      step: 0.5,
      defaultValue: 2,
      description: 'Толщина линий',
    },
    ariaLabel: { control: 'text', description: 'Текст для скринридеров' },
    decorative: { control: 'boolean', description: 'Декоративная иконка' },
    disabled: { control: 'boolean', description: 'Отключить интерактивность' },
    onClick: { control: false, description: 'Обработчик клика' },
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

// Basic
export const Default: Story = {
  render: () => (
    <ThemeContainer>
      <Icon name={Home} size="md" color="foreground" />
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

// Sizes
export const AllSizes: Story = {
  render: () => (
    <ThemeContainer>
      <Grid>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <div key={size} style={{ textAlign: 'center' }}>
            <Icon name={Home} size={size} color="foreground" />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {size.toUpperCase()}
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

// Colors
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
        ].map(({ color, icon }) => (
          <div key={color} style={{ textAlign: 'center' }}>
            <Icon name={icon} size="md" color={color} />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {color}
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

// Stroke Width
export const StrokeWidths: Story = {
  render: () => (
    <ThemeContainer>
      <Grid>
        {([1, 1.5, 2, 2.5, 3] as const).map((width) => (
          <div key={width} style={{ textAlign: 'center' }}>
            <Icon name={Home} size="lg" strokeWidth={width} color="foreground" />
            <p style={{ fontSize: '10px', marginTop: '4px', color: 'var(--foreground-muted)' }}>
              {width}
            </p>
          </div>
        ))}
      </Grid>
    </ThemeContainer>
  ),
};

// Interactive
export const Clickable: Story = {
  args: {
    name: Mail,
    size: 'md',
    color: 'primary',
    onClick: () => alert('Icon clicked!'),
    ariaLabel: 'Отправить письмо',
  },
};

export const Disabled: Story = {
  args: {
    name: Home,
    size: 'md',
    disabled: true,
  },
};

// Real-world
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
            <Icon name={icon} size="sm" color="inherit" />
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

// Theme
export const ThemeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div
        data-theme="light"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Icon name={Home} size="xl" color="primary" />
      </div>
      <div
        data-theme="dark"
        style={{
          backgroundColor: 'var(--background)',
          padding: '32px',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Icon name={Home} size="xl" color="primary" />
      </div>
    </div>
  ),
};
