import { Card } from '@/shared/ui/Card';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overlay } from './Overlay';

const meta = {
  title: 'Shared/Overlay',
  component: Overlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Компонент затемнения фона (overlay/backdrop). Используется с модальными окнами, popover, dropdown.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: false,
      description: 'Контент поверх оверлея (обычно модальное окно)',
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика по оверлею (закрытие модального окна)',
    },
    blur: {
      control: 'boolean',
      description: 'Размытие фона через backdrop-filter',
    },
    dark: {
      control: 'boolean',
      description: 'Более тёмная версия оверлея',
    },
    className: {
      control: 'text',
      description: 'Дополнительные CSS классы',
    },
  },
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof meta>;

// Базовая история
export const Default: Story = {
  args: {
    children: (
      <Card
        style={{
          padding: '2rem',
          maxWidth: '400px',
          width: '90%',
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--foreground)' }}>
          📦 Контент поверх оверлея
        </h3>
        <p style={{ margin: 0, color: 'var(--foreground-muted)' }}>
          Кликните по оверлею чтобы закрыть
        </p>
      </Card>
    ),
    blur: false,
    dark: false,
  },
  render: (args) => (
    <div style={{ position: 'relative', minHeight: '400px' }}>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--foreground)', marginBottom: '1rem' }}>Основной контент</h2>
        <p style={{ color: 'var(--foreground-muted)' }}>Этот контент затемняется оверлеем</p>
      </div>

      <Overlay {...args} />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
        }}
      >
        {args.children}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Базовое использование оверлея с затемнением 60%',
      },
    },
  },
};

// Оверлей с blur эффектом
export const WithBlur: Story = {
  args: {
    ...Default.args,
    blur: true,
  },
  render: Default.render,
  parameters: {
    docs: {
      description: {
        story: 'Оверлей с размытием фона через backdrop-filter',
      },
    },
  },
};

// Тёмный оверлей
export const DarkOverlay: Story = {
  args: {
    ...Default.args,
    dark: true,
  },
  render: Default.render,
  parameters: {
    docs: {
      description: {
        story: 'Более тёмная версия оверлея (80% затемнение)',
      },
    },
  },
};

// Оверлей с обработчиком клика
export const Clickable: Story = {
  args: {
    ...Default.args,
    onClick: () => alert('Overlay clicked! Close modal'),
  },
  render: Default.render,
  parameters: {
    docs: {
      description: {
        story: 'Клик по оверлею закрывает модальное окно',
      },
    },
  },
};

// Демонстрация работы с темами
export const ThemedOverlay: Story = {
  args: {
    children: (
      <Card
        style={{
          padding: '1.5rem',
          maxWidth: '350px',
          animation: 'scaleIn 0.3s ease-out',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>
          🌓 Темизация работает
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--foreground)' }}>
          Основной текст
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
          Оверлей адаптируется под тему
        </p>
      </Card>
    ),
    blur: true,
  },
  render: (args) => (
    <div style={{ position: 'relative', minHeight: '400px' }}>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--foreground)' }}>Контент страницы</h2>
      </div>

      <Overlay {...args} />

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1001,
        }}
      >
        {args.children}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Оверлей и контент используют CSS переменные темы (dark/light)',
      },
    },
  },
};
