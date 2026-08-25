import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import {
  Briefcase,
  Download,
  Edit,
  ExternalLink,
  Heart,
  Home,
  Info,
  Mail,
  Moon,
  Settings,
  Share2,
  Trash2,
  User,
} from 'lucide-react';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Link } from '@/shared/ui/Link';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Tooltip } from '@/shared/ui/Tooltip';
import { ICON_COLORS, ICON_SIZES } from '../model/constants';
import { Icon } from './Icon';

const meta = {
  title: 'Shared/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: { control: false },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
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
    },
    strokeWidth: {
      control: 'number',
      min: 1,
      max: 3,
      step: 0.5,
    },
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

export const Default: Story = {
  args: {
    name: Home,
    size: 'md',
    color: 'foreground',
    ariaLabel: 'Home',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-size', 'md');
    expect(icon).toHaveAttribute('data-color', 'foreground');
    expect(icon).toHaveAttribute('aria-label', 'Home');
  },
};

export const Decorative: Story = {
  args: {
    name: Moon,
    size: 'md',
    decorative: true,
  },
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
    expect(icon).not.toHaveAttribute('aria-label');
  },
};

export const Interactive: Story = {
  args: {
    name: Mail,
    size: 'md',
    color: 'primary',
    onClick: () => {},
    ariaLabel: 'Send email',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button');
    expect(icon).toHaveAttribute('tabindex', '0');
    expect(icon).toHaveAttribute('data-interactive', 'true');
    await userEvent.click(icon);
    expect(icon).toHaveFocus();
  },
};

export const ToggleState: Story = {
  args: {
    name: Moon,
    size: 'md',
    color: 'primary',
    isPressed: true,
    onClick: () => {},
    ariaLabel: 'Toggle theme',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('button');
    expect(icon).toHaveAttribute('aria-pressed', 'true');
  },
};

export const CustomColor: Story = {
  args: {
    name: Heart,
    size: 'lg',
    color: '#ff5733',
    ariaLabel: 'Custom color icon',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('img');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('data-color', '#ff5733');
  },
};

// ============================================
// Sizes Group
// ============================================

/**
 * Все 5 размеров в ряд. Каждый span несёт корректный `data-size`,
 * а inner svg получает inline width/height из ICON_SIZES.
 */
