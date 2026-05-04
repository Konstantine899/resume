import { Card } from '@/shared/ui/Card';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { Portal } from './Portal';

const meta = {
  title: 'Shared/Portal',
  component: Portal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Компонент для рендеринга контента вне DOM иерархии. Используется для модальных окон, тостов, тултипов.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    element: {
      control: false,
      description: 'DOM элемент для рендеринга портала (по умолчанию document.body)',
    },
  },
} satisfies Meta<typeof Portal>;

export default meta;
type Story = StoryObj<typeof meta>;

// Базовая история
export const Default: Story = {
  args: {
    children: (
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: '0 4px 20px var(--shadow-color)',
          zIndex: 1000,
          maxWidth: '300px',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>🎯 Портал контент</h3>
        <p style={{ margin: 0, color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
          Этот контент рендерится вне DOM иерархии через React.createPortal()
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Базовое использование портала с фиксированным позиционированием',
      },
    },
  },
};

// Портал с кастомным элементом
export const CustomElement: Story = {
  args: {
    children: (
      <Card style={{ padding: '1rem', maxWidth: '250px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>
          ✅ В кастомном контейнере
        </h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--foreground-muted)' }}>
          Контент рендерится внутри указанного элемента
        </p>
      </Card>
    ),
  },
  render: (args) => {
    const containerId = 'custom-portal-element';
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
      const element = document.getElementById(containerId);
      if (element) {
        setContainer(element);
      }
    }, []);

    return (
      <div style={{ padding: '2rem' }}>
        <div
          id={containerId}
          ref={(el) => {
            if (el) setContainer(el);
          }}
          style={{
            position: 'relative',
            padding: '2rem',
            backgroundColor: 'var(--background-secondary)',
            borderRadius: '8px',
            border: '2px dashed var(--card-border)',
            minHeight: '200px',
          }}
        >
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
            Кастомный контейнер для портала:
          </p>

          {container && <Portal {...args} element={container} />}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Рендеринг портала в кастомный DOM элемент через prop element',
      },
    },
  },
};

// Портал для модального окна
export const ModalOverlay: Story = {
  args: {
    children: (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
      >
        <Card
          style={{
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            animation: 'scaleIn 0.3s ease-out',
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--foreground)' }}>🎭 Модальное окно</h3>
          <p style={{ margin: '0 0 1.5rem 0', color: 'var(--foreground-muted)' }}>
            Пример использования портала для модального окна с overlay
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                backgroundColor: 'transparent',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Подтвердить
            </button>
          </div>
        </Card>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Использование портала для модального окна с затемнением фона',
      },
    },
  },
};

// Демонстрация работы с темами
export const ThemedContent: Story = {
  args: {
    children: (
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '1rem',
          borderRadius: '8px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: '0 4px 20px var(--shadow-color)',
          zIndex: 1000,
          maxWidth: '280px',
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--foreground)' }}>
          🌓 Темизация работает
        </h4>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--foreground)' }}>
          Основной текст
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
          Вторичный текст адаптируется под тему
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Контент портала автоматически использует CSS переменные темы (dark/light)',
      },
    },
  },
};
