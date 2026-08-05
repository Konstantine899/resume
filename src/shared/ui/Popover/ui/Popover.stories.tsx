import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { Info, Settings, User } from 'lucide-react';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Popover } from './Popover';

const meta = {
  title: 'Shared/Popover',
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Click me');

    await userEvent.click(trigger);

    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Это содержимое попапа');
    expect(popover).toHaveAttribute('data-position', 'top');
    expect(popover).toHaveAttribute('data-testid', 'popover-content');

    // Клик по триггеру повторно — закрыть
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  },
};

export const WithTitle: Story = {
  args: {
    ...Default.args,
    title: 'Заголовок',
    content: 'Контент с заголовком',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Click me');

    await userEvent.click(trigger);

    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Заголовок');
    expect(popover).toHaveTextContent('Контент с заголовком');
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
  play: async ({ canvasElement }) => {
    const positions = ['top', 'bottom', 'left', 'right', 'center'] as const;
    for (const pos of positions) {
      // Триггеры — span[role="button"] c data-position; внутри ещё вложенный
      // <button>, поэтому ищем по data-position, а не по имени.
      const trigger = canvasElement.querySelector(
        `[data-testid="popover-trigger"][data-position="${pos}"]`
      ) as HTMLElement | null;
      expect(trigger).not.toBeNull();

      await userEvent.click(trigger as HTMLElement);

      const popover = screen.getByRole('dialog');
      expect(popover).toHaveAttribute('data-position', pos);
      expect(popover.textContent).toMatch(new RegExp(`^${pos} position`, 'i'));

      // Закрыть перед следующей итерацией
      await userEvent.click(trigger as HTMLElement);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    }
  },
};

export const Center: Story = {
  args: {
    content: 'Центрированный попап поверх триггера',
    position: 'center',
    size: 'md',
    children: <button className="px-4 py-2 bg-purple-500 text-white rounded">Center</button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Center');

    await userEvent.click(trigger);

    const popover = screen.getByRole('dialog');
    expect(popover).toHaveAttribute('data-position', 'center');
    expect(popover).toHaveTextContent('Центрированный попап поверх триггера');
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Click me');

    await userEvent.click(trigger);

    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();

    // Клик по контенту при closeOnContentClick=true — закрыть
    await userEvent.click(popover);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Disabled');

    expect(trigger.closest('[data-testid="popover-trigger"]')).toHaveAttribute('tabIndex', '-1');

    await userEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

// ─── Composition stories (CRIT#9: интеграция в Button/Icon/Avatar) ───

export const WithButton: Story = {
  args: {
    title: 'Меню',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button>Редактировать</button>
        <button>Дублировать</button>
        <button>Удалить</button>
      </div>
    ),
    children: (
      <Button variant="primary">
        Actions <Settings size={14} />
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Actions');

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Редактировать');
  },
};

export const WithIconMenu: Story = {
  args: {
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Контекстное меню для значка</span>
        <span>Настройки</span>
      </div>
    ),
    position: 'bottom',
    children: <Settings size={20} />,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-testid="popover-trigger"]') as HTMLElement;

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Контекстное меню для значка');
  },
};

export const WithAvatarProfile: Story = {
  args: {
    title: 'Профиль',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span>Настройки</span>
        <span>Выйти</span>
      </div>
    ),
    position: 'bottom',
    children: <Avatar alt="User" />,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-testid="popover-trigger"]') as HTMLElement;

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Настройки');
  },
};

export const DropdownMenu: Story = {
  args: {
    title: 'Профиль',
    position: 'bottom',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button variant="ghost" size="sm">
          Настройки
        </Button>
        <Button variant="ghost" size="sm">
          Выйти
        </Button>
      </div>
    ),
    children: <Avatar alt="Profile" />,
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-testid="popover-trigger"]') as HTMLElement;

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Настройки');
    expect(popover).toHaveTextContent('Выйти');
  },
};
