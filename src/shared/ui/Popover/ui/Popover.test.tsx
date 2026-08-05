import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Popover } from './Popover';
import { POPOVER_CONSTANTS } from '../model/constants';

// Mock Portal to render inline for testing
vi.mock('@/shared/ui/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="portal-mock">{children}</div>
  ),
}));

describe('Popover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear body before each test
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Rendering', () => {
    it('должен рендерить trigger', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('не должен рендерить popover пока не открыт', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
    });

    it('должен рендерить popover после клика на trigger', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });
    });

    it('должен рендерить content в popover', async () => {
      render(
        <Popover content="Popover Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Popover Content')).toBeInTheDocument();
      });
    });

    it('должен рендерить title когда передан', async () => {
      render(
        <Popover title="Popover Title" content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.getByText('Popover Title')).toBeInTheDocument();
      });
    });

    it('не должен рендерить title когда не передан', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByText('Popover Title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Interaction', () => {
    it('должен открывать popover по клику на trigger', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });
    });

    it('должен закрывать popover по повторному клику на trigger', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('должен закрывать popover по клику на content (closeOnContentClick=true)', async () => {
      render(
        <Popover content="Content" closeOnContentClick>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('popover-content'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('не должен закрывать popover по клику на content (closeOnContentClick=false)', async () => {
      render(
        <Popover content="Content" closeOnContentClick={false}>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('popover-content'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('должен открывать/закрывать по Enter', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.keyDown(screen.getByTestId('popover-trigger'), { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.keyDown(screen.getByTestId('popover-trigger'), { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('должен открывать/закрывать по Space', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.keyDown(screen.getByTestId('popover-trigger'), { key: ' ' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.keyDown(screen.getByTestId('popover-trigger'), { key: ' ' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('должен закрывать popover по ESC', async () => {
      render(
        <Popover content="Content" closeOnEsc>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('не должен закрывать popover по ESC (closeOnEsc=false)', async () => {
      render(
        <Popover content="Content" closeOnEsc={false}>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('не должен открывать popover когда disabled=true', async () => {
      render(
        <Popover content="Content" disabled>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('должен иметь tabIndex=-1 когда disabled', () => {
      render(
        <Popover content="Content" disabled>
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('tabIndex', '-1');
    });

    it('должен иметь tabIndex=0 когда enabled', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('tabIndex', '0');
    });

    it('не должен реагировать на клавиатуру когда disabled', async () => {
      render(
        <Popover content="Content" disabled>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.keyDown(screen.getByTestId('popover-trigger'), { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('должен иметь role="button" на trigger', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('role', 'button');
    });

    it('должен иметь aria-haspopup="dialog"', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('должен иметь aria-expanded="false" когда закрыт', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('aria-expanded', 'false');
    });

    it('должен иметь aria-expanded="true" когда открыт', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.getByTestId('popover-trigger')).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('должен иметь aria-label когда передан', () => {
      render(
        <Popover content="Content" ariaLabel="Custom label">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('aria-label', 'Custom label');
    });

    it('должен иметь role="dialog" на popover', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toHaveAttribute('role', 'dialog');
      });
    });

    it('должен иметь aria-modal="true" на popover', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toHaveAttribute('aria-modal', 'true');
      });
    });

    it('должен иметь data-position атрибут', async () => {
      render(
        <Popover content="Content" position="top">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toHaveAttribute('data-position', 'top');
      });
    });
  });

  describe('Data Attributes', () => {
    it('должен иметь data-testid="popover-trigger"', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toBeInTheDocument();
    });

    it('должен иметь data-testid="popover-content" когда открыт', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });
    });
  });

  describe('Default Props', () => {
    it('должен использовать position="top" по умолчанию', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toHaveAttribute('data-position', 'top');
      });
    });

    it('должен использовать closeOnContentClick=true по умолчанию', async () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('popover-content'));

      await waitFor(() => {
        expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
      });
    });

    it('должен использовать offset=8 по умолчанию', () => {
      expect(POPOVER_CONSTANTS.DEFAULT_OFFSET).toBe(8);
    });
  });

  describe('Dev Warnings', () => {
    it('должен предупреждать о невалидной позиции в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        // @ts-expect-error testing invalid prop
        <Popover content="Content" position="invalid">
          <button>Trigger</button>
        </Popover>
      );

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Popover: невалидная позиция'));

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('должен предупреждать о невалидном размере в dev режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        // @ts-expect-error testing invalid prop
        <Popover content="Content" size="xl">
          <button>Trigger</button>
        </Popover>
      );

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Popover: невалидный размер'));

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });

    it('не должен предупреждать в production режиме', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        // @ts-expect-error testing invalid prop
        <Popover content="Content" position="invalid">
          <button>Trigger</button>
        </Popover>
      );

      expect(warnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      warnSpy.mockRestore();
    });
  });

  describe('displayName', () => {
    it('должен иметь displayName', () => {
      expect(Popover.displayName).toBe('Popover');
    });
  });

  describe('Polymorphic API', () => {
    it('должен рендерить триггер как <a> с href при as="a"', () => {
      render(
        <Popover as="a" href="/profile" content="Content">
          Link
        </Popover>
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger.tagName).toBe('A');
      expect(trigger).toHaveAttribute('href', '/profile');
    });

    it('должен форвардить ref на триггер с типом элемента из as', () => {
      const ref = { current: null as HTMLAnchorElement | null };
      render(
        <Popover as="a" ref={ref} content="Content">
          Link
        </Popover>
      );

      expect(ref.current).not.toBeNull();
      expect(ref.current instanceof HTMLAnchorElement).toBe(true);
    });

    it('должен по умолчанию рендерить <span> триггер', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger').tagName).toBe('SPAN');
    });

    it('должен сохранять элемент-специфичные пропсы при as="a"', async () => {
      render(
        <Popover as="a" href="/x" target="_blank" content="Content">
          Link
        </Popover>
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger).toHaveAttribute('target', '_blank');
      expect(trigger).toHaveAttribute('role', 'button');
    });

    it('должен поддерживать custom component через as', () => {
      const CustomLink = ({
        children,
        ...props
      }: React.ComponentProps<'a'>): React.ReactElement => (
        <a data-custom="true" {...props}>
          {children}
        </a>
      );

      render(
        <Popover as={CustomLink} href="/custom" content="Content">
          Custom
        </Popover>
      );

      const trigger = screen.getByTestId('popover-trigger');
      expect(trigger.tagName).toBe('A');
      expect(trigger).toHaveAttribute('data-custom', 'true');
      expect(trigger).toHaveAttribute('href', '/custom');
    });

    it('должен вызывать пользовательский onClick вместе с popover-обработчиком (M1)', () => {
      const userClick = vi.fn();
      render(
        <Popover onClick={userClick} content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));

      expect(userClick).toHaveBeenCalledTimes(1);
      // Поповер тоже сработал (открылся)
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('должен вызывать пользовательский onKeyDown вместе с popover-обработчиком (M1)', () => {
      const userKeyDown = vi.fn();
      render(
        <Popover onKeyDown={userKeyDown} content="Content">
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.keyDown(screen.getByTestId('popover-trigger'), { key: 'Enter' });

      expect(userKeyDown).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('должен ставить aria-disabled=true при disabled (Mi2)', () => {
      render(
        <Popover disabled content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).toHaveAttribute('aria-disabled', 'true');
    });

    it('не должен ставить aria-disabled когда не disabled', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('popover-trigger')).not.toHaveAttribute('aria-disabled');
    });

    it('должен отражать auto-adjust во data-position монолита (M2)', async () => {
      // Монолит с position="top" у края viewport: usePopover флипает на bottom.
      // Content должен читать adjustedPosition из контекста, а не статичный position.
      render(
        <Popover position="top" content="Content">
          <button>Trigger</button>
        </Popover>
      );

      const trigger = screen.getByTestId('popover-trigger');
      fireEvent.click(trigger);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        // В jsdom viewport 0x0 — autoAdjust флипает top на bottom
        expect(dialog).toHaveAttribute('data-position', 'bottom');
      });
    });
  });

  describe('Compound API (статики)', () => {
    it('должен экспортировать Provider/Trigger/Content как статики', () => {
      expect(Popover.Provider).toBeDefined();
      expect(Popover.Trigger).toBeDefined();
      expect(Popover.Content).toBeDefined();
    });

    it('должен сохранять монолитную работу через compound части', async () => {
      render(
        <Popover.Provider position="bottom">
          <Popover.Trigger as="button">
            <span>Compound</span>
          </Popover.Trigger>
          <Popover.Content>Compound content</Popover.Content>
        </Popover.Provider>
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveTextContent('Compound content');
        expect(dialog).toHaveAttribute('data-position', 'bottom');
      });
    });
  });
});
