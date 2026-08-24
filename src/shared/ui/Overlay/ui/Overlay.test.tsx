import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Overlay } from './Overlay';
import { createRef } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readScss(filename: string): string {
  return readFileSync(resolve(__dirname, filename), 'utf-8');
}

describe('Overlay', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ============================================
  // Existing Tests
  // ============================================

  it('renders with default visible state and accessibility attributes', () => {
    render(
      <Overlay>
        <div>content</div>
      </Overlay>
    );

    const overlay = screen.getByTestId('overlay');

    expect(overlay).toHaveAttribute('data-visible', 'true');
    expect(overlay).not.toHaveAttribute('aria-hidden');
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

  it('does not apply cursor pointer class when onClick is not provided', () => {
    render(<Overlay />);

    const overlay = screen.getByTestId('overlay');

    expect(overlay.className).not.toMatch(/clickable/);
  });

  it('applies clickable class when onClick is provided', () => {
    render(<Overlay onClick={() => {}} />);

    const overlay = screen.getByTestId('overlay');

    expect(overlay.className).toMatch(/clickable/);
  });

  it('calls onKeyDown handler when a key is pressed', () => {
    const handleKeyDown = vi.fn();

    render(<Overlay onKeyDown={handleKeyDown} />);

    const overlay = screen.getByTestId('overlay');
    fireEvent.keyDown(overlay, { key: 'Escape' });

    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the overlay div', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Overlay ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('data-testid', 'overlay');
  });

  it('sets data-blur attribute when blur is true', () => {
    render(<Overlay blur />);
    const overlay = screen.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-blur');
  });

  it('does not set data-blur attribute when blur is false', () => {
    render(<Overlay blur={false} />);
    const overlay = screen.getByTestId('overlay');
    expect(overlay).not.toHaveAttribute('data-blur');
  });

  it('sets data-dark attribute when dark is true', () => {
    render(<Overlay dark />);
    const overlay = screen.getByTestId('overlay');
    expect(overlay).toHaveAttribute('data-dark');
  });

  it('does not set data-dark attribute when dark is false', () => {
    render(<Overlay dark={false} />);
    const overlay = screen.getByTestId('overlay');
    expect(overlay).not.toHaveAttribute('data-dark');
  });

  it('sets aria-hidden when no children are present', () => {
    render(<Overlay />);
    const overlay = screen.getByTestId('overlay');
    expect(overlay).toHaveAttribute('aria-hidden', 'true');
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
      render(<Overlay blur dark />);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Overlay]'));
    });

    it('does not warn when only blur is used', () => {
      render(<Overlay blur dark={false} />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn when only dark is used', () => {
      render(<Overlay blur={false} dark />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('does not warn in production mode when blur and dark are combined', () => {
      process.env.NODE_ENV = 'production';
      render(<Overlay blur dark />);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // OVR-01: Escape Dismiss
  // ============================================

  describe('OVR-01: Escape dismiss', () => {
    it('calls onEscapeKeyDown when Escape is pressed', () => {
      const handleEscape = vi.fn();
      render(<Overlay onEscapeKeyDown={handleEscape} />);

      const overlay = screen.getByTestId('overlay');
      fireEvent.keyDown(overlay, { key: 'Escape' });

      expect(handleEscape).toHaveBeenCalledTimes(1);
    });

    it('calls onEscapeKeyDown before onKeyDown', () => {
      const callOrder: string[] = [];
      const handleEscape = vi.fn(() => callOrder.push('escape'));
      const handleKeyDown = vi.fn(() => callOrder.push('keydown'));

      render(<Overlay onEscapeKeyDown={handleEscape} onKeyDown={handleKeyDown} />);

      const overlay = screen.getByTestId('overlay');
      fireEvent.keyDown(overlay, { key: 'Escape' });

      expect(callOrder).toEqual(['escape', 'keydown']);
    });

    it('does not call onEscapeKeyDown for non-Escape keys', () => {
      const handleEscape = vi.fn();
      render(<Overlay onEscapeKeyDown={handleEscape} />);

      const overlay = screen.getByTestId('overlay');
      fireEvent.keyDown(overlay, { key: 'Enter' });

      expect(handleEscape).not.toHaveBeenCalled();
    });

    it('still calls onKeyDown for non-Escape keys', () => {
      const handleKeyDown = vi.fn();
      render(<Overlay onKeyDown={handleKeyDown} />);

      const overlay = screen.getByTestId('overlay');
      fireEvent.keyDown(overlay, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // OVR-02: z-index prop
  // ============================================

  describe('OVR-02: z-index prop', () => {
    it('applies custom zIndex via inline style', () => {
      render(<Overlay zIndex={5000} />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay.style.zIndex).toBe('5000');
    });

    it('applies default zIndex from constants when not provided', () => {
      render(<Overlay />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay.style.zIndex).toBe('1000');
    });

    it('sets data-animation attribute', () => {
      render(<Overlay />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveAttribute('data-animation', 'fade');
    });
  });

  // ============================================
  // OVR-03: Unmount on exit
  // ============================================

  describe('OVR-03: Unmount on exit', () => {
    it('renders nothing when unmountOnExit=true and visible=false', () => {
      const { container } = render(<Overlay unmountOnExit visible={false} />);
      expect(container.innerHTML).toBe('');
    });

    it('renders overlay when unmountOnExit=true and visible=true', () => {
      render(<Overlay unmountOnExit visible={true} />);
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });

    it('renders overlay when unmountOnExit=false and visible=false', () => {
      render(<Overlay unmountOnExit={false} visible={false} />);
      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });
  });

  // ============================================
  // OVR-04: Transition control
  // ============================================

  describe('OVR-04: Transition control', () => {
    it('applies custom transition duration via CSS variable', () => {
      render(<Overlay transitionDuration={0.5} />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay.style.getPropertyValue('--overlay-duration')).toBe('0.5s');
    });

    it('applies default transition duration from constants when not provided', () => {
      render(<Overlay />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay.style.getPropertyValue('--overlay-duration')).toBe('0.2s');
    });
  });

  // ============================================
  // OVR-05: Animation callbacks
  // ============================================

  describe('OVR-05: Animation callbacks', () => {
    it('calls onOpen when visible becomes true', () => {
      const onOpen = vi.fn();
      const { rerender } = render(<Overlay visible={false} onOpen={onOpen} />);
      expect(onOpen).not.toHaveBeenCalled();

      rerender(<Overlay visible={true} onOpen={onOpen} />);
      expect(onOpen).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when visible becomes false', () => {
      const onClose = vi.fn();
      const { rerender } = render(<Overlay visible={true} onClose={onClose} />);
      expect(onClose).not.toHaveBeenCalled();

      rerender(<Overlay visible={false} onClose={onClose} />);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onOpen on initial render when visible=true', () => {
      const onOpen = vi.fn();
      render(<Overlay visible={true} onOpen={onOpen} />);
      expect(onOpen).not.toHaveBeenCalled();
    });

    it('does not call onClose on initial render when visible=false', () => {
      const onClose = vi.fn();
      render(<Overlay visible={false} onClose={onClose} />);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // OVR-07: prefers-reduced-motion test
  // ============================================

  describe('Reduced Motion — Source Guard', () => {
    it('has @media (prefers-reduced-motion: reduce) block with transition: none', () => {
      const scss = readScss('./Overlay.module.scss');
      const mediaBlockMatch = scss.match(
        /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*?)\}/
      );
      expect(mediaBlockMatch).toBeTruthy();

      const mediaContent = mediaBlockMatch?.[1] ?? '';
      expect(mediaContent).toMatch(/transition\s*:\s*none/);
    });

    it('has reduced-motion handling in scale animation', () => {
      const scss = readScss('./Overlay.module.scss');
      // Find the data-animation='scale' block and its nested reduced-motion
      const scaleBlock = scss.match(/&\[data-animation='scale'\]\s*\{([\s\S]*?)\n\s*\}/);
      expect(scaleBlock).toBeTruthy();
      const scaleContent = scaleBlock?.[1] ?? '';
      expect(scaleContent).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
      expect(scaleContent).toMatch(/transition\s*:\s*none/);
    });

    it('has reduced-motion handling in slide animation', () => {
      const scss = readScss('./Overlay.module.scss');
      const slideBlock = scss.match(/&\[data-animation='slide'\]\s*\{([\s\S]*?)\n\s*\}/);
      expect(slideBlock).toBeTruthy();
      const slideContent = slideBlock?.[1] ?? '';
      expect(slideContent).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
      expect(slideContent).toMatch(/transition\s*:\s*none/);
    });
  });

  // ============================================
  // OVR-08: Body scroll lock
  // ============================================

  describe('OVR-08: Body scroll lock', () => {
    it('sets body overflow to hidden when preventScroll=true and visible=true', () => {
      render(<Overlay preventScroll visible={true} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow on cleanup', () => {
      document.body.style.overflow = 'auto';
      const { unmount } = render(<Overlay preventScroll visible={true} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('auto');
    });

    it('does not lock scroll when preventScroll=false', () => {
      document.body.style.overflow = 'auto';
      render(<Overlay preventScroll={false} visible={true} />);
      expect(document.body.style.overflow).toBe('auto');
    });

    it('does not lock scroll when visible=false', () => {
      document.body.style.overflow = 'auto';
      render(<Overlay preventScroll visible={false} />);
      expect(document.body.style.overflow).toBe('auto');
    });

    it('does not restore overflow until all overlays are unmounted', () => {
      document.body.style.overflow = 'auto';
      const { unmount: unmount1 } = render(<Overlay preventScroll visible={true} />);
      const { unmount: unmount2 } = render(<Overlay preventScroll visible={true} />);
      expect(document.body.style.overflow).toBe('hidden');

      unmount1();
      expect(document.body.style.overflow).toBe('hidden');

      unmount2();
      expect(document.body.style.overflow).toBe('auto');
    });
  });

  // ============================================
  // Pointer-events when not visible
  // ============================================

  describe('Pointer-events when not visible', () => {
    it('does not have pointer-events: none when visible', () => {
      render(<Overlay visible={true} />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay).not.toHaveStyle({ pointerEvents: 'none' });
    });

    it('SCSS disables pointer-events when data-visible is not true', () => {
      const scss = readScss('./Overlay.module.scss');
      expect(scss).toMatch(/&:not\(\[data-visible='true'\]\)\s*\{[^}]*pointer-events:\s*none/);
    });
  });

  // ============================================
  // OVR-09: Container/Portal
  // ============================================

  describe('OVR-09: Container/Portal', () => {
    it('renders into container via portal when container is provided', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      render(
        <Overlay container={container}>
          <span>portal content</span>
        </Overlay>
      );

      expect(container.querySelector('[data-testid="overlay"]')).toBeTruthy();
      expect(container.textContent).toBe('portal content');

      document.body.removeChild(container);
    });

    it('renders normally when container is null', () => {
      render(
        <Overlay container={null}>
          <span>normal content</span>
        </Overlay>
      );

      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });

    it('renders normally when container is undefined', () => {
      render(
        <Overlay>
          <span>normal content</span>
        </Overlay>
      );

      expect(screen.getByTestId('overlay')).toBeInTheDocument();
    });
  });

  // ============================================
  // OVR-10: CSS animation presets
  // ============================================

  describe('OVR-10: CSS animation presets', () => {
    it('defaults data-animation to fade', () => {
      render(<Overlay />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveAttribute('data-animation', 'fade');
    });

    it('sets data-animation to scale', () => {
      render(<Overlay animation="scale" />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveAttribute('data-animation', 'scale');
    });

    it('sets data-animation to slide', () => {
      render(<Overlay animation="slide" />);
      const overlay = screen.getByTestId('overlay');
      expect(overlay).toHaveAttribute('data-animation', 'slide');
    });

    it('SCSS contains scale animation preset', () => {
      const scss = readScss('./Overlay.module.scss');
      expect(scss).toMatch(/data-animation='scale'/);
      expect(scss).toMatch(/transform\s*:\s*scale\(0\.95\)/);
    });

    it('SCSS contains slide animation preset', () => {
      const scss = readScss('./Overlay.module.scss');
      expect(scss).toMatch(/data-animation='slide'/);
      expect(scss).toMatch(/transform\s*:\s*translateY\(-10px\)/);
    });
  });

  // ============================================
  // Integration: combined props
  // ============================================

  describe('Integration: combined props', () => {
    it('supports all new props together', () => {
      const onEscapeKeyDown = vi.fn();
      const onOpen = vi.fn();
      const onClose = vi.fn();

      const { rerender } = render(
        <Overlay
          zIndex={2000}
          transitionDuration={0.3}
          animation="scale"
          onEscapeKeyDown={onEscapeKeyDown}
          onOpen={onOpen}
          onClose={onClose}
          onClick={() => {}}
          visible={false}
        />
      );

      const overlay = screen.getByTestId('overlay');
      expect(overlay.style.zIndex).toBe('2000');
      expect(overlay.style.getPropertyValue('--overlay-duration')).toBe('0.3s');
      expect(overlay).toHaveAttribute('data-animation', 'scale');
      expect(overlay.className).toMatch(/clickable/);

      rerender(
        <Overlay
          zIndex={2000}
          transitionDuration={0.3}
          animation="scale"
          onEscapeKeyDown={onEscapeKeyDown}
          onOpen={onOpen}
          onClose={onClose}
          onClick={() => {}}
          visible={true}
        />
      );

      expect(onOpen).toHaveBeenCalledTimes(1);
    });
  });
});
