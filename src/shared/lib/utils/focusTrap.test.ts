import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { focusTrap } from './focusTrap';

describe('focusTrap', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns a noop function when container is null', () => {
    const untrap = focusTrap(null);
    expect(untrap).toBeInstanceOf(Function);
    expect(() => untrap()).not.toThrow();
  });

  it('returns a noop function when container is undefined', () => {
    const untrap = focusTrap(undefined as unknown as HTMLElement);
    expect(untrap).toBeInstanceOf(Function);
    expect(() => untrap()).not.toThrow();
  });

  it('returns cleanup function for a container with no focusable elements', () => {
    const untrap = focusTrap(container);
    expect(untrap).toBeInstanceOf(Function);
    // Should not throw when calling cleanup
    expect(() => untrap()).not.toThrow();
  });

  it('wraps focus from last to first element on Tab', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);

    const untrap = focusTrap(container);
    button2.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    button2.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    untrap();
  });

  it('wraps focus from first to last element on Shift+Tab', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);

    const untrap = focusTrap(container);
    button1.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    button1.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    untrap();
  });

  it('removes event listener on cleanup', () => {
    const button = document.createElement('button');
    container.appendChild(button);

    const untrap = focusTrap(container);
    const addEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    untrap();

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('does not throw on keyboard events with empty container', () => {
    const untrap = focusTrap(container);

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
    });

    expect(() => container.dispatchEvent(event)).not.toThrow();
    untrap();
  });

  it('does not trap non-Tab keys', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);

    const untrap = focusTrap(container);

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
    });

    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    button2.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    untrap();
  });
});
