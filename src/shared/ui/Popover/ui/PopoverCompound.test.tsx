// src/shared/ui/Popover/ui/PopoverCompound.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Popover } from './Popover';

describe('Popover compound API', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен рендерить trigger и показывать content через click', async () => {
    render(
      <Popover.Provider position="top" autoAdjust={false}>
        <Popover.Trigger>
          <button>Compound trigger</button>
        </Popover.Trigger>
        <Popover.Content>Compound popover</Popover.Content>
      </Popover.Provider>
    );

    const trigger = screen.getByTestId('popover-trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog')).toHaveTextContent('Compound popover');
    expect(screen.getByRole('dialog')).toHaveAttribute('data-position', 'top');
  });

  it('должен рендерить trigger и content как вложенные части монолита', async () => {
    render(
      <Popover.Provider>
        <Popover.Trigger as="button">
          <span>Child trigger</span>
        </Popover.Trigger>
        <Popover.Content>Child content</Popover.Content>
      </Popover.Provider>
    );

    const trigger = screen.getByRole('button', { name: 'Child trigger' });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog')).toHaveTextContent('Child content');
  });

  it('должен рендерить title внутри Content', async () => {
    render(
      <Popover.Provider>
        <Popover.Trigger as="button">
          <span>Title trigger</span>
        </Popover.Trigger>
        <Popover.Content title="Заголовок">Title content</Popover.Content>
      </Popover.Provider>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Заголовок');
      expect(screen.getByRole('dialog')).toHaveTextContent('Title content');
    });
  });

  it('должен скрывать content когда disabled', () => {
    render(
      <Popover.Provider disabled>
        <Popover.Trigger as="button">
          <span>Disabled trigger</span>
        </Popover.Trigger>
        <Popover.Content>Disabled popover</Popover.Content>
      </Popover.Provider>
    );

    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('popover-trigger')).toHaveAttribute('tabIndex', '-1');
  });

  it('должен рендерить trigger вне Provider без падения', () => {
    render(
      <Popover.Trigger as="button">
        <span>Orphan trigger</span>
      </Popover.Trigger>
    );

    expect(screen.getByRole('button', { name: 'Orphan trigger' })).toBeInTheDocument();
  });

  it('должен рендерить content вне Provider как null', () => {
    const { container } = render(<Popover.Content>Orphan content</Popover.Content>);

    expect(container).toBeEmptyDOMElement();
  });

  it('должен сохранять монолит как behavioral-noop (content prop)', async () => {
    render(
      <Popover content="Monolith popover">
        <button>Monolith trigger</button>
      </Popover>
    );

    fireEvent.click(screen.getByText('Monolith trigger'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveTextContent('Monolith popover');
    });
  });

  it('должен применять overlayClassName на контенте', async () => {
    render(
      <Popover.Provider>
        <Popover.Trigger as="button">
          <span>Overlay trigger</span>
        </Popover.Trigger>
        <Popover.Content overlayClassName="custom-overlay-class">Overlay content</Popover.Content>
      </Popover.Provider>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toHaveClass('custom-overlay-class');
    });
  });

  it('должен применять overlayStyle без перезаписи позиции', async () => {
    render(
      <Popover.Provider position="bottom">
        <Popover.Trigger as="button">
          <span>Style trigger</span>
        </Popover.Trigger>
        <Popover.Content overlayStyle={{ color: 'red', top: '999px' }}>
          Style content
        </Popover.Content>
      </Popover.Provider>
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      // jsdom хранит inline style как строку
      expect(dialog.style.color).toBe('red');
      // top НЕ должен быть перезаписан overlayStyle (защита позиции)
      expect(dialog.style.top).not.toBe('999px');
    });
  });
});
