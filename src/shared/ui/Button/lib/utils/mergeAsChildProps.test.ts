// src/shared/ui/Button/lib/utils/mergeAsChildProps.test.ts

// Disable no-script-url: dangerous javascript: values are intentional
// test fixtures for sanitizeHref — asserting they are REJECTED.
/* eslint-disable no-script-url */

import { createElement } from 'react';
import type { KeyboardEventHandler, MouseEventHandler, ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isInteractiveElement, mergeAsChildProps } from './mergeAsChildProps';
import type { MergeAsChildPropsOptions } from './mergeAsChildProps';

describe('isInteractiveElement', () => {
  it('returns true for native interactive tags', () => {
    expect(isInteractiveElement('a')).toBe(true);
    expect(isInteractiveElement('button')).toBe(true);
    expect(isInteractiveElement('input')).toBe(true);
    expect(isInteractiveElement('select')).toBe(true);
    expect(isInteractiveElement('textarea')).toBe(true);
  });

  it('returns false for non-interactive tags', () => {
    expect(isInteractiveElement('div')).toBe(false);
    expect(isInteractiveElement('span')).toBe(false);
    expect(isInteractiveElement('p')).toBe(false);
  });

  it('returns false for composite components', () => {
    const Component = (): null => null;

    expect(isInteractiveElement(Component)).toBe(false);
    expect(isInteractiveElement(undefined)).toBe(false);
  });
});

describe('mergeAsChildProps', () => {
  let handleClick: ReturnType<typeof vi.fn>;
  let handleKeyDown: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    handleClick = vi.fn();
    handleKeyDown = vi.fn();
  });

  const buildOptions = (
    child: ReactElement,
    overrides: Partial<MergeAsChildPropsOptions> = {}
  ): MergeAsChildPropsOptions => ({
    child,
    buttonClassName: 'button primary md',
    disabledClassName: 'disabled',
    dataTestId: 'button',
    handleClick: handleClick as unknown as MouseEventHandler,
    handleKeyDown: handleKeyDown as unknown as KeyboardEventHandler<HTMLElement>,
    isDisabled: false,
    loading: false,
    ...overrides,
  });

  it('merges the button className with the child className', () => {
    const child = createElement('div', { className: 'child-class' });

    const merged = mergeAsChildProps(buildOptions(child));

    expect(merged.className).toBe('button primary md child-class');
  });

  it('adds the disabled modifier class only when disabled', () => {
    const child = createElement('div');

    const enabled = mergeAsChildProps(buildOptions(child));
    const disabled = mergeAsChildProps(buildOptions(child, { isDisabled: true }));

    expect(enabled.className).not.toContain('disabled');
    expect(disabled.className).toContain('disabled');
  });

  it('sets the state attributes from isDisabled and loading', () => {
    const child = createElement('div');

    const idle = mergeAsChildProps(buildOptions(child));
    const busy = mergeAsChildProps(buildOptions(child, { isDisabled: true, loading: true }));

    expect(idle['aria-disabled']).toBeUndefined();
    expect(idle['aria-busy']).toBeUndefined();
    expect(idle['data-state']).toBe('idle');
    expect(busy['aria-disabled']).toBe(true);
    expect(busy['aria-busy']).toBe(true);
    expect(busy['data-state']).toBe('loading');
    expect(busy['data-testid']).toBe('button');
  });

  it('adds role, tabIndex and an activation handler for a non-interactive child', () => {
    const child = createElement('div');

    const merged = mergeAsChildProps(buildOptions(child));

    expect(merged.role).toBe('button');
    expect(merged.tabIndex).toBe(0);
    expect(merged.onKeyDown).toBeTypeOf('function');
  });

  it('keeps native semantics for an interactive child', () => {
    const child = createElement('a', { href: '/about' });

    const merged = mergeAsChildProps(buildOptions(child));

    expect(merged).not.toHaveProperty('role');
    expect(merged).not.toHaveProperty('tabIndex');
    expect(merged).not.toHaveProperty('onKeyDown');
  });

  it('wires the guarded click handler', () => {
    const child = createElement('div');

    const merged = mergeAsChildProps(buildOptions(child));

    expect(merged.onClick).toBe(handleClick);
  });

  it('merges extraProps before restProps so caller props win', () => {
    const child = createElement('div');

    const merged = mergeAsChildProps(
      buildOptions(child, {
        extraProps: { 'aria-label': 'from component' },
        restProps: { 'aria-label': 'from caller' },
      })
    );

    expect(merged['aria-label']).toBe('from caller');
  });

  it('drops a dangerous child href', () => {
    const child = createElement('a', { href: 'javascript:alert(1)' });

    const merged = mergeAsChildProps(buildOptions(child));

    expect(merged.href).toBeUndefined();
  });

  it('prefers the component href over the child href and sanitizes it', () => {
    const child = createElement('a', { href: '/child' });

    const merged = mergeAsChildProps(buildOptions(child, { href: 'javascript:alert(1)' }));

    expect(merged.href).toBeUndefined();
  });

  it('keeps a safe child href when the component has none', () => {
    const child = createElement('a', { href: '/child' });

    const merged = mergeAsChildProps(buildOptions(child));

    expect(merged.href).toBe('/child');
  });

  it('composes the child keydown handler before the guard', () => {
    const callOrder: string[] = [];
    const childKeyDown = vi.fn(() => {
      callOrder.push('child');
    });
    handleKeyDown = vi.fn(() => {
      callOrder.push('guard');
    });
    const child = createElement('div', { onKeyDown: childKeyDown });

    const merged = mergeAsChildProps(buildOptions(child));
    const onKeyDown = merged.onKeyDown as KeyboardEventHandler<HTMLElement>;
    const event = {
      key: 'Enter',
      defaultPrevented: false,
      preventDefault: vi.fn(),
      currentTarget: { click: vi.fn() },
    };

    onKeyDown(event as unknown as Parameters<KeyboardEventHandler<HTMLElement>>[0]);

    expect(childKeyDown).toHaveBeenCalledTimes(1);
    expect(callOrder).toEqual(['child', 'guard']);
  });
});
