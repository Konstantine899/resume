// ============================================
// Nav Widget - useNavigation Hook Tests (T2)
// ============================================
import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS } from '../model/constants';
import { sectionIdFromHref, trapFocus, useNavigation } from './useNavigation';

// jsdom has no IntersectionObserver — class stub with instance tracking
// (same pattern as useScrollAnimation.test.ts / AnimatedSection.test.tsx).
// Entries use a minimal shape: the stub is never type-linked to the DOM lib,
// so tests can build exactly what the hook's callback reads — no casts.
interface TriggerEntry {
  target?: Element;
  isIntersecting: boolean;
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  observe = vi.fn<(el: Element) => void>();
  unobserve = vi.fn<(el: Element) => void>();
  disconnect = vi.fn<() => void>();
  callback: (entries: TriggerEntry[]) => void;

  constructor(callback: (entries: TriggerEntry[]) => void) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  trigger(entries: TriggerEntry[]) {
    this.callback(entries);
  }
}

/** Section ids the hook MUST derive from NAV_ITEMS (decision R8). */
const SECTION_IDS = NAV_ITEMS.map((item) => sectionIdFromHref(item.href));

const setWindowWidth = (width: number): void => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: width });
};

describe('sectionIdFromHref', () => {
  it('strips the hash from a section anchor', () => {
    expect(sectionIdFromHref('#home')).toBe('home');
  });

  it('passes through a value that has no hash prefix', () => {
    expect(sectionIdFromHref('contact')).toBe('contact');
  });
});

describe('useNavigation: active section tracking (R8)', () => {
  let sections: HTMLElement[] = [];

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    sections = SECTION_IDS.map((id) => {
      const el = document.createElement('section');
      el.id = id;
      document.body.appendChild(el);
      return el;
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sections.forEach((el) => el.remove());
    sections = [];
    setWindowWidth(1024);
  });

  it('starts on the first section of NAV_ITEMS', () => {
    const { result } = renderHook(() => useNavigation());

    expect(result.current.activeSection).toBe('home');
    expect(SECTION_IDS[0] ?? null).toBe('home');
  });

  it('observes exactly the section ids derived from NAV_ITEMS (single source)', () => {
    renderHook(() => useNavigation());

    const observer = MockIntersectionObserver.instances[0];
    const observedIds = observer ? observer.observe.mock.calls.map(([el]) => el.id) : [];

    expect(observedIds).toEqual(SECTION_IDS);
    expect(observedIds).toHaveLength(NAV_ITEMS.length);
  });

  it('marks a section active when it intersects the viewport trigger line', () => {
    const { result } = renderHook(() => useNavigation());
    const observer = MockIntersectionObserver.instances[0];
    const skillsSection = sections.find((el) => el.id === 'skills');

    act(() => {
      observer?.trigger([{ target: skillsSection, isIntersecting: true }]);
    });

    expect(result.current.activeSection).toBe('skills');
  });

  it('prefers the topmost section when several intersect at once', () => {
    const { result } = renderHook(() => useNavigation());
    const observer = MockIntersectionObserver.instances[0];
    const homeSection = sections.find((el) => el.id === 'home');
    const workSection = sections.find((el) => el.id === 'work');

    act(() => {
      observer?.trigger([
        { target: workSection, isIntersecting: true },
        { target: homeSection, isIntersecting: true },
      ]);
    });

    expect(result.current.activeSection).toBe('home');
  });

  it('keeps the last active section when no section intersects anymore', () => {
    const { result } = renderHook(() => useNavigation());
    const observer = MockIntersectionObserver.instances[0];
    const workSection = sections.find((el) => el.id === 'work');

    act(() => {
      observer?.trigger([{ target: workSection, isIntersecting: true }]);
    });
    expect(result.current.activeSection).toBe('work');

    act(() => {
      observer?.trigger([{ target: workSection, isIntersecting: false }]);
    });
    expect(result.current.activeSection).toBe('work');
  });

  it('follows hashchange for a known section hash', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      window.location.hash = '#contact';
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(result.current.activeSection).toBe('contact');

    // Restore inside act() so the listener cleanup stays warning-free.
    act(() => {
      window.location.hash = '';
      window.dispatchEvent(new Event('hashchange'));
    });
  });

  it('ignores hashchange for a hash that is not a NAV_ITEMS section', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => {
      window.location.hash = '#/admin';
      window.dispatchEvent(new Event('hashchange'));
    });

    expect(result.current.activeSection).toBe('home');

    // Restore inside act() — a late native hashchange then reads '' and is ignored.
    act(() => {
      window.location.hash = '';
      window.dispatchEvent(new Event('hashchange'));
    });
  });

  it('disconnects the observer on unmount (no leaked listeners)', () => {
    const { unmount } = renderHook(() => useNavigation());
    const observer = MockIntersectionObserver.instances[0];

    unmount();

    expect(observer?.disconnect).toHaveBeenCalledTimes(1);
  });
});

