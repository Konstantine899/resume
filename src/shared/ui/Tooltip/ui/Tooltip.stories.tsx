import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import { Input } from '@/shared/ui/Input';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { HelpCircle, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Shared/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**Tooltip** - всплывающая подсказка для предоставления дополнительной информации.

### Особенности:
- 12 позиций: top/bottom/left/right + start/end варианты
- 3 триггера: hover, focus, click
- Авто-коррекция позиции при выходе за границы
- Compound API: Provider + Trigger + Content + Arrow
- Accessibility (aria-describedby, keyboard navigation)
- Настраиваемые задержки показа/скрытия
- Кастомный цвет фона через \`color\` prop
        `,
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: [
        'top-start',
        'top',
        'top-end',
        'bottom-start',
        'bottom',
        'bottom-end',
        'left-start',
        'left',
        'left-end',
        'right-start',
        'right',
        'right-end',
      ],
      description: 'Позиция тултипа относительно триггера (12 вариантов)',
    },
    trigger: {
      control: 'select',
      options: ['hover', 'focus', 'click'],
      description: 'Триггер активации тултипа',
    },
    showDelay: {
      control: 'number',
      description: 'Задержка показа (мс)',
    },
    hideDelay: {
      control: 'number',
      description: 'Задержка скрытия (мс)',
    },
    maxWidth: {
      control: 'number',
      description: 'Максимальная ширина тултипа (px)',
    },
    offset: {
      control: 'number',
      description: 'Смещение от триггера (px)',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить тултип',
    },
    autoAdjust: {
      control: 'boolean',
      description: 'Авто-коррекция позиции',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS класс',
    },
    color: {
      control: 'color',
      description: 'Цвет фона тултипа (AntD-style). Стрелка наследует цвет.',
    },
    arrowShadowColor: {
      control: 'text',
      description: 'Цвет тени стрелки (drop-shadow) — CSS-значение box-shadow.',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label',
    },
  },
  args: {
    showDelay: 200,
    hideDelay: 100,
    maxWidth: 250,
    offset: 8,
    disabled: false,
    autoAdjust: true,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Basic Stories
// ============================================

/**
 * Базовый пример с hover триггером
 */
export const Default: Story = {
  args: {
    content: 'Это всплывающая подсказка',
    position: 'top',
    trigger: 'hover',
    children: <button style={{ padding: '0.5rem 1rem' }}>Hover me</button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Hover me' });

    // Hover to show
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Это всплывающая подсказка');

    // Unhover to hide
    await userEvent.unhover(button);
    await waitFor(
      () => {
        expect(tooltip).not.toBeInTheDocument();
      },
      { timeout: 500 }
    );
  },
};

/**
 * Тултип с позицией bottom
 */
export const BottomPosition: Story = {
  args: {
    ...Default.args,
    position: 'bottom',
    children: <button style={{ padding: '0.5rem 1rem' }}>Hover me</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-position="bottom"]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с позицией left
 */
export const LeftPosition: Story = {
  args: {
    ...Default.args,
    position: 'left',
    children: <button style={{ padding: '0.5rem 1rem' }}>Hover me</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-position="left"]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с позицией right
 */
export const RightPosition: Story = {
  args: {
    ...Default.args,
    position: 'right',
    children: <button style={{ padding: '0.5rem 1rem' }}>Hover me</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-position="right"]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Position Align Stories (12 позиций)
// ============================================

/**
 * Все 12 позиций: top/bottom/left/right × start/center/end
 */
export const AllPositions: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => {
    const placements = [
      'top-start',
      'top',
      'top-end',
      'bottom-start',
      'bottom',
      'bottom-end',
      'left-start',
      'left',
      'left-end',
      'right-start',
      'right',
      'right-end',
    ] as const;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          padding: '4rem',
          maxWidth: 800,
        }}
      >
        {placements.map((placement) => (
          <Tooltip key={placement} content={`placement: ${placement}`} position={placement}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.5rem 0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                textAlign: 'center',
              }}
            >
              {placement}
            </span>
          </Tooltip>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Ховер на top-start триггер и проверка позиции
    const topStart = canvas.getByText('top-start');
    await userEvent.hover(topStart);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('placement: top-start');
    expect(tooltip).toHaveClass(/top-start/);
    await userEvent.unhover(topStart);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    // Ховер на bottom-end триггер
    const bottomEnd = canvas.getByText('bottom-end');
    await userEvent.hover(bottomEnd);
    const tooltip2 = await screen.findByRole('tooltip');
    expect(tooltip2).toHaveTextContent('placement: bottom-end');
    expect(tooltip2).toHaveClass(/bottom-end/);
    await userEvent.unhover(bottomEnd);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Compound API с align-позицией (top-start)
 */
export const CompoundWithAlignPosition: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <Tooltip.Provider position="top-end">
      <Tooltip.Trigger asChild>
        <button style={{ padding: '0.5rem 1rem' }}>Align top-end</button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        Aligned top-end tooltip
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Align top-end' });
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Aligned top-end tooltip');
    expect(tooltip).toHaveClass(/top-end/);
    const arrow = document.querySelector('[data-tooltip-arrow]');
    expect(arrow).toHaveAttribute('data-position', 'top-end');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Trigger Stories
// ============================================

/**
 * Click триггер - открывается по клику
 */
export const ClickTrigger: Story = {
  args: {
    content: 'Нажмите ещё раз чтобы закрыть',
    trigger: 'click',
    position: 'bottom',
    children: <span style={{ display: 'inline-block', padding: '0.5rem 1rem' }}>Click me</span>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });

    // Click to open
    await userEvent.click(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Нажмите ещё раз чтобы закрыть');

    // Click to close
    await userEvent.click(button);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Focus триггер - для accessibility
 */
export const FocusTrigger: Story = {
  args: {
    content: 'Нажмите Tab для фокуса',
    trigger: 'focus',
    position: 'bottom',
    children: (
      <input
        type="text"
        placeholder="Focus me"
        style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
      />
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    trigger.focus();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Нажмите Tab для фокуса');
    trigger.blur();
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Content Stories
// ============================================

/**
 * Тултип с длинным текстом
 */
export const LongContent: Story = {
  args: {
    content:
      'Это очень длинная подсказка, которая содержит много полезной информации о функциональности этого элемента интерфейса',
    position: 'top',
    maxWidth: 300,
    children: <button style={{ padding: '0.5rem 1rem' }}>Long text</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('очень длинная подсказка');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с HTML контентом
 */
export const RichContent: Story = {
  args: {
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <strong>Заголовок</strong>
        <span>
          Описание с <em>форматированием</em>
        </span>
        <code>console.log('Hello')</code>
      </div>
    ),
    position: 'right',
    maxWidth: 280,
    children: <Icon name={Info} size={24} />,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Заголовок');
    expect(tooltip).toHaveTextContent('console.log');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с кнопкой (композиция с Button из UI kit)
 */
export const WithButton: Story = {
  args: {
    content: 'Сохранить изменения',
    position: 'top',
    children: (
      <Button variant="primary" size="md">
        Save
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Сохранить изменения');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с иконкой
 */
export const WithIcon: Story = {
  args: {
    content: 'Показать информацию',
    position: 'right',
    children: <Icon name={HelpCircle} size={20} />,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с Input — helper text / объяснение ошибки валидации
 */
export const WithInput: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '320px' }}>
      <div>
        <label htmlFor="email-field">Email</label>
        <Tooltip content="Email должен содержать @ и домен" position="bottom">
          <Input id="email-field" placeholder="you@example.com" />
        </Tooltip>
      </div>
      <div>
        <label htmlFor="password-field">Password</label>
        <Tooltip content="Минимум 8 символов" position="bottom">
          <Input id="password-field" type="password" placeholder="••••••••" />
        </Tooltip>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(2);
    await userEvent.hover(triggers[0] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Email должен содержать @ и домен');
    await userEvent.unhover(triggers[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с Card — действие в заголовке карточки
 */
export const WithCard: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <Card variant="default" style={{ width: '320px' }}>
      <Card.Header>Проект Resume</Card.Header>
      <Card.Body>
        <p>Карточка с action-кнопкой, у которой есть тултип.</p>
        <div style={{ marginTop: '1rem' }}>
          <Tooltip content="Удалить проект" position="top">
            <Button variant="danger" size="sm">
              Удалить
            </Button>
          </Tooltip>
        </div>
      </Card.Body>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    expect(trigger).toBeTruthy();
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Удалить проект');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Тултип с Avatar — имя при hover (accessibility для иконок без текста)
 */
export const WithAvatar: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Tooltip content="Константин" position="top">
        <Avatar size="sm" alt="Константин" src="/images/avatar.png" showSkeleton={false} />
      </Tooltip>
      <Tooltip content="Анна" position="top">
        <Avatar size="sm" alt="Анна" />
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(2);
    await userEvent.hover(triggers[0] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Константин');
    await userEvent.unhover(triggers[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Advanced Stories
// ============================================

/**
 * Кастомные задержки
 */
export const CustomDelays: Story = {
  args: {
    content: 'Появится через 1 секунду, исчезнет через 500мс',
    showDelay: 1000,
    hideDelay: 500,
    position: 'top',
    children: <button style={{ padding: '0.5rem 1rem' }}>Slow tooltip</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    // показ с задержкой 1000мс
    const tooltip = await screen.findByRole('tooltip', {}, { timeout: 1500 });
    expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(
      () => {
        expect(tooltip).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  },
};

/**
 * С кастомным offset
 */
export const CustomOffset: Story = {
  args: {
    content: 'Тултип с большим отступом',
    offset: 20,
    position: 'bottom',
    children: <button style={{ padding: '0.5rem 1rem' }}>Large offset</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

/**
 * Отключенный тултип
 */
export const Disabled: Story = {
  args: {
    content: 'Этот тултип не покажется',
    disabled: true,
    children: <button style={{ padding: '0.5rem 1rem' }}>Disabled</button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          'В отключенном состоянии тултип не показывается при взаимодействии. Используйте для временного отключения подсказок без удаления компонента.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });
    await userEvent.hover(button);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Без авто-коррекции позиции
 */
export const NoAutoAdjust: Story = {
  args: {
    content: 'Может выйти за границы экрана',
    autoAdjust: false,
    position: 'top',
    children: (
      <button style={{ padding: '0.5rem 1rem', position: 'absolute', top: '10px' }}>
        Edge case
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    // без авто-коррекции позиционный data-атрибут остаётся 'top'
    expect(trigger).toHaveAttribute('data-tooltip-position', 'top');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Accessibility Stories
// ============================================

/**
 * Accessibility с aria-label
 */
export const Accessibility: Story = {
  args: {
    content: 'Нажмите для отправки формы',
    trigger: 'focus',
    position: 'bottom',
    ariaLabel: 'Кнопка отправки формы',
    children: (
      <button
        style={{
          padding: '0.5rem 1rem',
          background: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Submit
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    expect(trigger).toHaveAttribute('aria-label', 'Кнопка отправки формы');
    trigger.focus();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    trigger.blur();
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Keyboard navigation (Escape для закрытия)
 */
export const KeyboardNavigation: Story = {
  args: {
    content: 'Нажмите Escape для закрытия',
    trigger: 'click',
    position: 'bottom',
    children: (
      <span style={{ display: 'inline-block', padding: '0.5rem 1rem' }}>Click + Escape</span>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click + Escape' });

    // Click to open
    await userEvent.click(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    // Press Escape to close
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Edge Cases
// ============================================

/**
 * Тултип у края экрана (тест auto-adjust)
 */
export const EdgeOfScreen: Story = {
  args: {
    content: 'Должен авто-скорректировать позицию',
    position: 'left',
    autoAdjust: true,
    children: (
      <button style={{ padding: '0.5rem 1rem', position: 'absolute', left: '10px' }}>
        Left edge
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('авто-скорректировать');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Маленький maxWidth
 */
export const NarrowTooltip: Story = {
  args: {
    content: 'Очень узкий тултип',
    maxWidth: 100,
    position: 'top',
    children: <button style={{ padding: '0.5rem 1rem' }}>Narrow</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    // maxWidth применяется из пропса (после позиционирования)
    await waitFor(() => {
      expect(tooltip).toHaveStyle({ maxWidth: '100px' });
    });
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Кастомный цвет фона через `color` prop (AntD-style).
 * Стрелка наследует цвет автоматически через --tooltip-bg.
 */
export const ColorVariants: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Tooltip content="Фиолетовая подсказка" color="#7c3aed" position="top">
        <button style={{ padding: '0.5rem 1rem' }}>Violet</button>
      </Tooltip>
      <Tooltip content="Голубая подсказка" color="#0ea5e9" position="top">
        <button style={{ padding: '0.5rem 1rem' }}>Sky</button>
      </Tooltip>
      <Tooltip
        content="Изумрудная подсказка"
        color="#059669"
        arrowShadowColor="0 0 0 1px rgb(5 150 105 / 0.6)"
        position="bottom"
      >
        <button style={{ padding: '0.5rem 1rem' }}>Emerald</button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(3);

    // Ховер на первый (Violet) — проверяем --tooltip-bg
    await userEvent.hover(triggers[0] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    await waitFor(() => {
      expect(tooltip).toHaveStyle({ '--tooltip-bg': '#7c3aed' });
    });
    await userEvent.unhover(triggers[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    // Ховер на второй (Sky)
    await userEvent.hover(triggers[1] as HTMLElement);
    const tooltip2 = await screen.findByRole('tooltip');
    await waitFor(() => {
      expect(tooltip2).toHaveStyle({ '--tooltip-bg': '#0ea5e9' });
    });
    await userEvent.unhover(triggers[1] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    // Ховер на третий (Emerald) — проверяем arrowShadowColor
    await userEvent.hover(triggers[2] as HTMLElement);
    const tooltip3 = await screen.findByRole('tooltip');
    await waitFor(() => {
      expect(tooltip3).toHaveStyle({ '--tooltip-arrow-shadow': '0 0 0 1px rgb(5 150 105 / 0.6)' });
    });
    await userEvent.unhover(triggers[2] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Skeleton-режим: вместо контента рендерится Skeleton placeholder
 * (полезно, когда контент тултипа грузится асинхронно).
 */
export const SkeletonMode: Story = {
  args: {
    content: 'Этот контент не должен появиться',
    skeleton: true,
    children: <button style={{ padding: '0.5rem 1rem' }}>Hover me (skeleton)</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    // Контент заменён Skeleton: role=status + aria-busy
    await waitFor(() => {
      expect(tooltip.querySelector('[role="status"]')).toHaveAttribute('aria-busy', 'true');
    });
    expect(tooltip).not.toHaveTextContent('Этот контент не должен появиться');
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Compound API
// ============================================

/**
 * Compound API: Provider + Trigger + Content с явной стрелкой.
 * Паттерн как у Modal — части рендерятся отдельно, состояние
 * связывается через контекст.
 */
export const CompoundBasic: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <Tooltip.Provider position="top">
      <Tooltip.Trigger asChild>
        <button style={{ padding: '0.5rem 1rem' }}>Hover me (compound)</button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        Compound tooltip with arrow
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me (compound)' });
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Compound tooltip with arrow');
    expect(document.querySelector('[data-tooltip-arrow]')).toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Compound API без стрелки.
 */
export const CompoundWithoutArrow: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <Tooltip.Provider position="bottom">
      <Tooltip.Trigger asChild>
        <button style={{ padding: '0.5rem 1rem' }}>No arrow (compound)</button>
      </Tooltip.Trigger>
      <Tooltip.Content>Просто текст без стрелки</Tooltip.Content>
    </Tooltip.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'No arrow (compound)' });
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Просто текст без стрелки');
    expect(document.querySelector('[data-tooltip-arrow]')).not.toBeInTheDocument();
    await userEvent.unhover(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Compound API с нативным span-триггером (без asChild).
 */
export const CompoundNativeTrigger: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <Tooltip.Provider position="right" trigger="click">
      <Tooltip.Trigger>Click me (native)</Tooltip.Trigger>
      <Tooltip.Content>
        Click-triggered compound tooltip
        <Tooltip.Arrow />
      </Tooltip.Content>
    </Tooltip.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Click me (native)');
    await userEvent.click(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Click-triggered compound tooltip');
  },
};

// ============================================
// Real-World Examples
// ============================================

/**
 * Real-world: валидация формы. Тултипы объясняют требования к полям
 * (helper text на focus, ошибки на blur).
 */
export const FormValidation: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <form style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <Tooltip content="Имя: минимум 2 символа" position="bottom" trigger="focus">
          <Input id="fv-name" placeholder="Имя" />
        </Tooltip>
      </div>
      <div>
        <Tooltip content="Email должен содержать @" position="bottom" trigger="focus">
          <Input id="fv-email" type="email" placeholder="Email" />
        </Tooltip>
      </div>
      <div>
        <Tooltip
          content="Пароль: 8+ символов, одна заглавная буква"
          position="bottom"
          trigger="focus"
        >
          <Input id="fv-password" type="password" placeholder="Пароль" />
        </Tooltip>
      </div>
      <Button type="submit" variant="primary" size="md">
        Отправить форму
      </Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const emailField = canvasElement.querySelector('#fv-email') as HTMLElement;
    expect(emailField).toBeTruthy();
    emailField.focus();
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Email должен содержать @');
  },
};

/**
 * Real-world: навигационное меню. Тултип объясняет действие иконки
 * без текста (accessibility для screen readers).
 */
export const NavigationMenu: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <nav
      style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem',
        background: '#1f2937',
        borderRadius: '8px',
      }}
    >
      <Tooltip content="Главная" position="bottom">
        <Icon name={HelpCircle} size={20} />
      </Tooltip>
      <Tooltip content="Поиск" position="bottom">
        <Icon name={Info} size={20} />
      </Tooltip>
      <Tooltip content="Уведомления (3 новых)" position="bottom">
        <Icon name={HelpCircle} size={20} />
      </Tooltip>
    </nav>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(3);
    await userEvent.hover(triggers[1] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Поиск');
    await userEvent.unhover(triggers[1] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

/**
 * Real-world: объяснение disabled кнопки. Тултип говорит, почему действие
 * недоступно и что нужно сделать, чтобы его активировать.
 */
export const DisabledButtonExplanation: Story = {
  args: {
    content: null,
    children: undefined,
  },
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Tooltip
        content="Доступно после заполнения формы"
        position="top"
        overlayClassName={undefined}
      >
        <Button variant="primary" size="md" disabled>
          Submit
        </Button>
      </Tooltip>
      <Tooltip content="Скоро в продаже" position="top">
        <Button variant="secondary" size="md" disabled>
          Купить
        </Button>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(2);
    await userEvent.hover(triggers[0] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Доступно после заполнения формы');
    await userEvent.unhover(triggers[0] as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  },
};

// ============================================
// Edge Cases
// ============================================

/**
 * Edge case: длинный контент со скроллом при ограниченной высоте.
 */
export const LongContentScroll: Story = {
  args: {
    content: null,
    children: null,
  },
  render: () => (
    <Tooltip
      content={
        <div style={{ maxHeight: '120px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i} style={{ margin: '0 0 0.5rem' }}>
              Строка {i + 1}: длинный контент для проверки прокрутки внутри тултипа.
            </p>
          ))}
        </div>
      }
      position="bottom"
      maxWidth={280}
    >
      <button style={{ padding: '0.5rem 1rem' }}>Scroll content</button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Строка 20');
  },
};

/**
 * Edge case: вложенные тултипы. Внешний на hover, внутренний — тоже.
 */
export const NestedTooltips: Story = {
  args: {
    content: null,
    children: null,
  },
  render: () => (
    <Tooltip content="Внешняя подсказка" position="top">
      <button style={{ padding: '0.5rem 1rem' }}>
        Outer
        <Tooltip content="Внутренняя подсказка" position="bottom" showDelay={300}>
          <span style={{ marginLeft: '0.5rem', color: '#3b82f6', textDecoration: 'underline' }}>
            inner
          </span>
        </Tooltip>
      </button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(2);
    await userEvent.hover(triggers[0] as HTMLElement);
    const outer = await screen.findByRole('tooltip');
    expect(outer).toHaveTextContent('Внешняя подсказка');
  },
};

/**
 * Edge case: быстрое наведение/уход — задержки не должны давать "залипание".
 */
export const RapidToggle: Story = {
  args: {
    content: 'Не залипает при быстром наведении',
    showDelay: 100,
    hideDelay: 100,
    children: <button style={{ padding: '0.5rem 1rem' }}>Rapid</button>,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-tooltip-trigger]') as HTMLElement;
    await userEvent.hover(trigger);
    await screen.findByRole('tooltip');
    await userEvent.unhover(trigger);
    await userEvent.hover(trigger);
    // Повторный показ после повторного hover
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  },
};

/**
 * Edge case: много тултипов на странице — все работают независимо.
 */
export const ManyTooltips: Story = {
  args: {
    content: null,
    children: null,
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Tooltip key={i} content={`Тултип #${i + 1}`} position="top">
          <button style={{ padding: '0.5rem' }}>#{i + 1}</button>
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(12);
    await userEvent.hover(triggers[5] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Тултип #6');
  },
};

/**
 * Performance demo: 50+ тултипов на странице.
 */
export const PerformanceDemo: Story = {
  args: {
    content: null,
    children: null,
  },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '0.75rem' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <Tooltip key={i} content={`Item ${i + 1}`} position="top" showDelay={100}>
          <button style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{i + 1}</button>
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = canvasElement.querySelectorAll('[data-tooltip-trigger]');
    expect(triggers.length).toBe(60);
    await userEvent.hover(triggers[0] as HTMLElement);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Item 1');
  },
};
