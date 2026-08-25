import { describe, expect, it } from 'vitest';
import { classNames, cn, createBEM, createNamespace } from './classNames';

describe('classNames', () => {
  it('joins string and number args', () => {
    expect(classNames('a', 'b', 1)).toBe('a b 1');
  });

  it('ignores falsy values', () => {
    expect(classNames('a', false, null, undefined, '')).toBe('a');
  });

  it('handles object with boolean flags', () => {
    expect(classNames('a', { active: true, disabled: false })).toBe('a active');
  });

  it('flattens nested arrays (recursive)', () => {
    expect(classNames('a', ['b', ['c', { d: true }]])).toBe('a b c d');
  });

  it('cn is a transparent alias of classNames', () => {
    expect(cn('x')).toBe('x');
  });
});

describe('createBEM', () => {
  const bem = createBEM('button');

  it('returns the block when no element/modifier', () => {
    expect(bem()).toBe('button');
  });

  it('returns element', () => {
    expect(bem('icon')).toBe('button__icon');
  });

  it('returns modifier', () => {
    expect(bem(undefined, 'large')).toBe('button--large');
  });

  it('returns element with modifier', () => {
    expect(bem('icon', 'large')).toBe('button__icon--large');
  });
});

describe('createNamespace', () => {
  const styles = { button: 'button_hash', primary: 'primary_hash' };
  const ns = createNamespace(styles);

  it('maps class names to module keys', () => {
    expect(ns('button', 'primary')).toBe('button_hash primary_hash');
  });

  it('falls back to the raw name when the key is missing', () => {
    expect(ns('missing')).toBe('missing');
  });

  it('drops empty class names', () => {
    expect(ns('button', '')).toBe('button_hash');
  });
});
