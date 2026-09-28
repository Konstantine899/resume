import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FOCUS_TRAP_SENTINEL_ATTR, focusTrap, getTabbableElements } from './focusTrap';

describe('focusTrap', () => {
  let container: HTMLDivElement;
  let untrap: (() => void) | null = null;

  const addButton = (options: { hidden?: boolean; disabled?: boolean } = {}): HTMLButtonElement => {
    const button = document.createElement('button');
    if (options.hidden) button.style.display = 'none';
    if (options.disabled) button.disabled = true;
    container.appendChild(button);
    return button;
  };

  const sentinel = (position: 'start' | 'end'): HTMLElement | null =>
    container.querySelector<HTMLElement>(`[${FOCUS_TRAP_SENTINEL_ATTR}="${position}"]`);

  const trap = (): (() => void) => {
    untrap = focusTrap(container);
    return untrap;
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    untrap?.();
    untrap = null;
    cleanup();
    container.remove();
  });

  it('returns a noop cleanup when container is null or undefined', () => {
    const fromNull = focusTrap(null);
    const fromUndefined = focusTrap(undefined as unknown as HTMLElement);

    expect(fromNull).toBeInstanceOf(Function);
    expect(fromUndefined).toBeInstanceOf(Function);
    expect(() => {
      fromNull();
      fromUndefined();
    }).not.toThrow();
  });

  it('wraps focus from last to first candidate on Tab', async () => {
    const user = userEvent.setup();
    const first = addButton();
    addButton();
    const last = addButton();
    trap();

    last.focus();
    await user.tab();

    expect(document.activeElement).toBe(first);
  });

  it('wraps focus from first to last candidate on Shift+Tab', async () => {
    const user = userEvent.setup();
    const first = addButton();
    addButton();
    const last = addButton();
    trap();

    first.focus();
    await user.tab({ shift: true });

    expect(document.activeElement).toBe(last);
  });

  it('moves to the next candidate on Tab when not at the boundary', async () => {
    const user = userEvent.setup();
    const first = addButton();
    const second = addButton();
    trap();

    first.focus();
    await user.tab();

    expect(document.activeElement).toBe(second);
  });

  it('reaches content added after the trap was installed', async () => {
    const user = userEvent.setup();
    const first = addButton();
    const second = addButton();
    trap();

    // Добавлен ПОСЛЕ установки trap: старый «последний» элемент больше не граница.
    const third = addButton();

    second.focus();
    await user.tab();
    expect(document.activeElement).toBe(third);

    // Новый последний элемент участвует в цикле вперёд…
    third.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);

    // …и в цикле назад.
    first.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(third);
  });

  it('recomputes candidates when content is removed after setup', async () => {
    const user = userEvent.setup();
    const first = addButton();
    const second = addButton();
    const third = addButton();
    trap();

    third.remove();

    second.focus();
    await user.tab();

    expect(document.activeElement).toBe(first);
  });

  it('skips hidden, disabled, inert, aria-hidden and sentinel elements', async () => {
    const user = userEvent.setup();
    addButton({ hidden: true });
    const first = addButton();
    addButton({ disabled: true });
    const second = addButton();

    const inertWrap = document.createElement('div');
    inertWrap.setAttribute('inert', '');
    const inertButton = document.createElement('button');
    inertWrap.appendChild(inertButton);
    container.appendChild(inertWrap);

    const ariaHiddenWrap = document.createElement('div');
    ariaHiddenWrap.setAttribute('aria-hidden', 'true');
    const ariaHiddenButton = document.createElement('button');
    ariaHiddenWrap.appendChild(ariaHiddenButton);
    container.appendChild(ariaHiddenWrap);

    trap();

    expect(getTabbableElements(container)).toEqual([first, second]);

    // hidden стоит перед первым кандидатом: без фильтра Shift+Tab увёл бы фокус наружу.
    first.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(second);

    // disabled/inert/aria-hidden/sentinel стоят после второго кандидата:
    // без фильтра Tab не замкнулся бы на первом.
    second.focus();
    await user.tab();
    expect(document.activeElement).toBe(first);
  });

  it('keeps focus inside an empty container with a focusable root', async () => {
    const user = userEvent.setup();
    addButton({ hidden: true }); // единственный ребёнок отфильтрован → «пустая зона»
    container.tabIndex = 0;
    trap();

    container.focus();
    expect(document.activeElement).toBe(container);

    await user.tab();
    expect(document.activeElement).toBe(container);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(container);
    expect(container.contains(document.activeElement)).toBe(true);
  });

  it('cycles sentinels when the root cannot hold focus', async () => {
    const user = userEvent.setup();
    trap();

    const start = sentinel('start');
    const end = sentinel('end');
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();

    start?.focus();
    expect(document.activeElement).toBe(start);

    await user.tab();
    expect(document.activeElement).toBe(end);
    expect(container.contains(document.activeElement)).toBe(true);

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(start);
    expect(container.contains(document.activeElement)).toBe(true);
  });

  it('re-routes focusin that lands on the root from outside to the first candidate', () => {
    const first = addButton();
    addButton();
    container.tabIndex = 0;
    trap();

    const outsideBefore = document.createElement('button');
    document.body.insertBefore(outsideBefore, container);

    outsideBefore.focus();
    container.focus();

    expect(document.activeElement).toBe(first);
    outsideBefore.remove();
  });

  it('re-routes focusin from after the container to the last candidate', () => {
    addButton();
    const last = addButton();
    container.tabIndex = 0;
    trap();

    const outsideAfter = document.createElement('button');
    document.body.appendChild(outsideAfter);

    outsideAfter.focus();
    container.focus();

    expect(document.activeElement).toBe(last);
    outsideAfter.remove();
  });

  it('does not disturb focus moving between the container children', () => {
    const first = addButton();
    const second = addButton();
    container.tabIndex = 0;
    trap();

    first.focus();
    second.focus();
    expect(document.activeElement).toBe(second);

    // Фокус из ребёнка на корень пришёл не снаружи → корень не трогаем.
    container.focus();
    expect(document.activeElement).toBe(container);
  });

  it('routes Tab pressed on the container root to the edge candidates', async () => {
    const user = userEvent.setup();
    const first = addButton();
    const last = addButton();
    container.tabIndex = 0;
    trap();

    first.focus();
    container.focus();
    expect(document.activeElement).toBe(container);

    await user.tab();
    expect(document.activeElement).toBe(first);

    container.focus();
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });

  it('ignores non-Tab keys', async () => {
    const user = userEvent.setup();
    addButton();
    const second = addButton();
    trap();

    second.focus();
    await user.keyboard('{Enter}');

    expect(document.activeElement).toBe(second);
  });

  it('stops trapping and removes sentinels after cleanup', async () => {
    const user = userEvent.setup();
    const first = addButton();
    const last = addButton();
    const teardown = trap();

    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(first); // trap активен

    teardown();
    untrap = null;
    expect(sentinel('start')).toBeNull();
    expect(sentinel('end')).toBeNull();

    // Без trap Tab от последнего элемента уходит наружу (не замыкается).
    last.focus();
    await user.tab();
    expect(document.activeElement).toBe(document.body);
    expect(document.activeElement).not.toBe(first);
  });
});
