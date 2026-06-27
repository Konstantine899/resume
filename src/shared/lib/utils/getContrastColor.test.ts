import { describe, it, expect } from 'vitest';
import { getContrastColor } from './getContrastColor';

describe('getContrastColor', () => {
  it('returns black for white background', () => {
    expect(getContrastColor('#ffffff')).toBe('black');
  });

  it('returns white for black background', () => {
    expect(getContrastColor('#000000')).toBe('white');
  });

  it('returns black for light colors', () => {
    expect(getContrastColor('#f4b377')).toBe('black');
    expect(getContrastColor('#f0f0f0')).toBe('black');
    expect(getContrastColor('#ffffff')).toBe('black');
  });

  it('returns white for dark colors', () => {
    expect(getContrastColor('#333333')).toBe('white');
    expect(getContrastColor('#1a1a1a')).toBe('white');
    expect(getContrastColor('#000000')).toBe('white');
  });

  it('handles hex without #', () => {
    expect(getContrastColor('ffffff')).toBe('black');
    expect(getContrastColor('000000')).toBe('white');
  });

  it('returns black for bright colors', () => {
    expect(getContrastColor('#ffff00')).toBe('black');
    expect(getContrastColor('#00ff00')).toBe('black');
  });

  it('returns white for dark blue', () => {
    expect(getContrastColor('#0000ff')).toBe('white');
  });

  it('returns black for light gray', () => {
    expect(getContrastColor('#cccccc')).toBe('black');
  });

  it('returns white for dark gray', () => {
    expect(getContrastColor('#666666')).toBe('white');
  });
});
