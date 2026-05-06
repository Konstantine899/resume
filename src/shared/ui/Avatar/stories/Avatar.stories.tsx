import { DEVELOPER_DATA } from '@/entities/Developer';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../ui/Avatar';

const DEVELOPER_NAME = DEVELOPER_DATA.fullName;

// Meta конфигурация
const meta = {
  title: 'Shared/UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Размер аватара',
    },
    shape: {
      control: 'select',
      options: ['circle', 'square'],
      description: 'Форма аватара',
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
      description: 'Статус пользователя',
    },
    statusPosition: {
      control: 'select',
      options: ['top-right', 'bottom-right', 'top-left', 'bottom-left'],
      description: 'Позиция индикатора статуса',
    },
    border: {
      control: { type: 'range', min: 0, max: 8 },
      description: 'Толщина рамки',
    },
    borderColor: {
      control: 'color',
      description: 'Цвет рамки',
    },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Реальные данные из проекта
// ============================================
export const Developer: Story = {
  args: {
    name: DEVELOPER_NAME,
    size: 'lg',
    shape: 'circle',
  },
};

export const DeveloperOnline: Story = {
  args: {
    name: DEVELOPER_NAME,
    size: 'lg',
    status: 'online',
  },
};

export const DeveloperWithBorder: Story = {
  args: {
    name: DEVELOPER_NAME,
    size: 'lg',
    border: 3,
    borderColor: 'var(--primary)',
    status: 'online',
  },
};

// ============================================
// Размеры
// ============================================
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
      <Avatar size="xs" name={DEVELOPER_NAME} />
      <Avatar size="sm" name={DEVELOPER_NAME} />
      <Avatar size="md" name={DEVELOPER_NAME} />
      <Avatar size="lg" name={DEVELOPER_NAME} />
      <Avatar size="xl" name={DEVELOPER_NAME} />
    </div>
  ),
};

// ============================================
// Формы
// ============================================
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Avatar shape="circle" name={DEVELOPER_NAME} size="lg" />
      <Avatar shape="square" name={DEVELOPER_NAME} size="lg" />
    </div>
  ),
};

// ============================================
// Статусы
// ============================================
export const Statuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px' }}>
      <Avatar status="online" name={DEVELOPER_NAME} size="lg" />
      <Avatar status="offline" name={DEVELOPER_NAME} size="lg" />
      <Avatar status="busy" name={DEVELOPER_NAME} size="lg" />
      <Avatar status="away" name={DEVELOPER_NAME} size="lg" />
    </div>
  ),
};

// ============================================
// Позиции статуса
// ============================================
export const StatusPositions: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      <Avatar status="online" statusPosition="top-right" name={DEVELOPER_NAME} size="lg" />
      <Avatar status="online" statusPosition="bottom-right" name={DEVELOPER_NAME} size="lg" />
      <Avatar status="online" statusPosition="top-left" name={DEVELOPER_NAME} size="lg" />
      <Avatar status="online" statusPosition="bottom-left" name={DEVELOPER_NAME} size="lg" />
    </div>
  ),
};

// ============================================
// С изображением
// ============================================
export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=11',
    alt: 'User avatar',
    name: 'John Doe',
    size: 'lg',
  },
};

export const DeveloperWithPhoto: Story = {
  args: {
    src: DEVELOPER_DATA.avatarUrl || 'https://i.pravatar.cc/150?img=11',
    alt: `${DEVELOPER_NAME} avatar`,
    name: DEVELOPER_NAME,
    size: 'xl',
    status: 'online',
  },
};

// ============================================
// Валидация и fallback
// ============================================
export const InvalidImage: Story = {
  args: {
    src: 'invalid-url',
    name: DEVELOPER_NAME,
    size: 'lg',
  },
};

export const ErrorFallback: Story = {
  args: {
    src: '/invalid-image.jpg',
    name: DEVELOPER_NAME,
    size: 'lg',
  },
};

// ============================================
// Интеракции
// ============================================
export const Clickable: Story = {
  args: {
    name: DEVELOPER_NAME,
    size: 'lg',
    onClick: () => console.log('Avatar clicked!'),
  },
};

export const Disabled: Story = {
  args: {
    name: DEVELOPER_NAME,
    size: 'lg',
    disabled: true,
  },
};