describe('useNavigation: onNavClick', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('closes the menu, activates the section, and forwards onNavigation', () => {
    const onNavigation = vi.fn();
    const { result } = renderHook(() => useNavigation({ onNavigation }));

    act(() => result.current.openMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(true);

    act(() => result.current.onNavClick('#skills'));

    expect(result.current.isMobileMenuOpen).toBe(false);
    expect(result.current.activeSection).toBe('skills');
    expect(onNavigation).toHaveBeenCalledTimes(1);
    expect(onNavigation).toHaveBeenCalledWith('#skills');
  });

  it('still forwards onNavigation for a non-section href without activating it', () => {
    const onNavigation = vi.fn();
    const { result } = renderHook(() => useNavigation({ onNavigation }));

    act(() => result.current.onNavClick('#/admin'));

    expect(onNavigation).toHaveBeenCalledWith('#/admin');
    expect(result.current.activeSection).toBe('home');
  });

  it('activates every NAV_ITEMS section through onNavClick (sweep, R8)', () => {
    const onNavigation = vi.fn();
    const { result } = renderHook(() => useNavigation({ onNavigation }));

    NAV_ITEMS.forEach((item) => {
      act(() => result.current.onNavClick(item.href));

      expect(result.current.activeSection).toBe(sectionIdFromHref(item.href));
      expect(onNavigation).toHaveBeenLastCalledWith(item.href);
    });

    expect(onNavigation).toHaveBeenCalledTimes(NAV_ITEMS.length);
  });
});

describe('useNavigation: mobile menu state', () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    setWindowWidth(1024);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.overflow = '';
    setWindowWidth(1024);
  });

  it('toggles, opens, and closes the mobile menu', () => {
    const { result } = renderHook(() => useNavigation());

    expect(result.current.isMobileMenuOpen).toBe(false);

    act(() => result.current.toggleMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(true);

    act(() => result.current.toggleMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(false);

    act(() => result.current.openMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(true);

    act(() => result.current.closeMobileMenu());
    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('locks body scroll while the menu is open and restores it on close', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => result.current.openMobileMenu());
    expect(document.body.style.overflow).toBe('hidden');

    act(() => result.current.closeMobileMenu());
    expect(document.body.style.overflow).toBe('');
  });

  it('auto-closes the menu on resize to the desktop breakpoint', () => {
    const { result } = renderHook(() => useNavigation());

    act(() => result.current.openMobileMenu());
    // jsdom window is 1024px wide by default — >= 768 means desktop.
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobileMenuOpen).toBe(false);
  });

  it('keeps the menu open on resize while still below the desktop breakpoint', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useNavigation());

    act(() => result.current.openMobileMenu());
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobileMenuOpen).toBe(true);
  });

  it('closes the menu at the exact 768px breakpoint boundary (>= rule)', () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useNavigation());

    act(() => result.current.openMobileMenu());
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobileMenuOpen).toBe(false);
  });
});

describe('trapFocus (R11)', () => {
  let container: HTMLDivElement;
  let first: HTMLButtonElement;
  let last: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    first = document.createElement('button');
    first.textContent = 'First';
    last = document.createElement('button');
    last.textContent = 'Last';
    container.append(first, last);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('cycles Tab forward from the last candidate to the first', () => {
    const release = trapFocus({ current: container });

    last.focus();
    fireEvent.keyDown(container, { key: 'Tab' });

    expect(document.activeElement).toBe(first);
    release();
  });

  it('cycles Shift+Tab backward from the first candidate to the last', () => {
    const release = trapFocus({ current: container });

    first.focus();
    fireEvent.keyDown(container, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(last);
    release();
  });

  it('invokes onEscape on Escape and stops after cleanup', () => {
    const onEscape = vi.fn();
    const release = trapFocus({ current: container }, onEscape);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);

    release();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('stops cycling focus after cleanup (listener unbound)', () => {
    const release = trapFocus({ current: container });
    release();

    last.focus();
    fireEvent.keyDown(container, { key: 'Tab' });

    // jsdom does not move focus on Tab natively — only the live trap would.
    expect(document.activeElement).toBe(last);
  });

  it('returns safely when the ref is not bound to a DOM node yet', () => {
    const release = trapFocus({ current: null });

    expect(() => release()).not.toThrow();
  });
});
