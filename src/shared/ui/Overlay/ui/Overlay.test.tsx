import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Overlay } from './Overlay';

describe('Overlay', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders with default visible state and accessibility attributes', () => {
    render(
      <Overlay>
        <div>content</div>
      </Overlay>
    );

    const overlay = screen.getByTestId('overlay');

    expect(overlay).toHaveAttribute('data-visible', 'true');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
    expect(overlay).toHaveAttribute('role', 'presentation');
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('sets data-visible to false when visible={false}', () => {
    render(<Overlay visible={false} />);

    const overlay = screen.getByTestId('overlay');

    expect(overlay).toHaveAttribute('data-visible', 'false');
  });

  it('applies blur class when blur is true', () => {
    const { container } = render(<Overlay blur={true} />);
    const overlay = container.firstChild as HTMLElement;

    expect(overlay.className).toMatch(/blur/);
  });

  it('applies dark class when dark is true', () => {
    const { container } = render(<Overlay dark={true} />);
    const overlay = container.firstChild as HTMLElement;

    expect(overlay.className).toMatch(/dark/);
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Overlay onClick={handleClick} />);

    const overlay = screen.getByTestId('overlay');
    await user.click(overlay);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not apply cursor pointer inline style when onClick is not provided', () => {
    render(<Overlay />);

    const overlay = screen.getByTestId('overlay');

    expect(overlay.style.cursor).not.toBe('pointer');
  });

  it('calls onKeyDown handler when a key is pressed', () => {
    const handleKeyDown = vi.fn();

    render(<Overlay onKeyDown={handleKeyDown} />);

    const overlay = screen.getByTestId('overlay');
    fireEvent.keyDown(overlay, { key: 'Escape' });

    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  describe('Development Warnings', () => {
    const originalEnv = process.env.NODE_ENV;
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      consoleWarnSpy.mockRestore();
    });

    it('warns when both blur and dark are used together', () => {
      render(<Overlay blur={true} dark={true} />);

      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Overlay]'));
    });

    it('does not warn when only blur is used', () => {
      render(<Overlay blur={true} dark={false} />);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn when only dark is used', () => {
      render(<Overlay blur={false} dark={true} />);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
