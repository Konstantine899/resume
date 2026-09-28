import { afterEach, describe, expect, it } from 'vitest';
import {
  getLayerManagerSnapshot,
  isTopLayer,
  layerIndex,
  registerLayer,
  resetLayerManager,
  subscribeLayerManager,
  unregisterLayer,
} from './layerManager';

const UNREGISTERED = -1;

afterEach(() => {
  resetLayerManager();
});

describe('layerManager (M7)', () => {
  it('registerLayer keeps first-registered layer lower; later layer is top', () => {
    registerLayer('a');
    registerLayer('b');

    // b was registered last → it is top
    expect(isTopLayer('b')).toBe(true);
    expect(isTopLayer('a')).toBe(false);
  });

  it('layerIndex grows with registration order; unregistered layer is -1', () => {
    expect(layerIndex(null)).toBe(UNREGISTERED);
    expect(layerIndex('unknown')).toBe(UNREGISTERED);

    registerLayer('a');
    registerLayer('b');

    expect(layerIndex('a')).toBe(0);
    expect(layerIndex('b')).toBe(1);
  });

  it('unregistering the top layer promotes the previous one', () => {
    registerLayer('a');
    registerLayer('b');
    expect(isTopLayer('b')).toBe(true);

    unregisterLayer('b');
    expect(isTopLayer('a')).toBe(true);
    expect(isTopLayer('b')).toBe(false);
    expect(layerIndex('a')).toBe(0);
  });

  it('unregistering a middle layer collapses the stack without holes', () => {
    registerLayer('a');
    registerLayer('b');
    registerLayer('c');

    unregisterLayer('b');

    expect(layerIndex('a')).toBe(0);
    expect(layerIndex('c')).toBe(1);
    expect(isTopLayer('c')).toBe(true);
  });

  it('unregistering an unknown id is a no-op', () => {
    registerLayer('a');
    expect(() => unregisterLayer('unknown')).not.toThrow();
    expect(layerIndex('a')).toBe(0);
  });

  it('registering the same id twice is idempotent (StrictMode-safe)', () => {
    registerLayer('a');
    registerLayer('a');
    expect(layerIndex('a')).toBe(0);
    unregisterLayer('a');
    expect(isTopLayer('a')).toBe(false);
  });

  it('subscribe notifies listeners on register/unregister (version bump)', () => {
    let notifications = 0;
    const countingListener = (): void => {
      notifications += 1;
    };
    const unsubscribe = subscribeLayerManager(countingListener);

    const snapshot0 = getLayerManagerSnapshot();
    registerLayer('a');
    const snapshot1 = getLayerManagerSnapshot();
    unregisterLayer('a');

    expect(snapshot1).not.toBe(snapshot0);
    expect(notifications).toBe(2);

    unsubscribe();
    const before = getLayerManagerSnapshot();
    registerLayer('b');
    expect(getLayerManagerSnapshot()).not.toBe(before);
  });

  it('returns the same snapshot for a stable stack (no spurious renders)', () => {
    registerLayer('a');
    const s1 = getLayerManagerSnapshot();
    const s2 = getLayerManagerSnapshot();
    expect(s1).toBe(s2);

    // unrelated mutation changes version only once
    unregisterLayer('a');
    expect(getLayerManagerSnapshot()).not.toBe(s1);
  });
});
