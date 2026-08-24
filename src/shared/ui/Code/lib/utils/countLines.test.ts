import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { countLines } from './countLines';

describe('countLines', () => {
  it('подсчитывает строки в многострочном тексте', () => {
    const text = 'line1\nline2\nline3';
    expect(countLines(text)).toBe(3);
  });

  it('подсчитывает строки в односрочном тексте', () => {
    expect(countLines('const x = 10;')).toBe(1);
  });

  it('возвращает 0 для пустой строки', () => {
    expect(countLines('')).toBe(0);
  });

  it('возвращает 0 для null', () => {
    expect(countLines(null)).toBe(0);
  });

  it('возвращает 0 для undefined', () => {
    expect(countLines(undefined)).toBe(0);
  });

  it('возвращает 1 для одного числа', () => {
    expect(countLines(42)).toBe(1);
  });

  it('подсчитывает строки в массиве', () => {
    expect(countLines(['line1\nline2', '\n', 'line3'])).toBe(3);
  });

  it('подсчитывает строки в ReactElement с многострочным текстом', () => {
    const element = createElement('div', null, 'line1\nline2\nline3');
    expect(countLines(element)).toBe(3);
  });

  it('возвращает 1 для ReactElement с односрочным текстом', () => {
    const element = createElement('span', null, 'hello');
    expect(countLines(element)).toBe(1);
  });
});
