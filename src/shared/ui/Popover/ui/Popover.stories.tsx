import type { Meta, StoryObj } from '@storybook/react-vite';
import { Info, Settings, User } from 'lucide-react';
import { Popover } from './Popover';

const meta = {
  title: 'Shared/UI/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right', 'center'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'auto'],
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Это содержимое попапа',
    position: 'top',
    size: 'md',
    children: <button className="px-4 py-2 bg-blue-500 text-white rounded">Click me</button>,
  },
};

export const WithTitle: Story = {
  args: {
    ...Default.args,
    title: 'Заголовок',
    content: 'Контент с заголовком',
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    content: 'Маленький попап',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    content: 'Большой попап с длинным контентом для демонстрации максимального размера',
  },
};

export const AllPositions: Story = {
  args: {
    content: 'Position test',
    children: <button>Click</button>,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Popover {...args} position="top" content="Top position">
        <button>Top</button>
      </Popover>
      <Popover {...args} position="bottom" content="Bottom position">
        <button>Bottom</button>
      </Popover>
      <Popover {...args} position="left" content="Left position">
        <button>Left</button>
      </Popover>
      <Popover {...args} position="right" content="Right position">
        <button>Right</button>
      </Popover>
      <Popover {...args} position="center" content="Center position">
        <button>Center</button>
      </Popover>
    </div>
  ),
};

export const Center: Story = {
  args: {
    content: 'Центрированный попап поверх триггера',
    position: 'center',
    size: 'md',
    children: <button className="px-4 py-2 bg-purple-500 text-white rounded">Center</button>,
  },
};

export const WithIcon: Story = {
  args: {
    content: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={16} />
        <span>Информация</span>
      </div>
    ),
    children: <Settings size={20} />,
  },
};

export const WithComplexContent: Story = {
  args: {
    title: 'Профиль',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} />
          <span>Пользователь</span>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>user@example.com</div>
      </div>
    ),
    children: <button className="px-4 py-2 bg-gray-500 text-white rounded">Профиль</button>,
  },
};

export const CloseOnContentClick: Story = {
  args: {
    ...Default.args,
    closeOnContentClick: true,
    content: 'Кликни здесь чтобы закрыть',
  },
};

export const NoCloseOnContentClick: Story = {
  args: {
    ...Default.args,
    closeOnContentClick: false,
    content: 'Этот попап не закроется при клике',
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    children: <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded">Disabled</button>,
  },
};
