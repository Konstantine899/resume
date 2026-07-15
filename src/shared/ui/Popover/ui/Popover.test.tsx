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
});
