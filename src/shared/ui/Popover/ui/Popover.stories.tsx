import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from '@storybook/test';
import { createElement } from 'react';
import { Info, Mail, Settings, User } from 'lucide-react';
import { AvatarHero } from '@/shared/ui/Avatar';
import { Button, IconButton } from '@/shared/ui/Button';
import { Code } from '@/shared/ui/Code';
import { ContactCard } from '@/shared/ui/Card';
import { Link } from '@/shared/ui/Link';
import { Paragraph } from '@/shared/ui/Paragraph';
import { Tooltip } from '@/shared/ui/Tooltip';
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

// ─── Basic Stories ───

export const Default: Story = {
  args: {
    content: <Paragraph>Это содержимое попапа</Paragraph>,
    position: 'top',
    size: 'md',
    children: <Button variant="primary">Click me</Button>,
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
    content: (
      <>
        <Paragraph size="m" theme="primary">
          Контент с заголовком
        </Paragraph>
      </>
    ),
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
    content: <Paragraph size="s">Маленький попап</Paragraph>,
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    content: (
      <Paragraph>
        Большой попап с длинным контентом для демонстрации максимального размера
      </Paragraph>
    ),
  },
};

export const AllPositions: Story = {
  args: {
    content: <Paragraph>Position test</Paragraph>,
    children: <Button variant="outline">Click</Button>,
  },
  render: (args) => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Popover {...args} position="top" content={<Paragraph>Top position</Paragraph>}>
        <Button variant="outline">Top</Button>
      </Popover>
      <Popover {...args} position="bottom" content={<Paragraph>Bottom position</Paragraph>}>
        <Button variant="outline">Bottom</Button>
      </Popover>
      <Popover {...args} position="left" content={<Paragraph>Left position</Paragraph>}>
        <Button variant="outline">Left</Button>
      </Popover>
      <Popover {...args} position="right" content={<Paragraph>Right position</Paragraph>}>
        <Button variant="outline">Right</Button>
      </Popover>
      <Popover {...args} position="center" content={<Paragraph>Center position</Paragraph>}>
        <Button variant="outline">Center</Button>
      </Popover>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const positions = ['top', 'bottom', 'left', 'right', 'center'] as const;
    for (const pos of positions) {
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
    content: <Paragraph>Центрированный попап поверх триггера</Paragraph>,
    position: 'center',
    size: 'md',
    children: <Button variant="primary">Center</Button>,
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

// ─── Icon Stories ───

export const WithIcon: Story = {
  args: {
    content: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {createElement(Info, { size: 16, 'aria-hidden': 'true' })}
        <Paragraph size="m">Информация</Paragraph>
      </div>
    ),
    children: <IconButton icon={createElement(Settings, {})} ariaLabel="Settings" />,
  },
};

export const WithComplexContent: Story = {
  args: {
    title: 'Профиль',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} aria-hidden="true" />
          <Paragraph size="m">Пользователь</Paragraph>
        </div>
        <Paragraph size="xs" theme="muted">
          user@example.com
        </Paragraph>
      </div>
    ),
    children: <Button variant="primary">Профиль</Button>,
  },
};

// ─── Behavior Stories ───

export const CloseOnContentClick: Story = {
  args: {
    ...Default.args,
    closeOnContentClick: true,
    content: <Paragraph>Кликни здесь чтобы закрыть</Paragraph>,
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
    content: <Paragraph>Этот попап не закроется при клике</Paragraph>,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    children: (
      <Button variant="primary" disabled>
        Disabled
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Disabled');

    expect(trigger.closest('[data-testid="popover-trigger"]')).toHaveAttribute('tabIndex', '-1');

    await userEvent.click(trigger);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

// ─── Composition Stories (CRIT#9: интеграция в Button/Icon/Avatar) ───

export const WithButton: Story = {
  args: {
    title: 'Меню',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button variant="ghost" size="sm">
          Редактировать
        </Button>
        <Button variant="ghost" size="sm">
          Дублировать
        </Button>
        <Button variant="ghost" size="sm">
          Удалить
        </Button>
      </div>
    ),
    children: (
      <Button variant="primary">
        Actions <Settings size={14} aria-hidden="true" />
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
        <Paragraph size="m">Контекстное меню для значка</Paragraph>
        <Button variant="ghost" size="sm">
          Настройки
        </Button>
      </div>
    ),
    position: 'bottom',
    children: <IconButton icon={createElement(Settings, {})} ariaLabel="Settings menu" />,
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
        <Button variant="ghost" size="sm">
          Настройки
        </Button>
        <Button variant="ghost" size="sm">
          Выйти
        </Button>
      </div>
    ),
    position: 'bottom',
    children: <AvatarHero alt="User" size="xl" />,
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
    children: <AvatarHero alt="Profile" size="xl" />,
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

// ─── Real-world Pattern Stories (новые) ───

export const WithLink: Story = {
  args: {
    title: 'Навигация',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link href="#about" variant="ghost" underline="hover">
          О себе
        </Link>
        <Link href="#contact" variant="ghost" underline="hover">
          Контакты
        </Link>
      </div>
    ),
    position: 'right',
    children: (
      <Link href="#home" variant="ghost" underline="never">
        K
      </Link>
    ),
  },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-testid="popover-trigger"]') as HTMLElement;

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Навигация');
  },
};

export const WithContactCard: Story = {
  args: {
    content: (
      <ContactCard title="Контакты" icon={createElement(Mail, { size: 24, 'aria-hidden': 'true' })}>
        <Paragraph size="s" theme="muted">
          Я всегда открыт для обсуждения новых проектов
        </Paragraph>
      </ContactCard>
    ),
    position: 'top',
    children: <Button variant="primary">Связаться</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Связаться');

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Контакты');
  },
};

export const WithCode: Story = {
  args: {
    title: 'Навыки',
    content: (
      <Code variant="block" language="typescript" copyable={false}>
        {`const skills = ['React', 'TypeScript', 'Node.js'];`}
      </Code>
    ),
    position: 'bottom',
    children: <Button variant="outline">Показать навыки</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Показать навыки');

    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Навыки');
    expect(popover).toHaveTextContent('const skills');
  },
};

export const WithTooltipAndPopover: Story = {
  args: {
    title: 'Подсказка + Поповер',
    content: <Paragraph>Дополнительная информация</Paragraph>,
    position: 'right',
    children: (
      <Tooltip content="Нажми для меню" position="top">
        <Button variant="primary">Меню</Button>
      </Tooltip>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Меню');

    // Клик для открытия Popover (Tooltip на hover/focus)
    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    expect(popover).toBeInTheDocument();
    expect(popover).toHaveTextContent('Подсказка + Поповер');
  },
};
