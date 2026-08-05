// src/shared/ui/Tooltip/ui/TooltipCompound.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tooltip } from './Tooltip';

// Моки для debounce — синхронное выполнение для тестов
vi.mock('@/shared/lib/utils/debounce', () => ({
  debounce: vi.fn((fn) => {
    const mocked = Object.assign(vi.fn(fn), { cancel: vi.fn() });
    return mocked;
  }),
}));

describe('Tooltip compound API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('должен рендерить trigger и показывать content через hover', async () => {
    render(
      <Tooltip.Provider position="top">
        <Tooltip.Trigger>
          <button>Compound trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Compound tooltip
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Provider>
    );

    const trigger = screen.getByText('Compound trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Compound tooltip');
  });

  it('должен рендерить trigger и content как вложенные части монолита', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip.Trigger asChild>
          <button>Child trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Child content</Tooltip.Content>
      </Tooltip.Provider>
    );

    const trigger = screen.getByRole('button', { name: 'Child trigger' });
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('должен рендерить Arrow внутри Content с data-атрибутами', async () => {
    render(
      <Tooltip.Provider position="top">
        <Tooltip.Trigger asChild>
          <button>Arrow trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Arrow tooltip
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Provider>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const arrow = document.querySelector('[data-tooltip-arrow]');
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveAttribute('data-position', 'top');
    });
  });

  it('должен скрывать content когда disabled', async () => {
    render(
      <Tooltip.Provider disabled>
        <Tooltip.Trigger asChild>
          <button>Disabled trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Disabled tooltip</Tooltip.Content>
      </Tooltip.Provider>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('должен рендерить trigger вне Provider без падения', () => {
    render(
      <Tooltip.Trigger asChild>
        <button>Orphan trigger</button>
      </Tooltip.Trigger>
    );

    expect(screen.getByRole('button', { name: 'Orphan trigger' })).toBeInTheDocument();
  });

  it('должен рендерить content вне Provider как null', () => {
    const { container } = render(<Tooltip.Content>Orphan content</Tooltip.Content>);

    expect(container).toBeEmptyDOMElement();
  });

  it('должен сохранять монолит как behavioral-noop (content prop)', async () => {
    render(
      <Tooltip content="Monolith tooltip">
        <button>Monolith trigger</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByText('Monolith trigger'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Monolith tooltip');
    });
  });

  it('должен применять color из Provider через CSS-переменную', async () => {
    render(
      <Tooltip.Provider color="#0ea5e9">
        <Tooltip.Trigger>
          <button>Color trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          Color tooltip
          <Tooltip.Arrow />
        </Tooltip.Content>
      </Tooltip.Provider>
    );

    fireEvent.mouseEnter(screen.getByText('Color trigger'));

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveStyle({ '--tooltip-bg': '#0ea5e9' });
    });
  });

  it('должен пробрасывать aria-describedby на триггер через asChild', async () => {
    render(
      <Tooltip.Provider>
        <Tooltip.Trigger asChild>
          <button>Aria trigger</button>
        </Tooltip.Trigger>
        <Tooltip.Content>Aria tooltip</Tooltip.Content>
      </Tooltip.Provider>
    );

    fireEvent.mouseEnter(screen.getByRole('button'));

    await waitFor(() => {
      const trigger = screen.getByRole('button');
      const tooltip = screen.getByRole('tooltip');
      expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    });
  });
});
