import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LiveClock } from './LiveClock';

describe('LiveClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default testid, localized label and a time value', () => {
    render(<LiveClock />);
    const block = screen.getByTestId('live-clock');
    expect(block).toBeInTheDocument();
    // i18n default language in tests is en (fallbackLng) — locale parity
    // for the key itself is covered by locales-parity.test.ts.
    expect(screen.getByText('Local time')).toBeInTheDocument();
    const time = block.querySelector('time');
    expect(time).not.toBeNull();
    expect(time?.textContent).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    expect(time?.getAttribute('datetime')).toMatch(/^\d{4}-/);
  });

  it('updates the displayed time on every tick', () => {
    const { container } = render(<LiveClock />);
    const time = container.querySelector('time');
    const before = time?.textContent;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(time?.textContent).toBeDefined();
    expect(time?.textContent).not.toBe(before);
  });

  it('clears the interval on unmount', () => {
    const { unmount } = render(<LiveClock />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('merges custom className', () => {
    render(<LiveClock className="custom" />);
    expect(screen.getByTestId('live-clock')).toHaveClass('custom');
  });

  it('renders children', () => {
    render(<LiveClock>child content</LiveClock>);
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
