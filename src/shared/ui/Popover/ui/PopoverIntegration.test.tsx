// src/shared/ui/Popover/ui/PopoverIntegration.test.tsx
// CRIT#9: интеграционные тесты Popover + Button/Icon/Avatar

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Settings } from 'lucide-react';
import { Popover } from './Popover';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Avatar } from '@/shared/ui/Avatar';

// Portal рендерится inline — так видно диалог в иерархии теста
vi.mock('@/shared/ui/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="portal-mock">{children}</div>
  ),
}));

const open = async () => {
  const trigger = screen.getByTestId('popover-trigger');
  fireEvent.click(trigger);
  await waitFor(() => {
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  return screen.getByRole('dialog');
};

describe('Popover + Button/Icon/Avatar integration (CRIT#9)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('Button как триггер: открывает popover и рендерит контент', async () => {
    render(
      <Popover title="Меню" content={<span data-testid="menu">Действия</span>}>
        <Button>Actions</Button>
      </Popover>
    );

    const dialog = await open();
    expect(dialog).toHaveTextContent('Меню');
    expect(dialog).toHaveTextContent('Действия');
  });

  it('Button как триггер: переклик закрывает popover', async () => {
    render(
      <Popover content="Content A">
        <Button>Toggle</Button>
      </Popover>
    );

    await open();
    fireEvent.click(screen.getByTestId('popover-trigger'));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Icon как триггер: открывает popover', async () => {
    render(
      <Popover content={<span>Icon menu</span>}>
        <Icon name={Settings} ariaLabel="Settings menu" />
      </Popover>
    );

    await open();
    expect(screen.getByRole('dialog')).toHaveTextContent('Icon menu');
  });

  it('Avatar как триггер: открывает profile popover', async () => {
    render(
      <Popover title="Профиль" content={<span>Profile actions</span>}>
        <Avatar alt="User" />
      </Popover>
    );

    await open();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Профиль');
    expect(dialog).toHaveTextContent('Profile actions');
  });

  it('Вложенный Button кликается без конфликта с триггером', async () => {
    const innerClick = vi.fn();
    render(
      <Popover
        content={
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={innerClick}>Войти</button>
          </div>
        }
      >
        <Button>Открыть</Button>
      </Popover>
    );

    await open();

    // Клик по кнопке внутри контента — она обрабатывается, popover закрывается
    fireEvent.click(screen.getByText('Войти'));
    expect(innerClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