export const AllSizes: Story = {
  render: () => {
    const sizes: Array<keyof typeof ICON_SIZES> = ['xs', 'sm', 'md', 'lg', 'xl'];
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {sizes.map((size) => (
          <Icon key={size} name={Home} size={size} decorative />
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('[data-size]');
    expect(icons).toHaveLength(5);
    const expected: Array<[string, number]> = [
      ['xs', ICON_SIZES.xs],
      ['sm', ICON_SIZES.sm],
      ['md', ICON_SIZES.md],
      ['lg', ICON_SIZES.lg],
      ['xl', ICON_SIZES.xl],
    ];
    expected.forEach(([size, px]) => {
      const el = canvasElement.querySelector(`[data-size="${size}"]`);
      expect(el).toBeTruthy();
      const svg = el?.querySelector('svg');
      expect(svg).toHaveStyle({ width: `${px}px`, height: `${px}px` });
    });
  },
};

/**
 * Все 9 color presets из ICON_COLORS. Каждый span несёт `data-color`,
 * inline style color резолвится из ICON_COLORS (CSS-var / currentColor).
 */
export const AllColors: Story = {
  render: () => {
    const colors = Object.keys(ICON_COLORS) as Array<keyof typeof ICON_COLORS>;
    return (
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {colors.map((color) => (
          <Icon key={color} name={Heart} size="md" color={color} decorative />
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const colors = Object.keys(ICON_COLORS) as Array<keyof typeof ICON_COLORS>;
    colors.forEach((color) => {
      const el = canvasElement.querySelector(`[data-color="${color}"]`);
      expect(el).toBeTruthy();
      const svg = el?.querySelector('svg');
      // Inline style: браузер сериализует CSS-токены в lowercase (currentcolor).
      const inlineStyle = (svg?.getAttribute('style') ?? '').toLowerCase();
      expect(inlineStyle).toContain(ICON_COLORS[color].toLowerCase());
    });
  },
};

/**
 * All stroke widths (1 / 1.5 / 2 / 2.5 / 3). inner svg несёт
 * `stroke-width` атрибут равный значению.
 */
export const AllStrokeWidths: Story = {
  render: () => {
    const widths = [1, 1.5, 2, 2.5, 3] as const;
    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {widths.map((strokeWidth) => (
          <Icon key={strokeWidth} name={Settings} size="md" strokeWidth={strokeWidth} decorative />
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('[data-size="md"]');
    expect(icons).toHaveLength(5);
    icons.forEach((el, index) => {
      const svg = el.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', String([1, 1.5, 2, 2.5, 3][index]));
    });
  },
};

// ============================================
// Composition Group
// ============================================

/**
 * Icon внутри Link (external). Link отрендерит target=_blank + rel.
 */
export const WithLink: Story = {
  render: () => (
    <Link href="https://github.com" external>
      <Icon name={ExternalLink} decorative />
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    const icon = link.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  },
};

/**
 * Icon внутри кнопки Button.
 */
export const WithButton: Story = {
  render: () => (
    <Button variant="primary" size="md">
      <Icon name={Mail} size="sm" decorative /> Email
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).toBeInTheDocument();
    const icon = button.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  },
};

/**
 * Icon как fallback Avatar (без src — показывается fallback).
 */
export const WithAvatar: Story = {
  render: () => (
    <Avatar size="md" alt="User" fallback={<Icon name={User} size="sm" decorative />} />
  ),
  play: async ({ canvasElement }) => {
    const avatar = canvasElement.querySelector('[role="img"]');
    expect(avatar).toBeInTheDocument();
    const icon = avatar?.querySelector('[aria-hidden="true"]');
    expect(icon).not.toBeNull();
  },
};

/**
 * Icon как триггер Tooltip. Hover открывает тултип.
 */
export const WithTooltip: Story = {
  render: () => (
    <Tooltip content="Настройки" position="top">
      <Icon name={Settings} size="lg" ariaLabel="Settings" />
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Настройки');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Real-World Group
// ============================================

/**
 * Real-world: ряд навигационных иконок (декоративные).
 */
export const NavigationIcons: Story = {
  render: () => (
    <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '0.5rem 1rem' }}>
      <Icon name={Home} size="md" decorative />
      <Icon name={User} size="md" decorative />
      <Icon name={Briefcase} size="md" decorative />
      <Icon name={Mail} size="md" decorative />
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('[data-size="md"]');
    expect(icons).toHaveLength(4);
  },
};

const onAction = fn();

/**
 * Real-world: ряд action-иконок (интерактивные, роль=button).
 */
export const ActionIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Icon name={Edit} ariaLabel="Редактировать" onClick={onAction} />
      <Icon name={Trash2} ariaLabel="Удалить" onClick={onAction} />
      <Icon name={Share2} ariaLabel="Поделиться" onClick={onAction} />
      <Icon name={Download} ariaLabel="Скачать" onClick={onAction} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    await userEvent.click(buttons[0] as HTMLElement);
    expect(onAction).toHaveBeenCalled();
  },
};

// ============================================
// Edge Cases Group
// ============================================

/**
 * Edge case: кастомный числовой размер (не preset).
 */
export const CustomSize: Story = {
  render: () => <Icon name={Home} size={42} decorative />,
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg');
    expect(svg).toHaveStyle({ width: '42px', height: '42px' });
  },
};

/**
 * Edge case: длинный aria-label для скринридера.
 */
export const LongAriaLabel: Story = {
  render: () => (
    <Icon
      name={Info}
      ariaLabel="Длинный текст для скринридера, который описывает иконку очень подробно, чтобы пользователь мог понять её назначение"
    />
  ),
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('[role="img"]');
    expect(icon).toHaveAttribute(
      'aria-label',
      'Длинный текст для скринридера, который описывает иконку очень подробно, чтобы пользователь мог понять её назначение'
    );
  },
};

/**
 * Edge / performance: 50 иконок в grid.
 */
export const ManyIcons: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.75rem' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <Icon key={i} name={Home} size="sm" decorative />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const icons = canvasElement.querySelectorAll('[data-size="sm"]');
    expect(icons).toHaveLength(50);
  },
};

/**
 * Demo: skeleton loading рядом с иконкой.
 */
export const IconSkeletonLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Skeleton variant="text" width="40px" height="40px" />
      <Icon name={Settings} size="lg" ariaLabel="Настройки" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const skeleton = canvas.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    const icon = canvas.getByRole('img');
    expect(icon).toBeInTheDocument();
  },
};
