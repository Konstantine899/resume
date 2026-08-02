import { describe, expect, it } from 'vitest';
import { resolveCssModuleKey } from './resolveCssModuleKey';

describe('resolveCssModuleKey', () => {
  const styles = {
    paragraph: 'paragraph--hash',
    size2Xl: 'size-2xl--hash',
    lineClamp3: 'line-clamp-3--hash',
    headingSize5Xl: 'heading-size-5xl--hash',
    primary: 'primary--hash',
    truncate: 'truncate--hash',
  };

  it('returns the direct key when it exists (single-word classes)', () => {
    expect(resolveCssModuleKey(styles, 'paragraph')).toBe('paragraph--hash');
    expect(resolveCssModuleKey(styles, 'primary')).toBe('primary--hash');
  });

  it('resolves kebab-case keys to their camelCase export', () => {
    expect(resolveCssModuleKey(styles, 'size-2xl')).toBe('size-2xl--hash');
    expect(resolveCssModuleKey(styles, 'line-clamp-3')).toBe('line-clamp-3--hash');
  });

  it('resolves prefixed kebab-case keys (heading--size-2xl pattern)', () => {
    expect(resolveCssModuleKey(styles, 'heading--size-5xl')).toBe('heading-size-5xl--hash');
  });

  it('returns an empty string for unknown keys — never "undefined"', () => {
    expect(resolveCssModuleKey(styles, 'does-not-exist')).toBe('');
    expect(resolveCssModuleKey(styles, '')).toBe('');
  });

  it('does not leak "undefined" into the class list', () => {
    const resolved = resolveCssModuleKey(styles, 'unknown-class');
    expect(resolved.includes('undefined')).toBe(false);
  });

  it('returns an empty string for prototype-key names, never a non-string', () => {
    expect(resolveCssModuleKey(styles, '__proto__')).toBe('');
    expect(resolveCssModuleKey(styles, 'constructor')).toBe('');
    expect(resolveCssModuleKey(styles, 'toString')).toBe('');
    expect(resolveCssModuleKey(styles, 'hasOwnProperty')).toBe('');
  });
});
