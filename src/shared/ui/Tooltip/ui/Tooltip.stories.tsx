import { Icon } from '@/shared/ui/Icon';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
- 4 позиции: top, bottom, left, right
- 3 триггера: hover, focus, click
- Авто-коррекция позиции при выходе за границы
- Accessibility (aria-describedby, keyboard navigation)
- Настраиваемые задержки показа/скрытия
        `,
      },
    },
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Позиция тултипа относительно триггера',
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
    children: <button style={{ padding: '0.5rem 1rem' }}>Click me</button>,
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
};

/**
 * Тултип с кнопкой
 */
export const WithButton: Story = {
  args: {
    content: 'Сохранить изменения',
    position: 'top',
    children: (
      <button
        style={{
          padding: '0.5rem 1rem',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Save
      </button>
    ),
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
};

/**
 * Keyboard navigation (Escape для закрытия)
 */
export const KeyboardNavigation: Story = {
  args: {
    content: 'Нажмите Escape для закрытия',
    trigger: 'click',
    position: 'bottom',
    children: <button style={{ padding: '0.5rem 1rem' }}>Click + Escape</button>,
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
};
