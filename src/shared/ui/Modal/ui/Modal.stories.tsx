// ============================================
// Modal Stories
// ============================================

import { useModal } from '@/shared/lib/hooks/useModal';
import { Button } from '@/shared/ui/Button';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Modal } from './Modal';

const meta = {
  title: 'Shared/UI/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Modal>;

export default meta;

// Используем StoryObj без строгой типизации args для render-историй
type Story = StoryObj<typeof meta>;

// ============================================
// Helper Component для интерактивности
// ============================================

interface ModalWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  overlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  blockScroll?: boolean;
  className?: string;
  showCloseButton?: boolean;
  ariaLabel?: string;
  disableAnimation?: boolean;
}

const ModalWrapper = ({ children, ...modalProps }: ModalWrapperProps) => {
  const { isOpen, open, close } = useModal();

  return (
    <div>
      <Button onClick={open} variant="primary">
        Открыть модальное окно
      </Button>

      <Modal isOpen={isOpen} onClose={close} {...modalProps}>
        {children}
      </Modal>
    </div>
  );
};

// ============================================
// Basic Sizes
// ============================================

export const Small: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper size="sm" title="Small Modal">
      <p>Это маленькое модальное окно с максимальной шириной 400px.</p>
      <div style={{ marginTop: '16px' }}>
        <Button variant="primary">OK</Button>
      </div>
    </ModalWrapper>
  ),
};

export const Medium: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper size="md" title="Medium Modal">
      <p>Это модальное окно среднего размера с максимальной шириной 500px.</p>
      <p style={{ marginTop: '12px', color: 'var(--foreground-muted)' }}>
        Подходит для большинства сценариев использования.
      </p>
      <div style={{ marginTop: '16px' }}>
        <Button variant="secondary">Отмена</Button>
        <Button variant="primary" style={{ marginLeft: '8px' }}>
          OK
        </Button>
      </div>
    </ModalWrapper>
  ),
};

export const Large: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper size="lg" title="Large Modal">
      <p>Это большое модальное окно с максимальной шириной 640px.</p>
      <p style={{ marginTop: '12px' }}>
        Подходит для форм с несколькими полями или контента с изображениями.
      </p>
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--background-alt)',
          borderRadius: '8px',
        }}
      >
        <h4 style={{ margin: '0 0 8px 0' }}>Пример контента</h4>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Здесь может быть форма, таблица или другой сложный контент.
        </p>
      </div>
    </ModalWrapper>
  ),
};

export const ExtraLarge: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper size="xl" title="Extra Large Modal">
      <p>Это очень большое модальное окно с максимальной шириной 800px.</p>
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div
            style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '8px' }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>Column 1</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>Left content</p>
          </div>
          <div
            style={{ padding: '16px', background: 'var(--background-alt)', borderRadius: '8px' }}
          >
            <h4 style={{ margin: '0 0 8px 0' }}>Column 2</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>Right content</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  ),
};

export const FullScreen: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper size="full" title="Full Screen Modal">
      <p>Это модальное окно на весь экран (с отступами).</p>
      <div
        style={{
          marginTop: '24px',
          padding: '24px',
          background: 'var(--background-alt)',
          borderRadius: '8px',
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>Полноэкранный режим</h4>
        <p style={{ margin: 0 }}>
          Подходит для сложных редакторов, настроек или когда нужно много рабочего пространства.
        </p>
      </div>
    </ModalWrapper>
  ),
};

// ============================================
// With Header & Footer
// ============================================

export const WithFooter: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper
      title="Модальное окно с футером"
      subtitle="Дополнительная информация в заголовке"
      footer={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary">Отмена</Button>
          <Button variant="primary">Сохранить</Button>
        </div>
      }
    >
      <p>Это модальное окно имеет заголовок, подзаголовок и футер с кнопками.</p>
      <p style={{ marginTop: '12px' }}>Футер автоматически стилизуется и прижимается к низу.</p>
    </ModalWrapper>
  ),
};

// ============================================
// States & Variants
// ============================================

export const NoAnimation: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper title="Без анимации" disableAnimation>
      <p>Это модальное окно появляется мгновенно, без анимации.</p>
    </ModalWrapper>
  ),
};

export const NoOverlay: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper title="Без overlay" overlay={false}>
      <p>Это модальное окно без затемнения фона.</p>
    </ModalWrapper>
  ),
};

export const NoCloseButton: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper title="Без кнопки закрытия" showCloseButton={false}>
      <p>У этого модального окна нет кнопки закрытия в заголовке.</p>
      <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--foreground-muted)' }}>
        Закрыть можно только через кнопку в футере или ESC.
      </p>
      <div style={{ marginTop: '16px' }}>
        <Button variant="primary">Закрыть</Button>
      </div>
    </ModalWrapper>
  ),
};

// ============================================
// Content Examples
// ============================================

export const WithForm: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    return (
      <ModalWrapper
        title="Контактная форма"
        subtitle="Заполните форму ниже"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary">Отмена</Button>
            <Button
              variant="primary"
              // eslint-disable-next-line no-console
              onClick={() => console.log('Submit', { email, message })}
            >
              Отправить
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Сообщение
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Ваше сообщение..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </ModalWrapper>
    );
  },
};

export const WithLongContent: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper title="Длинный контент" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <p key={i}>
            Это параграф {i + 1}. Модальное окно автоматически добавляет скролл, если контент не
            помещается. Lorem ipsum dolor sit amet consectetur adipisicing elit.
          </p>
        ))}
      </div>
    </ModalWrapper>
  ),
};

// ============================================
// Multiple Modals
// ============================================

export const MultipleModals: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => {
    const modal1 = useModal();
    const modal2 = useModal();

    return (
      <div style={{ display: 'flex', gap: '16px' }}>
        <Button onClick={modal1.open} variant="primary">
          Открыть модалку 1
        </Button>
        <Button onClick={modal2.open} variant="secondary">
          Открыть модалку 2
        </Button>

        <Modal isOpen={modal1.isOpen} onClose={modal1.close} title="Модальное окно 1" size="sm">
          <p>Первое модальное окно.</p>
          <p style={{ marginTop: '12px', fontSize: '14px' }}>
            Попробуй открыть второе окно — скролл должен остаться заблокированным.
          </p>
          <Button onClick={modal2.open} variant="primary" style={{ marginTop: '16px' }}>
            Открыть вторую модалку
          </Button>
        </Modal>

        <Modal isOpen={modal2.isOpen} onClose={modal2.close} title="Модальное окно 2" size="sm">
          <p>Второе модальное окно.</p>
          <p style={{ marginTop: '12px', fontSize: '14px' }}>
            Закрой обе модалки и проверь, что скролл восстановился.
          </p>
          <Button onClick={modal2.close} variant="primary" style={{ marginTop: '16px' }}>
            Закрыть
          </Button>
        </Modal>
      </div>
    );
  },
};

// ============================================
// Accessibility
// ============================================

export const Accessibility: Story = {
  args: {
    children: undefined,
    isOpen: false,
    onClose: () => {},
  },
  render: () => (
    <ModalWrapper
      title="Доступность"
      ariaLabel="Пример модального окна с ARIA атрибутами"
      footer={<Button variant="primary">Закрыть</Button>}
    >
      <p>Это модальное окно имеет:</p>
      <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
        <li>role="dialog" и aria-modal="true"</li>
        <li>aria-labelledby для заголовка</li>
        <li>aria-label для описания</li>
        <li>focus management при открытии/закрытии</li>
        <li>Закрытие по клавише ESC</li>
      </ul>
    </ModalWrapper>
  ),
};
