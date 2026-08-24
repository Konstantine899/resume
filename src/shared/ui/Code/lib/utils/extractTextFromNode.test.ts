import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { extractTextFromNode } from './extractTextFromNode';

describe('extractTextFromNode', () => {
  it('извлекает текст из строки', () => {
    expect(extractTextFromNode('const x = 10;')).toBe('const x = 10;');
  });

  it('извлекает текст из числа', () => {
    expect(extractTextFromNode(42)).toBe('42');
  });

  it('извлекает текст из bigint', () => {
    expect(extractTextFromNode(BigInt(100))).toBe('100');
  });

  it('возвращает пустую строку для boolean', () => {
    expect(extractTextFromNode(true)).toBe('');
    expect(extractTextFromNode(false)).toBe('');
  });

  it('возвращает пустую строку для null', () => {
    expect(extractTextFromNode(null)).toBe('');
  });

  it('возвращает пустую строку для undefined', () => {
    expect(extractTextFromNode(undefined)).toBe('');
  });

  it('извлекает текст из массива узлов', () => {
    expect(extractTextFromNode(['const ', 'x', ' = ', 10, ';'])).toBe('const x = 10;');
  });

  it('извлекает текст из ReactElement с children', () => {
    const element = createElement('span', null, 'const');
    expect(extractTextFromNode(element)).toBe('const');
  });

  it('рекурсивно извлекает текст из вложенных ReactElement', () => {
    const element = createElement(
      'div',
      null,
      createElement('span', null, 'const'),
      ' ',
      createElement('span', null, 'x'),
      ' = ',
      createElement('span', null, '10'),
      ';'
    );
    expect(extractTextFromNode(element)).toBe('const x = 10;');
  });

  it('извлекает текст из вложенных массивов', () => {
    expect(extractTextFromNode([['a', 'b'], ['c']])).toBe('abc');
  });

  it('обрабатывает пустой массив', () => {
    expect(extractTextFromNode([])).toBe('');
  });

  it('обрабатывает пустую строку', () => {
    expect(extractTextFromNode('')).toBe('');
  });

  it('обрабатывает объект без props (не ReactElement)', () => {
    // Создаём объект, похожий на ReactNode, но без props
    const nonReactNode = { foo: 'bar' } as unknown as React.ReactNode;
    expect(extractTextFromNode(nonReactNode)).toBe('');
  });

  it('извлекает текст из функционального компонента без hooks', () => {
    // Простые функциональные компоненты без hooks работают
    const MyComponent = () => createElement('span', null, 'Hello');
    const element = createElement(MyComponent);
    expect(extractTextFromNode(element)).toBe('Hello');
  });

  it('извлекает текст из children компонента с props', () => {
    // Компоненты-обёртки извлекают текст из children
    const Wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement('div', null, children);
    const element = createElement(Wrapper, null, createElement('span', null, 'Content'));
    expect(extractTextFromNode(element)).toBe('Content');
  });
});
